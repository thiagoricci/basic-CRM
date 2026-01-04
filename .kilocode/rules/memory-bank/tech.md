# Technical Stack

## Technologies Used

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **Charts**: Recharts (via shadcn/ui)
- **State Management**: React hooks (useState, useReducer)
- **Data Fetching**: SWR for client-side data management
- **Form Handling**: React Hook Form + Zod validation
- **Animations**: Motion (Framer Motion)
- **Drag & Drop**: @hello-pangea/dnd for Kanban board

### Backend

- **Runtime**: Node.js
- **API Routes**: Next.js API Routes (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma

### Authentication (Phase 1-4)

- **Framework**: NextAuth.js v5 (beta)
- **Session Strategy**: JWT
- **Providers**: Credentials (email/password), OAuth providers (for Phase 5)
- **Password Hashing**: bcrypt (10 rounds)
- **2FA**: TOTP-based with backup codes
- **Email Service**: Resend (for email verification, password reset, 2FA codes)
- **Rate Limiting**: Upstash Redis with graceful fallback
- **IP Tracking**: Sign-in history logging
- **Authorization**: Role-based access control (RBAC)

### Development Tools

- **Package Manager**: npm or pnpm
- **Code Quality**: ESLint, Prettier
- **Type Checking**: TypeScript
- **Version Control**: Git
- **Email Service**: Resend (for authentication flows)
- **Rate Limiting**: Upstash Redis (optional, graceful fallback if unavailable)

## Development Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or pnpm package manager

### Initial Setup Commands

```bash
# Create Next.js project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install required shadcn/ui components
npx shadcn-ui@latest add button card table dialog input select checkbox label badge tabs

# Install additional dependencies
npm install recharts react-hook-form @hookform/resolvers zod swr @hello-pangea/dnd

# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init
```

### Environment Variables

Create `.env.local` file:

```env
# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"

# NextAuth.js configuration (required for authentication)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email service (Resend) - Required for email verification, password reset, 2FA
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Rate limiting (Upstash Redis) - Optional, graceful fallback if unavailable
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

### Database Setup

```bash
# Create database
createdb crm_db

# Run Prisma migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

## Technical Constraints

### MVP Constraints

- No authentication/authorization in initial MVP
- Single database shared by all users (Phase 1-4: Multi-user with RBAC)
- Client-side filtering for search (acceptable for MVP)
- No real-time updates (polling acceptable)
- No file uploads
- Task completion requires manual checkbox click (no bulk completion)
- Tasks are not automatically created from activities (manual creation only)
- Deal stage updates require drag-and-drop on Kanban board
- Email service requires Resend account setup (Phase 3)
- Rate limiting requires Upstash Redis setup (Phase 3, optional with fallback)

### Performance Targets

- Page load time: < 2 seconds
- Form submission: < 1 second
- Dashboard analytics: < 3 seconds
- API response time: < 500ms

### Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Accessibility

- WCAG AA compliance minimum
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Dependencies

### Core Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.300.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-label": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.0",
    "recharts": "^2.10.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "@prisma/client": "^5.0.0",
    "framer-motion": "^10.16.0",
    "swr": "^2.2.0",
    "@hello-pangea/dnd": "^16.5.0",
    "next-auth@beta": "^5.0.0",
    "bcrypt": "^5.1.0",
    "@types/bcrypt": "^5.0.0",
    "@auth/prisma-adapter": "^2.0.0",
    "resend": "^3.0.0",
    "qrcode": "^1.5.0",
    "speakeasy": "^2.0.0",
    "@upstash/redis": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "prisma": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "@types/qrcode": "^1.5.0",
    "@types/speakeasy": "^2.0.0"
  }
}
```

## Tool Usage Patterns

### Git Workflow

- Feature branch workflow
- Branch naming: `feature/description` or `fix/description`
- Commit messages: Conventional Commits format
  - `feat: add contact creation form`
  - `fix: resolve email validation bug`
  - `docs: update API documentation`

### Code Style

- Prettier for formatting
- ESLint for linting
- 2-space indentation
- Single quotes for strings
- Semicolons required

### Component Structure

```typescript
// imports
import { ComponentProps } from 'react'

// types/interfaces
interface ComponentProps {
  // props definition
}

// component
export function Component({ prop }: ComponentProps) {
  // component logic
  return (
    // JSX
  )
}
```

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // logic
    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: 'Error message' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // validation and logic
    return NextResponse.json({ data: result, error: null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ data: null, error: 'Error message' }, { status: 400 });
  }
}
```

### Database Query Pattern (Prisma)

```typescript
import { prisma } from '@/lib/prisma';

// Get all contacts
async function getAllContacts() {
  return await prisma.contact.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

// Get single contact by ID
async function getContactById(id: string) {
  return await prisma.contact.findUnique({
    where: { id },
  });
}

// Create contact
async function createContact(contact: ContactInput) {
  return await prisma.contact.create({
    data: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
      status: contact.status,
    },
  });
}

// Get activities for a contact
async function getActivitiesByContactId(contactId: string) {
  return await prisma.activity.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
  });
}

// Get tasks for a contact
async function getTasksByContactId(contactId: string) {
  return await prisma.task.findMany({
    where: { contactId },
    orderBy: { dueDate: 'asc' },
  });
}

// Get deals for a contact
async function getDealsByContactId(contactId: string) {
  return await prisma.deal.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
  });
}
```

### Validation Pattern with Zod

```typescript
import { z } from 'zod';

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email format'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['lead', 'customer'], {
    required_error: 'Status is required',
  }),
});

export const activitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note'], {
    required_error: 'Activity type is required',
  }),
  subject: z.string().min(1, 'Subject is required').max(255),
  description: z.string().max(1000).optional(),
  contactId: z.string().uuid('Invalid contact ID'),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Priority is required',
  }),
  contactId: z.string().uuid('Invalid contact ID'),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type DealInput = z.infer<typeof dealSchema>;
```

### Form Handling Pattern

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validations";

export function ContactForm() {
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      status: "lead",
    },
  });

  const onSubmit = async (data: ContactInput) => {
    // submit logic
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>{/* form fields */}</form>
  );
}
```

## File Naming Conventions

- Components: `kebab-case.tsx` (e.g., `contact-table.tsx`)
- Pages: `page.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Utilities: `kebab-case.ts` (e.g., `validations.ts`)
- Types: `kebab-case.ts` (e.g., `contact.ts`, `activity.ts`, `task.ts`)
- Database: `schema.prisma`

## Testing Strategy (Future)

- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests with Playwright
- API tests with Supertest

## Deployment Considerations

- Environment variables management
- Database migrations
- Static asset optimization
- Image optimization with Next.js Image component
- API route optimization with caching
