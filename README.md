# CRM Lead Management System

A full-stack CRM take-home assessment project built with **Next.js**, **Express**, and **MongoDB Atlas**.

## Project Overview

This application helps a small sales team manage leads through a pipeline:
- Secure login required to access CRM features
- Lead CRUD with pipeline status management
- Lead notes for follow-up tracking
- Dashboard metrics for quick visibility
- Search and filtering for lead discovery

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend: Node.js, Express, JWT Auth, Mongoose
- Database: MongoDB Atlas (cloud)
- Testing: Jest, Supertest, mongodb-memory-server, React Testing Library

## Implemented Features

- Authentication
  - Login API and protected routes
  - Seeded test user:
    - Email: `admin@example.com`
    - Password: `password123`
- Lead Management
  - Create, read, update, delete leads
  - Update lead status (`New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`)
  - View lead detail
- Lead Notes
  - Add notes to a lead
  - Track note creator and timestamp
- Dashboard
  - Total Leads
  - New Leads
  - Qualified Leads
  - Won Leads
  - Lost Leads
  - Total Estimated Deal Value
  - Total Value of Won Deals
- Search and Filtering
  - Filter by status, lead source, assigned salesperson
  - Search by lead name, company name, or email

## Repository Structure

```txt
.
├── action.yml
├── docker-compose.yml
├── package.json
├── POSTMAN_CHECK_SUMMARY.md
├── README.md
├── REFLECTION.md
├── backend/
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── config.js
│   │   ├── db.js
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed.js
│   │   └── server.js
│   └── tests/
├── frontend/
│   ├── Dockerfile
│   ├── README.md
│   ├── eslint.config.mjs
│   ├── jest.config.js
│   ├── next.config.ts
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── app/
│       ├── lib/
│       └── types/
└── .github/
    └── workflows/
```

## Local Setup Instructions

### 1) Prerequisites

- Node.js 20+
- npm 10+
- MongoDB Atlas database

### 2) Install dependencies

From project root:

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 3) Configure environment variables

Backend:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` values:
- `MONGO_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = any secure string

Frontend:

```bash
cp frontend/.env.example frontend/.env.local
```

### 4) Run the project

Run backend:

```bash
npm run dev --prefix backend
```

Run frontend in a second terminal:

```bash
npm run dev --prefix frontend
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5001`

## Database Setup (MongoDB Atlas)

1. Create an Atlas cluster
2. Create a database user
3. Add your IP/network access rule
4. Copy connection string into `backend/.env` as `MONGO_URI`
5. Start backend once; it auto-seeds test user `admin@example.com`

## API Summary

- `POST /api/auth/login`
- `GET /api/leads`
- `POST /api/leads`
- `GET /api/leads/:id`
- `PUT /api/leads/:id`
- `PATCH /api/leads/:id/status`
- `DELETE /api/leads/:id`
- `POST /api/leads/:id/notes`
- `GET /api/dashboard`

All lead and dashboard endpoints require `Authorization: Bearer <token>`.

## Running Tests

Backend tests:

```bash
npm run test --prefix backend
```

Frontend tests:

```bash
npm run test --prefix frontend
```

Run all tests from root:

```bash
npm test
```

## CI/CD (GitHub Actions)

Workflows live in `.github/workflows/` for CI, CodeQL, dependency review, releases, image publishing, and production deploy.

### Required GitHub secrets

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_PASSWORD`

### GitHub Actions variables

- `NEXT_PUBLIC_API_BASE_URL` (frontend build-time API URL for Docker image builds)

## Environment Variables

Backend:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Frontend:
- `NEXT_PUBLIC_API_BASE_URL`

## Known Limitations

- No role/permission model beyond single authenticated user flow
- No pagination for very large lead datasets
- Basic styling focused on clarity over brand customization
- Frontend tests currently cover key rendering baseline; more UI interaction tests can be added

## Demo Video

Add your video link here before submission (YouTube/Loom/Drive):
- [Demo video](https://drive.google.com/file/d/1l03NZft4yxLpoNcqrVfzFj2KJJaV0n8b/view?usp=sharing)

## Submission Checklist

- [ ] Public GitHub repo link
- [ ] Demo video link
- [ ] Deployed app link (or note not deployed)
- [ ] Verified links in incognito mode
