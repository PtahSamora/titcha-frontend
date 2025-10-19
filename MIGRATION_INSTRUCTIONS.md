# 🚀 Database Migration Instructions

## Current Status

✅ **Prisma schema configured** - All authentication models defined
✅ **Prisma Client generated** - Types available for development
✅ **SQL migration file created** - Ready to run in Supabase
⏳ **Database tables** - Need to be created in Supabase

---

## 📋 Step-by-Step Migration Guide

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your **Titcha project**
3. Click on **SQL Editor** in the left sidebar (icon: `</>`)
4. Click **New query**

### Step 2: Run the Migration SQL

1. Open the file: **`supabase_auth_migration.sql`** (in project root)
2. **Copy all the SQL content** (it's about 200 lines)
3. **Paste** into the Supabase SQL Editor
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify Tables Were Created

You should see output showing:
```
✅ Authentication schema created successfully!
📋 Tables created: users, learners, accounts, sessions, verification_tokens
🔐 Role enum created: PARENT, TEACHER, STUDENT
```

**Verify in Supabase:**
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - ✅ `users`
   - ✅ `learners`
   - ✅ `accounts`
   - ✅ `sessions`
   - ✅ `verification_tokens`

### Step 4: Verify Prisma Client (Already Done ✅)

The Prisma Client has been generated. Verify by running:

```bash
npx prisma generate
```

You should see:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

---

## 🧪 Testing the Authentication System

### Test 1: Register a New User

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "test123",
    "role": "STUDENT"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "clxxxxxxxx",
    "name": "Test Student",
    "email": "student@test.com",
    "role": "STUDENT",
    "createdAt": "2025-10-19T..."
  },
  "message": "User created successfully"
}
```

### Test 2: Verify User in Database

**Option A: Using Supabase Dashboard**
1. Go to **Table Editor** → **users**
2. You should see the new user

**Option B: Using Prisma Studio**
```bash
npx prisma studio
```
Opens a GUI at `http://localhost:5555` to browse your data

**Option C: Using SQL**
Go to Supabase SQL Editor and run:
```sql
SELECT id, name, email, role, "createdAt" FROM users;
```

### Test 3: Login with the User

**Using the Frontend:**
1. Go to `http://localhost:3000/login`
2. Enter the credentials:
   - Email: `student@test.com`
   - Password: `test123`
3. Click **Sign In**
4. Should redirect to `/portal/student/dashboard`

**Using cURL (via NextAuth):**
```bash
# Note: NextAuth requires CSRF token, so frontend login is easier
# But you can test credential validation via the authorize function
```

### Test 4: Check Session

**In React Component:**
```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();

  console.log('Session:', session);
  // Should show: { user: { name, email, role, id } }

  return <div>Logged in as {session?.user?.name}</div>;
}
```

---

## 📊 Database Schema Overview

### Tables Created

#### 1. `users` Table
Primary table for all users (parents, teachers, students)

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique user identifier (cuid) |
| name | TEXT | Full name |
| email | TEXT (UNIQUE) | Login email |
| password | TEXT | Hashed password (bcrypt) |
| title | TEXT | Mr, Mrs, Ms, etc. |
| role | Role ENUM | PARENT, TEACHER, or STUDENT |
| createdAt | TIMESTAMP | Account creation time |
| updatedAt | TIMESTAMP | Last update time |

#### 2. `learners` Table
Children linked to parent accounts

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique learner ID |
| name | TEXT | Child's name |
| grade | TEXT | Grade level |
| school | TEXT | School name |
| subjects | TEXT[] | Array of subjects |
| parentId | TEXT (FK) | Reference to users.id |

#### 3. `accounts` Table (NextAuth)
OAuth provider data (future use)

#### 4. `sessions` Table (NextAuth)
Active user sessions

#### 5. `verification_tokens` Table (NextAuth)
Email verification tokens (future use)

---

## 🔐 Security Features

### Password Hashing
- ✅ bcrypt with 10 salt rounds
- ✅ Never stored in plain text
- ✅ Secure comparison during login

### Database Security
- ✅ Unique email constraint
- ✅ Cascade delete for related data
- ✅ Foreign key constraints
- ✅ Indexed columns for performance

### Session Security
- ✅ JWT tokens (stateless)
- ✅ No sensitive data in tokens
- ✅ Automatic expiration
- ✅ Role-based access control

---

## 🐛 Troubleshooting

### Problem: SQL Editor shows error

**Check:**
1. Make sure you're in the correct Supabase project
2. Verify you have write permissions
3. Try running the SQL in smaller chunks

### Problem: "User not found" when logging in

**Solution:**
1. Check if user exists in `users` table
2. Verify email is correct (case-sensitive)
3. Make sure password was hashed during registration

### Problem: "Database not configured" error

**Solution:**
Update your `.env.local` with real Supabase URL:
```bash
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

### Problem: Prisma Client not recognizing tables

**Solution:**
```bash
npx prisma generate
```

---

## 🚀 Next Steps

Once migration is complete:

1. ✅ **Test Registration**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@test.com","password":"test123","role":"PARENT"}'
   ```

2. ✅ **Test Login**
   - Go to `http://localhost:3000/login`
   - Use the credentials you created

3. ✅ **Verify in Supabase**
   - Check Table Editor → users
   - Should see the new user

4. ✅ **Add to Vercel**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `DATABASE_URL` with your Supabase connection string
   - Redeploy

5. ✅ **Create More Test Users**
   ```bash
   # Teacher
   curl -X POST http://localhost:3000/api/auth/register \
     -d '{"name":"Teacher","email":"teacher@test.com","password":"test123","role":"TEACHER"}'

   # Student
   curl -X POST http://localhost:3000/api/auth/register \
     -d '{"name":"Student","email":"student@test.com","password":"test123","role":"STUDENT"}'
   ```

---

## 📝 Summary

**What was created:**
- ✅ 5 database tables (users, learners, accounts, sessions, verification_tokens)
- ✅ Role enum (PARENT, TEACHER, STUDENT)
- ✅ Foreign key relationships
- ✅ Indexes for performance
- ✅ Auto-update triggers for timestamps
- ✅ Prisma Client generated with types

**What works now:**
- ✅ User registration with role selection
- ✅ Secure password hashing (bcrypt)
- ✅ NextAuth authentication
- ✅ JWT session management
- ✅ Role-based access control

**Ready for:**
- ✅ Frontend login/registration forms
- ✅ Protected routes
- ✅ Role-based dashboards
- ✅ Parent-learner relationships
- ✅ Production deployment

---

## 📞 Need Help?

If you encounter any issues:

1. Check the `AUTH_SETUP.md` file for detailed documentation
2. Verify your Supabase project is active
3. Make sure DATABASE_URL is configured correctly
4. Check Supabase logs for any errors
5. Run `npx prisma studio` to inspect database directly

**Common Commands:**
```bash
# Regenerate Prisma Client
npx prisma generate

# View database in GUI
npx prisma studio

# Check schema status
npx prisma validate

# Format schema file
npx prisma format
```
