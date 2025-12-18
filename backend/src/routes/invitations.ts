import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);

// Validation schema
const inviteSchema = z.object({
  email: z.string().email(),
});

// Send invitation to a bucket list
router.post(
  '/:bucketListId/invite',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const { bucketListId } = req.params;
    const data = inviteSchema.parse(req.body);

    // Check if user is owner of the bucket list
    const membership = await prisma.bucketListMember.findFirst({
      where: { bucketListId, userId, role: 'owner' },
    });

    if (!membership) {
      throw new AppError('Only owners can invite people', 403);
    }

    // Can't invite yourself
    if (data.email === req.user!.email) {
      throw new AppError('You cannot invite yourself', 400);
    }

    // Check if already a member
    const existingMember = await prisma.bucketListMember.findFirst({
      where: {
        bucketListId,
        user: { email: data.email },
      },
    });

    if (existingMember) {
      throw new AppError('This user is already a member of this bucket list', 400);
    }

    // Check if invitation already exists (any status)
    const existingInvitation = await prisma.invitation.findFirst({
      where: { bucketListId, email: data.email },
    });

    if (existingInvitation) {
      if (existingInvitation.status === 'pending') {
        throw new AppError('An invitation has already been sent to this email', 400);
      }

      // Reactivate existing invitation (was accepted/declined but member was removed)
      const invitation = await prisma.invitation.update({
        where: { id: existingInvitation.id },
        data: {
          status: 'pending',
          invitedById: userId,
        },
        include: {
          bucketList: {
            select: { name: true },
          },
        },
      });

      res.status(201).json({ invitation });
      return;
    }

    // Find if the invited user already exists
    const invitedUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Create new invitation
    const invitation = await prisma.invitation.create({
      data: {
        bucketListId,
        invitedById: userId,
        email: data.email,
        invitedUserId: invitedUser?.id,
      },
      include: {
        bucketList: {
          select: { name: true },
        },
      },
    });

    res.status(201).json({ invitation });
  })
);

// Get pending invitations for current user
router.get(
  '/pending',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    const invitations = await prisma.invitation.findMany({
      where: {
        OR: [{ invitedUserId: userId }, { email: userEmail }],
        status: 'pending',
      },
      include: {
        bucketList: {
          select: { id: true, name: true, description: true },
        },
        invitedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ invitations });
  })
);

// Accept invitation
router.post(
  '/:invitationId/accept',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const { invitationId } = req.params;

    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        OR: [{ invitedUserId: userId }, { email: userEmail }],
        status: 'pending',
      },
    });

    if (!invitation) {
      throw new AppError('Invitation not found or already processed', 404);
    }

    // Create membership and update invitation in a transaction
    await prisma.$transaction([
      prisma.bucketListMember.create({
        data: {
          bucketListId: invitation.bucketListId,
          userId,
          role: 'member',
        },
      }),
      prisma.invitation.update({
        where: { id: invitationId },
        data: {
          status: 'accepted',
          invitedUserId: userId,
        },
      }),
    ]);

    res.json({ message: 'Invitation accepted' });
  })
);

// Decline invitation
router.post(
  '/:invitationId/decline',
  asyncHandler<AuthRequest>(async (req, res: Response) => {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const { invitationId } = req.params;

    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        OR: [{ invitedUserId: userId }, { email: userEmail }],
        status: 'pending',
      },
    });

    if (!invitation) {
      throw new AppError('Invitation not found or already processed', 404);
    }

    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        status: 'declined',
        invitedUserId: userId,
      },
    });

    res.json({ message: 'Invitation declined' });
  })
);

export default router;
