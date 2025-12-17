import request from 'supertest';
import app from '../app';
import { createTestUser, createTestBucketList, authHeader } from './helpers';

describe('Bucket List Routes', () => {
  describe('GET /bucket-lists', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/bucket-lists');

      expect(response.status).toBe(401);
    });

    it('should return empty array when user has no bucket lists', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .get('/bucket-lists')
        .set(authHeader(user.token));

      expect(response.status).toBe(200);
      expect(response.body.bucketLists).toEqual([]);
    });

    it('should return user bucket lists', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test My Lists' });

      const response = await request(app)
        .get('/bucket-lists')
        .set(authHeader(user.token));

      expect(response.status).toBe(200);
      expect(response.body.bucketLists).toHaveLength(1);
      expect(response.body.bucketLists[0].name).toBe('Test My Lists');
      expect(response.body.bucketLists[0].itemCount).toBe(0);
      expect(response.body.bucketLists[0].completedCount).toBe(0);
    });
  });

  describe('POST /bucket-lists', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/bucket-lists')
        .send({ name: 'Test List' });

      expect(response.status).toBe(401);
    });

    it('should create a new bucket list', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/bucket-lists')
        .set(authHeader(user.token))
        .send({
          name: 'Test New Bucket List',
          description: 'My test description',
          type: 'individual',
        });

      expect(response.status).toBe(201);
      expect(response.body.bucketList.name).toBe('Test New Bucket List');
      expect(response.body.bucketList.description).toBe('My test description');
      expect(response.body.bucketList.type).toBe('individual');
      expect(response.body.bucketList.members).toHaveLength(1);
      expect(response.body.bucketList.members[0].role).toBe('owner');
      expect(response.body.bucketList.members[0].userId).toBe(user.id);
    });

    it('should create a group bucket list', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/bucket-lists')
        .set(authHeader(user.token))
        .send({
          name: 'Test Group List',
          type: 'group',
        });

      expect(response.status).toBe(201);
      expect(response.body.bucketList.type).toBe('group');
    });

    it('should fail with invalid data', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/bucket-lists')
        .set(authHeader(user.token))
        .send({ name: '' }); // Empty name

      expect(response.status).toBe(500); // Zod validation error
    });
  });

  describe('GET /bucket-lists/:id', () => {
    it('should return 404 for non-existent bucket list', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .get('/bucket-lists/non-existent-id')
        .set(authHeader(user.token));

      expect(response.status).toBe(404);
    });

    it('should return 404 for bucket list user is not member of', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const bucketList = await createTestBucketList(user1.id, { name: 'Test Private List' });

      const response = await request(app)
        .get(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(user2.token));

      expect(response.status).toBe(404);
    });

    it('should return bucket list with items', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Detail List' });

      const response = await request(app)
        .get(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(user.token));

      expect(response.status).toBe(200);
      expect(response.body.bucketList.id).toBe(bucketList.id);
      expect(response.body.bucketList.name).toBe('Test Detail List');
      expect(response.body.bucketList.items).toEqual([]);
      expect(response.body.bucketList.members).toHaveLength(1);
    });
  });

  describe('PUT /bucket-lists/:id', () => {
    it('should update bucket list name', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Original Name' });

      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(user.token))
        .send({ name: 'Test Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.bucketList.name).toBe('Test Updated Name');
    });

    it('should update bucket list description', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Update Desc' });

      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(user.token))
        .send({ description: 'New description' });

      expect(response.status).toBe(200);
      expect(response.body.bucketList.description).toBe('New description');
    });

    it('should return 403 for non-owner', async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Owner Only Update' });

      // Add member (not as owner)
      const { prisma } = await import('../config/database');
      await prisma.bucketListMember.create({
        data: {
          bucketListId: bucketList.id,
          userId: member.id,
          role: 'member',
        },
      });

      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(member.token))
        .send({ name: 'Unauthorized Update' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /bucket-lists/:id', () => {
    it('should delete bucket list', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test To Delete' });

      const response = await request(app)
        .delete(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(user.token));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Bucket list deleted successfully');

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(user.token));

      expect(getResponse.status).toBe(404);
    });

    it('should return 403 for non-owner', async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Owner Only Delete' });

      // Add member (not as owner)
      const { prisma } = await import('../config/database');
      await prisma.bucketListMember.create({
        data: {
          bucketListId: bucketList.id,
          userId: member.id,
          role: 'member',
        },
      });

      const response = await request(app)
        .delete(`/bucket-lists/${bucketList.id}`)
        .set(authHeader(member.token));

      expect(response.status).toBe(403);
    });
  });
});
