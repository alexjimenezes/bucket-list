# Bucket List

A collaborative bucket list application where users can create, share, and track their life goals together.

## Features

- **Google Authentication** - Secure login with Google OAuth 2.0
- **Individual & Group Lists** - Create personal bucket lists or share them with others
- **Collaborative** - Invite others by email to join your bucket lists
- **Progress Tracking** - Mark items as done and track completion dates
- **Real-time Invitations** - Accept or decline invitations directly in the app

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport.js + JWT

### Frontend (Coming Soon)
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui

## Project Structure

```
bucket-list/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/       # Database, auth, environment config
│   │   ├── middleware/   # Auth, error handling, async wrapper
│   │   ├── routes/       # API route handlers
│   │   └── __tests__/    # Jest test suites
│   └── prisma/           # Database schema
├── frontend/         # React application (coming soon)
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use [Neon](https://neon.tech) free tier)
- Google Cloud Console project for OAuth

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bucket-list
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run db:push
   npm run dev
   ```

3. **Set up the frontend** (coming soon)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Documentation

- [Backend Setup & API Documentation](./backend/README.md)
- Frontend Documentation (coming soon)

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/google` | GET | Initiate Google OAuth |
| `/auth/me` | GET | Get current user |
| `/bucket-lists` | GET/POST | List/Create bucket lists |
| `/bucket-lists/:id` | GET/PUT/DELETE | Manage bucket list |
| `/bucket-lists/:id/items` | POST | Add item |
| `/bucket-lists/:id/items/:itemId` | PUT/DELETE | Manage item |
| `/bucket-lists/:id/invite` | POST | Invite user by email |
| `/invitations/pending` | GET | Get pending invitations |
| `/invitations/:id/accept` | POST | Accept invitation |
| `/invitations/:id/decline` | POST | Decline invitation |

## License

MIT
