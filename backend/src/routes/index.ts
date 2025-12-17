import { Router } from 'express';
import authRoutes from './auth';
import bucketListRoutes from './bucketLists';
import itemRoutes from './items';
import invitationRoutes from './invitations';

const router = Router();

router.use('/auth', authRoutes);
router.use('/bucket-lists', bucketListRoutes);
router.use('/bucket-lists', itemRoutes);
// Mount invite endpoint under /bucket-lists as well
router.use('/bucket-lists', invitationRoutes);
router.use('/invitations', invitationRoutes);

export default router;
