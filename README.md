# Zorvyn Finance Backend

Production-style Node.js backend for finance data processing with Express, TypeScript, Prisma, PostgreSQL, JWT auth, and RBAC.

## Requirements

- Node.js 20+
- PostgreSQL

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   copy .env.example .env
   ```

3. Update `DATABASE_URL` and `JWT_SECRET` in `.env`.

4. Generate Prisma client and run migrations:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Seed the database:

   ```bash
   npx prisma db seed
   ```

6. Start the server:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - run in development
- `npm run build` - compile TypeScript
- `npm run start` - run compiled server
- `npm run test` - run tests once
- `npm run test:watch` - run tests in watch mode
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - create and apply migrations
- `npm run prisma:seed` - seed data

## Enhancements Included

- JWT authentication for protected routes
- RBAC for viewer, analyst, and admin access
- Pagination and search for list endpoints
- Soft delete for records
- Rate limiting on auth endpoints
- Unit and integration tests

## API Overview

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/records`
- `POST /api/v1/records`
- `GET /api/v1/dashboard/summary`

## Notes

- Controllers only handle request and response.
- Services hold business logic only.
- Repositories contain Prisma queries only.
- RBAC is handled through `authorize(roles)` middleware.