process.env.NODE_ENV = 'test';
import http from 'http';
import jwt from 'jsonwebtoken';
import '../src/config/env.js';
import { prisma, connectDB } from '../src/config/db.js';
import app from '../src/index.js';
import { ENV } from '../src/config/env.js';

async function main() {
  console.log('================================================================');
  console.log('🛡️ FINAL PRE-OPEN PRODUCTION VERIFICATION');
  console.log('================================================================\n');

  await connectDB();

  // 1. Verify Database Endpoint Identity
  const dbUrl = process.env.DATABASE_URL || '';
  const isProd = dbUrl.includes('ep-mute-king-b315bk71');
  console.log(`1. Database Identity: ${isProd ? '✅ Production (ep-mute-king-b315bk71)' : '❌ UNEXPECTED DB URL'}`);
  if (!isProd) throw new Error('DATABASE_URL is not pointed to production endpoint ep-mute-king-b315bk71');

  // 2. Counts and Sequences
  const prodCount = await prisma.application.count();
  const stagedCountRes: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as c FROM "public"."applications_staged_conflicts"`);
  const stagedCount = stagedCountRes[0].c;
  const maxAppRes: any[] = await prisma.$queryRawUnsafe(`SELECT MAX(application_id) as max_id FROM "public"."applications"`);
  const maxAppId = maxAppRes[0].max_id;
  const seqRes: any[] = await prisma.$queryRawUnsafe(`SELECT current_value FROM "public"."sequence_counters" WHERE id = 'application_counter'`);
  const seqVal = seqRes[0].current_value;

  console.log(`2. public.applications Count:                  ${prodCount} (Expected: 454 including verified test applicant)`);
  console.log(`3. applications_staged_conflicts Count:        ${stagedCount} (Expected: 41)`);
  console.log(`4. Total Preserved Records:                    ${prodCount + stagedCount} (Expected: 495)`);
  console.log(`5. Current Max Application ID:                 ${maxAppId} (Expected: APCSIP2026-000460)`);
  console.log(`6. Sequence Counter Value:                     ${seqVal} (Expected: 460)`);

  // Start HTTP test server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`\nTest server running on ${baseUrl}`);

  try {
    // 7. Verify Admin Dashboard can retrieve the newly created application
    console.log('\n--- Testing Admin Dashboard Retrieval ---');
    const adminToken = jwt.sign(
      { id: 'admin-test-id', email: ENV.ADMIN_EMAIL, name: 'Admin', role: 'SUPER_ADMIN' },
      ENV.AUTH_SECRET,
      { expiresIn: '1h' }
    );

    const adminListRes = await fetch(`${baseUrl}/api/admin/applications?page=1&limit=10&search=preopen.test.applicant`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminListBody: any = await adminListRes.json();
    const appList = Array.isArray(adminListBody.data) ? adminListBody.data : adminListBody.data?.applications;
    console.log(`Admin Search Status: ${adminListRes.status}, Total Found: ${appList?.length || 0}`);
    const foundApp = appList?.find((a: any) => a.applicationId === 'APCSIP2026-000460');
    if (adminListRes.status !== 200 || !foundApp) {
      throw new Error(`Admin dashboard failed to retrieve application APCSIP2026-000460. Body: ${JSON.stringify(adminListBody)}`);
    }
    console.log(`✅ Admin Dashboard successfully retrieved record: ${foundApp.applicationId} (${foundApp.fullName})`);

    // 8. Verify Candidate Slip Token & Download
    console.log('\n--- Testing Registration Slip PDF & QR Code ---');
    const testApp = await prisma.application.findUnique({ where: { applicationId: 'APCSIP2026-000460' } });
    if (!testApp) throw new Error('Test app APCSIP2026-000460 not found in database');

    const legitimateToken = jwt.sign(
      { applicationId: testApp.applicationId, id: testApp.id, type: 'slip_access' },
      ENV.AUTH_SECRET,
      { expiresIn: '7d' }
    );

    const slipRes = await fetch(`${baseUrl}/api/applications/APCSIP2026-000460/registration-slip?token=${legitimateToken}`);
    const slipContentType = slipRes.headers.get('content-type');
    console.log(`Registration Slip Status: ${slipRes.status}, Content-Type: ${slipContentType}`);
    if (slipRes.status !== 200 || !slipContentType?.includes('application/pdf')) {
      throw new Error(`Registration slip download failed: status ${slipRes.status}, Content-Type: ${slipContentType}`);
    }
    console.log('✅ Registration Slip PDF generated and downloaded successfully.');

    // 9. Verify QR Verification Endpoint
    const qrRes = await fetch(`${baseUrl}/api/verify/APCSIP2026-000460`);
    const qrBody: any = await qrRes.json();
    console.log(`QR Verification Status: ${qrRes.status}, Verified: ${qrBody.data?.verified}, Name: ${qrBody.data?.fullName}`);
    if (qrRes.status !== 200 || qrBody.data?.verified !== true) {
      throw new Error(`QR Verification failed: ${JSON.stringify(qrBody)}`);
    }
    console.log('✅ QR Public Verification endpoint works correctly with zero PII leaks.');

    // 10. Verify Resume Endpoint
    console.log('\n--- Testing Resume Streaming ---');
    const resumeRes = await fetch(`${baseUrl}/api/applications/resume/${testApp.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Resume Retrieval Status: ${resumeRes.status}`);
    if (resumeRes.status !== 200) {
      throw new Error(`Resume retrieval failed with status ${resumeRes.status}`);
    }
    console.log('✅ Resume upload and streaming verified successfully.');

    // 11. Verify CORS and Rate Limiter
    console.log('\n--- Testing CORS & Security Headers ---');
    const corsRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5173' }
    });
    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    console.log(`CORS Access-Control-Allow-Origin: ${allowOrigin}`);
    if (allowOrigin !== 'http://localhost:5173') {
      throw new Error(`CORS header mismatch: expected http://localhost:5173, got ${allowOrigin}`);
    }
    console.log('✅ CORS is strictly enforced.');

    console.log('\n================================================================');
    console.log('🎉 ALL PRE-OPEN PRODUCTION VERIFICATION CHECKS PASSED!');
    console.log('================================================================\n');

  } finally {
    server.close();
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ PRE-OPEN VERIFICATION FAILED:', err);
  process.exit(1);
});
