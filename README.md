# TCET Center of Excellence Portal

TCET Center of Excellence (CoE) is a Next.js application for institutional content and facility reservations. It includes role-based authentication, booking approvals, and content management for grants, events, and news.

## Overview

### Core capabilities

- Facility booking wizard with authentication, OTP verification, and admin approvals
- Role-based access control for Students, Faculty, and Admin
- News, grants, events, and announcements management
- Email notifications for OTPs, approvals, and booking updates
- MinIO integration for file uploads

### Booking resources

- Research Culture Development Room 701 (workstations, computer, deployable server, AI computing server, projector and whiteboard)
- Industrial IoT and OT Room 213 (mock services)
- Robotics and Automation Room 010 (mock services)

## Tech stack

- Next.js 16 (App Router)
- TypeScript, React 19
- Tailwind CSS v4
- Prisma 5 (MySQL)
- JWT access and refresh tokens stored in secure httpOnly cookies
- MinIO (S3 compatible)
- Nodemailer (SMTP)
- Zod validation
- node-cron for reminders

## Architecture

### Authentication flow

```mermaid
flowchart LR
  A[Login form] --> B[POST /api/auth/login]
  B --> C{Credentials valid}
  C -->|No| D[401 / error message]
  C -->|Yes| E[Set httpOnly cookies]
  E --> F[Access token cookie]
  E --> G[Refresh token cookie]
  F --> H[API requests read cookie]
  H --> I[RBAC checks]
  I --> J[Allow or reject]
  G --> K[POST /api/auth/refresh]
  K --> F
```

### Data model

```mermaid
erDiagram
  User ||--o{ Booking : creates
  User ||--o{ NewsPost : posts
  User ||--o{ Grant : posts
  User ||--o{ Event : posts
  User ||--o{ Announcement : creates
  User {
    int id
    string name
    string email
    string role
    string status
    bool isVerified
  }
  Booking {
    int id
    string lab
    string timeSlot
    string status
    string purpose
  }
```

## Project structure

```text
facility-booking-app/
├── prisma/                  # Prisma schema and migrations
├── src/
│   ├── app/
│   │   ├── api/             # Route handlers (auth, admin, content)
│   │   ├── about/           # About page
│   │   ├── admin/           # Admin dashboard
│   │   ├── facility-booking/# Booking wizard
│   │   ├── laboratory/      # Lab page
│   │   └── layout.tsx       # Global layout and fonts
│   ├── components/          # Navbar, footer
│   └── lib/                 # Prisma, JWT, mailer, MinIO, validators
└── .env                     # Environment variables
```

## Local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://root:password@localhost:3306/coe_db"
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
ADMIN_EMAIL="admin@tcetmumbai.in"
ADMIN_PASSWORD="AdminPassword123"
ADMIN_NAME="CoE Admin"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app-specific-password"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

### 3) Database

```bash
npx prisma migrate dev
npx prisma generate
```

### 4) Seed the admin user

Start the dev server:

```bash
npm run dev
```

Seed the admin account:

```bash
curl -X POST http://localhost:3000/api/seed
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## API summary

### Auth

- POST /api/auth/register/student
- POST /api/auth/register/faculty
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- POST /api/auth/verify-otp
- POST /api/auth/resend-otp

### Bookings

- POST /api/bookings
- GET /api/bookings/my
- GET /api/bookings/[id]
- PATCH /api/admin/bookings/[id]/confirm
- PATCH /api/admin/bookings/[id]/reject

### Admin

- GET /api/admin/stats
- GET /api/admin/users
- GET /api/admin/bookings
- PATCH /api/admin/faculty/[id]/approve
- PATCH /api/admin/faculty/[id]/reject

### Content

- GET /api/news
- POST /api/news
- GET /api/events
- POST /api/events
- GET /api/grants
- POST /api/grants
- GET /api/announcements
- POST /api/announcements

## Notes

- Access tokens are stored in httpOnly cookies and validated in route handlers.
- Refresh tokens are stored in httpOnly cookies for session renewal.
- Booking reminders are sent by the cron route.
