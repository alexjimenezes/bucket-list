import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import { AuthRequest, generateToken, authMiddleware } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

// Redirect to Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.frontendUrl}/login?error=auth_failed`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as { id: string };
    const token = generateToken(user.id);

    // Pass the token as a URL param to avoid cross-site cookie blocking.
    // Safari (ITP), Firefox (strict ETP), and iOS browsers silently drop
    // SameSite=None cookies set during cross-origin redirects, causing the
    // subsequent /auth/me call to fail and the user to land on the landing page.
    // The frontend reads the token from the URL and stores it in localStorage.
    res.redirect(`${env.frontendUrl}/auth/callback?token=${token}`);
  }
);

// Logout (token is stored client-side in localStorage; frontend clears it)
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  res.json({ user: authReq.user });
});

export default router;