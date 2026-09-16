import '../src/config/env.js';
import { prisma, connectDB } from '../src/config/db.js';

async function main() {
  await connectDB();
  const count = await prisma.application.count();
  console.log(`\n======================================================`);
  console.log(`[DATABASE READ-ONLY INTEGRITY CHECK] Total registered applications: ${count}`);
  console.log(`======================================================\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
