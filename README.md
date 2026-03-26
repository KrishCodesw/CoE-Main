# TCET Center of Excellence (CoE) Portal

A production-ready, high-performance web platform built for the **TCET Center of Excellence (CoE)** at TCET Mumbai. This portal integrates institutional branding with advanced facility reservation systems, research management, and administrative workflows.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Standardized institutional palette: Navy `#002155`, Gold `#fd9923`)
- **Design System:** Institutional Editorial (0px border-radius, premium typography)
- **Icons:** Material Symbols Outlined

### Backend (Integrated Next.js API Routes)
- **Runtime:** Node.js
- **Database:** MySQL via **Prisma 5.22 ORM**
- **Authentication:** JWT (Access/Refresh Token pattern) with `bcryptjs` and Secure `httpOnly` cookies
- **File Storage:** Self-hosted **MinIO** (S3-compatible) via SDK
- **Emailing:** **Nodemailer** (SMTP) with institutional HTML templates
- **Validation:** Type-safe request validation with **Zod**
- **Scheduled Tasks:** `node-cron` for automated booking reminders

---

## 🛠️ Key Features

### 1. Advanced Facility Booking System
- **Strict Authentication Gate:** Restricted to `@tcetmumbai.in` domain users.
- **Role-Based Access (RBAC):** Distinct workflows for **Students**, **Faculty**, and **Admins**.
- **Interactive Wizard:** 
  - **Identity:** Email validation + 6-digit OTP verification.
  - **Profile:** Role-specific registration (UID validation for students).
  - **Scheduling:** Real-time selection of laboratories, equipment (NVIDIA DGX, VLSI tools), and date/time slots.
- **Approval Workflow:** Bookings are queued for Admin/Superintendent clearance.

### 2. Research & News Management
- **Grants Directory:** Repository of industry, government, and research grants with PDF attachment support (MinIO).
- **In the Press (News):** Dynamic news section for paper cut-outs and institutional updates with image persistence.
- **Events Engine:** Management of Online/Offline/Hybrid events with poster uploads.
- **Notice Ticker:** Real-time scrolling announcements for urgent updates.

### 3. Integrated Backend Services
- **MinIO Integration:** Automated bucket management and secure presigned URL generation for assets.
- **Nodemailer Workflows:** 
  - Automated OTP dispatch.
  - Faculty registration alerts for Admins.
  - Booking confirmation/rejection receipts.
  - 30-minute pre-booking reminders.
- **Admin Dashboard:** Centralized stats and management for users and reservations.

---

## 📂 Project Structure

```text
facility-booking-app/
├── prisma/                  # Database schema & migrations
├── src/
│   ├── app/
│   │   ├── api/             # Backend API Routes (Auth, Admin, Content)
│   │   ├── about/           # About Us pages
│   │   ├── facility-booking/# Interactive booking wizard
│   │   ├── laboratory/      # Lab infrastructure catalog
│   │   └── layout.tsx       # Global fonts & styles (Next.js)
│   ├── components/          # Shared UI (Navbar, Footer, Ticker)
│   └── lib/                 # Core Utilities
│       ├── prisma.ts        # Prisma Client singleton
│       ├── jwt.ts           # Token generation/verification
│       ├── mailer.ts        # Email templates & transport
│       ├── minio.ts         # S3 storage interaction
│       └── validators.ts    # Zod API request schemas
└── .env                     # Configuration variables
```

---

## ⚙️ Setup & Installation

### 1. Environment Configuration
Create a `.env` file in the root directory with the following variables:

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

### 2. Database Initialization
```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Seed Admin Account
Start the development server:
```bash
npm run dev
```
Make a `POST` request to `http://localhost:3000/api/seed` to initialize the administrative account.

---

## 📡 API Endpoints Summary

### Authentication
- `POST /api/auth/register/student`: Signup with email OTP.
- `POST /api/auth/register/faculty`: Signup (requires admin approval).
- `POST /api/auth/login`: Issue tokens & cookies.
- `POST /api/auth/verify-otp`: Email verification processing.

### Reservations
- `POST /api/bookings`: Create a reservation (Student).
- `GET /api/bookings/my`: List student's requests.
- `PATCH /api/admin/bookings/[id]/confirm`: Approve a slot (Admin).

### Content Management
- `POST /api/news`: Upload press updates (Faculty/Admin).
- `GET /api/grants`: Public view of research opportunities.
- `POST /api/events`: Schedule institutional seminars.

---
*Developed for the TCET Center of Excellence. Standardized for Institutional Excellence.*
