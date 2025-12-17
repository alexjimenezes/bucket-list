import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { uploadMiddleware, getExtensionFromMimeType } from '../config/upload';
import {
  uploadToR2,
  deleteFromR2,
  generateImageKey,
  getSignedImageUrl,
  isR2Configured,
} from '../config/r2';

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

    // Delete image from R2 if exists
    if (existingItem.imageKey && isR2Configured()) {
      try {
        await deleteFromR2(existingItem.imageKey);
      } catch (error) {
        console.error('Failed to delete image from R2:', error);
        // Continue with item deletion even if image deletion fails
      }
    }

    await prisma.bucketListItem.delete({
      where: { id: itemId },
    });

    res.json({ message: 'Item deleted successfully' });
  })
);

// Upload image for an item
router.post(
  '/:bucketListId/items/:itemId/image',
  uploadMiddleware.single('image'),
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const { bucketListId, itemId } = req.params;

    // Check R2 configuration
    if (!isR2Configured()) {
      throw new AppError('Image uploads are not configured', 503);
    }

    await checkBucketListAccess(bucketListId, userId);

    // Check if item exists and belongs to this bucket list
    const existingItem = await prisma.bucketListItem.findFirst({
      where: { id: itemId, bucketListId },
    });

    if (!existingItem) {
      throw new AppError('Item not found', 404);
    }

    // Check if file was uploaded
    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }

    // Delete old image if exists
    if (existingItem.imageKey) {
      try {
        await deleteFromR2(existingItem.imageKey);
      } catch (error) {
        console.error('Failed to delete old image from R2:', error);
      }
    }

    // Generate new image key and upload
    const extension = getExtensionFromMimeType(req.file.mimetype);
    const imageKey = generateImageKey(bucketListId, itemId, extension);

    await uploadToR2(imageKey, req.file.buffer, req.file.mimetype);

    // Update item with image key
    const item = await prisma.bucketListItem.update({
      where: { id: itemId },
      data: {
        imageKey,
        imageUploadedAt: new Date(),
      },
    });

    // Generate signed URL for response
    const imageUrl = await getSignedImageUrl(imageKey);

    res.json({
      message: 'Image uploaded successfully',
      item: { ...item, imageUrl },
    });
  })
);

// Delete image from an item
router.delete(
  '/:bucketListId/items/:itemId/image',
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

    if (!existingItem.imageKey) {
      throw new AppError('Item has no image', 404);
    }

    // Delete from R2
    if (isR2Configured()) {
      try {
        await deleteFromR2(existingItem.imageKey);
      } catch (error) {
        console.error('Failed to delete image from R2:', error);
      }
    }

    // Remove image reference from database
    const item = await prisma.bucketListItem.update({
      where: { id: itemId },
      data: {
        imageKey: null,
        imageUploadedAt: null,
      },
    });

    res.json({
      message: 'Image deleted successfully',
      item,
    });
  })
);

export default router;
