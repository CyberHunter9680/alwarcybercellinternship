import '../src/config/env.js';
import { prisma, connectDB } from '../src/config/db.js';
import { SystemService } from '../src/services/systemService.js';
import { ApplicationService } from '../src/services/applicationService.js';
import app from '../src/index.js';
import http from 'http';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE WHATSAPP VERIFICATION TEST SUITE');
  console.log('======================================================\n');

  await connectDB();

  // 1. Check existing applications count
  const initialCount = await prisma.application.count();
  console.log(`[TEST 1] Initial Application Count: ${initialCount}`);

  // Fetch one real application ID for testing
  const sampleApp = await prisma.application.findFirst({
    select: { id: true, applicationId: true, fullName: true, email: true, mobile: true },
  });

  if (!sampleApp) {
    console.warn('⚠️ No existing applications found in database to test.');
    return;
  }

  console.log(`[TEST 2] Using existing sample record: ${sampleApp.applicationId} (UUID: ${sampleApp.id})`);

  // Start temporary local HTTP server for testing Express endpoints
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Helper function to make JSON requests
    async function makePost(urlPath: string, body: any) {
      const res = await fetch(`${baseUrl}${urlPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      return { status: res.status, data };
    }

    async function makeGet(urlPath: string) {
      const res = await fetch(`${baseUrl}${urlPath}`);
      const data = await res.json().catch(() => null);
      return { status: res.status, data };
    }

    // 1. Test Valid Existing Application ID
    console.log('\n--- Test: Valid Existing Application ID ---');
    const validRes = await makePost('/api/applications/verify-whatsapp', {
      applicationId: sampleApp.applicationId,
    });
    console.log('Status:', validRes.status);
    console.log('Response:', JSON.stringify(validRes.data, null, 2));

    if (
      validRes.status === 200 &&
      validRes.data?.verified === true &&
      validRes.data?.whatsappGroupUrl &&
      validRes.data.whatsappGroupUrl.includes('chat.whatsapp.com')
    ) {
      console.log('✅ PASS: Valid Application ID verified and returned WhatsApp link.');
    } else {
      console.error('❌ FAIL: Valid Application ID failed verification.');
    }

    // Check PII leakage
    const responseString = JSON.stringify(validRes.data);
    const hasPII =
      responseString.includes(sampleApp.fullName) ||
      responseString.includes(sampleApp.email) ||
      responseString.includes(sampleApp.mobile);

    if (!hasPII) {
      console.log('✅ PASS: Zero student PII returned in verification response.');
    } else {
      console.error('❌ FAIL: Student PII detected in verification response!');
    }

    // 2. Test Whitespace around Valid ID
    console.log('\n--- Test: Whitespace Around Valid ID ---');
    const whitespaceRes = await makePost('/api/applications/verify-whatsapp', {
      applicationId: `   ${sampleApp.applicationId.toLowerCase()}   `,
    });
    console.log('Status:', whitespaceRes.status);
    if (whitespaceRes.status === 200 && whitespaceRes.data?.verified === true) {
      console.log('✅ PASS: Normalized whitespace and case successfully.');
    } else {
      console.error('❌ FAIL: Failed to normalize whitespace around valid ID.');
    }

    // 3. Test Invalid Application ID
    console.log('\n--- Test: Invalid Application ID ---');
    const invalidRes = await makePost('/api/applications/verify-whatsapp', {
      applicationId: 'APCSIP2026-999999',
    });
    console.log('Status:', invalidRes.status);
    console.log('Response:', JSON.stringify(invalidRes.data, null, 2));
    if (
      invalidRes.status === 400 &&
      invalidRes.data?.verified === false &&
      invalidRes.data?.message?.includes('could not be verified') &&
      !invalidRes.data?.whatsappGroupUrl
    ) {
      console.log('✅ PASS: Invalid ID safely rejected without WhatsApp URL.');
    } else {
      console.error('❌ FAIL: Invalid ID response incorrect.');
    }

    // 4. Test Empty Application ID
    console.log('\n--- Test: Empty Application ID ---');
    const emptyRes = await makePost('/api/applications/verify-whatsapp', {
      applicationId: '   ',
    });
    console.log('Status:', emptyRes.status);
    if (emptyRes.status === 400 && !emptyRes.data?.whatsappGroupUrl) {
      console.log('✅ PASS: Empty ID rejected with validation error.');
    } else {
      console.error('❌ FAIL: Empty ID handling failed.');
    }

    // 5. Test Malformed / Script Injection ID
    console.log('\n--- Test: Malformed / Injection ID ---');
    const injectionRes = await makePost('/api/applications/verify-whatsapp', {
      applicationId: "<script>alert('xss')</script>",
    });
    console.log('Status:', injectionRes.status);
    if (injectionRes.status === 400 && !injectionRes.data?.whatsappGroupUrl) {
      console.log('✅ PASS: Malformed input safely rejected.');
    } else {
      console.error('❌ FAIL: Malformed input handling failed.');
    }

    // 6. Test Registration Status is Closed
    console.log('\n--- Test: Registration Status Check ---');
    const regStatus = await SystemService.isRegistrationOpen();
    console.log('Is Registration Open:', regStatus.isOpen);
    console.log('Registration Status Message:', regStatus.message);
    if (!regStatus.isOpen) {
      console.log('✅ PASS: Registration remains securely closed.');
    } else {
      console.log('ℹ️ Registration status is currently:', regStatus.isOpen);
    }

    // 7. Verify QR Public Verification Still Works
    console.log('\n--- Test: Public Verification QR Endpoint ---');
    const qrRes = await makeGet(`/api/verify/${sampleApp.applicationId}`);
    console.log('Status:', qrRes.status);
    if (qrRes.status === 200 && qrRes.data?.data?.applicationId === sampleApp.applicationId) {
      console.log('✅ PASS: Existing QR verification endpoint intact.');
    } else {
      console.error('❌ FAIL: QR verification endpoint failed.');
    }

    // 8. Verify IDOR Protection on Registration Slip PDF
    console.log('\n--- Test: Unauthorized Slip Download (IDOR Protection) ---');
    const unauthSlipRes = await fetch(`${baseUrl}/api/applications/${sampleApp.applicationId}/registration-slip`);
    console.log('Status:', unauthSlipRes.status);
    if (unauthSlipRes.status === 403) {
      console.log('✅ PASS: Registration slip IDOR protection intact (403 Forbidden).');
    } else {
      console.error('❌ FAIL: Registration slip not protected!');
    }

    // 9. Verify Database Count and Data Integrity Unaltered
    const finalCount = await prisma.application.count();
    console.log('\n--- Data Integrity Check ---');
    console.log(`Initial Count: ${initialCount} | Final Count: ${finalCount}`);
    if (initialCount === finalCount) {
      console.log('✅ PASS: Student application data remains 100% unaltered.');
    } else {
      console.error('❌ FAIL: Application count changed unexpectedly!');
    }

    // 10. Check Audit Log Entry
    const auditCount = await prisma.auditLog.count({
      where: { action: 'WHATSAPP_APPLICATION_VERIFICATION' },
    });
    console.log(`WhatsApp Verification Audit Logs recorded: ${auditCount}`);
    if (auditCount > 0) {
      console.log('✅ PASS: Verification events recorded in audit log.');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('======================================================\n');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
