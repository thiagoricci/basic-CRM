# User Authentication & Multi-user System - Implementation Plan

## Overview

This document outlines the complete implementation of User Authentication & Multi-user System for the CRM Contact Manager. The implementation is divided into 7 phases to ensure systematic development and testing.

**Technology Choice:** NextAuth.js v5 (Auth.js)

- Built for Next.js App Router
- Supports multiple providers (email/password, Google, GitHub)
- Session management built-in
- Easy to extend with custom callbacks
- Excellent TypeScript support

## Phase 1: Database Schema & Basic Auth Setup

### Objectives

- Set up NextAuth.js configuration
- Update Prisma schema with User model
- Add user relationships to existing models
- Create authentication API routes
- Set up session management

### Database Schema Changes

```prisma
// New User model
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
}

// NextAuth models (simplified)
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
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Update Existing Models

```prisma
model Contact {
  // ... existing fields
  userId    String
  user      User @relation(fields: [userId], references: [id])
}

model Deal {
  // ... existing fields
  userId    String
  user      User @relation(fields: [userId], references: [id])
}

model Task {
  // ... existing fields
  userId    String
  user      User @relation(fields: [userId], references: [id])
}

model Activity {
  // ... existing fields
  userId    String
  user      User @relation(fields: [userId], references: [id])
}
```

### Tasks

- [ ] Install NextAuth.js and dependencies
- [ ] Update Prisma schema with User, Account, Session, VerificationToken models
- [ ] Add userId foreign key to Contact, Deal, Task, Activity models
- [ ] Run database migration
- [ ] Create NextAuth configuration file (auth.config.ts)
- [ ] Create authentication API route handler (app/api/auth/[...nextauth]/route.ts)
- [ ] Create TypeScript types for auth (types/auth.ts)
- [ ] Set up environment variables (NEXTAUTH_SECRET, NEXTAUTH_URL)
- [ ] Test basic authentication flow (sign in/sign out)

---

## Phase 2: Authentication UI (Sign In/Sign Up/Forgot Password)

### Objectives

- Create authentication pages (Sign In, Sign Up, Forgot Password)
- Create authentication forms with validation
- Add password hashing with bcrypt
- Implement email verification (optional for MVP)
- Add protected route middleware

### Pages to Create

1. **Sign In Page** (`app/auth/signin/page.tsx`)
   - Email/password form
   - "Remember me" checkbox
   - "Forgot password" link
   - "Sign up" link
   - Social login buttons (Google, GitHub) - optional

2. **Sign Up Page** (`app/auth/signup/page.tsx`)
   - Name input
   - Email input
   - Password input (with strength indicator)
   - Confirm password input
   - Terms & conditions checkbox
   - "Sign in" link

3. **Forgot Password Page** (`app/auth/forgot-password/page.tsx`)
   - Email input
   - Submit button
   - "Back to sign in" link

4. **Reset Password Page** (`app/auth/reset-password/[token]/page.tsx`)
   - New password input
   - Confirm password input
   - Submit button

### Components to Create

1. **SignInForm** (`components/auth/signin-form.tsx`)
2. **SignUpForm** (`components/auth/signup-form.tsx`)
3. **ForgotPasswordForm** (`components/auth/forgot-password-form.tsx`)
4. **ResetPasswordForm** (`components/auth/reset-password-form.tsx`)
5. **PasswordStrengthIndicator** (`components/auth/password-strength-indicator.tsx`)

### API Routes to Create

1. **Sign Up API** (`app/api/auth/signup/route.ts`)
   - Validate input
   - Hash password with bcrypt
   - Create user in database
   - Send verification email (optional)

2. **Forgot Password API** (`app/api/auth/forgot-password/route.ts`)
   - Validate email
   - Generate reset token
   - Send reset email

3. **Reset Password API** (`app/api/auth/reset-password/route.ts`)
   - Validate token
   - Hash new password
   - Update user password

### Middleware

- Create middleware file (`middleware.ts`) to protect routes
- Redirect unauthenticated users to sign-in page
- Allow public routes (auth pages, API routes)

### Tasks

- [ ] Create sign-in page with form
- [ ] Create sign-up page with form
- [ ] Create forgot-password page with form
- [ ] Create reset-password page with form
- [ ] Create authentication form components
- [ ] Create password strength indicator component
- [ ] Create sign-up API route with password hashing
- [ ] Create forgot-password API route
- [ ] Create reset-password API route
- [ ] Create middleware for protected routes
- [ ] Add shadcn/ui components (if needed: alert, separator)
- [ ] Test authentication flows end-to-end
- [ ] Add form validation with Zod

---

## Phase 3: User Management (Admin Only)

### Objectives

- Create user list page (Admin only)
- Create user profile page
- Create user creation/edit forms (Admin only)
- Implement role assignment
- Add user deactivation

### Pages to Create

1. **Users List Page** (`app/users/page.tsx`)
   - Table showing all users
   - Search by name/email
   - Filter by role
   - Filter by status (active/inactive)
   - "Add User" button (Admin only)
   - Edit/Delete actions (Admin only)

2. **User Profile Page** (`app/users/[id]/page.tsx`)
   - Display user information
   - Show assigned contacts/deals/tasks count
   - Edit button (Admin only or own profile)
   - Delete button (Admin only)
   - Deactivate button (Admin only)

3. **New User Page** (`app/users/new/page.tsx`)
   - User creation form (Admin only)
   - Role selection
   - Initial password generation

### Components to Create

1. **UserTable** (`components/users/user-table.tsx`)
2. **UserForm** (`components/users/user-form.tsx`)
3. **UserProfile** (`components/users/user-profile.tsx`)
4. **UserFilters** (`components/users/user-filters.tsx`)
5. **UserSelector** (`components/users/user-selector.tsx`) - for assigning records

### API Routes to Create

1. **Users API** (`app/api/users/route.ts`)
   - GET: List all users (Admin only)
   - POST: Create new user (Admin only)

2. **User API** (`app/api/users/[id]/route.ts`)
   - GET: Get single user (Admin or own profile)
   - PUT: Update user (Admin or own profile)
   - DELETE: Delete user (Admin only)
   - PATCH: Deactivate/activate user (Admin only)

### Tasks

- [ ] Create users list page
- [ ] Create user profile page
- [ ] Create new user page
- [ ] Create user table component
- [ ] Create user form component
- [ ] Create user profile component
- [ ] Create user filters component
- [ ] Create user selector component
- [ ] Create users API routes
- [ ] Implement role-based access control for user management
- [ ] Add user deactivation functionality
- [ ] Test user management CRUD operations
- [ ] Add user management to navigation (Admin only)

---

## Phase 4: Data Ownership & Assignment

### Objectives

- Add "Assigned to" field to Contact, Deal, Task, Activity forms
- Update API routes to handle user assignment
- Create "My Records" views for each entity
- Filter records by user in list views

### Update Existing Forms

1. **Contact Form** (`components/contacts/contact-form.tsx`)
   - Add "Assigned to" field (UserSelector)
   - Default to current user

2. **Deal Form** (`components/deals/deal-form.tsx`)
   - Add "Assigned to" field (UserSelector)
   - Default to current user

3. **Task Form** (`components/tasks/task-form.tsx`)
   - Add "Assigned to" field (UserSelector)
   - Default to current user

4. **Activity Form** (`components/activities/activity-form.tsx`)
   - Add "Assigned to" field (UserSelector)
   - Default to current user

### Update API Routes

1. **Contacts API** (`app/api/contacts/route.ts`, `app/api/contacts/[id]/route.ts`)
   - Include userId in create/update
   - Filter by userId based on user role

2. **Deals API** (`app/api/deals/route.ts`, `app/api/deals/[id]/route.ts`)
   - Include userId in create/update
   - Filter by userId based on user role

3. **Tasks API** (`app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts`)
   - Include userId in create/update
   - Filter by userId based on user role

4. **Activities API** (`app/api/activities/route.ts`, `app/api/activities/[id]/route.ts`)
   - Include userId in create/update
   - Filter by userId based on user role

### Create "My Records" Pages

1. **My Contacts** (`app/my-contacts/page.tsx`)
   - Show only contacts assigned to current user
   - Reuse ContactTable component
   - Add "All Contacts" link (for Admin/Manager)

2. **My Deals** (`app/my-deals/page.tsx`)
   - Show only deals assigned to current user
   - Reuse DealKanbanBoard component
   - Add "All Deals" link (for Admin/Manager)

3. **My Tasks** (`app/my-tasks/page.tsx`)
   - Show only tasks assigned to current user
   - Reuse TaskList component
   - Add "All Tasks" link (for Admin/Manager)

4. **My Activities** (`app/my-activities/page.tsx`)
   - Show only activities assigned to current user
   - Reuse ActivityList component
   - Add "All Activities" link (for Admin/Manager)

### Update List Pages Filters

1. **Contacts List** (`app/contacts/page.tsx`)
   - Add "Assigned to" filter (Admin/Manager only)

2. **Deals List** (`app/deals/page.tsx`)
   - Add "Assigned to" filter (Admin/Manager only)

3. **Tasks List** (`app/tasks/page.tsx`)
   - Add "Assigned to" filter (Admin/Manager only)

4. **Activities List** (`app/activities/page.tsx`)
   - Add "Assigned to" filter (Admin/Manager only)

### Tasks

- [ ] Update Contact form with "Assigned to" field
- [ ] Update Deal form with "Assigned to" field
- [ ] Update Task form with "Assigned to" field
- [ ] Update Activity form with "Assigned to" field
- [ ] Update Contacts API to handle userId
- [ ] Update Deals API to handle userId
- [ ] Update Tasks API to handle userId
- [ ] Update Activities API to handle userId
- [ ] Create "My Contacts" page
- [ ] Create "My Deals" page
- [ ] Create "My Tasks" page
- [ ] Create "My Activities" page
- [ ] Add "Assigned to" filters to list pages
- [ ] Test data ownership and assignment

---

## Phase 5: Role-Based Access Control (RBAC)

### Objectives

- Implement permission checks in API routes
- Create permission utility functions
- Restrict UI elements based on user role
- Add role-based navigation

### Permission System

Create permission types and utility functions:

```typescript
// types/permissions.ts
export type UserRole = 'admin' | 'manager' | 'rep';

export interface Permissions {
  canViewAllContacts: boolean;
  canViewAllDeals: boolean;
  canViewAllTasks: boolean;
  canViewAllActivities: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canAssignRecords: boolean;
  canViewAllCompanies: boolean;
}

export function getPermissions(role: UserRole): Permissions {
  switch (role) {
    case 'admin':
      return {
        canViewAllContacts: true,
        canViewAllDeals: true,
        canViewAllTasks: true,
        canViewAllActivities: true,
        canCreateUsers: true,
        canEditUsers: true,
        canDeleteUsers: true,
        canAssignRecords: true,
        canViewAllCompanies: true,
      };
    case 'manager':
      return {
        canViewAllContacts: true,
        canViewAllDeals: true,
        canViewAllTasks: true,
        canViewAllActivities: true,
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canAssignRecords: true,
        canViewAllCompanies: true,
      };
    case 'rep':
      return {
        canViewAllContacts: false,
        canViewAllDeals: false,
        canViewAllTasks: false,
        canViewAllActivities: false,
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canAssignRecords: false,
        canViewAllCompanies: false,
      };
  }
}
```

### Create Permission Utilities

1. **Permission Check Middleware** (`lib/permissions.ts`)
   - `hasPermission(user, permission)` function
   - `canAccessResource(user, resource)` function
   - `filterByUserPermission(user, resources)` function

2. **API Route Helpers** (`lib/api-helpers.ts`)
   - `requireAuth()` middleware
   - `requireRole(role)` middleware
   - `requirePermission(permission)` middleware

### Update API Routes with RBAC

Apply permission checks to all API routes:

1. **Contacts API**
   - Rep: Only see own contacts
   - Manager/Admin: See all contacts
   - Rep: Cannot assign contacts to others
   - Manager/Admin: Can assign contacts to any user

2. **Deals API**
   - Rep: Only see own deals
   - Manager/Admin: See all deals
   - Rep: Cannot assign deals to others
   - Manager/Admin: Can assign deals to any user

3. **Tasks API**
   - Rep: Only see own tasks
   - Manager/Admin: See all tasks
   - Rep: Cannot assign tasks to others
   - Manager/Admin: Can assign tasks to any user

4. **Activities API**
   - Rep: Only see own activities
   - Manager/Admin: See all activities
   - Rep: Cannot assign activities to others
   - Manager/Admin: Can assign activities to any user

5. **Users API**
   - Admin: Full access
   - Manager: Read-only access
   - Rep: No access

6. **Dashboard API**
   - Rep: See only own data
   - Manager: See team data
   - Admin: See all data

### Update UI Components with RBAC

1. **Navigation** (`components/layout/navigation.tsx`)
   - Show/hide links based on user role
   - Add "My Records" section for Reps
   - Add "Users" link for Admins

2. **Contact Table** (`components/contacts/contact-table.tsx`)
   - Hide "Assigned to" column for Reps
   - Disable assignment dropdown for Reps

3. **Deal Kanban Board** (`components/deals/deal-kanban-board.tsx`)
   - Show only own deals for Reps
   - Show all deals for Managers/Admins

4. **Task List** (`components/tasks/task-list.tsx`)
   - Show only own tasks for Reps
   - Show all tasks for Managers/Admins

5. **Activity List** (`components/activities/activity-list.tsx`)
   - Show only own activities for Reps
   - Show all activities for Managers/Admins

### Create Role Badge Component

- **RoleBadge** (`components/users/role-badge.tsx`)
  - Display user role with color coding
  - Admin: Red
  - Manager: Blue
  - Rep: Green

### Tasks

- [ ] Create permission types and utility functions
- [ ] Create permission check middleware
- [ ] Create API route helpers for RBAC
- [ ] Update Contacts API with RBAC
- [ ] Update Deals API with RBAC
- [ ] Update Tasks API with RBAC
- [ ] Update Activities API with RBAC
- [ ] Update Users API with RBAC
- [ ] Update Dashboard API with RBAC
- [ ] Update Navigation component with RBAC
- [ ] Update Contact Table with RBAC
- [ ] Update Deal Kanban Board with RBAC
- [ ] Update Task List with RBAC
- [ ] Update Activity List with RBAC
- [ ] Create Role Badge component
- [ ] Test role-based access control

---

## Phase 6: UI Updates & User Profile

### Objectives

- Add user dropdown to header
- Create user profile page
- Add user settings page
- Update dashboard to show user-specific data
- Add user avatar display

### Create User Dropdown Component

- **UserDropdown** (`components/layout/user-dropdown.tsx`)
  - Display user avatar and name
  - Dropdown menu with:
    - Profile link
    - Settings link
    - Sign out button
  - Role badge display

### Update Header/Layout

- **Layout** (`app/layout.tsx`)
  - Add UserDropdown to header
  - Show user info in header
  - Update navigation based on user role

### Create User Profile Page

- **User Profile** (`app/profile/page.tsx`)
  - Display user information
  - Edit profile form (name, bio, avatar)
  - Change password form
  - Show statistics:
    - Total contacts
    - Total deals
    - Total tasks
    - Total activities

### Create User Settings Page

- **User Settings** (`app/settings/page.tsx`)
  - Preferences (theme, notifications)
  - Account settings
  - Security settings (change password)
  - Delete account (with confirmation)

### Update Dashboard

- **Dashboard** (`app/page.tsx`)
  - Show user-specific data
  - Add "My Records" quick links
  - Update analytics to filter by user (for Reps)

### Create Avatar Upload Component

- **AvatarUpload** (`components/users/avatar-upload.tsx`)
  - File upload for avatar
  - Image preview
  - Crop functionality (optional)

### Tasks

- [ ] Create UserDropdown component
- [ ] Update layout to include UserDropdown
- [ ] Create user profile page
- [ ] Create user settings page
- [ ] Update dashboard for user-specific data
- [ ] Create avatar upload component
- [ ] Add user avatar display throughout app
- [ ] Test profile and settings functionality
- [ ] Test avatar upload and display

---

## Phase 7: Testing, Documentation & Deployment

### Objectives

- Comprehensive testing of all authentication features
- Update API documentation
- Create user guide for authentication
- Prepare for deployment
- Update README with authentication setup

### Testing

1. **Unit Tests**
   - Permission check functions
   - Password hashing
   - Token generation

2. **Integration Tests**
   - Authentication flows (sign in, sign up, sign out)
   - User management CRUD
   - Data ownership and assignment
   - Role-based access control

3. **E2E Tests**
   - Complete user journey from sign up to creating records
   - Admin user management workflow
   - Manager vs Rep access differences

### Documentation

1. **API Documentation**
   - Update `docs/API_DOCUMENTATION.md` with auth endpoints
   - Document authentication headers
   - Document permission system

2. **User Guide**
   - Create `docs/AUTHENTICATION.md`
   - How to sign up and sign in
   - How to reset password
   - Understanding user roles and permissions

3. **Deployment Guide**
   - Update `README.md` with authentication setup
   - Environment variables for auth
   - Database migration steps
   - Security best practices

### Security Review

1. **Password Security**
   - Ensure bcrypt is used for hashing
   - Implement password complexity requirements
   - Rate limiting for auth endpoints

2. **Session Security**
   - Secure cookie settings
   - Session expiration
   - CSRF protection

3. **API Security**
   - Validate all inputs
   - Sanitize outputs
   - Rate limiting

### Performance Optimization

1. **Database Indexes**
   - Add indexes on userId columns
   - Add composite indexes for filtering

2. **Caching**
   - Cache user permissions
   - Cache user profile data

3. **API Optimization**
   - Batch queries for user data
   - Optimize permission checks

### Deployment Checklist

- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Set up email service for password reset (optional)
- [ ] Configure CORS settings
- [ ] Set up monitoring and logging
- [ ] Create backup strategy
- [ ] Test deployment in staging environment

### Tasks

- [ ] Write unit tests for auth utilities
- [ ] Write integration tests for auth flows
- [ ] Write E2E tests for user journeys
- [ ] Update API documentation
- [ ] Create authentication user guide
- [ ] Update README with auth setup
- [ ] Conduct security review
- [ ] Add database indexes for userId
- [ ] Implement caching for user data
- [ ] Optimize API routes
- [ ] Prepare deployment checklist
- [ ] Test deployment in staging
- [ ] Deploy to production

---

## Migration Strategy

### Data Migration

When adding authentication to existing CRM:

1. **Create Default Admin User**
   - Create initial admin account during migration
   - Set default password (force change on first login)

2. **Assign Existing Records**
   - Assign all existing contacts to default admin
   - Assign all existing deals to default admin
   - Assign all existing tasks to default admin
   - Assign all existing activities to default admin

3. **Run Migration Script**
   - Create migration script to add userId to existing records
   - Test migration on staging database
   - Backup production database before migration

### Rollback Plan

1. Keep backup of pre-migration database
2. Document migration steps for easy rollback
3. Test rollback procedure

---

## Success Criteria

### Phase 1

- [ ] NextAuth.js configured and working
- [ ] User model created in database
- [ ] Basic sign in/sign out working

### Phase 2

- [ ] All authentication pages created and styled
- [ ] Sign up flow working
- [ ] Sign in flow working
- [ ] Password reset flow working
- [ ] Protected routes redirect to sign in

### Phase 3

- [ ] User management CRUD working
- [ ] Role assignment working
- [ ] User deactivation working
- [ ] Only admins can access user management

### Phase 4

- [ ] All forms have "Assigned to" field
- [ ] Records are assigned to users
- [ ] "My Records" pages working
- [ ] Filtering by user working

### Phase 5

- [ ] Permission system implemented
- [ ] All API routes have RBAC
- [ ] UI elements hidden based on role
- [ ] Role-based navigation working

### Phase 6

- [ ] User dropdown in header
- [ ] User profile page working
- [ ] User settings page working
- [ ] Avatar upload working
- [ ] Dashboard shows user-specific data

### Phase 7

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Security review complete
- [ ] Deployment checklist complete
- [ ] Production deployment successful

---

## Dependencies

### New Packages to Install

```bash
# NextAuth.js v5 (Auth.js)
npm install next-auth@beta

# Password hashing
npm install bcrypt

# Email service (optional for password reset)
npm install nodemailer

# Avatar upload (optional)
npm install @uploadthing/react
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Email (optional for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

---

## Notes & Considerations

1. **Backward Compatibility**
   - Existing data will be assigned to default admin user
   - Gradual migration of users to new system

2. **Email Verification**
   - Optional for MVP
   - Can be added in later phase

3. **Social Login**
   - Optional for MVP
   - Google and GitHub providers ready to add

4. **Two-Factor Authentication**
   - Not in MVP
   - Can be added in future phase

5. **Audit Logging**
   - Not in MVP
   - Can be added in future phase for compliance

6. **Performance**
   - Consider caching user permissions
   - Optimize database queries with proper indexes

7. **Security**
   - Always use HTTPS in production
   - Implement rate limiting on auth endpoints
   - Use strong password requirements

---

## Timeline Estimate

- Phase 1: 2-3 days
- Phase 2: 2-3 days
- Phase 3: 2-3 days
- Phase 4: 2-3 days
- Phase 5: 2-3 days
- Phase 6: 2-3 days
- Phase 7: 2-3 days

**Total: 14-21 days**

---

## References

- [NextAuth.js Documentation](https://authjs.dev/)
- [NextAuth.js v5 Guide](https://authjs.dev/guides/upgrade-to-v5)
- [Prisma Authentication Guide](https://www.prisma.io/docs/guides/database/strategies/mongodb/nextjs-auth)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
