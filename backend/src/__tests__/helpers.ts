import { prisma } from '../config/database';
import { generateToken } from '../middleware/auth';

interface TestUser {
  id: string;
  email: string;
  name: string;
  googleId: string;
  avatarUrl: string | null;
  token: string;
}

let userCounter = 0;

export async function createTestUser(overrides: Partial<{ email: string; name: string }> = {}): Promise<TestUser> {
  userCounter++;
  const timestamp = Date.now();

  const user = await prisma.user.create({
    data: {
      email: overrides.email || `testuser${userCounter}_${timestamp}@test.com`,
      name: overrides.name || `Test User ${userCounter}`,
      googleId: `google-test-id-${userCounter}-${timestamp}`,
      avatarUrl: null,
    },
  });

  const token = generateToken(user.id);

  return {
    ...user,
    token,
  };
}

export async function createTestBucketList(
  userId: string,
  overrides: Partial<{ name: string; description: string; type: string }> = {}
) {
  const timestamp = Date.now();

  return prisma.bucketList.create({
    data: {
      name: overrides.name || `Test Bucket List ${timestamp}`,
      description: overrides.description || 'A test bucket list',
      type: overrides.type || 'individual',
      members: {
        create: {
          userId,
          role: 'owner',
        },
      },
    },
    include: {
      members: true,
      items: true,
    },
  });
}

export async function createTestItem(
  bucketListId: string,
  overrides: Partial<{ text: string; done: boolean }> = {}
) {
  const timestamp = Date.now();

  return prisma.bucketListItem.create({
    data: {
      bucketListId,
      text: overrides.text || `Test Item ${timestamp}`,
      done: overrides.done || false,
    },
  });
}

export async function createTestInvitation(
  bucketListId: string,
  invitedById: string,
  email: string
) {
  return prisma.invitation.create({
    data: {
      bucketListId,
      invitedById,
      email,
      status: 'pending',
    },
  });
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
