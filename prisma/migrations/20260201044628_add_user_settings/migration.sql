-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'dark';
