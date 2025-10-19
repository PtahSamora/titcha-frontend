# Supabase & OpenAI Integration Guide

This document explains how Supabase (PostgreSQL) and OpenAI have been integrated into the Titcha Next.js application.

## Overview

The integration adds two key capabilities to the application:
1. **Supabase Database** - PostgreSQL database connection via Prisma ORM
2. **OpenAI API** - AI-powered features using GPT models

## Files Added

### Database Integration (Prisma + Supabase)

1. **`prisma/schema.prisma`**
   - Defines the database connection to Supabase PostgreSQL
   - Uses `DATABASE_URL` environment variable
   - Generated Prisma Client for type-safe database queries

2. **`src/lib/prisma.ts`**
   - Singleton PrismaClient instance
   - Prevents multiple instances during hot-reloads in development
   - Enables query logging for debugging

3. **`src/app/api/test-db/route.ts`**
   - Test endpoint to verify database connectivity
   - Endpoint: `GET /api/test-db`
   - Returns current database timestamp

### OpenAI Integration

4. **`src/lib/openai.ts`**
   - Centralized OpenAI client instance
   - Uses `OPENAI_API_KEY` environment variable
   - Ready for use across the application

5. **`src/app/api/test-ai/route.ts`**
   - Test endpoint to verify OpenAI API connectivity
   - Endpoint: `GET /api/test-ai`
   - Uses GPT-4o-mini model for testing

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"

# OpenAI Configuration
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxx"
```

### Getting Your Credentials

**Supabase Database URL:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to Settings > Database
4. Copy the "Connection string" under "Connection pooling"
5. Replace `[YOUR-PASSWORD]` with your database password

**OpenAI API Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (it won't be shown again!)
4. Add it to your `.env.local`

## Testing the Integration

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Database Connection

Open your browser and navigate to:
```
http://localhost:3000/api/test-db
```

**Expected Response (Success):**
```json
{
  "status": "ok",
  "time": [{ "now": "2025-10-19T..." }]
}
```

**Error Response Example:**
```json
{
  "status": "error",
  "message": "Connection refused..."
}
```

### 3. Test OpenAI Connection

Navigate to:
```
http://localhost:3000/api/test-ai
```

**Expected Response (Success):**
```json
{
  "ok": true,
  "message": "Titcha backend successfully connected."
}
```

**Error Response Example:**
```json
{
  "ok": false,
  "error": "Incorrect API key provided..."
}
```

## Usage Examples

### Using Prisma in API Routes

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Example: Query users table
    const users = await prisma.user.findMany();
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### Using OpenAI in API Routes

```typescript
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful tutor." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

## Database Schema Management

### Adding Models to Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Generate Prisma Client After Schema Changes

```bash
npx prisma generate
```

### Push Schema to Database

```bash
npx prisma db push
```

### Create and Run Migrations

```bash
npx prisma migrate dev --name init
```

## Production Deployment

### Vercel Environment Variables

Add these to your Vercel project settings:

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add:
   - `DATABASE_URL` - Your Supabase connection string
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NEXTAUTH_SECRET` - Your NextAuth secret
   - `NEXTAUTH_URL` - Your production URL (e.g., https://titcha.vercel.app)

### Build Verification

Before deploying:

```bash
npm run build
```

Ensure the build completes successfully.

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Verify your `DATABASE_URL` is correct
- Check if your IP is allowed in Supabase Dashboard > Settings > Database > Connection pooling

**Error: "SSL required"**
- Add `?sslmode=require` to your connection string

### OpenAI API Issues

**Error: "Incorrect API key"**
- Verify your `OPENAI_API_KEY` is correct
- Check if the key is active in OpenAI Dashboard

**Error: "Rate limit exceeded"**
- Check your OpenAI usage limits
- Consider implementing request throttling

### Build Issues

**Error: "Cannot find module '@prisma/client'"**
- Run `npx prisma generate`
- Restart your development server

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use environment variables** - Don't hardcode credentials
3. **Rotate API keys regularly** - Especially for production
4. **Enable Row Level Security (RLS)** - In Supabase for data protection
5. **Monitor API usage** - Set up billing alerts in OpenAI Dashboard

## Next Steps

1. Define your database schema in `prisma/schema.prisma`
2. Create migrations: `npx prisma migrate dev`
3. Build API endpoints using Prisma and OpenAI
4. Implement authentication checks for sensitive routes
5. Add rate limiting for AI endpoints
6. Monitor usage and costs

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
