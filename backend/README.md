# Bucket List - Backend

Express.js REST API server for the Bucket List application.

## Table of Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [Testing](#testing)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Known Limitations & Future Improvements](#known-limitations--future-improvements)

## Requirements

- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL 14+ (or Neon/Supabase hosted)

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#environment-variables)).

### 3. Set Up Database

```bash
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client (auto-runs after push)
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3001`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) | `your-secret-key-here` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - Development: `http://localhost:3001/auth/google/callback`
   - Production: `https://your-api-domain.com/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### Generating JWT Secret

```bash
openssl rand -base64 32
```

## Database Setup

### Using Neon (Recommended for Development)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Using Local PostgreSQL

```bash
# Create database
createdb bucketlist

# Set DATABASE_URL
DATABASE_URL="postgresql://localhost:5432/bucketlist"
```

### Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

### Database Schema

```
User
├── id (UUID)
├── email (unique)
├── name
├── googleId (unique)
├── avatarUrl
└── createdAt, updatedAt

BucketList
├── id (UUID)
├── name
├── description
├── type (individual/group)
└── createdAt, updatedAt

BucketListMember (join table)
├── id (UUID)
├── userId → User
├── bucketListId → BucketList
├── role (owner/member)
└── joinedAt

BucketListItem
├── id (UUID)
├── bucketListId → BucketList
├── text
├── done
├── completedAt
├── completedById
└── createdAt, updatedAt

Invitation
├── id (UUID)
├── bucketListId → BucketList
├── invitedById → User
├── email
├── invitedUserId → User (nullable)
├── status (pending/accepted/declined)
└── createdAt
```

## Running the Server

### Development

```bash
npm run dev
```

Features:
- Hot reload on file changes
- Source maps for debugging
- Environment variable logging

### Production

```bash
npm run build    # Compile TypeScript
npm run start    # Run compiled JavaScript
```

## Testing

> **Warning:** Tests currently run against your main database (`DATABASE_URL`). Test data is cleaned up automatically, but see [Known Limitations](#known-limitations--future-improvements) for recommended improvements.

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Structure

```
src/__tests__/
├── setup.ts           # Jest setup, database connection
├── helpers.ts         # Test utilities (createTestUser, etc.)
├── globalSetup.ts     # Cleanup before all tests
├── globalTeardown.ts  # Cleanup after all tests
├── auth.test.ts       # Auth route tests
├── bucketLists.test.ts # Bucket list CRUD tests
├── items.test.ts      # Item CRUD tests
└── invitations.test.ts # Invitation flow tests
```

## API Reference

### Authentication

All endpoints except `/auth/google` and `/health` require authentication via:
- HTTP-only cookie (`token`)
- Or Authorization header: `Bearer <token>`

### Endpoints

#### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Redirect to Google OAuth |
| GET | `/auth/google/callback` | OAuth callback (sets cookie) |
| POST | `/auth/logout` | Clear auth cookie |
| GET | `/auth/me` | Get current user |

#### Bucket Lists

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/bucket-lists` | List user's bucket lists | Required |
| POST | `/bucket-lists` | Create bucket list | Required |
| GET | `/bucket-lists/:id` | Get bucket list with items | Member |
| PUT | `/bucket-lists/:id` | Update bucket list | Owner |
| DELETE | `/bucket-lists/:id` | Delete bucket list | Owner |

**Create/Update Body:**
```json
{
  "name": "string (required, 1-100 chars)",
  "description": "string (optional, max 500 chars)",
  "type": "individual | group (default: individual)"
}
```

#### Items

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/bucket-lists/:id/items` | Add item | Member |
| PUT | `/bucket-lists/:id/items/:itemId` | Update item | Member |
| DELETE | `/bucket-lists/:id/items/:itemId` | Delete item | Member |

**Create Body:**
```json
{
  "text": "string (required, 1-500 chars)"
}
```

**Update Body:**
```json
{
  "text": "string (optional)",
  "done": "boolean (optional)"
}
```

#### Invitations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/bucket-lists/:id/invite` | Invite by email | Owner |
| GET | `/invitations/pending` | Get pending invitations | Required |
| POST | `/invitations/:id/accept` | Accept invitation | Invitee |
| POST | `/invitations/:id/decline` | Decline invitation | Invitee |

**Invite Body:**
```json
{
  "email": "string (valid email)"
}
```

### Response Formats

**Success:**
```json
{
  "bucketList": { ... },
  "bucketLists": [ ... ],
  "item": { ... },
  "invitation": { ... },
  "invitations": [ ... ],
  "message": "string"
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (not owner/member) |
| 404 | Not found |
| 500 | Internal server error |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts    # Prisma client
│   │   ├── env.ts         # Environment variables
│   │   └── passport.ts    # Google OAuth strategy
│   ├── middleware/
│   │   ├── asyncHandler.ts  # Async route wrapper
│   │   ├── auth.ts          # JWT auth middleware
│   │   └── errorHandler.ts  # Error handling
│   ├── routes/
│   │   ├── auth.ts          # /auth/* routes
│   │   ├── bucketLists.ts   # /bucket-lists/* routes
│   │   ├── invitations.ts   # Invitation routes
│   │   ├── items.ts         # Item routes
│   │   └── index.ts         # Route aggregator
│   ├── __tests__/           # Test files
│   ├── app.ts               # Express app setup
│   └── index.ts             # Server entry point
├── prisma/
│   └── schema.prisma        # Database schema
├── .env.example             # Environment template
├── jest.config.js           # Jest configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
```

## Deployment

### Render Deployment (Recommended)

#### Step 1: Create Web Service

1. Go to [render.com](https://render.com) and sign up/login with GitHub
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `bucket-list-api` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

#### Step 2: Configure Environment Variables

Add these environment variables in Render dashboard:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3001` | Render also sets this automatically |
| `DATABASE_URL` | `postgresql://...` | Your Neon connection string |
| `JWT_SECRET` | `<random-32-char-string>` | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx` | From Google Cloud Console |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your frontend URL (with https) |
| `BACKEND_URL` | `https://your-app.onrender.com` | Your Render URL (with https) |

> **Important:** Both `FRONTEND_URL` and `BACKEND_URL` must use `https://`

#### Step 3: Update Google OAuth

In [Google Cloud Console](https://console.cloud.google.com):

1. Go to **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client
3. Add to **Authorized redirect URIs**:
   ```
   https://your-app.onrender.com/auth/google/callback
   ```
   > **Must be HTTPS** - Google requires HTTPS for production OAuth

#### Step 4: Deploy

Click **Create Web Service**. Render will:
1. Clone your repo
2. Run build command
3. Start the server

First deploy takes 2-5 minutes. Subsequent deploys are faster.

### Cross-Domain Cookie Configuration

This app uses HTTP-only cookies for authentication. Since the backend and frontend are on different domains, cookies are configured with:

```javascript
{
  httpOnly: true,
  secure: true,        // HTTPS only
  sameSite: 'none',    // Allow cross-domain
}
```

This requires:
- Both frontend and backend must use HTTPS
- `credentials: 'include'` in frontend fetch requests (already configured)

### Health Check

```bash
curl https://your-app.onrender.com/health
# {"status":"ok","timestamp":"..."}
```

### Alternative Platforms

**Backend Hosting:**
- [Railway](https://railway.app) - Easy deploys, limited free tier
- [Fly.io](https://fly.io) - Global edge deployment

**Database:**
- [Neon](https://neon.tech) - Serverless Postgres, free tier (recommended)
- [Supabase](https://supabase.com) - Postgres with extras
- [Railway](https://railway.app) - Managed Postgres

## Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Ensure all variables in `.env.example` are set in `.env`

**"Database connection failed"**
- Check `DATABASE_URL` format
- Ensure database exists and is accessible
- Check network/firewall settings

**"Invalid token"**
- Token may be expired (7 day expiry)
- Clear cookies and re-authenticate

**"CORS error"**
- Ensure `FRONTEND_URL` matches your frontend origin exactly
- Include protocol (http/https)

**"Google OAuth error"**
- Verify redirect URI matches exactly in Google Console
- Check client ID and secret are correct
- Ensure OAuth consent screen is configured

### Logs

Development server logs all requests and errors to console.

For production, consider adding:
- Winston or Pino for structured logging
- Error tracking (Sentry, etc.)

### Database Issues

```bash
# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# View database in browser
npm run db:studio
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Run production server |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## Known Limitations & Future Improvements

### Test Database Isolation (High Priority)

**Current Behavior:**
Tests run against the production/development database specified in `DATABASE_URL`. While test data is automatically cleaned up (users with `@test.com` emails, bucket lists starting with `Test `), this approach has risks:

- If tests crash or timeout, test data may remain in the database
- Potential for accidental interference with real data
- Network latency to remote database slows test execution

**Recommended Improvement:**
Set up a separate test database using one of these approaches:

1. **Separate Neon Database**
   ```bash
   # Create .env.test
   DATABASE_URL="postgresql://...separate-test-db..."
   ```
   Update Jest config to load `.env.test`:
   ```js
   // jest.config.js
   setupFiles: ['dotenv/config'],
   ```

2. **Local PostgreSQL for Tests**
   ```bash
   # .env.test
   DATABASE_URL="postgresql://localhost:5432/bucketlist_test"
   ```

3. **Neon Database Branching**
   Use Neon's branching feature to create an isolated `test` branch that can be reset between test runs.

4. **In-Memory Database**
   Use SQLite with Prisma for faster, isolated tests (requires schema compatibility adjustments).

### Other Future Improvements

- **Rate Limiting** - Add rate limiting to prevent API abuse
- **Request Logging** - Structured logging with Winston/Pino for production
- **Error Tracking** - Integration with Sentry or similar service
- **API Documentation** - Auto-generated OpenAPI/Swagger docs
- **Input Sanitization** - Additional XSS/injection protection
- **Refresh Tokens** - Implement refresh token rotation for better security
