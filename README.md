# Alwar Police Internship Programme 2026
### Cyber Security Internship Programme — Official Portal

[![Deployment: Vercel](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://vercel.com)
[![Database: Neon PostgreSQL](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?logo=postgresql)](https://neon.tech)
[![ORM: Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://prisma.io)
[![Security: HTTPS & Hashed](https://img.shields.io/badge/Security-AES%20%2F%20Bcrypt-00A8E8)](https://alwarpolice.gov.in)

A complete, production-ready web application for the **Alwar Police Internship Programme 2026 (Cyber Security Internship Programme)**. This system serves as the official student registration, multi-step qualification portal, collision-safe Application ID generator, dynamic A4 Registration Slip & QR code verification system, and secure administrative management platform.

---

## 🏛️ System Features

### 1. Public Student Portal
- **Hero & Programme Details**: Exact official titles, curriculum, forensic laboratory exposure, timeline, and FAQs.
- **Strict Eligibility Verification**: Enforced at frontend, backend, and database levels:
  - **Eligible Courses**: strictly `BCA`, `B.Tech`, `MCA`
  - **Eligible Years**: strictly `2nd Year`, `3rd Year`, `4th Year`
- **6-Step Registration Wizard**:
  - **Step 1 - Personal Details**: Name, 10-digit Indian mobile number validation (`^[6-9]\d{9}$`), email format verification.
  - **Step 2 - Academic Details**: Course, year, and university/college name.
  - **Step 3 - Cyber Security Skills**: Multi-select tag system for 30+ domains (*Ethical Hacking, Penetration Testing, Cyber Forensics, OSINT, SOC, SIEM, Reverse Engineering, DFIR, etc.*) + Custom skill addition with validation and duplicate prevention.
  - **Step 4 - Statement of Motivation**: 50–1000 characters with real-time character counter.
  - **Step 5 - Resume Upload**: Drag-and-drop support for PDF, DOC, DOCX up to 5 MB with MIME/size checking.
  - **Step 6 - Review & Edit**: Full application dossier summary with per-section edit buttons.
- **Unique Application ID Generation**: Collision-safe sequential format (`APCSIP2026-000001`).
- **Duplicate Prevention**: Strict unique constraints on Email and Mobile with friendly error handling.

### 2. A4 Registration Slip & QR Verification
- **A4 PDF Generation**: Clean, official-looking layout with applicant details, academic qualifications, selected skills, motivation statement, and instructions.
- **Dynamic QR Code**: Encodes `https://<domain>/verify/APCSIP2026-000001`.
- **Public Verification Route (`/verify/:applicationId`)**: Displays only non-sensitive verification status (Application ID, Applicant Name, Course, Year, Status, Registration Date). Withholds sensitive personal info.

### 3. Secure Admin Portal (`/admin`)
- **Authentication**: Bcrypt password hashing (12 rounds), JWT tokens in secure HTTP-only cookies + Bearer header fallback, login rate limiting (5 attempts / 15 min).
- **Dashboard & KPIs**: Real-time stats (Total, Submitted, Under Review, Shortlisted, Selected, Rejected) and Recharts visualizations (Course breakdown, Year breakdown, Status distribution, Registration trend, Top skills).
- **Application Management**: Server-side multi-field search (Name, App ID, Email, Mobile, University), multi-filter (Course, Year, Status, Date range), and server-side pagination (20, 50, 100).
- **Application Dossier View**: Complete candidate profile, resume viewer/streamer, status change workflow with remarks, and registration slip download.
- **Data Export**: CSV and XLSX (Excel) export respecting active search filters.
- **Security Audit Trail**: Immutable logging of all officer actions (Login, Logout, Dossier View, Status Change, Data Export).

---

## 💻 Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router 7, Recharts, QRCode.React, Canvas Confetti.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, Zod, Multer, PDFKit, QRCode, XLSX, BcryptJS, JSONWebToken, Helmet, Express-Rate-Limit.
- **Database**: PostgreSQL / Neon PostgreSQL with Prisma Client.
- **Storage**: Configurable storage driver (Local encrypted disk / Vercel Blob / S3 / DB backup).

---

## 📁 Folder Structure

```
alwar-police-internship/
├── package.json               # Root monorepo orchestrator
├── vercel.json                # Vercel full-stack deployment configuration
├── .env.example               # Environment variables template
├── README.md
├── prisma/
│   ├── schema.prisma          # PostgreSQL / Neon schema
│   └── seed.ts                # Database seed script for initial admin & sequence counter
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts           # Express server & security headers
│       ├── config/            # Database and environment configs
│       ├── controllers/       # Application, Admin, Verify controllers
│       ├── middleware/        # Auth, Rate limiting, Uploads, Error handling
│       ├── routes/            # REST API endpoints
│       ├── services/          # Business logic, Storage, PDF, Audit, Export
│       ├── utils/             # ID generator, Sanitizer, Response helpers
│       └── validators/        # Zod input schemas
└── client/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.tsx            # Routes and layout guards
        ├── main.tsx           # React DOM root
        ├── types/             # TypeScript interfaces
        ├── context/           # AuthContext & ToastContext
        ├── services/          # Axios API layer
        ├── components/        # Navbar, Footer, Slip, Badges, Modals
        └── pages/             # Home, Register, Success, Verify, Admin Portal
```

---

## 🚀 Quick Setup & Local Development

### 1. Prerequisites
- Node.js **v18+** or **v20+**
- PostgreSQL (Local or a free [Neon](https://neon.tech) serverless database)

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repo-url>
cd alwar-police-internship

# Install root, server, and client dependencies
npm run install:all
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the root (or inside `server/`):
```bash
cp .env.example .env
```

Set your database and admin credentials in `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@ep-example-pooler.region.aws.neon.tech/alwar_internship?sslmode=require"
AUTH_SECRET="your-super-secure-jwt-secret-key-32-chars-min"
ADMIN_EMAIL="admin@alwarpolice.gov.in"
ADMIN_PASSWORD="your-strong-production-admin-password"
FRONTEND_URL="http://localhost:5173"
PUBLIC_APP_URL="http://localhost:5173"
STORAGE_PROVIDER="LOCAL"
```

### 4. Database Migration & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run --workspace=server prisma:push

# Seed default admin user & sequence counter
npm run prisma:seed
```

### 5. Start Development Servers
```bash
# Starts both Express API (:5000) and React Vite Client (:5173) concurrently
npm run dev
```

Visit:
- **Public Portal**: `http://localhost:5173`
- **Student Registration**: `http://localhost:5173/register`
- **Admin Portal**: `http://localhost:5173/admin/login`
- **Backend Health Check**: `http://localhost:5000/api/health`

---

## 🔐 Admin Authentication & Security
- Admin access is strictly secured with Bcrypt password hashing (12 rounds) and JWT authentication.
- Admin credentials must be configured securely via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`) in your deployment environment.
- Never commit production passwords or secrets into version control.

---

## 🌐 Vercel Deployment

1. Push this repository to GitHub / GitLab.
2. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. Configure Environment Variables in Vercel Project Settings:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `AUTH_SECRET`: Random 32+ character string.
   - `ADMIN_EMAIL`: `admin@alwarpolice.gov.in`
   - `ADMIN_PASSWORD`: Secure production password.
   - `PUBLIC_APP_URL`: Your Vercel domain (e.g. `https://alwar-cyber-internship.vercel.app`).
   - `STORAGE_PROVIDER`: `LOCAL` or `VERCEL_BLOB`.
4. Deploy! Vercel will automatically build the React Vite static bundle and serverless API endpoints using `vercel.json`.

---

## 🛡️ Security Best Practices Implemented

- **No Plaintext Passwords**: Passwords hashed with Bcrypt (12 rounds).
- **HTTP-Only Cookies**: Prevents XSS token theft for admin sessions.
- **Strict Parameterized Queries**: Prisma ORM safeguards against SQL Injection.
- **Input Sanitization & Validation**: Zod schema validation on every input field.
- **Rate Limiting**: Login endpoint brute-force protection (5 attempts / 15 min) and registration DDoS mitigation.
- **Privacy Masking**: Public verification endpoints omit contact numbers, email, motivation, and resume files.
- **Path Traversal Protection**: Resume filename sanitation and strict extension validation.
- **Audit Logging**: Immutable tracking of administrative operations with IP logging.

---

## 📜 Official Disclaimer
This application is created for the **Alwar Police Internship Programme 2026**. No fake government seals, police emblems, or unauthorized logos are embedded.
