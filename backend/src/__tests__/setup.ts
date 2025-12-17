import { prisma } from '../config/database';

// Connect to database before all tests
beforeAll(async () => {
  await prisma.$connect();
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Global cleanup function that can be called manually
export async function cleanupTestData() {
  // Delete in correct order due to foreign key constraints
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
}
