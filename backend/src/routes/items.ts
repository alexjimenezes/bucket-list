import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);

// Validation schemas
const createItemSchema = z.object({
  text: z.string().min(1).max(500),
});

const updateItemSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  done: z.boolean().optional(),
});

// Helper to check bucket list access
async function checkBucketListAccess(bucketListId: string, userId: string) {
  const membership = await prisma.bucketListMember.findFirst({
    where: { bucketListId, userId },
  });

  if (!membership) {
    throw new AppError('Access denied to this bucket list', 403);
  }

  return membership;
}

// Add item to bucket list
router.post(
  '/:bucketListId/items',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const { bucketListId } = req.params;
    const data = createItemSchema.parse(req.body);

    await checkBucketListAccess(bucketListId, userId);

    const item = await prisma.bucketListItem.create({
      data: {
        bucketListId,
        text: data.text,
      },
    });

    res.status(201).json({ item });
  })
);

// Update an item
router.put(
  '/:bucketListId/items/:itemId',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const { bucketListId, itemId } = req.params;
    const data = updateItemSchema.parse(req.body);

    await checkBucketListAccess(bucketListId, userId);

    // Check if item exists and belongs to this bucket list
    const existingItem = await prisma.bucketListItem.findFirst({
      where: { id: itemId, bucketListId },
    });

    if (!existingItem) {
      throw new AppError('Item not found', 404);
    }

    const updateData: {
      text?: string;
      done?: boolean;
      completedAt?: Date | null;
      completedById?: string | null;
    } = {};

    if (data.text !== undefined) {
      updateData.text = data.text;
    }

    if (data.done !== undefined) {
      updateData.done = data.done;
      if (data.done) {
        updateData.completedAt = new Date();
        updateData.completedById = userId;
      } else {
        updateData.completedAt = null;
        updateData.completedById = null;
      }
    }

    const item = await prisma.bucketListItem.update({
      where: { id: itemId },
      data: updateData,
    });

    res.json({ item });
  })
);

// Delete an item
router.delete(
  '/:bucketListId/items/:itemId',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const { bucketListId, itemId } = req.params;

    await checkBucketListAccess(bucketListId, userId);

    // Check if item exists and belongs to this bucket list
    const existingItem = await prisma.bucketListItem.findFirst({
      where: { id: itemId, bucketListId },
    });

    if (!existingItem) {
      throw new AppError('Item not found', 404);
    }

    await prisma.bucketListItem.delete({
      where: { id: itemId },
    });

    res.json({ message: 'Item deleted successfully' });
  })
);

export default router;
