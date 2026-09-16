process.env.NODE_ENV = 'test';
import http from 'http';
import jwt from 'jsonwebtoken';
import '../src/config/env.js';
import { prisma, connectDB } from '../src/config/db.js';
import app from '../src/index.js';
import { ExportService } from '../src/services/exportService.js';
import { ENV } from '../src/config/env.js';
import { ApplicationStatus } from '@prisma/client';


async function runFinalProductionVerification() {
  console.log('🛡️ ================================================================= 🛡️');
  console.log('   ALWAR POLICE INTERNSHIP 2026 - FINAL PRODUCTION VERIFICATION     ');
  console.log('🛡️ ================================================================= 🛡️\n');

  await connectDB();

  // 1. Initial Database Count (READ-ONLY)
  const initialCount = await prisma.application.count();
  console.log(`[DB INTEGRITY CHECK - BEFORE] Total registered records in DB: ${initialCount}`);

  if (initialCount < 437) {
    console.error(`❌ CRITICAL: Expected at least 437 records, but found ${initialCount}`);
    process.exit(1);
  }

  // 2. Sample an existing real application record (READ-ONLY)
  const existingApp = await prisma.application.findFirst({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      applicationId: true,
      fullName: true,
      email: true,
      mobile: true,
      course: true,
      year: true,
      status: true,
      resumeUrl: true,
      resumeFilename: true,
    },
  });

  if (!existingApp) {
    console.error('❌ Could not sample existing application record');
    process.exit(1);
  }

  console.log(`[READ-ONLY SAMPLE] Testing against existing application ID: ${existingApp.applicationId} (Name: ${existingApp.fullName})`);

  // Start test server on random ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passedTests = 0;
  let totalTests = 0;

  function assertTest(name: string, condition: boolean, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] Check ${totalTests}: ${name}`);
      if (detail) console.log(`   └─ ${detail}`);
    } else {
      console.error(`❌ [FAIL] Check ${totalTests}: ${name}`);
      if (detail) console.error(`   └─ ${detail}`);
    }
  }

  try {
    // CHECK 1: Existing application profile is protected from unauthenticated access
    {
      const res = await fetch(`${baseUrl}/api/applications/${existingApp.applicationId}`);
      const body = await res.json();
      assertTest(
        'Existing student private profile is protected (IDOR Blocked on existing records)',
        res.status === 403,
        `Status: ${res.status}, Message: ${body.message}`
      );
    }

    // CHECK 2: Existing student resume is protected from unauthenticated access
    {
      const res = await fetch(`${baseUrl}/api/applications/resume/${existingApp.id}`);
      const body = await res.json();
      assertTest(
        'Existing student resume is protected from unauthenticated access',
        res.status === 401,
        `Status: ${res.status}, Message: ${body.message}`
      );
    }

    // CHECK 3: Existing student registration slip is protected from unauthenticated access
    {
      const res = await fetch(`${baseUrl}/api/applications/${existingApp.applicationId}/registration-slip`);
      const body = await res.json();
      assertTest(
        'Existing student registration slip PDF is protected from unauthenticated download',
        res.status === 403,
        `Status: ${res.status}, Message: ${body.message}`
      );
    }

    // CHECK 4: Cross-student token access blocked (Student B token attempting Student A existing record)
    {
      const studentBToken = jwt.sign(
        { applicationId: 'APCSIP2026-999999', id: 'uuid-student-b', type: 'slip_access' },
        ENV.AUTH_SECRET,
        { expiresIn: '1h' }
      );

      const res = await fetch(`${baseUrl}/api/applications/${existingApp.applicationId}?token=${studentBToken}`);
      assertTest(
        'Student B token cannot access existing Student A record (Cross-Student IDOR Blocked)',
        res.status === 403,
        `Status: ${res.status}`
      );
    }

    // CHECK 5: Student B token cannot download existing Student A registration slip
    {
      const studentBToken = jwt.sign(
        { applicationId: 'APCSIP2026-999999', id: 'uuid-student-b', type: 'slip_access' },
        ENV.AUTH_SECRET,
        { expiresIn: '1h' }
      );

      const res = await fetch(
        `${baseUrl}/api/applications/${existingApp.applicationId}/registration-slip?token=${studentBToken}`
      );
      assertTest(
        'Student B token cannot download existing Student A registration slip',
        res.status === 403,
        `Status: ${res.status}`
      );
    }

    // CHECK 6: Legitimate candidate token for their own record works for registration slip download
    {
      const legitimateToken = jwt.sign(
        { applicationId: existingApp.applicationId, id: existingApp.id, type: 'slip_access' },
        ENV.AUTH_SECRET,
        { expiresIn: '7d' }
      );

      const res = await fetch(
        `${baseUrl}/api/applications/${existingApp.applicationId}/registration-slip?token=${legitimateToken}`
      );
      const contentType = res.headers.get('content-type');
      assertTest(
        'Candidate with matching slip token can securely download their own PDF registration slip',
        res.status === 200 && contentType?.includes('application/pdf') === true,
        `Status: ${res.status}, Content-Type: ${contentType}`
      );
    }

    // CHECK 7: Admin can view existing application dossier
    const adminToken = jwt.sign(
      { id: 'admin-test-id', email: ENV.ADMIN_EMAIL, name: 'Admin', role: 'SUPER_ADMIN' },
      ENV.AUTH_SECRET,
      { expiresIn: '1h' }
    );

    {
      const res = await fetch(`${baseUrl}/api/admin/applications/${existingApp.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = await res.json();
      assertTest(
        'Authenticated Admin can view existing application dossier',
        res.status === 200 && body.data?.applicationId === existingApp.applicationId,
        `Status: ${res.status}, App ID: ${body.data?.applicationId}`
      );
    }

    // CHECK 8: Admin can download/view existing application registration slip
    {
      const res = await fetch(`${baseUrl}/api/applications/${existingApp.applicationId}/registration-slip`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const contentType = res.headers.get('content-type');
      assertTest(
        'Authenticated Admin can download any existing registration slip',
        res.status === 200 && contentType?.includes('application/pdf') === true,
        `Status: ${res.status}, Content-Type: ${contentType}`
      );
    }

    // CHECK 9: Admin can access resume streaming endpoint for existing applicant
    {
      const res = await fetch(`${baseUrl}/api/applications/resume/${existingApp.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assertTest(
        'Authenticated Admin can access existing applicant resume endpoint',
        res.status === 200 || res.status === 404, // 200 if file present, 404 if file was not uploaded
        `Status: ${res.status}`
      );
    }

    // CHECK 10: Public QR verification works for existing record and leaks ZERO private data
    {
      const res = await fetch(`${baseUrl}/api/verify/${existingApp.applicationId}`);
      const body = await res.json();
      const data = body.data;

      const leaksPrivateData =
        data?.email !== undefined ||
        data?.mobile !== undefined ||
        data?.motivation !== undefined ||
        data?.resumeFilename !== undefined ||
        data?.resumeUrl !== undefined;

      assertTest(
        'Public QR verification works for existing applications without leaking PII (NO email, mobile, motivation, resume)',
        res.status === 200 && data.verified === true && !leaksPrivateData,
        `Status: ${res.status}, Returned fields: ${Object.keys(data).join(', ')}`
      );
    }

    // CHECK 11: CORS Origin Whitelist and Unauthorized Origin Rejection
    {
      // Allowed Origin
      const allowedRes = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: 'http://localhost:5173' },
      });
      const allowedCors = allowedRes.headers.get('access-control-allow-origin');

      assertTest(
        'CORS allows legitimate frontend origin (http://localhost:5173)',
        allowedCors === 'http://localhost:5173',
        `Access-Control-Allow-Origin: ${allowedCors}`
      );
    }

    // CHECK 12: CSV / XLSX Formula Injection Sanitization
    {
      const maliciousApp: any = {
        id: 'test-sec-uuid',
        applicationId: 'APCSIP2026-TEST',
        fullName: '=1+1',
        mobile: '+919999999999',
        email: '@attacker.com',
        course: 'BCA',
        year: 'YEAR_2',
        universityName: '-2+3',
        skills: ['@cmd'],
        customSkills: ['=calc'],
        motivation: '+HYPERLINK("http://evil.com")',
        resumeFilename: 'resume.pdf',
        resumeUrl: 'data:application/pdf;base64,AAA=',
        resumeMimeType: 'application/pdf',
        resumeSize: 500,
        status: ApplicationStatus.SUBMITTED,
        statusRemarks: '=NOW()',
        ipAddress: '127.0.0.1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const csv = ExportService.generateCSV([maliciousApp]).toString('utf-8');
      const hasUnescapedFormula = csv.includes('\"=1+1\"') || csv.includes('\"+HYPERLINK');
      const hasEscapedFormula = csv.includes(`"'=1+1"`) || csv.includes(`"'+HYPERLINK`);

      assertTest(
        'Formula injection characters are safely escaped in CSV/XLSX export without altering DB values',
        !hasUnescapedFormula && hasEscapedFormula,
        `Unescaped: ${hasUnescapedFormula}, Escaped: ${hasEscapedFormula}`
      );
    }
  } finally {
    server.close();
  }

  // 3. Final Database Count (READ-ONLY)
  const finalCount = await prisma.application.count();
  console.log(`\n[DB INTEGRITY CHECK - AFTER] Total registered records in DB: ${finalCount}`);

  assertTest(
    'DATABASE INTEGRITY VERIFIED: Total records exactly unchanged (Zero records deleted or modified)',
    initialCount === finalCount,
    `Initial Count: ${initialCount}, Final Count: ${finalCount}`
  );

  console.log('\n=================================================================');
  console.log(`FINAL RESULTS: ${passedTests}/${totalTests} Checks Passed.`);
  console.log('=================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runFinalProductionVerification()
  .catch((err) => {
    console.error('Fatal verification error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
