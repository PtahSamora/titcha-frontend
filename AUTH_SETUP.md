# Authentication Setup Guide (NextAuth + Prisma + Supabase)

This document explains the authentication system implemented for Titcha using NextAuth.js, Prisma ORM, and Supabase PostgreSQL.

## Overview

The authentication system supports:
- **Role-based access**: PARENT, TEACHER, STUDENT
- **Secure password hashing**: bcrypt with 10 salt rounds
- **JWT sessions**: NextAuth with JWT strategy
- **Database storage**: Supabase PostgreSQL via Prisma ORM
- **Fallback support**: Uses file-based devdb when database is not configured

## Architecture

```
┌─────────────────┐
│  Frontend       │
│  /login         │
│  /register      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  NextAuth API                   │
│  /api/auth/[...nextauth]        │
│  - CredentialsProvider          │
│  - PrismaAdapter               │
└────────┬────────────────────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Prisma ORM     │  │  bcrypt         │  │  JWT Tokens     │
│  (Database)     │  │  (Password)     │  │  (Session)      │
└────────┬────────┘  └─────────────────┘  └─────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Supabase PostgreSQL            │
│  - users                        │
│  - accounts                     │
│  - sessions                     │
│  - verification_tokens          │
│  - learners                     │
└─────────────────────────────────┘
```

## Database Schema

### User Model
```prisma
model User {
  id             String    @id @default(cuid())
  name           String?
  email          String?   @unique
  emailVerified  DateTime?
  image          String?
  password       String?
  title          String?   // Mr, Mrs, Ms etc.
  role           Role      @default(STUDENT)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  accounts       Account[]
  sessions       Session[]
  learners       Learner[] @relation("ParentToChild")
}
```

### Role Enum
```prisma
enum Role {
  PARENT
  TEACHER
  STUDENT
}
```

### Learner Model (for Parents)
```prisma
model Learner {
  id             String   @id @default(cuid())
  name           String
  grade          String
  school         String?
  subjects       String[]
  parentId       String?
  parent         User?    @relation("ParentToChild", fields: [parentId], references: [id])
}
```

## Setup Instructions

### 1. Configure Supabase Database

1. **Get your Supabase connection string**:
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Select your project
   - Navigate to **Settings > Database**
   - Copy the **Connection pooling** URL (recommended for serverless)
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

2. **Update `.env.local`**:
   ```bash
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Generate a secure NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

### 2. Run Database Migration

Once your DATABASE_URL is configured:

```bash
# Create and apply migration
npx prisma migrate dev --name add_auth_models

# Or push schema directly (for development)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

This will create the following tables in your Supabase database:
- `users`
- `accounts`
- `sessions`
- `verification_tokens`
- `learners`

### 3. Verify Migration

Check your Supabase dashboard to confirm tables were created:

```sql
-- Check users table
SELECT * FROM users LIMIT 1;

-- Check table structure
\d users
\d accounts
\d sessions
\d learners
```

## API Endpoints

### Register a New User

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "title": "Mr",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "PARENT"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "user": {
    "id": "clxxxxxxxxxxxxxxx",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "PARENT",
    "title": "Mr",
    "createdAt": "2025-10-19T..."
  },
  "message": "User created successfully"
}
```

**Response (Error)**:
```json
{
  "error": "User with this email already exists"
}
```

### Login (NextAuth)

**Endpoint**: `POST /api/auth/callback/credentials`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123",
  "csrfToken": "..."
}
```

Or use the `signIn` function from `next-auth/react`:

```typescript
import { signIn } from 'next-auth/react';

const result = await signIn('credentials', {
  email: 'john@example.com',
  password: 'securepassword123',
  redirect: false,
});

if (result?.ok) {
  // Redirect to role-based dashboard
  router.push('/portal/student/dashboard');
}
```

### Get Current Session

**Client-side**:
```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>Not authenticated</p>;

  return <p>Welcome {session.user.name}! Role: {session.user.role}</p>;
}
```

**Server-side**:
```typescript
import { getSessionUser } from '@/lib/auth';

export default async function ServerComponent() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return <div>Welcome {user.name}!</div>;
}
```

## Usage Examples

### Example 1: Register a Student

```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'password123',
    role: 'STUDENT',
  }),
});

const data = await response.json();
console.log(data.user);
```

### Example 2: Register a Parent with Learners

First, register the parent:
```typescript
const parentResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Doe',
    title: 'Mrs',
    email: 'jane@example.com',
    password: 'securepass',
    role: 'PARENT',
  }),
});

const parent = await parentResponse.json();
```

Then add learners:
```typescript
await prisma.learner.create({
  data: {
    name: 'Child Name',
    grade: 'Grade 8',
    school: 'School Name',
    subjects: ['Math', 'Science'],
    parentId: parent.user.id,
  },
});
```

### Example 3: Role-based Redirect After Login

```typescript
import { signIn } from 'next-auth/react';
import { getRoleBasedRedirect } from '@/lib/auth';

async function handleLogin(email: string, password: string) {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  if (result?.ok) {
    // Get user session to determine role
    const session = await getSession();
    const redirectUrl = getRoleBasedRedirect(session.user.role);
    router.push(redirectUrl);
  }
}
```

## Security Features

### Password Hashing
- **Algorithm**: bcrypt
- **Salt rounds**: 10
- **Never stored in plain text**

```typescript
import { hash, compare } from 'bcrypt';

// Hashing (during registration)
const hashedPassword = await hash(password, 10);

// Verification (during login)
const isValid = await compare(password, hashedPassword);
```

### Session Management
- **Strategy**: JWT (stateless)
- **Token contains**: userId, role, email
- **No sensitive data** in tokens
- **Automatic expiration**

### Environment Variables
```bash
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Optional (defaults shown)
NEXTAUTH_JWT_SECRET="auto-generated"
```

## Testing

### 1. Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "STUDENT"
  }'
```

### 2. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 3. Check Database

```bash
npx prisma studio
```

This opens a GUI to view your database tables.

## Troubleshooting

### Error: "Database not configured"

**Problem**: DATABASE_URL contains placeholder value

**Solution**:
```bash
# .env.local
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

### Error: "P2002: Unique constraint failed"

**Problem**: Email already exists in database

**Solution**: Use a different email or delete the existing user

### Error: "Authentication failed"

**Problem**: Incorrect password or user not found

**Solution**:
1. Verify email is correct
2. Check password (case-sensitive)
3. Ensure user exists in database

### Migration Fails

**Problem**: Prisma cannot connect to database

**Solution**:
1. Check DATABASE_URL format
2. Verify Supabase project is running
3. Check IP allowlist in Supabase settings
4. Use connection pooling URL (not direct connection)

## Production Deployment

### Vercel Environment Variables

Add these to your Vercel project:

```
DATABASE_URL=postgresql://... (Supabase connection pooling URL)
NEXTAUTH_SECRET=... (generate with openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Run Migration on Deploy

Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma migrate deploy && next build"
  }
}
```

Or use Vercel's build command override:
```bash
prisma migrate deploy && next build
```

## Fallback Behavior

The auth system has intelligent fallback:

1. **If DATABASE_URL is configured**: Uses Prisma + Supabase
2. **If DATABASE_URL is placeholder**: Uses file-based devdb

This allows development without Supabase while maintaining compatibility.

## Next Steps

1. ✅ Configure Supabase DATABASE_URL
2. ✅ Run `npx prisma migrate dev`
3. ✅ Test registration at `/api/auth/register`
4. ✅ Test login at `/login`
5. ✅ Verify users in Supabase dashboard
6. ✅ Deploy to Vercel with environment variables

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
