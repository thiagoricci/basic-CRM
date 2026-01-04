# Phase 1: Database Schema & Basic Auth Setup - Implementation Plan

## Overview

This document provides a detailed implementation plan for Phase 1 of the User Authentication & Multi-user System. This phase focuses on setting up the foundation: database schema changes, NextAuth.js configuration, and basic authentication flow.

## Objectives

- Set up NextAuth.js v5 configuration
- Update Prisma schema with User model and NextAuth models
- Add user relationships to existing models
- Create authentication API routes
- Set up session management
- Test basic authentication flow (sign in/sign out)

---

## Technology Stack

- **Authentication**: NextAuth.js v5 (Auth.js)
- **Password Hashing**: bcrypt
- **Database**: PostgreSQL (via Prisma)
- **Type Safety**: TypeScript

---

## Implementation Steps

### Step 1: Install Dependencies

**Command:**

```bash
npm install next-auth@beta bcrypt
npm install -D @types/bcrypt
```

**What this installs:**

- `next-auth@beta`: NextAuth.js v5 (currently in beta)
- `bcrypt`: Password hashing library
- `@types/bcrypt`: TypeScript types for bcrypt

---

### Step 2: Update Prisma Schema

**File:** `prisma/schema.prisma`

**Changes:**

1. **Add User Model**

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String    // hashed with bcrypt
  name      String
  role      String    @default("rep") // "admin", "manager", "rep"
  avatar    String?
  bio       String?
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  contacts  Contact[]
  deals     Deal[]
  tasks     Task[]
  activities Activity[]
  sessions  Session[]
  accounts  Account[]

  @@index([email])
  @@index([role])
}
```

2. **Add NextAuth Models**

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

3. **Update Existing Models with userId**

**Contact Model:**

```prisma
model Contact {
  id          String     @id @default(uuid())
  firstName   String
  lastName    String
  email       String     @unique
  phoneNumber String?    @unique
  status      String     @default("lead")
  jobTitle    String?
  companyId   String?
  userId      String     // NEW
  company     Company?   @relation(fields: [companyId], references: [id], onDelete: SetNull)
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade) // NEW
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  activities  Activity[]
  tasks       Task[]
  deals       Deal[]

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@index([phoneNumber])
  @@index([companyId])
  @@index([userId]) // NEW
}
```

**Deal Model:**

```prisma
model Deal {
  id                String    @id @default(uuid())
  name              String
  value             Float
  stage             String    @default("lead")
  expectedCloseDate DateTime
  actualCloseDate   DateTime?
  status            String    @default("open")
  probability       Int?      @default(0)
  description       String?
  contactId         String
  companyId         String?
  userId            String    // NEW
  contact           Contact   @relation(fields: [contactId], references: [id], onDelete: Cascade)
  company           Company?  @relation(fields: [companyId], references: [id], onDelete: SetNull)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade) // NEW
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  stageHistory      DealStageHistory[]

  @@index([contactId])
  @@index([stage])
  @@index([status])
  @@index([expectedCloseDate])
  @@index([actualCloseDate])
  @@index([companyId])
  @@index([userId]) // NEW
}
```

**Task Model:**

```prisma
model Task {
  id          String    @id @default(uuid())
  title       String
  description String?
  dueDate     DateTime
  priority    String    @default("medium")
  completed   Boolean   @default(false)
  completedAt DateTime?
  contactId   String
  userId      String    // NEW
  contact     Contact   @relation(fields: [contactId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade) // NEW
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([contactId])
  @@index([dueDate])
  @@index([completed])
  @@index([priority])
  @@index([userId]) // NEW
}
```

**Activity Model:**

```prisma
model Activity {
  id          String   @id @default(uuid())
  type        String
  subject     String
  description String?
  contactId   String
  userId      String   // NEW
  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade) // NEW
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([contactId])
  @@index([createdAt])
  @@index([type])
  @@index([userId]) // NEW
}
```

---

### Step 3: Create Database Migration

**Command:**

```bash
npx prisma migrate dev --name add_authentication
```

**What this does:**

- Creates a new migration file with the schema changes
- Applies the migration to the database
- Updates the Prisma client

**Expected Output:**

```
The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20240101_000000_add_authentication/
      └─ migration.sql

Your database is now in sync with your schema.
```

---

### Step 4: Generate Prisma Client

**Command:**

```bash
npx prisma generate
```

**What this does:**

- Regenerates the Prisma Client with the new models
- Ensures TypeScript types are up to date

---

### Step 5: Create Authentication Types

**File:** `types/auth.ts`

```typescript
import type { User as NextAuthUser, Session as NextAuthSession } from 'next-auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'rep';
  avatar?: string | null;
  bio?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session extends NextAuthSession {
  user: User;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export type UserRole = 'admin' | 'manager' | 'rep';
```

---

### Step 6: Create NextAuth Configuration

**File:** `lib/auth.config.ts`

```typescript
import type { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'manager' | 'rep';
      }
      return session;
    },
  },
};
```

---

### Step 7: Create Authentication API Route

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
```

---

### Step 8: Create Auth Helper Functions

**File:** `lib/auth.ts`

```typescript
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authConfig);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/signin');
  }
  return session;
}

export async function requireRole(role: 'admin' | 'manager' | 'rep') {
  const session = await requireAuth();
  if (session.user.role !== role) {
    redirect('/dashboard');
  }
  return session;
}
```

---

### Step 9: Update Environment Variables

**File:** `.env.local`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

---

### Step 10: Create Seed Script for Default Admin User

**File:** `prisma/seed-auth.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@crm.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@crm.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    },
  });

  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed script:**

```bash
npx ts-node prisma/seed-auth.ts
```

---

### Step 11: Assign Existing Records to Admin User

**File:** `prisma/migrate-existing-records.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get admin user
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@crm.com' },
  });

  if (!admin) {
    console.log('Admin user not found. Please run seed-auth.ts first.');
    return;
  }

  // Assign all contacts to admin
  const contacts = await prisma.contact.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  console.log(`Assigned ${contacts.count} contacts to admin`);

  // Assign all deals to admin
  const deals = await prisma.deal.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  console.log(`Assigned ${deals.count} deals to admin`);

  // Assign all tasks to admin
  const tasks = await prisma.task.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  console.log(`Assigned ${tasks.count} tasks to admin`);

  // Assign all activities to admin
  const activities = await prisma.activity.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  console.log(`Assigned ${activities.count} activities to admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run migration script:**

```bash
npx ts-node prisma/migrate-existing-records.ts
```

---

### Step 12: Test Basic Authentication Flow

**Test Steps:**

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Test sign in:**
   - Navigate to `http://localhost:3000/auth/signin` (will be created in Phase 2)
   - Enter email: `admin@crm.com`
   - Enter password: `admin123`
   - Click "Sign In"
   - Should be redirected to dashboard

3. **Test session:**
   - Check if session is stored in cookies
   - Refresh page - should stay signed in

4. **Test sign out:**
   - Click sign out button (will be added in Phase 2)
   - Should be redirected to sign in page

---

## Database Schema Summary

### New Tables

1. **User** - Stores user accounts with authentication and role information
2. **Account** - NextAuth OAuth account information (for future social login)
3. **Session** - Active user sessions
4. **VerificationToken** - Email verification tokens (for future email verification)

### Modified Tables

1. **Contact** - Added `userId` foreign key
2. **Deal** - Added `userId` foreign key
3. **Task** - Added `userId` foreign key
4. **Activity** - Added `userId` foreign key

### Relationships

- User has many Contacts, Deals, Tasks, Activities
- Contact/Deal/Task/Activity belong to one User
- User has many Sessions and Accounts (NextAuth)

---

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt (10 rounds)
2. **Session Security**: JWT-based sessions with secure cookies
3. **User Status**: Inactive users cannot sign in
4. **Cascade Deletion**: Deleting a user deletes all their records
5. **Unique Constraints**: Email addresses are unique

---

## Known Limitations (Phase 1)

- No sign-up page (users must be created by admin)
- No password reset functionality
- No email verification
- No social login providers
- No role-based access control (all users have same access)
- No user profile management UI
- No "Assigned to" fields in forms

**These will be addressed in Phases 2-7.**

---

## Success Criteria

- [ ] NextAuth.js installed and configured
- [ ] User model created in database
- [ ] NextAuth models (Account, Session, VerificationToken) created
- [ ] userId foreign keys added to Contact, Deal, Task, Activity models
- [ ] Database migration applied successfully
- [ ] Default admin user created
- [ ] Existing records assigned to admin user
- [ ] Basic sign in working with email/password
- [ ] Basic sign out working
- [ ] Session management working (cookies persist across page refreshes)

---

## Next Steps (Phase 2)

Once Phase 1 is complete and tested, proceed to Phase 2:

- Create authentication UI pages (Sign In, Sign Up, Forgot Password)
- Create authentication forms with validation
- Add password hashing with bcrypt
- Implement email verification (optional for MVP)
- Add protected route middleware

---

## Troubleshooting

### Migration Fails

**Issue**: Migration fails due to existing data
**Solution**: Backup database, then run:

```bash
npx prisma migrate reset
```

### Password Hashing Errors

**Issue**: bcrypt.compare returns false for correct password
**Solution**: Ensure password is hashed during user creation:

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### Session Not Persisting

**Issue**: User is logged out on page refresh
**Solution**: Check NEXTAUTH_SECRET and NEXTAUTH_URL in .env.local

### Admin User Already Exists

**Issue**: Seed script fails because admin user exists
**Solution**: Update seed script to check for existing user before creating

---

## References

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [NextAuth.js v5 Guide](https://authjs.dev/guides/upgrade-to-v5)
- [Prisma Authentication Guide](https://www.prisma.io/docs/guides/database/strategies/mongodb/nextjs-auth)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
