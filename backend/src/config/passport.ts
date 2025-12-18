import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { prisma } from './database';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: `${env.backendUrl}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          // Update avatar URL on each login (in case it changed)
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              avatarUrl: profile.photos?.[0]?.value || user.avatarUrl,
            },
          });
        } else {
          // Check if user exists with this email (invited but not registered)
          user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Update existing user with Google ID
            user = await prisma.user.update({
              where: { email },
              data: {
                googleId: profile.id,
                name: profile.displayName,
                avatarUrl: profile.photos?.[0]?.value,
              },
            });
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value,
              },
            });
          }

          // Link any pending invitations to this user
          await prisma.invitation.updateMany({
            where: { email, invitedUserId: null },
            data: { invitedUserId: user.id },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
