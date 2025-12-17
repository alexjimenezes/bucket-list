import request from 'supertest';
import app from '../app';
import { createTestUser, authHeader } from './helpers';

describe('Auth Routes', () => {
  describe('GET /auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should return user data when authenticated', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .get('/auth/me')
        .set(authHeader(user.token));

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear token cookie and return success', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');

      // Check that the cookie is being cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });
  });

  describe('GET /auth/google', () => {
    it('should redirect to Google OAuth', async () => {
      const response = await request(app).get('/auth/google');

      // Should redirect to Google
      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('accounts.google.com');
    });
  });
});
