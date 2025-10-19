-- ============================================================
-- Titcha Authentication Schema Migration
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS "verification_tokens" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "learners" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;

-- Create Role enum
CREATE TYPE "Role" AS ENUM ('PARENT', 'TEACHER', 'STUDENT');

-- ============================================================
-- Create users table
-- ============================================================
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "title" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- ============================================================
-- Create learners table (for parent-child relationships)
-- ============================================================
CREATE TABLE "learners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "school" TEXT,
    "subjects" TEXT[],
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learners_pkey" PRIMARY KEY ("id")
);

-- Create foreign key to users
ALTER TABLE "learners" ADD CONSTRAINT "learners_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index on parentId
CREATE INDEX "learners_parentId_idx" ON "learners"("parentId");

-- ============================================================
-- Create accounts table (NextAuth OAuth)
-- ============================================================
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- Create foreign key to users
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique constraint on provider + providerAccountId
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key"
    ON "accounts"("provider", "providerAccountId");

-- Create index on userId
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- ============================================================
-- Create sessions table (NextAuth)
-- ============================================================
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Create foreign key to users
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique index on sessionToken
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- Create index on userId
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- ============================================================
-- Create verification_tokens table (NextAuth email verification)
-- ============================================================
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Create unique index on token
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- Create unique constraint on identifier + token
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key"
    ON "verification_tokens"("identifier", "token");

-- ============================================================
-- Create updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to learners table
CREATE TRIGGER update_learners_updated_at
    BEFORE UPDATE ON "learners"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('users', 'learners', 'accounts', 'sessions', 'verification_tokens')
ORDER BY table_name;

-- Check enum was created
SELECT
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'Role'
ORDER BY e.enumsortorder;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Authentication schema created successfully!';
    RAISE NOTICE '📋 Tables created: users, learners, accounts, sessions, verification_tokens';
    RAISE NOTICE '🔐 Role enum created: PARENT, TEACHER, STUDENT';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run: npx prisma generate';
    RAISE NOTICE '2. Test registration: POST /api/auth/register';
    RAISE NOTICE '3. Test login: POST /api/auth/[...nextauth]';
END $$;
