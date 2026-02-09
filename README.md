# AI-Assisted Learning Platform

A scalable, production-ready foundation for an AI-assisted learning platform built with **React**, **Supabase**, and **Cloudflare Workers**. This README outlines architecture, setup, environment variables, deployment, and operational considerations.

## Stack

- **Frontend:** React (Vite)
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime)
- **Edge/API:** Cloudflare Workers (API gateway, caching, rate limiting)
- **CI/CD:** GitHub Actions (recommended)

## Architecture Overview

```
[React App] → [Cloudflare Worker API Gateway] → [Supabase]
                                  ↘︎ [3rd-party AI Providers]
```

### Key Responsibilities

- **React App:** UI, client-side routing, session handling, and realtime UI updates.
- **Cloudflare Workers:** Secure API gateway, request validation, cache, rate limiting, and AI provider proxying.
- **Supabase:** Auth, database, storage, and realtime subscriptions.

## Features

- User authentication (email/password, OAuth)
- Course and lesson management
- AI tutor sessions (streaming response support)
- Progress tracking and analytics
- Realtime updates for collaborative study
- Role-based access control (RBAC)

## Repository Structure

```
/
├── apps/
│   └── web/               # React app (Vite)
├── workers/
│   └── api/               # Cloudflare Worker API gateway
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── seed.sql           # Optional seed data
└── README.md
```

## Getting Started

### 1) Prerequisites

- Node.js 20+
- pnpm or npm
- Supabase CLI
- Cloudflare Wrangler CLI

### 2) Clone

```
git clone <your-repo-url>
cd ai-study-platform
```

### 3) Install Dependencies

```
# Web app
cd apps/web
pnpm install

# Worker
cd ../../workers/api
pnpm install
```

### 4) Supabase Setup

```
# Initialize and start Supabase locally
supabase init
supabase start

# Apply migrations
supabase db reset
```

### 5) Environment Variables (Local Development)

Create the following files at these paths:

- [apps/web/.env](apps/web/.env)
- [workers/api/.env](workers/api/.env)

#### Web App (.env)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=

For local Supabase, you can copy values from the output of `supabase status`:

- `VITE_SUPABASE_URL` → `API URL`
- `VITE_SUPABASE_ANON_KEY` → `anon key`
```

#### Worker (.env)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER_API_KEY=
CORS_ALLOWED_ORIGINS=

For local Supabase, use:

- `SUPABASE_URL` → `API URL` from `supabase status`
- `SUPABASE_SERVICE_ROLE_KEY` → `service_role key` from `supabase status`
```

> Do not commit real secrets. Keep `.env` files out of git and use `.env.local` for local overrides if needed.

## Development

### Run the Web App

```
cd apps/web
pnpm dev
```

### Run the Worker

```
cd workers/api
pnpm dev
```

### Run Supabase

```
supabase start
```

## Deployment

### React App

- Build with `pnpm build`
- Deploy to Vercel, Cloudflare Pages, or Netlify

### Cloudflare Worker

```
cd workers/api
pnpm deploy
```

### Supabase

- Use Supabase Cloud for production
- Apply migrations via `supabase db push`

## Security & Compliance

- Use Row Level Security (RLS) on all tables
- Enforce RBAC policies for course content and admin features
- Secure secrets using Cloudflare and Supabase environment settings
- Add request validation and rate limiting at the Worker layer

## Observability

- Client: Sentry (React)
- Worker: Cloudflare Analytics + Logpush
- DB: Supabase logs + Postgres metrics

## Suggested Database Schema (High-Level)

- `profiles` (user metadata)
- `courses`
- `lessons`
- `enrollments`
- `progress`
- `ai_sessions`
- `messages`

## Roadmap

- [ ] AI-powered lesson recommendations
- [ ] Offline mode
- [ ] Content authoring tools
- [ ] Org/team support

## License

MIT
