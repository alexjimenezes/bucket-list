import request from 'supertest';
import app from '../app';
import { createTestUser, createTestBucketList, createTestItem, authHeader } from './helpers';

describe('Item Routes', () => {
  describe('POST /bucket-lists/:bucketListId/items', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/bucket-lists/some-id/items')
        .send({ text: 'Test item' });

      expect(response.status).toBe(401);
    });

    it('should return 403 for bucket list user is not member of', async () => {
      const owner = await createTestUser();
      const stranger = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Private Items' });

      const response = await request(app)
        .post(`/bucket-lists/${bucketList.id}/items`)
        .set(authHeader(stranger.token))
        .send({ text: 'Unauthorized item' });

      expect(response.status).toBe(403);
    });

    it('should create a new item', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Add Item' });

      const response = await request(app)
        .post(`/bucket-lists/${bucketList.id}/items`)
        .set(authHeader(user.token))
        .send({ text: 'Visit Paris' });

      expect(response.status).toBe(201);
      expect(response.body.item.text).toBe('Visit Paris');
      expect(response.body.item.done).toBe(false);
      expect(response.body.item.bucketListId).toBe(bucketList.id);
    });

    it('should fail with empty text', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Empty Item' });

      const response = await request(app)
        .post(`/bucket-lists/${bucketList.id}/items`)
        .set(authHeader(user.token))
        .send({ text: '' });

      expect(response.status).toBe(500); // Zod validation error
    });
  });

  describe('PUT /bucket-lists/:bucketListId/items/:itemId', () => {
    it('should update item text', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Update Item Text' });
      const item = await createTestItem(bucketList.id, { text: 'Original text' });

      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token))
        .send({ text: 'Updated text' });

      expect(response.status).toBe(200);
      expect(response.body.item.text).toBe('Updated text');
    });

    it('should mark item as done', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Mark Done' });
      const item = await createTestItem(bucketList.id, { text: 'To complete' });

      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token))
        .send({ done: true });

      expect(response.status).toBe(200);
      expect(response.body.item.done).toBe(true);
      expect(response.body.item.completedAt).toBeDefined();
      expect(response.body.item.completedById).toBe(user.id);
    });

    it('should mark item as not done', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Unmark Done' });
      const item = await createTestItem(bucketList.id, { text: 'Already done', done: true });

      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token))
        .send({ done: false });

      expect(response.status).toBe(200);
      expect(response.body.item.done).toBe(false);
      expect(response.body.item.completedAt).toBeNull();
      expect(response.body.item.completedById).toBeNull();
    });

    it('should return 404 for non-existent item', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Item Not Found' });

      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/non-existent-id`)
        .set(authHeader(user.token))
        .send({ text: 'Update' });

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-member', async () => {
      const owner = await createTestUser();
      const stranger = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Forbidden Update' });
      const item = await createTestItem(bucketList.id, { text: 'Private item' });

      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(stranger.token))
        .send({ text: 'Unauthorized' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /bucket-lists/:bucketListId/items/:itemId', () => {
    it('should delete an item', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Delete Item' });
      const item = await createTestItem(bucketList.id, { text: 'To delete' });

      const response = await request(app)
        .delete(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item deleted successfully');

      // Verify item is deleted by trying to update it
      const updateResponse = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token))
        .send({ text: 'Should fail' });

      expect(updateResponse.status).toBe(404);
    });

    it('should return 404 for non-existent item', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Delete Not Found' });

      const response = await request(app)
        .delete(`/bucket-lists/${bucketList.id}/items/non-existent-id`)
        .set(authHeader(user.token));

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-member', async () => {
      const owner = await createTestUser();
      const stranger = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Forbidden Delete' });
      const item = await createTestItem(bucketList.id, { text: 'Private item' });

      const response = await request(app)
        .delete(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(stranger.token));

      expect(response.status).toBe(403);
    });
  });

  describe('Member can CRUD items', () => {
    it('should allow member to add items', async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const bucketList = await createTestBucketList(owner.id, { name: 'Test Member Add' });

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
        .post(`/bucket-lists/${bucketList.id}/items`)
        .set(authHeader(member.token))
        .send({ text: 'Member item' });

      expect(response.status).toBe(201);
      expect(response.body.item.text).toBe('Member item');
    });
  });

  describe('completedAt editing', () => {
    it('should update completedAt for a done item', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test CompletedAt Edit' });
      const item = await createTestItem(bucketList.id, { text: 'Completed item', done: true });

      const pastDate = new Date('2024-06-15T12:00:00Z');
      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token))
        .send({ completedAt: pastDate.toISOString() });

      expect(response.status).toBe(200);
      expect(new Date(response.body.item.completedAt).toISOString()).toBe(pastDate.toISOString());
    });

    it('should return 400 when completedAt is in the future', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Future CompletedAt' });
      const item = await createTestItem(bucketList.id, { text: 'Completed item', done: true });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days in the future

      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token))
        .send({ completedAt: futureDate.toISOString() });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Completed date cannot be in the future');
    });

    it('should return 400 when setting completedAt on uncompleted item', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Uncompleted CompletedAt' });
      const item = await createTestItem(bucketList.id, { text: 'Uncompleted item', done: false });

      const pastDate = new Date('2024-06-15T12:00:00Z');
      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token))
        .send({ completedAt: pastDate.toISOString() });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot set completed date for uncompleted items');
    });

    it('should allow setting completedAt when also marking as done', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test CompletedAt With Done' });
      const item = await createTestItem(bucketList.id, { text: 'To complete', done: false });

      const pastDate = new Date('2024-06-15T12:00:00Z');
      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token))
        .send({ done: true, completedAt: pastDate.toISOString() });

      expect(response.status).toBe(200);
      expect(response.body.item.done).toBe(true);
      expect(new Date(response.body.item.completedAt).toISOString()).toBe(pastDate.toISOString());
    });

    it('should auto-set completedAt to now when marking done without explicit date', async () => {
      const user = await createTestUser();
      const bucketList = await createTestBucketList(user.id, { name: 'Test Auto CompletedAt' });
      const item = await createTestItem(bucketList.id, { text: 'To complete', done: false });

      const beforeRequest = new Date();
      const response = await request(app)
        .put(`/bucket-lists/${bucketList.id}/items/${item.id}`)
        .set(authHeader(user.token))
        .send({ done: true });
      const afterRequest = new Date();

      expect(response.status).toBe(200);
      expect(response.body.item.done).toBe(true);
      const completedAt = new Date(response.body.item.completedAt);
      expect(completedAt.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(completedAt.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });
  });
});
