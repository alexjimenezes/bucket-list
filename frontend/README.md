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

## Production Deployment

Build the app:
```bash
npm run build
```

The `dist/` folder contains the static files to deploy. Options include:

- **Vercel**: Connect your repo, it auto-detects Vite
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`
- **Any static host**: Upload the `dist/` folder

### Environment Variables

For production, ensure your backend URL is correctly configured in the proxy or API client.
