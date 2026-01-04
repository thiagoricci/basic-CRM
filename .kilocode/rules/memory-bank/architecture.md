# System Architecture

## High-Level Architecture

The CRM Contact Manager follows a modern full-stack web application architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  (Next.js App Router + React Components + shadcn/ui)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Authentication Layer (Phase 1-4)               │
│  (NextAuth.js - Sessions, 2FA, Rate Limiting, RBAC)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Server)                        │
│  (Next.js API Routes - /api/contacts/*, /api/activities/*, /api/tasks/*, /api/deals/*, /api/companies/*, /api/auth/*) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                         │
│  (Prisma ORM - Database queries & transformations)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│  (PostgreSQL - contacts, activities, tasks, deals, companies, users, sessions, accounts tables)  │
└─────────────────────────────────────────────────────────────┘
```

## Source Code Structure

```
basic-CRM/
├── app/
│   ├── layout.tsx              # Root layout with navigation and SessionProvider
│   ├── page.tsx                 # Dashboard page (home)
│   ├── auth/                    # Authentication pages
│   │   ├── layout.tsx           # Auth page layout
│   │   ├── signin/
│   │   │   └── page.tsx       # Sign-in page
│   │   ├── signup/
│   │   │   └── page.tsx       # Sign-up page
│   │   ├── forgot-password/
│   │   │   └── page.tsx       # Forgot password page
│   │   ├── reset-password/
│   │   │   └── page.tsx       # Reset password page
│   │   ├── verify-email/
│   │   │   └── page.tsx       # Email verification page
│   │   ├── 2fa-setup/
│   │   │   └── page.tsx       # 2FA setup page
│   │   └── verify-2fa/
│   │       └── page.tsx       # 2FA verification page
│   ├── admin/                   # Admin pages (Phase 4)
│   │   └── users/
│   │       ├── page.tsx         # Users list page
│   │       ├── [id]/
│   │       │   └── page.tsx     # User profile page
│   │       └── new/
│   │           └── page.tsx     # New user creation page
│   ├── contacts/
│   │   ├── page.tsx             # Contacts list page
│   │   ├── [id]/
│   │   │   └── page.tsx         # Contact profile page
│   │   └── new/
│   │       └── page.tsx         # New contact page
│   ├── activities/
│   │   ├── page.tsx             # Activities list page
│   │   └── [id]/
│   │       └── page.tsx         # Activity profile page
│   ├── tasks/
│   │   ├── page.tsx             # Tasks list page
│   │   ├── [id]/
│   │   │   └── page.tsx         # Task profile page
│   │   └── new/
│   │       └── page.tsx         # New task page
│   ├── docs/
│   │   └── page.tsx             # API documentation page
│   ├── companies/
│   │   ├── page.tsx             # Companies list page
│   │   ├── [id]/
│   │   │   └── page.tsx         # Company profile page
│   │   └── new/
│   │       └── page.tsx         # New company page
│   └── api/
│       ├── auth/                  # Authentication API routes (Phase 1-3)
│       │   ├── [...nextauth]/
│       │   │   └── route.ts     # NextAuth.js handler
│       │   ├── signin/
│       │   │   └── route.ts     # Sign-in endpoint
│       │   ├── signup/
│       │   │   └── route.ts     # Sign-up endpoint
│       │   ├── forgot-password/
│       │   │   └── route.ts     # Forgot password endpoint
│       │   ├── reset-password/
│       │   │   └── route.ts     # Reset password endpoint
│       │   ├── verify-email/
│       │   │   └── route.ts     # Email verification endpoint
│       │   ├── resend-verification/
│       │   │   └── route.ts     # Resend verification endpoint
│       │   └── 2fa/
│       │       ├── enable/
│       │       │   └── route.ts   # Enable 2FA endpoint
│       │       ├── verify-setup/
│       │       │   └── route.ts   # Verify 2FA setup endpoint
│       │       ├── verify/
│       │       │   └── route.ts   # Verify 2FA during sign-in endpoint
│       │       ├── disable/
│       │       │   └── route.ts   # Disable 2FA endpoint
│       │       └── regenerate-codes/
│       │           └── route.ts   # Regenerate backup codes endpoint
│       ├── admin/                 # Admin API routes (Phase 4)
│       │   └── users/
│       │       ├── route.ts       # Users list and create API
│       │       └── [id]/
│       │           └── route.ts   # User get, update, delete API
│       ├── dashboard/
│       │   └── route.ts         # GET (analytics & recent data)
│       ├── contacts/
│       │   ├── route.ts         # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts     # GET (single), PUT (update), DELETE
│       ├── activities/
│       │   ├── route.ts         # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts     # GET (single), PUT (update), DELETE
│       └── tasks/
│           ├── route.ts         # GET (list), POST (create)
│           └── [id]/
│               └── route.ts     # GET (single), PUT (update), DELETE, PATCH (toggle complete)
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── analytics-cards.tsx
│   │   ├── status-chart.tsx
│   │   ├── growth-chart.tsx
│   │   ├── recent-contacts.tsx
│   │   ├── recent-activities.tsx
│   │   ├── upcoming-tasks.tsx
│   │   ├── dashboard-tabs.tsx
│   │   ├── activity-analytics-cards.tsx
│   │   ├── activity-type-chart.tsx
│   │   ├── activities-over-time-chart.tsx
│   │   ├── task-analytics-cards.tsx
│   │   ├── task-priority-chart.tsx
│   │   ├── task-completion-chart.tsx
│   │   ├── pipeline-metrics.tsx
│   │   ├── pipeline-chart.tsx
│   │   └── recent-deals.tsx
│   ├── contacts/
│   │   ├── contact-table.tsx
│   │   ├── contact-form.tsx
│   │   ├── contact-profile.tsx
│   │   ├── contact-selector.tsx
│   │   ├── contact-tasks.tsx    # Tasks tab for contact profile
│   │   └── contact-deals.tsx    # Deals tab for contact profile
│   ├── activities/
│   │   ├── activity-list.tsx
│   │   ├── activity-form.tsx
│   │   ├── activity-profile.tsx
│   │   ├── activity-filters.tsx
│   │   └── activity-pagination.tsx
│   ├── tasks/
│   │   ├── task-list.tsx
│   │   ├── task-form.tsx
│   │   ├── task-profile.tsx
│   │   ├── task-filters.tsx
│   │   └── task-pagination.tsx
│   ├── deals/
│   │   ├── deal-list.tsx
│   │   ├── deal-form.tsx
│   │   ├── deal-profile.tsx
│   │   ├── deal-filters.tsx
│   │   ├── deal-pagination.tsx
│   │   ├── deal-kanban-board.tsx
│   │   ├── deal-kanban-column.tsx
│   │   ├── deal-card.tsx
│   │   └── loading-indicator.tsx
│   ├── companies/
│   │   ├── company-activities.tsx
│   │   ├── company-contacts.tsx
│   │   ├── company-deals.tsx
│   │   ├── company-filters.tsx
│   │   ├── company-form.tsx
│   │   ├── company-pagination.tsx
│   │   ├── company-profile.tsx
│   │   ├── company-selector.tsx
│   │   ├── company-table.tsx
│   │   └── company-tasks.tsx
│   └── layout/
│       └── navigation.tsx       # Main navigation component
├── lib/
│   ├── prisma.ts                # Prisma client instance
│   ├── auth.config.ts           # NextAuth.js configuration
│   ├── auth.ts                 # Auth helper functions
│   ├── authorization.ts         # Authorization helper functions (Phase 4)
│   ├── validations.ts           # Validation schemas
│   ├── csv-export.ts           # CSV export utility (Reports)
│   └── utils.ts                # Utility functions
├── types/
│   ├── contact.ts               # Contact TypeScript interfaces
│   ├── activity.ts             # Activity TypeScript interfaces
│   ├── task.ts                # Task TypeScript interfaces
│   ├── deal.ts                # Deal TypeScript interfaces
│   ├── company.ts             # Company TypeScript interfaces
│   ├── user.ts                # User TypeScript interfaces
│   ├── auth.ts                # Auth TypeScript interfaces
│   ├── permissions.ts          # Permission types and helper functions (Phase 4)
│   └── reports.ts             # Reports TypeScript interfaces
├── docs/
│   └── API_DOCUMENTATION.md     # API documentation
├── prisma/
│   └── schema.prisma           # Database schema
└── public/                      # Static assets
```

## Key Technical Decisions

### Framework Choice: Next.js (App Router)

- **Rationale**: Provides built-in API routes, server-side rendering, and excellent developer experience
- **Benefits**: Single codebase for frontend and backend, type-safe API routes, automatic code splitting

### UI Library: shadcn/ui

- **Rationale**: Provides accessible, customizable components built on Radix UI primitives
- **Benefits**: No runtime overhead, full control over styling, excellent accessibility out of the box
- **Design Philosophy**: Allows custom styling to achieve "intentional minimalism" aesthetic

### Database: PostgreSQL

- **Rationale**: Robust relational database with excellent performance for structured data
- **Benefits**: Strong data integrity, advanced indexing, proven scalability

### Styling: Tailwind CSS

- **Rationale**: Utility-first CSS framework for rapid development
- **Benefits**: Consistent design system, easy responsive design, small bundle size

## Component Relationships

### Page Components (Route Handlers)

- `app/page.tsx` (Dashboard)
  - Uses: DashboardTabs with sub-components for Contacts, Activities, Tasks, Deals analytics
  - Fetches: Contact, activity, task, and deal statistics from API

- `app/contacts/page.tsx` (Contacts List)
  - Uses: ContactTable, FilterBar, SearchBar, AddContactButton
  - Fetches: All contacts from API (client-side filtering)

- `app/contacts/[id]/page.tsx` (Contact Profile)
  - Uses: ContactProfile, ContactForm (in edit mode), ContactTasks
  - Fetches: Single contact from API

- `app/activities/page.tsx` (Activities List)
  - Uses: ActivityList, ActivityFilters, ActivityPagination
  - Fetches: Activities from API with filtering and pagination

- `app/activities/[id]/page.tsx` (Activity Profile)
  - Uses: ActivityProfile, ActivityForm (in edit mode)
  - Fetches: Single activity from API

- `app/tasks/page.tsx` (Tasks List)
  - Uses: TaskList, TaskFilters, TaskPagination
  - Fetches: Tasks from API with filtering and pagination

- `app/tasks/[id]/page.tsx` (Task Profile)
  - Uses: TaskProfile, TaskForm (in edit mode)
  - Fetches: Single task from API

- `app/tasks/new/page.tsx` (New Task)
  - Uses: TaskForm
  - Creates new task via API

- `app/deals/page.tsx` (Deals List)
  - Uses: DealList, DealKanbanBoard, DealFilters
  - Fetches: Deals from API with filtering (client-side)

- `app/deals/[id]/page.tsx` (Deal Profile)
  - Uses: DealProfile, DealForm (in edit mode)
  - Fetches: Single deal from API

- `app/deals/new/page.tsx` (New Deal)
  - Uses: DealForm
  - Creates new deal via API

### Data Flow

```
User Action → Component → API Route → Database Query → Response → Component Update
```

### State Management Strategy

- **Server State**: Managed by Next.js server components and API routes
- **Client State**: React useState/useReducer for form state, selection state
- **Authentication State**: Managed by NextAuth.js sessions with SessionProvider
- **Authorization State**: Managed by permission checks on API routes and ProtectedRoute components
- **Data Fetching**: Next.js fetch API with revalidation for real-time updates
- **Client Data Management**: SWR for efficient data fetching and caching (tasks, deals)
- **Client-side Filtering**: Filter data locally after initial fetch to eliminate tab blinking

## Design Patterns

### 1. Server Components by Default

- Use Next.js Server Components for pages that don't need interactivity
- Use Client Components only when necessary (forms, interactive elements)

### 2. API Route Pattern

- RESTful API design with standard HTTP methods
- Consistent response format: `{ data: T | null, error: string | null }`
- Proper HTTP status codes (200, 201, 400, 404, 500)

### 3. Component Composition

- Build complex UIs from simple, reusable shadcn/ui components
- Wrap library components to add custom styling while maintaining accessibility

### 4. Validation Strategy

- Client-side validation for immediate feedback
- Server-side validation for data integrity
- Zod schemas for type-safe validation

## Critical Implementation Paths

### Contact Creation Flow

1. User fills form → Client validation
2. Submit → POST /api/contacts
3. Server validates (email uniqueness, format)
4. Insert into database
5. Return created contact
6. Redirect to contact profile

### Contact Update Flow

1. User clicks edit → Switch to edit mode
2. User modifies → Client validation
3. Submit → PUT /api/contacts/[id]
4. Server validates
5. Update database
6. Return updated contact
7. Switch back to view mode

### Contact Deletion Flow

1. User clicks delete → Show confirmation dialog
2. User confirms → DELETE /api/contacts/[id]
3. Delete from database
4. Return success
5. Redirect to contacts list

### Analytics Calculation

1. Dashboard component queries database via Prisma
2. Calculate totals, conversion rate using Prisma count()
3. Aggregate data for charts using Prisma groupBy()
4. Return statistics to frontend

### Activity Creation Flow

1. User selects contact and fills activity form → Client validation
2. Submit → POST /api/activities
3. Server validates (contact exists, required fields)
4. Insert into database with contact relationship
5. Return created activity
6. Redirect to activity profile or activities list

### Activity Deletion Flow

1. User clicks delete → Show confirmation dialog
2. User confirms → DELETE /api/activities/[id]
3. Delete from database
4. Return success
5. Redirect to activities list

### Task Creation Flow

1. User fills task form with contact selection → Client validation
2. Submit → POST /api/tasks
3. Server validates (contact exists, required fields)
4. Insert into database with contact relationship
5. Return created task
6. Redirect to task profile or tasks list

### Task Completion Flow

1. User clicks checkbox on task → PATCH /api/tasks/[id]
2. Server toggles completed status
3. If completing: set completedAt timestamp
4. If uncompleting: clear completedAt timestamp
5. Return updated task
6. Update UI to reflect new state

### Task Deletion Flow

1. User clicks delete → Show confirmation dialog
2. User confirms → DELETE /api/tasks/[id]
3. Delete from database
4. Return success
5. Redirect to tasks list

### Contact Deletion with Cascade

1. User clicks delete on contact → Show confirmation dialog
2. User confirms → DELETE /api/contacts/[id]
3. Delete contact from database (cascade deletes all activities and tasks)
4. Return success
5. Redirect to contacts list

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'rep' CHECK (role IN ('admin', 'manager', 'rep')),
  avatar VARCHAR(500),
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified TIMESTAMP,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  last_sign_in_ip VARCHAR(45),
  last_sign_in_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  access_token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

CREATE TABLE sign_in_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE two_factor_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'customer')),
  job_title VARCHAR(100),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  value NUMERIC NOT NULL,
  stage VARCHAR(20) NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  expected_close_date TIMESTAMP NOT NULL,
  actual_close_date TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  probability INTEGER DEFAULT 0,
  description TEXT,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  industry VARCHAR(100),
  website VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(500),
  employee_count INTEGER,
  revenue NUMERIC,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_contacts_phone_number ON contacts(phone_number);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX idx_deals_actual_close_date ON deals(actual_close_date);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_sign_in_history_user_id ON sign_in_history(user_id);
CREATE INDEX idx_sign_in_history_created_at ON sign_in_history(created_at);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_two_factor_backup_codes_user_id ON two_factor_backup_codes(user_id);
```

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns (email, status, created_at)
- Use parameterized queries to prevent SQL injection
- Consider connection pooling for production

### Frontend Optimization

- Server-side rendering for initial page loads
- Code splitting with Next.js automatic splitting
- Lazy loading for charts and heavy components
- Pagination for large contact lists (>50 contacts)

### Caching Strategy

- Next.js built-in caching for API routes
- Consider Redis for advanced caching in future phases

## Security Considerations

### MVP Phase (No Authentication)

- All users have full access to all contacts
- Trust-based model suitable for small teams
- Clear communication about data access

### Phase 1-4 (Authentication & Authorization Implemented)

- JWT-based sessions with secure cookies
- Password hashing with bcrypt (10 rounds)
- Email verification with Resend integration
- TOTP-based 2FA with backup codes
- Rate limiting with Upstash Redis (graceful fallback)
- Sign-in history and IP tracking
- Suspicious activity detection
- Role-based access control (RBAC)
- User ownership checks for all records
- Permission-based API route protection
- Admin-only user management interface
- Cascade deletion for user data

### Future Phase (Phase 5 - Enhanced Security)

- Social login (OAuth providers: Google, GitHub, etc.)
- IP intelligence and geolocation
- CAPTCHA integration
- Device fingerprinting
- Automatic account locking for suspicious activity
- Audit logging for permission denials

## Scalability Path

### Database Scaling

- Current schema supports 10,000+ contacts
- Add read replicas for high-read scenarios
- Consider sharding for multi-tenant architecture

### Application Scaling

- Stateless API routes enable horizontal scaling
- CDN for static assets
- Consider microservices architecture for future features

## Deployment Architecture (Future)

```
┌─────────────┐
│   CDN       │ (Static assets)
└─────────────┘
       │
┌─────────────┐
│  Next.js    │ (Application server)
└─────────────┘
       │
┌─────────────┐
│ PostgreSQL  │ (Primary database)
└─────────────┘
```

## Integration Points

### Future Integrations

- Email service (SendGrid, Mailgun)
- Calendar integration
- CRM platform integrations (Salesforce, HubSpot)
- Analytics tools (Google Analytics, Mixpanel)

### API Extension Points

- Webhook system for external integrations
- GraphQL API for complex queries
- REST API versioning for backward compatibility
