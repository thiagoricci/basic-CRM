# Phase 3.5: Email Verification Flow Completion

## Overview

Complete the email verification system with real email service integration using Resend. This phase ensures all new users must verify their email addresses before accessing the CRM system, improving security and reducing spam accounts.

## Current State

**Already Implemented:**

- ✅ User model with `emailVerified` field
- ✅ VerificationToken model for storing verification tokens
- ✅ Email service integration with Resend (lib/email.ts)
- ✅ Email templates (verification, password reset, 2FA, security alerts)
- ✅ Verification email sending in signup flow
- ✅ Email verification API endpoint (GET /api/auth/verify-email)
- ✅ Email verification page (app/auth/verify-email/page.tsx)
- ✅ Rate limiting infrastructure (lib/rate-limit.ts)
- ✅ Security utilities (lib/security.ts)

**Missing/Incomplete:**

- ❌ Resend verification email functionality
- ❌ Sign-in blocking for unverified users
- ❌ Email verification status indicators in UI
- ❌ Admin manual email verification
- ❌ Email verification reminders
- ❌ Comprehensive error handling and user feedback

## Implementation Plan

### 1. Prerequisites & Setup

#### 1.1 Verify Dependencies

```bash
# Check if resend is installed
npm list resend

# If not installed
npm install resend
```

#### 1.2 Environment Variables

Add to `.env.local`:

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Email Verification Settings
EMAIL_VERIFICATION_REQUIRED=true
EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS=24
EMAIL_RESEND_COOLDOWN_SECONDS=60
```

#### 1.3 Test Resend Connection

Create test script: `scripts/test-email.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<p>This is a test email from CRM Contact Manager.</p>',
  });

  console.log('Email sent:', result);
}

testEmail();
```

### 2. Backend API Enhancements

#### 2.1 Resend Verification Email Endpoint

**File:** `app/api/auth/resend-verification/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getRateLimitHeaders, getRateLimitErrorResponse } from '@/lib/rate-limit';
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email';
import { getClientIP } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json({ data: null, error: 'Email is required' }, { status: 400 });
    }

    // Check rate limit (per email address)
    const rateLimitResult = await checkRateLimit(
      // @ts-ignore
      require('@/lib/rate-limit').rateLimiters.resendVerification,
      email
    );

    if (!rateLimitResult.success) {
      return new NextResponse(getRateLimitErrorResponse(rateLimitResult), {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      });
    }

    // Find user by email
    const user = await (prisma as any).user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        {
          data: {
            message: 'If an account exists with this email, a verification link has been sent.',
          },
          error: null,
        },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ data: null, error: 'Email is already verified' }, { status: 400 });
    }

    // Delete any existing verification tokens
    await (prisma as any).verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    // Store verification token
    await (prisma as any).verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json(
      {
        data: { message: 'Verification email sent successfully' },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ResendVerification] Error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
```

#### 2.2 Update Sign-in API to Check Email Verification

**File:** `app/api/auth/signin/route.ts` (modify existing)

Add email verification check after password validation:

```typescript
// After password validation, add:
if (!user.emailVerified) {
  // Log failed sign-in attempt
  await (prisma as any).signInHistory.create({
    data: {
      userId: user.id,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      success: false,
      failureReason: 'Email not verified',
    },
  });

  return NextResponse.json(
    {
      data: null,
      error:
        'Please verify your email address before signing in. Check your inbox for the verification link.',
      requiresEmailVerification: true,
    },
    { status: 403 }
  );
}
```

#### 2.3 Admin Manual Email Verification Endpoint

**File:** `app/api/admin/users/[id]/verify-email/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireRole } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser();
    requireRole(currentUser, 'admin');

    // Find user to verify
    const user = await (prisma as any).user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ data: null, error: 'User not found' }, { status: 404 });
    }

    // Verify email
    const updatedUser = await (prisma as any).user.update({
      where: { id: params.id },
      data: { emailVerified: new Date() },
    });

    // Delete any existing verification tokens
    await (prisma as any).verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    // Send activation email
    await sendAccountActivatedEmail(user.email, user.name);

    return NextResponse.json(
      {
        data: {
          message: 'Email verified successfully',
          user: updatedUser,
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[AdminVerifyEmail] Error:', error);
    return NextResponse.json({ data: null, error: 'Failed to verify email' }, { status: 500 });
  }
}
```

#### 2.4 Update Rate Limiting Configuration

**File:** `lib/rate-limit.ts` (add new rate limiters)

```typescript
export const rateLimiters = {
  // ... existing rate limiters ...

  resendVerification: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // Max 3 requests per minute
    identifier: 'email',
  },

  verifyEmail: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // Max 10 attempts per 15 minutes
    identifier: 'token',
  },
};
```

### 3. Frontend Components

#### 3.1 Resend Verification Email Button Component

**File:** `components/auth/resend-verification-button.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';

interface ResendVerificationButtonProps {
  email: string;
  onSent?: () => void;
}

export function ResendVerificationButton({
  email,
  onSent,
}: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.error === null) {
        setMessage('Verification email sent! Please check your inbox.');
        onSent?.();

        // Start countdown
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleResend}
        disabled={isLoading || countdown > 0}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : countdown > 0 ? (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Resend in {countdown}s
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Resend Verification Email
          </>
        )}
      </Button>
      {message && (
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
}
```

#### 3.2 Email Verification Status Indicator

**File:** `components/auth/email-verification-status.tsx`

```typescript
'use client';

import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmailVerificationStatusProps {
  isVerified: boolean;
  email?: string;
}

export function EmailVerificationStatus({
  isVerified,
  email,
}: EmailVerificationStatusProps) {
  if (isVerified) {
    return (
      <Badge variant="outline" className="gap-1 border-green-500 text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700 dark:text-amber-400">
      <AlertCircle className="h-3 w-3" />
      Not Verified
    </Badge>
  );
}
```

#### 3.3 Email Verification Banner

**File:** `components/auth/email-verification-banner.tsx`

```typescript
'use client';

import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResendVerificationButton } from './resend-verification-button';

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

export function EmailVerificationBanner({
  email,
  onDismiss,
}: EmailVerificationBannerProps) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Verify Your Email Address
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Please verify your email to access all features. Check your inbox for the verification link.
              </p>
            </div>
            <ResendVerificationButton email={email} />
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-6 w-6 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
```

#### 3.4 Update Sign-in Form

**File:** `components/auth/sign-in-form.tsx` (modify existing)

Add email verification error handling:

```typescript
// In the sign-in form error handling:
if (data.requiresEmailVerification) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Email Not Verified</AlertTitle>
        <AlertDescription>{data.error}</AlertDescription>
      </Alert>
      <ResendVerificationButton email={email} />
    </div>
  );
}
```

### 4. User Settings Page

#### 4.1 Create User Settings Page

**File:** `app/settings/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailVerificationStatus } from '@/components/auth/email-verification-status';
import { ResendVerificationButton } from '@/components/auth/resend-verification-button';
import { getCurrentUser } from '@/lib/auth';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    }
    loadUser();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Address</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {user?.email}
              </p>
            </div>
            <EmailVerificationStatus
              isVerified={!!user?.emailVerified}
            />
          </div>

          {!user?.emailVerified && (
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Your email is not verified. Please verify your email to access all features.
              </p>
              <ResendVerificationButton email={user?.email} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add more settings sections as needed */}
    </div>
  );
}
```

### 5. Admin User Management Page

#### 5.1 Create Admin Users Page

**File:** `app/admin/users/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { EmailVerificationStatus } from '@/components/auth/email-verification-status';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch users from API
    async function fetchUsers() {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.data || []);
      setIsLoading(false);
    }
    fetchUsers();
  }, []);

  const handleVerifyEmail = async (userId: string) => {
    const response = await fetch(`/api/admin/users/${userId}/verify-email`, {
      method: 'POST',
    });

    if (response.ok) {
      // Refresh users list
      // ...
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{user.role}</Badge>
              </TableCell>
              <TableCell>
                {user.isActive ? (
                  <Badge variant="outline" className="border-green-500 text-green-700">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-500 text-red-700">
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <EmailVerificationStatus isVerified={!!user.emailVerified} />
              </TableCell>
              <TableCell>
                {!user.emailVerified && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerifyEmail(user.id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 6. Testing Checklist

#### 6.1 End-to-End Testing

**Test Case 1: Sign-up Flow**

1. Navigate to `/auth/signup`
2. Fill in registration form
3. Submit form
4. Verify user is created with `emailVerified: null`
5. Verify verification email is sent
6. Click verification link in email
7. Verify email is verified (`emailVerified` is set)
8. Attempt to sign in - should succeed

**Test Case 2: Sign-in Blocking**

1. Create user without verifying email
2. Attempt to sign in
3. Verify error message: "Please verify your email address"
4. Verify "Resend Verification Email" button appears
5. Click resend button
6. Verify new verification email is sent
7. Verify email and sign in - should succeed

**Test Case 3: Resend Verification Email**

1. Create user without verifying email
2. Navigate to sign-in page
3. Click "Resend Verification Email" button
4. Verify email is sent
5. Click resend button again immediately
6. Verify countdown timer prevents spam
7. Wait for countdown to expire
8. Resend again - should work

**Test Case 4: Token Expiration**

1. Create verification token
2. Manually expire token in database
3. Attempt to verify with expired token
4. Verify error message: "Verification link has expired"
5. Request new verification email
6. Verify with new token - should work

**Test Case 5: Admin Manual Verification**

1. Create user without verifying email
2. Sign in as admin
3. Navigate to admin users page
4. Find unverified user
5. Click "Verify" button
6. Verify email is marked as verified
7. User can now sign in

**Test Case 6: Already Verified User**

1. Create and verify user
2. Attempt to request new verification email
3. Verify error: "Email is already verified"

### 7. Documentation Updates

#### 7.1 Update Authentication Documentation

**File:** `docs/security/authentication.md`

Add section:

```markdown
## Email Verification

### Overview

All new users must verify their email address before accessing the CRM system. This improves security and reduces spam accounts.

### Flow

1. User signs up with email and password
2. Verification email is sent to user's email address
3. User clicks verification link in email
4. Email is verified and user can sign in

### Resending Verification Email

If verification email is lost or expired, users can request a new verification email from:

- Sign-in page (when sign-in is blocked)
- Account settings page

### Admin Manual Verification

Admin users can manually verify user emails from the admin users page.

### Configuration

Environment variables:

- `EMAIL_VERIFICATION_REQUIRED`: Enable/disable email verification (default: true)
- `EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS`: Token expiry time (default: 24)
- `EMAIL_RESEND_COOLDOWN_SECONDS`: Cooldown between resend requests (default: 60)
```

#### 7.2 API Documentation

**File:** `docs/api/authentication.md`

Add endpoints:

````markdown
### POST /api/auth/resend-verification

Resend verification email to user.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```
````

**Response:**

```json
{
  "data": {
    "message": "Verification email sent successfully"
  },
  "error": null
}
```

### POST /api/admin/users/:id/verify-email

Manually verify user email (admin only).

**Response:**

```json
{
  "data": {
    "message": "Email verified successfully",
    "user": { ... }
  },
  "error": null
}
```

```

### 8. Security Considerations

1. **Rate Limiting**: All email-related endpoints are rate-limited to prevent abuse
2. **Token Security**: Verification tokens are cryptographically secure and expire after 24 hours
3. **User Privacy**: Don't reveal if email exists in system for unauthenticated requests
4. **Audit Trail**: All email verification events are logged for security monitoring
5. **IP Tracking**: Track IP addresses for verification requests to detect suspicious activity

### 9. Success Criteria

Phase 3.5 is complete when:

- ✅ All new users must verify email before sign-in
- ✅ Users can resend verification emails with cooldown timer
- ✅ Clear error messages guide users through verification process
- ✅ Admin users can manually verify emails
- ✅ Email verification status is visible in UI
- ✅ All test cases pass
- ✅ Documentation is updated
- ✅ Rate limiting prevents email spam
- ✅ Security audit trail is maintained

## Next Steps

After Phase 3.5 completion:

1. **Phase 3.2**: IP Tracking and Security Alerts
2. **Phase 4**: Social Login Integration (OAuth providers)
3. **Phase 5**: Role-Based Access Control (RBAC) implementation
```
