import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function globalSetup() {
  // Clean up any leftover test data before running tests
  await prisma.$connect();

  await prisma.invitation.deleteMany({
    where: { email: { contains: '@test.com' } },
  });
  await prisma.bucketListItem.deleteMany({
    where: { bucketList: { name: { startsWith: 'Test ' } } },
  });
  await prisma.bucketListMember.deleteMany({
    where: { user: { email: { contains: '@test.com' } } },
  });
  await prisma.bucketList.deleteMany({
    where: { name: { startsWith: 'Test ' } },
  });
  await prisma.user.deleteMany({
    where: { email: { contains: '@test.com' } },
  });

  await prisma.$disconnect();
}
