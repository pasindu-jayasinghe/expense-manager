# Expenely - Production Grade Expense Manager

Expenely is a full-stack web application built with Next.js 15, TypeScript, Tailwind CSS, and Prisma. It provides a premium, secure, and efficient way to manage your personal finances.

## Features

- **User Authentication**: Secure JWT-based sessions with NextAuth.
- **Dashboard Overview**: Financial summaries with interactive charts (Monthly Trends & Category breakdown).
- **Expense CRUD**: Full management of expenses with search and filtering.
- **Categorization**: Default and custom user-defined categories.
- **Secure Architecture**: Input validation, SQL injection protection (via Prisma), and Auth Middleware.
- **Premium UI**: Modern dark-theme design with responsive layout and glassmorphism.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js API Routes, NextAuth.js.
- **Database**: PostgreSQL with Prisma ORM.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL instance running

### Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/expense_manager"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- `npm run build`: Production build and type checking.
- `npx prisma studio`: Visual database explorer.
