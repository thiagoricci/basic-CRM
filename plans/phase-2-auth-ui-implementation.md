# Phase 2: Authentication UI Implementation Plan

## Overview

This plan details the implementation of authentication UI components and pages for the CRM system. Phase 1 completed the backend authentication infrastructure (database schema, NextAuth.js configuration, helper functions). Phase 2 focuses on creating the user-facing authentication interface.

## Current State (Phase 1 Complete)

✅ Database schema with User, Account, Session, VerificationToken models
✅ NextAuth.js configured with Credentials provider
✅ Helper functions: getSession(), getCurrentUser(), requireAuth(), requireRole()
✅ Default admin user created (admin@crm.com / admin123)
✅ All existing records migrated to admin user
✅ Password hashing with bcrypt (10 rounds)
✅ JWT-based session management

## Phase 2 Goals

Create a complete authentication UI that allows users to:

- Sign in with email/password
- Sign up for new accounts
- Reset forgotten passwords
- Sign out securely
- Navigate to protected routes only when authenticated

## Architecture

### Component Structure

```
app/
├── auth/
│   ├── layout.tsx              # Auth layout with consistent styling
│   ├── signin/
│   │   └── page.tsx            # Sign-in page
│   ├── signup/
│   │   └── page.tsx            # Sign-up page
│   ├── forgot-password/
│   │   └── page.tsx            # Forgot password page
│   └── reset-password/
│       └── page.tsx            # Reset password page
components/
├── auth/
│   ├── sign-in-form.tsx        # Sign-in form component
│   ├── sign-up-form.tsx        # Sign-up form component
│   ├── forgot-password-form.tsx # Forgot password form component
│   ├── reset-password-form.tsx  # Reset password form component
│   ├── password-strength.tsx   # Password strength indicator
│   └── auth-layout.tsx         # Auth page layout wrapper
middleware.ts                    # Protected route middleware
```

### Data Flow

```
User Action → Form Component → API Route → Database → Session Update → UI Redirect
```

## Implementation Steps

### Step 1: Create Authentication Form Components

**Files to Create:**

1. `components/auth/sign-in-form.tsx`
   - Email input with validation
   - Password input with show/hide toggle
   - Remember me checkbox
   - Sign in button with loading state
   - Link to forgot password page
   - Link to sign up page
   - Error handling and display

2. `components/auth/sign-up-form.tsx`
   - Name input (required, max 100 chars)
   - Email input with validation
   - Password input with show/hide toggle
   - Confirm password input with validation
   - Password strength indicator
   - Sign up button with loading state
   - Link to sign in page
   - Error handling and display

3. `components/auth/forgot-password-form.tsx`
   - Email input with validation
   - Submit button with loading state
   - Success message display
   - Link back to sign in page
   - Error handling and display

4. `components/auth/reset-password-form.tsx`
   - New password input with show/hide toggle
   - Confirm password input with validation
   - Password strength indicator
   - Reset password button with loading state
   - Link back to sign in page
   - Error handling and display

5. `components/auth/password-strength.tsx`
   - Visual strength indicator (weak, fair, good, strong)
   - Requirements checklist:
     - Minimum 8 characters
     - At least 1 uppercase letter
     - At least 1 lowercase letter
     - At least 1 number
     - At least 1 special character
   - Real-time strength calculation

6. `components/auth/auth-layout.tsx`
   - Centered card layout
   - Logo/brand header
   - Consistent spacing and typography
   - Responsive design
   - Background pattern/gradient

**Validation Requirements:**

- Email: Valid email format, unique in database
- Password: Minimum 8 characters, must match confirmation
- Name: Required, max 100 characters

### Step 2: Create Authentication Pages

**Files to Create:**

1. `app/auth/layout.tsx`
   - Auth layout wrapper
   - Apply auth-layout component
   - Set page title and metadata

2. `app/auth/signin/page.tsx`
   - Sign-in form component
   - Page title: "Sign In"
   - Redirect to dashboard after successful sign-in
   - Handle sign-in errors

3. `app/auth/signup/page.tsx`
   - Sign-up form component
   - Page title: "Create Account"
   - Redirect to sign-in after successful sign-up
   - Handle sign-up errors

4. `app/auth/forgot-password/page.tsx`
   - Forgot password form component
   - Page title: "Forgot Password"
   - Display success message after submission
   - Handle errors

5. `app/auth/reset-password/page.tsx`
   - Reset password form component
   - Page title: "Reset Password"
   - Validate token from URL query params
   - Redirect to sign-in after successful reset
   - Handle errors

**Page Routing:**

- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/forgot-password` - Forgot password page
- `/auth/reset-password?token=xxx` - Reset password page with token

### Step 3: Create Protected Route Middleware

**File to Create:**

1. `middleware.ts` (root level)
   - Check authentication status
   - Redirect unauthenticated users to sign-in
   - Allow access to auth pages, public pages, and static assets
   - Apply to protected routes:
     - `/dashboard`
     - `/contacts/*`
     - `/activities/*`
     - `/tasks/*`
     - `/deals/*`
     - `/companies/*`
     - `/reports/*`

**Middleware Logic:**

```typescript
import { authConfig } from '@/lib/auth.config';
import NextAuth from 'next-auth';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth).*)'],
};
```

### Step 4: Update Navigation Component

**File to Modify:**

1. `components/layout/navigation.tsx`
   - Check authentication status using `getCurrentUser()`
   - Show sign-in button if not authenticated
   - Show user dropdown with sign-out option if authenticated
   - Update navigation links to include auth state

**User Dropdown Features:**

- Display user name and email
- Link to user profile (future feature)
- Sign out button
- Avatar display (if available)

### Step 5: Create Sign-Up API Route

**File to Create:**

1. `app/api/auth/signup/route.ts`
   - POST endpoint for user registration
   - Validate input (name, email, password)
   - Check email uniqueness
   - Hash password with bcrypt
   - Create user in database
   - Return success/error response
   - Set default role: 'rep'

**Validation:**

- Name: Required, max 100 characters
- Email: Valid format, unique
- Password: Minimum 8 characters

### Step 6: Create Password Reset API Routes

**Files to Create:**

1. `app/api/auth/forgot-password/route.ts`
   - POST endpoint for password reset request
   - Validate email
   - Generate reset token
   - Store token in VerificationToken table
   - Send reset email (mock for MVP, integrate email service later)
   - Return success/error response

2. `app/api/auth/reset-password/route.ts`
   - POST endpoint for password reset
   - Validate token
   - Validate new password
   - Hash new password
   - Update user password
   - Delete used token
   - Return success/error response

### Step 7: Update Navigation with Auth State

**File to Modify:**

1. `components/layout/navigation.tsx`
   - Import `getCurrentUser()` helper
   - Conditionally render sign-in button or user dropdown
   - Add sign-out functionality using NextAuth signOut

**Sign-Out Implementation:**

```typescript
'use client';
import { signOut } from 'next-auth/react';

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/auth/signin' });
};
```

### Step 8: Add Loading States

**Components to Update:**

- All auth forms should show loading spinner during API calls
- Disable submit button while loading
- Show error messages clearly
- Show success messages with auto-dismiss

### Step 9: Styling and UX

**Design Principles:**

- Follow "intentional minimalism" aesthetic
- Use shadcn/ui components (Button, Input, Card, Label)
- Consistent spacing and typography
- Smooth transitions and micro-interactions
- Mobile-responsive design
- Accessible (keyboard navigation, screen reader support)

**Color Scheme:**

- Primary: Brand color (from existing design)
- Error: Red/danger color
- Success: Green/success color
- Warning: Yellow/warning color

### Step 10: Testing

**Test Cases:**

1. **Sign In Flow:**
   - Sign in with valid credentials → redirect to dashboard
   - Sign in with invalid email → show error
   - Sign in with invalid password → show error
   - Sign in with inactive account → show error
   - Remember me functionality

2. **Sign Up Flow:**
   - Sign up with valid data → redirect to sign-in
   - Sign up with duplicate email → show error
   - Sign up with invalid email format → show error
   - Sign up with weak password → show strength warning
   - Password mismatch → show error

3. **Forgot Password Flow:**
   - Submit valid email → show success message
   - Submit invalid email format → show error
   - Submit non-existent email → show generic error (security)

4. **Reset Password Flow:**
   - Reset with valid token → redirect to sign-in
   - Reset with invalid token → show error
   - Reset with weak password → show strength warning
   - Password mismatch → show error

5. **Protected Routes:**
   - Access protected route while authenticated → allowed
   - Access protected route while not authenticated → redirect to sign-in
   - Sign out → redirect to sign-in
   - Sign in → redirect to intended page or dashboard

6. **Navigation:**
   - Show sign-in button when not authenticated
   - Show user dropdown when authenticated
   - Sign out functionality works correctly

## Dependencies to Install

No new dependencies required. Using existing:

- next-auth@beta (already installed)
- bcrypt (already installed)
- @types/bcrypt (already installed)
- shadcn/ui components (already available)

## API Endpoints to Create

1. `POST /api/auth/signup` - User registration
2. `POST /api/auth/forgot-password` - Request password reset
3. `POST /api/auth/reset-password` - Reset password with token

## Files to Modify

1. `components/layout/navigation.tsx` - Add auth state handling
2. `lib/auth.ts` - Add signOut helper (if needed)

## Success Criteria

- [ ] Users can sign in with valid credentials
- [ ] Users can sign up for new accounts
- [ ] Users can request password reset
- [ ] Users can reset password with valid token
- [ ] Protected routes require authentication
- [ ] Unauthenticated users are redirected to sign-in
- [ ] Navigation shows correct auth state
- [ ] Sign out functionality works correctly
- [ ] All forms have proper validation
- [ ] Error messages are clear and helpful
- [ ] Loading states are visible during API calls
- [ ] Password strength indicator works correctly
- [ ] Design follows "intentional minimalism" aesthetic
- [ ] Mobile-responsive design works correctly

## Known Limitations (Phase 2)

- Email service integration is mocked (no actual emails sent)
- No email verification for sign-up (to be added in Phase 3)
- No social login (to be added in Phase 4)
- No role-based access control (to be added in Phase 5)
- No "Assigned to" fields in forms (to be added in Phase 4)
- All users have same access level (rep role by default)

## Security Considerations

- Passwords are hashed with bcrypt (10 rounds)
- Password reset tokens have expiration
- Error messages don't reveal sensitive information
- CSRF protection via NextAuth.js
- Secure cookies for session management
- Rate limiting (to be added in Phase 3)

## Future Phases

- **Phase 3:** Email verification, rate limiting, enhanced security
- **Phase 4:** Social login, "Assigned to" fields in forms
- **Phase 5:** Role-based access control, permissions

## Implementation Order

1. Create authentication form components (Step 1)
2. Create authentication pages (Step 2)
3. Create sign-up API route (Step 5)
4. Create password reset API routes (Step 6)
5. Create protected route middleware (Step 3)
6. Update navigation component (Step 4, Step 7)
7. Add loading states and error handling (Step 8)
8. Apply styling and UX improvements (Step 9)
9. Test all authentication flows (Step 10)

## Notes

- Follow existing code patterns in the project
- Use shadcn/ui components for consistency
- Maintain TypeScript type safety
- Keep components modular and reusable
- Document any deviations from this plan
- Update authentication.md memory bank after completion
