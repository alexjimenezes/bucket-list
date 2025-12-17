# Bucket List Frontend

A React frontend for the Bucket List application, allowing users to create and manage personal and shared bucket lists.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS v4** for styling
- **TanStack Query** for server state management
- **React Router** for client-side routing

## Prerequisites

- Node.js 18+
- Backend server running (see `../backend/README.md`)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:5173

## Configuration

The development server proxies `/api` requests to `http://localhost:3001`. This can be modified in `vite.config.ts`.

For production, set the `VITE_API_URL` environment variable or configure your hosting provider to proxy API requests.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base components (Button, Input, Card, etc.)
│   └── Layout.tsx   # App layout with header
├── hooks/           # Custom React hooks
│   └── useAuth.tsx  # Authentication context
├── lib/             # Utilities and API client
│   ├── api.ts       # API client functions
│   └── utils.ts     # Helper functions
├── pages/           # Route components
│   ├── Login.tsx
│   ├── AuthCallback.tsx
│   ├── Dashboard.tsx
│   └── BucketListDetail.tsx
├── types/           # TypeScript type definitions
├── App.tsx          # Main app with routing
├── main.tsx         # Entry point
└── index.css        # Global styles and Tailwind config
```

## Features

- **Google OAuth** authentication
- **Dashboard** with list overview and pending invitations
- **Bucket List Detail** view with item management
- **Celebration modal** when completing items
- **Group list support** with member avatars
- **Invite system** for sharing lists

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

The app uses a custom theme defined in `src/index.css`:

- **Primary color**: Indigo palette (#6366f1)
- **Success color**: Emerald palette (#10b981)
- **Accent color**: Amber palette (#f59e0b)
- **Font**: Plus Jakarta Sans

## Deployment

### Vercel Deployment (Recommended)

#### Step 1: Create Project

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click **Add New** → **Project**
3. Import your `bucket-list` repository
4. Configure the project:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

#### Step 2: Configure Environment Variables

Add this environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` |

> **Important:** Use the full backend URL with `https://`

#### Step 3: Deploy

Click **Deploy**. Vercel will:
1. Clone your repo
2. Install dependencies
3. Build the app
4. Deploy to CDN

First deploy takes 1-2 minutes.

### Custom Domain Setup

#### Step 1: Add Domain in Vercel

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `bucketlist.yourdomain.com`)
4. Vercel will show DNS configuration instructions

#### Step 2: Configure DNS

In your domain registrar (e.g., IONOS, Cloudflare, GoDaddy):

**For subdomain (recommended):**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `bucketlist` | `cname.vercel-dns.com` | 3600 |

**For apex domain:**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `76.76.21.21` | 3600 |

#### Step 3: Update Backend CORS

After setting up your custom domain, update the backend's `FRONTEND_URL` environment variable in Render:

```
FRONTEND_URL=https://bucketlist.yourdomain.com
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (prod) | Backend API URL. Not needed in dev (uses proxy) |

### SPA Routing

The `vercel.json` file configures rewrites for client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures all routes (like `/list/123`) serve `index.html` and let React Router handle them.

### Alternative Platforms

**Netlify:**
1. Connect GitHub repo
2. Set **Base directory** to `frontend`
3. Set **Build command** to `npm run build`
4. Set **Publish directory** to `frontend/dist`
5. Add `_redirects` file: `/* /index.html 200`

**Any Static Host:**
```bash
npm run build
# Upload contents of dist/ folder
```

### Local Production Preview

```bash
npm run build
npm run preview
# Opens at http://localhost:4173
```
