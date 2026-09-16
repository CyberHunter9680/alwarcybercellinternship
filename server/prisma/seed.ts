import { PrismaClient, CourseType, AcademicYear, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Alwar Police Internship Programme 2026...');

  // 1. Seed Admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@alwarpolice.gov.in').toLowerCase().trim();
  const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@AlwarCyber2026!';
  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: 'Superintendent of Police / Cyber Cell Admin',
      isActive: true,
    },
    create: {
      name: 'Superintendent of Police / Cyber Cell Admin',
      email: adminEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin account seeded: ${admin.email}`);

  // 2. Initialize sequence counter
  await prisma.sequenceCounter.upsert({
    where: { id: 'application_counter' },
    update: {},
    create: {
      id: 'application_counter',
      currentValue: 0,
    },
  });

  console.log('✅ Sequence counter initialized.');
  console.log('✨ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
