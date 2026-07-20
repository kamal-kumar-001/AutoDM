import { PrismaClient, Plan, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  const email = process.argv[2] || 'meta_reviewer@autodm.com';
  const rawPassword = process.argv[3] || 'ReviewerPassword123!';
  const name = process.argv[4] || 'Meta App Reviewer';

  console.log(`Creating/Updating verified test user for Facebook App Review: ${email}`);

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      isVerified: true,
      role: UserRole.CREATOR,
      verificationToken: null,
      subscription: {
        create: {
          plan: Plan.PRO,
          status: 'ACTIVE',
        },
      },
    },
    update: {
      password: hashedPassword,
      name,
      isVerified: true,
      verificationToken: null,
    },
  });

  console.log('--------------------------------------------------');
  console.log('✅ VERIFIED TEST USER READY FOR FACEBOOK APP REVIEW');
  console.log('--------------------------------------------------');
  console.log(`User ID:  ${user.id}`);
  console.log(`Email:    ${user.email}`);
  console.log(`Password: ${rawPassword}`);
  console.log(`Verified: ${user.isVerified}`);
  console.log(`Role:     ${user.role}`);
  console.log('--------------------------------------------------');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Failed to create test user:', e);
  process.exit(1);
});
