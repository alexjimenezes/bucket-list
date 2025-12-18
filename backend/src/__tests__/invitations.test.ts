import request from 'supertest';
import app from '../app';
import { createTestUser, createTestBucketList, createTestInvitation, authHeader } from './helpers';

describe('Invitation Routes', () => {
  describe('POST /bucket-lists/:bucketListId/invite', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/bucket-lists/some-id/invite')
        .send({ email: 'invite@test.com' });

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-owner', async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Invite Forbidden' });

      // Add member (not owner)
      const { prisma } = await import('../config/database');
      await prisma.bucketListMember.create({
        data: {
          bucketListId: bucketList.id,
          userId: member.id,
          role: 'member',
        },
      });

      const response = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(member.token))
        .send({ email: 'someone@test.com' });

      expect(response.status).toBe(403);
    });

    it('should create invitation for new email', async () => {
      const owner = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Create Invite' });

      const response = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: 'newinvite@test.com' });

      expect(response.status).toBe(201);
      expect(response.body.invitation.email).toBe('newinvite@test.com');
      expect(response.body.invitation.status).toBe('pending');
      expect(response.body.invitation.bucketListId).toBe(bucketList.id);
    });

    it('should create invitation for existing user', async () => {
      const owner = await createTestUser();
      const existingUser = await createTestUser({ email: 'existing@test.com' });
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Invite Existing' });

      const response = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: existingUser.email });

      expect(response.status).toBe(201);
      expect(response.body.invitation.email).toBe(existingUser.email);
      expect(response.body.invitation.invitedUserId).toBe(existingUser.id);
    });

    it('should return 400 when inviting yourself', async () => {
      const owner = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Self Invite' });

      const response = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: owner.email });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('You cannot invite yourself');
    });

    it('should return 400 when user is already a member', async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Already Member' });

      // Add member
      const { prisma } = await import('../config/database');
      await prisma.bucketListMember.create({
        data: {
          bucketListId: bucketList.id,
          userId: member.id,
          role: 'member',
        },
      });

      const response = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: member.email });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('This user is already a member of this bucket list');
    });

    it('should return 400 when invitation already exists', async () => {
      const owner = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Duplicate Invite' });

      // Create first invitation
      await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: 'duplicate@test.com' });

      // Try to create second invitation
      const response = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: 'duplicate@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('An invitation has already been sent to this email');
    });
  });

  describe('GET /invitations/pending', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/invitations/pending');

      expect(response.status).toBe(401);
    });

    it('should return empty array when no pending invitations', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .get('/invitations/pending')
        .set(authHeader(user.token));

      expect(response.status).toBe(200);
      expect(response.body.invitations).toEqual([]);
    });

    it('should return pending invitations for user', async () => {
      const owner = await createTestUser();
      const invitee = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Pending Invites' });

      // Create invitation
      await createTestInvitation(bucketList.id, owner.id, invitee.email);

      // Update invitation to link to the user
      const { prisma } = await import('../config/database');
      await prisma.invitation.updateMany({
        where: { email: invitee.email },
        data: { invitedUserId: invitee.id },
      });

      const response = await request(app)
        .get('/invitations/pending')
        .set(authHeader(invitee.token));

      expect(response.status).toBe(200);
      expect(response.body.invitations).toHaveLength(1);
      expect(response.body.invitations[0].bucketList.name).toBe('Test Pending Invites');
      expect(response.body.invitations[0].invitedBy.id).toBe(owner.id);
    });

    it('should find invitations by email even if user registered later', async () => {
      const owner = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Late Registration' });

      // Create invitation to email before user exists
      const inviteEmail = `lateruser_${Date.now()}@test.com`;
      await createTestInvitation(bucketList.id, owner.id, inviteEmail);

      // Now create user with that email
      const invitee = await createTestUser({ email: inviteEmail });

      const response = await request(app)
        .get('/invitations/pending')
        .set(authHeader(invitee.token));

      expect(response.status).toBe(200);
      expect(response.body.invitations).toHaveLength(1);
    });
  });

  describe('POST /invitations/:invitationId/accept', () => {
    it('should accept invitation and create membership', async () => {
      const owner = await createTestUser();
      const invitee = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Accept Invite' });

      // Create invitation
      const { prisma } = await import('../config/database');
      const invitation = await prisma.invitation.create({
        data: {
          bucketListId: bucketList.id,
          invitedById: owner.id,
          email: invitee.email,
          invitedUserId: invitee.id,
          status: 'pending',
        },
      });

      const response = await request(app)
        .post(`/invitations/${invitation.id}/accept`)
        .set(authHeader(invitee.token));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Invitation accepted');

      // Verify membership was created
      const membership = await prisma.bucketListMember.findFirst({
        where: { bucketListId: bucketList.id, userId: invitee.id },
      });
      expect(membership).toBeDefined();
      expect(membership?.role).toBe('member');

      // Verify invitation status updated
      const updatedInvitation = await prisma.invitation.findUnique({
        where: { id: invitation.id },
      });
      expect(updatedInvitation?.status).toBe('accepted');
    });

    it('should return 404 for non-existent invitation', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/invitations/non-existent-id/accept')
        .set(authHeader(user.token));

      expect(response.status).toBe(404);
    });

    it('should return 404 for invitation not belonging to user', async () => {
      const owner = await createTestUser();
      const invitee = await createTestUser();
      const stranger = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Wrong User Accept' });

      const { prisma } = await import('../config/database');
      const invitation = await prisma.invitation.create({
        data: {
          bucketListId: bucketList.id,
          invitedById: owner.id,
          email: invitee.email,
          invitedUserId: invitee.id,
          status: 'pending',
        },
      });

      const response = await request(app)
        .post(`/invitations/${invitation.id}/accept`)
        .set(authHeader(stranger.token));

      expect(response.status).toBe(404);
    });

    it('should return 404 for already processed invitation', async () => {
      const owner = await createTestUser();
      const invitee = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Already Processed' });

      const { prisma } = await import('../config/database');
      const invitation = await prisma.invitation.create({
        data: {
          bucketListId: bucketList.id,
          invitedById: owner.id,
          email: invitee.email,
          invitedUserId: invitee.id,
          status: 'accepted', // Already accepted
        },
      });

      const response = await request(app)
        .post(`/invitations/${invitation.id}/accept`)
        .set(authHeader(invitee.token));

      expect(response.status).toBe(404);
    });
  });

  describe('POST /invitations/:invitationId/decline', () => {
    it('should decline invitation', async () => {
      const owner = await createTestUser();
      const invitee = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Decline Invite' });

      const { prisma } = await import('../config/database');
      const invitation = await prisma.invitation.create({
        data: {
          bucketListId: bucketList.id,
          invitedById: owner.id,
          email: invitee.email,
          invitedUserId: invitee.id,
          status: 'pending',
        },
      });

      const response = await request(app)
        .post(`/invitations/${invitation.id}/decline`)
        .set(authHeader(invitee.token));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Invitation declined');

      // Verify invitation status updated
      const updatedInvitation = await prisma.invitation.findUnique({
        where: { id: invitation.id },
      });
      expect(updatedInvitation?.status).toBe('declined');

      // Verify no membership was created
      const membership = await prisma.bucketListMember.findFirst({
        where: { bucketListId: bucketList.id, userId: invitee.id },
      });
      expect(membership).toBeNull();
    });

    it('should return 404 for non-existent invitation', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/invitations/non-existent-id/decline')
        .set(authHeader(user.token));

      expect(response.status).toBe(404);
    });
  });

  describe('Full invitation flow', () => {
    it('should complete full invite -> accept -> access flow', async () => {
      const owner = await createTestUser();
      const invitee = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Full Flow' });

      // 1. Owner invites user
      const inviteResponse = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: invitee.email });

      expect(inviteResponse.status).toBe(201);
      const invitationId = inviteResponse.body.invitation.id;

      // 2. Invitee sees pending invitation
      const pendingResponse = await request(app)
        .get('/invitations/pending')
        .set(authHeader(invitee.token));

      expect(pendingResponse.status).toBe(200);
      expect(pendingResponse.body.invitations).toHaveLength(1);

      // 3. Invitee accepts invitation
      const acceptResponse = await request(app)
        .post(`/invitations/${invitationId}/accept`)
        .set(authHeader(invitee.token));

      expect(acceptResponse.status).toBe(200);

      // 4. Invitee can now access the bucket list
      const accessResponse = await request(app)
        .get(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(invitee.token));

      expect(accessResponse.status).toBe(200);
      expect(accessResponse.body.bucketList.name).toBe('Test Full Flow');

      // 5. Invitee can add items
      const itemResponse = await request(app)
        .post(`/bucket-lists/${bucketList.id}/items`)
        .set(authHeader(invitee.token))
        .send({ text: 'Invitee item' });

      expect(itemResponse.status).toBe(201);

      // 6. No more pending invitations
      const noPendingResponse = await request(app)
        .get('/invitations/pending')
        .set(authHeader(invitee.token));

      expect(noPendingResponse.body.invitations).toHaveLength(0);
    });
  });

  describe('Re-invite after member removal', () => {
    it('should allow re-inviting a removed member', async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Re-invite' });

      // 1. Owner invites user
      const inviteResponse = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: member.email });

      expect(inviteResponse.status).toBe(201);
      const invitationId = inviteResponse.body.invitation.id;

      // 2. Member accepts invitation
      const acceptResponse = await request(app)
        .post(`/invitations/${invitationId}/accept`)
        .set(authHeader(member.token));

      expect(acceptResponse.status).toBe(200);

      // 3. Owner removes member
      const removeResponse = await request(app)
        .delete(`/bucket-lists/${bucketList.id}/members/${member.id}`)
        .set(authHeader(owner.token));

      expect(removeResponse.status).toBe(200);

      // 4. Member can no longer access bucket list
      const accessResponse = await request(app)
        .get(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(member.token));

      expect(accessResponse.status).toBe(404);

      // 5. Owner re-invites the same member
      const reInviteResponse = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: member.email });

      expect(reInviteResponse.status).toBe(201);
      expect(reInviteResponse.body.invitation.status).toBe('pending');

      // 6. Member sees new pending invitation
      const pendingResponse = await request(app)
        .get('/invitations/pending')
        .set(authHeader(member.token));

      expect(pendingResponse.status).toBe(200);
      expect(pendingResponse.body.invitations).toHaveLength(1);

      // 7. Member accepts and can access again
      const reAcceptResponse = await request(app)
        .post(`/invitations/${reInviteResponse.body.invitation.id}/accept`)
        .set(authHeader(member.token));

      expect(reAcceptResponse.status).toBe(200);

      const finalAccessResponse = await request(app)
        .get(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(member.token));

      expect(finalAccessResponse.status).toBe(200);
    });

    it('should reactivate declined invitation when re-inviting', async () => {
      const owner = await createTestUser();
      const invitee = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Reactivate Declined' });

      // 1. Owner invites user
      const inviteResponse = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: invitee.email });

      expect(inviteResponse.status).toBe(201);
      const invitationId = inviteResponse.body.invitation.id;

      // 2. Invitee declines
      const declineResponse = await request(app)
        .post(`/invitations/${invitationId}/decline`)
        .set(authHeader(invitee.token));

      expect(declineResponse.status).toBe(200);

      // 3. Owner re-invites (should reactivate existing invitation)
      const reInviteResponse = await request(app)
        .post(`/bucket-lists/${bucketList.id}/invite`)
        .set(authHeader(owner.token))
        .send({ email: invitee.email });

      expect(reInviteResponse.status).toBe(201);
      expect(reInviteResponse.body.invitation.status).toBe('pending');

      // 4. Invitee sees the reactivated invitation
      const pendingResponse = await request(app)
        .get('/invitations/pending')
        .set(authHeader(invitee.token));

      expect(pendingResponse.status).toBe(200);
      expect(pendingResponse.body.invitations).toHaveLength(1);
    });
  });
});
