import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Validation schemas
const createBucketListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['individual', 'group']).default('individual'),
});

const updateBucketListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

// Get all bucket lists for current user
router.get(
  '/',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;

    const bucketLists = await prisma.bucketList.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Add completion stats
    const bucketListsWithStats = await Promise.all(
      bucketLists.map(async (bl) => {
        const completedCount = await prisma.bucketListItem.count({
          where: { bucketListId: bl.id, done: true },
        });
        return {
          ...bl,
          itemCount: bl._count.items,
          completedCount,
        };
      })
    );

    res.json({ bucketLists: bucketListsWithStats });
  })
);

// Create a new bucket list
router.post(
  '/',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const data = createBucketListSchema.parse(req.body);

    const bucketList = await prisma.bucketList.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    res.status(201).json({ bucketList });
  })
);

// Get a single bucket list
router.get(
  '/:id',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const bucketList = await prisma.bucketList.findFirst({
      where: {
        id,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        items: {
          orderBy: [{ done: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!bucketList) {
      throw new AppError('Bucket list not found', 404);
    }

    res.json({ bucketList });
  })
);

// Update a bucket list
router.put(
  '/:id',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = updateBucketListSchema.parse(req.body);

    // Check if user is owner
    const membership = await prisma.bucketListMember.findFirst({
      where: { bucketListId: id, userId, role: 'owner' },
    });

    if (!membership) {
      throw new AppError('Only owners can update the bucket list', 403);
    }

    const bucketList = await prisma.bucketList.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    res.json({ bucketList });
  })
);

// Delete a bucket list
router.delete(
  '/:id',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if user is owner
    const membership = await prisma.bucketListMember.findFirst({
      where: { bucketListId: id, userId, role: 'owner' },
    });

    if (!membership) {
      throw new AppError('Only owners can delete the bucket list', 403);
    }

    await prisma.bucketList.delete({
      where: { id },
    });

    res.json({ message: 'Bucket list deleted successfully' });
  })
);

export default router;
