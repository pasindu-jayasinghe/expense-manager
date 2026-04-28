# Expensely — Smart Expense Manager

A production-grade, full-stack expense management application built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, and **Prisma 7**. Features a premium dark-theme UI with glassmorphism, interactive charts, and secure JWT-based authentication.

---

## ✨ Features

- **Authentication** — Secure JWT-based sessions via NextAuth.js (signup, login, role-based access)
- **Dashboard** — Financial summaries with interactive Recharts (monthly trends & category breakdown)
- **Expense Management** — Full CRUD with search, filtering, and attachment support
- **Categories** — Default system categories + custom user-defined categories
- **User Settings** — Configurable currency, theme, and profile management
- **Security** — Input validation, SQL injection protection (Prisma), auth middleware
- **Premium UI** — Dark-theme glassmorphism design with responsive sidebar navigation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                   │
│   Next.js App Router  ·  React 19  ·  Tailwind CSS 4    │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│                   Next.js Server (Vercel)                │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  App Router  │  │  API Routes  │  │  Auth (NextAuth)│ │
│  │  (Pages/UI)  │  │  /api/*      │  │  JWT Sessions   │ │
│  └─────────────┘  └──────┬───────┘  └────────┬───────┘  │
│                          │                    │          │
│                ┌─────────▼────────────────────▼───────┐  │
│                │  Prisma 7 ORM (Driver Adapter: pg)   │  │
│                └─────────────────┬────────────────────┘  │
└──────────────────────────────────┼───────────────────────┘
                                   │ TCP (port 6543 pooled)
                    ┌──────────────▼──────────────┐
                    │   Supabase PostgreSQL        │
                    │   (PgBouncer Connection      │
                    │    Pooler + Direct Access)    │
                    └─────────────────────────────┘
```

---

## 🗂️ Project Structure

```
expense-manager/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Inter font, dark theme, sidebar)
│   ├── page.tsx                  # Dashboard (home page)
│   ├── globals.css               # Global styles & Tailwind CSS
│   ├── login/page.tsx            # Login page
│   ├── signup/page.tsx           # Signup page
│   ├── expenses/page.tsx         # Expense list & management
│   ├── categories/page.tsx       # Category management
│   ├── settings/page.tsx         # User settings
│   └── api/                      # API Routes (RESTful)
│       ├── auth/
│       │   ├── [...nextauth]/route.ts   # NextAuth handler
│       │   └── signup/route.ts          # POST /api/auth/signup
│       ├── expenses/
│       │   ├── route.ts                 # GET & POST /api/expenses
│       │   └── [id]/route.ts            # GET, PUT, DELETE /api/expenses/:id
│       ├── categories/route.ts          # GET & POST /api/categories
│       ├── stats/route.ts              # GET /api/stats (dashboard data)
│       └── user/route.ts               # GET & PUT /api/user
│
├── components/                   # Reusable React components
│   ├── dashboard/
│   │   ├── StatCard.tsx          # Summary stat cards
│   │   ├── ExpenseCharts.tsx     # Recharts (bar + pie charts)
│   │   └── RecentExpenses.tsx    # Recent expenses list
│   ├── expenses/
│   │   ├── ExpenseForm.tsx       # Add/edit expense form
│   │   └── ExpenseList.tsx       # Filterable expense table
│   ├── layout/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── Navbar.tsx            # Top navbar
│   └── providers/
│       └── SessionProvider.tsx   # NextAuth session provider
│
├── lib/                          # Shared utilities
│   ├── prisma.ts                 # Prisma client singleton (pg driver adapter)
│   ├── auth-utils.ts             # Auth helper functions
│   └── utils.ts                  # General utilities (cn, formatCurrency, etc.)
│
├── types/
│   └── next-auth.d.ts            # NextAuth type augmentation (role, id)
│
├── prisma/
│   ├── schema.prisma             # Database schema (User, Category, Expense)
│   └── migrations/               # Prisma migration history
│
├── prisma.config.ts              # Prisma 7 CLI configuration (datasource URL)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── .env                          # Environment variables (gitignored)
```

---

## 🗄️ Database Schema

```
┌──────────────────────┐       ┌──────────────────────┐
│        User          │       │      Category         │
├──────────────────────┤       ├──────────────────────┤
│ id         (UUID PK) │◄──┐   │ id        (UUID PK)  │
│ email      (unique)  │   │   │ name                 │
│ password   (hashed)  │   │   │ type   (default/custom)│
│ name                 │   ├──►│ userId  (FK → User?)  │
│ role    (USER/ADMIN) │   │   │ createdAt            │
│ currency  (USD)      │   │   │ updatedAt            │
│ theme     (dark)     │   │   └──────────┬───────────┘
│ createdAt            │   │              │
│ updatedAt            │   │              │ 1:N
└──────────────────────┘   │              │
         │                 │   ┌──────────▼───────────┐
         │ 1:N             │   │      Expense          │
         │                 │   ├──────────────────────┤
         └────────────────►│   │ id          (UUID PK) │
                           │   │ amount      (Decimal) │
                           │   │ description           │
                           │   │ date                  │
                           │   │ attachmentUrl         │
                           ├──►│ userId    (FK → User)  │
                               │ categoryId (FK → Cat)  │
                               │ createdAt             │
                               │ updatedAt             │
                               └──────────────────────┘
```

**Relationships:**
- A **User** has many **Expenses** and many **Categories**
- A **Category** belongs to a **User** (optional, for custom categories) and has many **Expenses**
- An **Expense** belongs to one **User** and one **Category**

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register a new user | ❌ |
| `POST` | `/api/auth/[...nextauth]` | NextAuth sign in/out | ❌ |

### Expenses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/expenses` | List expenses (with filters) | ✅ |
| `POST` | `/api/expenses` | Create a new expense | ✅ |
| `GET` | `/api/expenses/:id` | Get expense by ID | ✅ |
| `PUT` | `/api/expenses/:id` | Update an expense | ✅ |
| `DELETE` | `/api/expenses/:id` | Delete an expense | ✅ |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/categories` | List categories | ✅ |
| `POST` | `/api/categories` | Create custom category | ✅ |

### Dashboard & User
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/stats` | Dashboard summary & chart data | ✅ |
| `GET` | `/api/user` | Get current user profile | ✅ |
| `PUT` | `/api/user` | Update user settings | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Icons** | Lucide React | 0.563+ |
| **Charts** | Recharts | 3.7+ |
| **Auth** | NextAuth.js | 4.24+ |
| **ORM** | Prisma (with pg driver adapter) | 7.3.0 |
| **Database** | PostgreSQL (Supabase) | 15+ |
| **Runtime** | React | 19.2.3 |
| **Hosting** | Vercel | — |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** instance (local or [Supabase](https://supabase.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/pasindu-jayasinghe/expense-manager.git
cd expense-manager

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database — Pooled connection for runtime (port 6543)
DATABASE_URL="postgresql://user:password@host:6543/postgres"

# Database — Direct/session connection for CLI operations (port 5432)
DIRECT_URL="postgresql://user:password@host:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

> **Supabase users:** Use port `6543` (transaction pooler) for `DATABASE_URL` and port `5432` (session mode) for `DIRECT_URL`.

### Database Setup

```bash
# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to explore data
npx prisma studio
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment (Vercel + Supabase)

### Deployment Architecture

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │                        CI/CD PIPELINE                               │
 │                                                                     │
 │   Developer                                                         │
 │      │                                                              │
 │      ├──► git push ──► GitHub (main branch)                         │
 │      │                      │                                       │
 │      │                      ▼                                       │
 │      │               Vercel Auto-Deploy                             │
 │      │               ┌──────────────────────┐                       │
 │      │               │ 1. npm install        │                       │
 │      │               │ 2. prisma generate    │ ← No DB needed       │
 │      │               │ 3. next build         │                       │
 │      │               │ 4. Deploy to Edge     │                       │
 │      │               └──────────────────────┘                       │
 │      │                                                              │
 │      └──► npx prisma db push ─────────────────► Supabase DB         │
 │           (manual, from local machine)           (port 5432 direct)  │
 │                                                                     │
 └─────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────┐
 │                     RUNTIME INFRASTRUCTURE                          │
 │                                                                     │
 │   User Browser                                                      │
 │       │                                                             │
 │       │ HTTPS                                                       │
 │       ▼                                                             │
 │   ┌──────────────────────────────────────────┐                      │
 │   │          Vercel Edge Network              │                     │
 │   │  ┌────────────────┐  ┌────────────────┐   │                     │
 │   │  │ Static Pages   │  │ Serverless Fns  │  │                     │
 │   │  │ (/, /login,    │  │ (API Routes)    │  │                     │
 │   │  │  /signup, etc) │  │ /api/expenses   │  │                     │
 │   │  │  Pre-rendered  │  │ /api/stats      │  │                     │
 │   │  │  at build time │  │ /api/auth/*     │  │                     │
 │   │  └────────────────┘  └───────┬─────────┘  │                     │
 │   └──────────────────────────────┼────────────┘                     │
 │                                  │                                  │
 │                                  │ TCP (port 6543)                  │
 │                                  ▼                                  │
 │   ┌──────────────────────────────────────────┐                      │
 │   │         Supabase (AWS ap-northeast-2)     │                     │
 │   │  ┌────────────────────────────────────┐   │                     │
 │   │  │   PgBouncer Connection Pooler       │  │                     │
 │   │  │   Port 6543 — Transaction Mode      │  │                     │
 │   │  │   (Efficient for serverless)        │  │                     │
 │   │  └──────────────┬─────────────────────┘   │                     │
 │   │                 ▼                          │                     │
 │   │  ┌────────────────────────────────────┐   │                     │
 │   │  │   PostgreSQL Database               │  │                     │
 │   │  │   Port 5432 — Direct/Session Mode   │  │                     │
 │   │  │                                     │  │                     │
 │   │  │   Tables: User, Category, Expense   │  │                     │
 │   │  └────────────────────────────────────┘   │                     │
 │   └──────────────────────────────────────────┘                      │
 │                                                                     │
 └─────────────────────────────────────────────────────────────────────┘
```

### Connection Strategy

| Concern | URL Used | Port | Mode | Description |
|---------|----------|------|------|-------------|
| **Runtime** (app queries) | `DATABASE_URL` | 6543 | Transaction Pooling | PgBouncer pooler — ideal for serverless (many short-lived connections) |
| **CLI** (prisma db push, migrate) | `DIRECT_URL` | 5432 | Session / Direct | Supports DDL operations (CREATE/ALTER TABLE) needed for schema sync |
| **Build** (Vercel CI) | — | — | No DB connection | `prisma generate` only generates the client locally, no database needed |

### Prisma 7 Dual-URL Configuration

Prisma 7 separates CLI config from runtime config:

```typescript
// prisma.config.ts — Used by Prisma CLI (migrations, db push)
// Points to DIRECT connection (port 5432) for schema operations
export default defineConfig({
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
```

```typescript
// lib/prisma.ts — Used by the app at runtime
// Points to POOLED connection (port 6543) for efficient query handling
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

### Deploy Steps

1. Push code to GitHub (connected to Vercel)
2. Set environment variables in **Vercel → Settings → Environment Variables**:

   | Variable | Value | Required |
   |----------|-------|----------|
   | `DATABASE_URL` | `postgresql://...@pooler.supabase.com:6543/postgres` | ✅ |
   | `DIRECT_URL` | `postgresql://...@pooler.supabase.com:5432/postgres` | ✅ |
   | `NEXTAUTH_SECRET` | Random secret string | ✅ |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | ✅ |

3. Push schema from your local machine (one-time, or whenever schema changes):
   ```bash
   npx prisma db push
   ```
4. Deploy automatically on push, or manually via Vercel dashboard

### Build Script

```json
"build": "prisma generate && next build"
```

> **⚠️ Important:** `prisma db push` is intentionally excluded from the build script. Vercel's build environment cannot reach the database directly. Schema changes must be pushed manually from a local machine that has network access to the Supabase database.

---

## 📝 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build (prisma generate + next build) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma studio` | Open visual database browser |
| `npx prisma migrate dev` | Create and apply migrations |

---

## 📄 License

This project is private and not licensed for public distribution.
