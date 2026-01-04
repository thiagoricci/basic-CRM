# Authentication Troubleshooting Guide

This guide helps you diagnose and fix common authentication issues in your CRM application.

## Common Issues and Solutions

### Issue 1: "Invalid email or password" Error

**Symptoms:**

- You enter correct credentials but still get this error
- Sign-in page shows error message

**Root Causes:**

1. **Email Not Verified** (Most Common)
   - The application requires email verification before sign-in
   - Unverified users cannot sign in even with correct credentials

   **Solution:**

   ```bash
   # Check user status
   npx tsx scripts/check-user.ts

   # Verify email manually (for development)
   npx tsx scripts/verify-email.ts your-email@example.com
   ```

2. **Incorrect Password**
   - Password doesn't match the one in database
   - Case-sensitive or typo

   **Solution:**
   - Reset password using "Forgot Password" link
   - Or create a new account

3. **User Account Inactive**
   - Admin may have deactivated the account

   **Solution:**
   - Contact administrator to reactivate account
   - Or check user status with: `npx tsx scripts/check-user.ts`

### Issue 2: Upstash Redis Configuration Errors

**Symptoms:**

- Error: "The 'url' property is missing or undefined in your Redis config"
- Error: "The 'token' property is missing or undefined in your Redis config"
- Error: "Failed to parse URL from /pipeline"

**Root Cause:**
Upstash Redis is not properly configured in environment variables.

**Solution:**

1. **Get Upstash Redis Credentials**
   - Go to [https://console.upstash.com/](https://console.upstash.com/)
   - Create a free Redis database
   - Copy REST API URL and token

2. **Add to `.env.local`**

   ```env
   UPSTASH_REDIS_REST_URL="https://your-db-name.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```

3. **Restart Development Server**

   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Verify Configuration**
   - Look for: `[RateLimit] Redis client initialized successfully`
   - If not configured, you'll see warning but app will work (rate limiting disabled)

**For Development Only:**
If you don't want to configure Upstash Redis, the application will work without it:

- Rate limiting will be disabled
- All requests will be allowed (fail open)
- Suitable for development, but not production

**See:** [Upstash Redis Setup Guide](./UPSTASH_REDIS_SETUP.md) for detailed instructions

### Issue 3: "Too many sign-in attempts" Error

**Symptoms:**

- Error message: "Too many sign-in attempts. Please try again later."
- HTTP status: 429

**Root Cause:**
Rate limiting is working correctly - you've exceeded the limit (10 requests per hour).

**Solution:**

1. **Wait** - Rate limit resets after 1 hour
2. **Check Rate Limit Headers** - Response includes:
   - `X-RateLimit-Limit`: Maximum requests
   - `X-RateLimit-Remaining`: Remaining requests
   - `X-RateLimit-Reset`: When limit resets

3. **Reset Rate Limit** (Development Only):
   - Clear Redis data in Upstash dashboard
   - Or wait for natural reset

### Issue 4: "Account is inactive" Error

**Symptoms:**

- Error: "Account is inactive. Please contact your administrator."

**Root Cause:**
User account has been deactivated by administrator.

**Solution:**

1. **Check User Status**

   ```bash
   npx tsx scripts/check-user.ts
   ```

2. **Contact Administrator**
   - Request account reactivation
   - Or ask why account was deactivated

3. **Reactivate Account** (Admin Only):
   - Go to `/admin/users`
   - Find the user
   - Click "Activate" button

### Issue 5: "Please verify your email address" Error

**Symptoms:**

- Error: "Please verify your email address before signing in. Check your inbox for verification link."
- HTTP status: 403

**Root Cause:**
Email verification is required for security, but user hasn't verified yet.

**Solution:**

1. **Check Email Inbox**
   - Look for verification email from your application
   - Check spam folder

2. **Resend Verification Email**
   - Go to `/auth/signin`
   - Click "Resend verification" link

3. **Manual Verification** (Development Only):

   ```bash
   npx tsx scripts/verify-email.ts your-email@example.com
   ```

4. **Verify All Users** (Development Only):

   ```bash
   # Check which users need verification
   npx tsx scripts/check-user.ts

   # Verify each unverified user
   npx tsx scripts/verify-email.ts thiago@reivien.com
   npx tsx scripts/verify-email.ts info@reivien.com
   ```

### Issue 6: Sign-in Redirects to Wrong Page

**Symptoms:**

- After successful sign-in, redirected to wrong URL
- Expected `/` but got `/dashboard` or other page

**Root Cause:**
Incorrect `callbackUrl` in sign-in form or NextAuth configuration.

**Solution:**

1. **Check Sign-in Form**
   - Verify `callbackUrl` prop is correct
   - Should be `/` for dashboard

2. **Check NextAuth Configuration**
   - Review `lib/auth.config.ts`
   - Ensure `pages.signIn` is correct

### Issue 7: Session Not Persisting

**Symptoms:**

- Can sign in successfully
- But session is lost on page refresh
- Redirected back to sign-in page

**Root Cause:**
Session configuration or cookie issues.

**Solution:**

1. **Check Session Strategy**
   - Ensure JWT strategy is configured
   - Review `lib/auth.config.ts`

2. **Check Cookie Configuration**
   - Verify cookies are set correctly
   - Check browser console for cookie errors

3. **Check NEXTAUTH_SECRET**
   - Ensure it's set in `.env.local`
   - Should be a secure random string
   - Don't change it after users have sessions

### Issue 8: Cannot Sign Out

**Symptoms:**

- Click sign-out button but nothing happens
- Session remains active

**Root Cause:**
Sign-out endpoint not configured or error in sign-out logic.

**Solution:**

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests

2. **Verify Sign-out Route**
   - Check `/api/auth/[...nextauth]/route.ts`
   - Ensure sign-out handler is implemented

3. **Clear Browser Cookies**
   - Manually clear cookies for localhost
   - Then try signing in again

## Diagnostic Tools

### Check All Users

```bash
npx tsx scripts/check-user.ts
```

This shows:

- All users in database
- Email verification status
- Account active status
- 2FA enabled status
- Potential issues

### Verify User Email

```bash
npx tsx scripts/verify-email.ts your-email@example.com
```

This manually verifies an email (development only).

### Check Database Connection

```bash
npx prisma studio
```

Opens Prisma Studio to view and edit database records.

## Production Considerations

### Security Best Practices

1. **Never** use manual email verification in production
2. **Always** require email verification for new accounts
3. **Use** strong, random `NEXTAUTH_SECRET`
4. **Enable** rate limiting in production
5. **Configure** Upstash Redis for distributed rate limiting
6. **Monitor** failed sign-in attempts
7. **Implement** account lockout after multiple failures

### Rate Limiting in Production

- **Required**: Upstash Redis must be configured
- **Benefits**:
  - Prevents brute force attacks
  - Protects against spam
  - Distributed across server instances
  - Persists across restarts

- **Without Redis**:
  - Rate limiting disabled
  - All requests allowed
  - Security risk in production

### Email Verification in Production

- **Required**: Email service must be configured (Resend)
- **Process**:
  1. User signs up
  2. Verification email sent
  3. User clicks link in email
  4. Account verified
  5. User can sign in

- **Without Email Service**:
  - Emails not sent
  - Users cannot verify
  - Users cannot sign in

## Getting Help

### Check Logs

1. **Server Logs**
   - Look for error messages in terminal
   - Check for initialization messages
   - Note any warnings

2. **Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Database Logs**
   - Use Prisma Studio to inspect data
   - Check user records
   - Verify email verification status

### Common Error Messages

| Error                                               | Meaning                                 | Solution                                 |
| --------------------------------------------------- | --------------------------------------- | ---------------------------------------- |
| "Invalid email or password"                         | Credentials wrong or email not verified | Check email verification, reset password |
| "Too many sign-in attempts"                         | Rate limit exceeded                     | Wait 1 hour or clear Redis               |
| "Account is inactive"                               | Account deactivated                     | Contact administrator                    |
| "Please verify your email"                          | Email not verified                      | Check email or resend verification       |
| "Redis client was initialized without url or token" | Upstash not configured                  | Add credentials to .env.local            |
| "Failed to parse URL from /pipeline"                | Redis configuration error               | Check URL format in .env.local           |

### Still Having Issues?

1. **Review Documentation**
   - [Upstash Redis Setup Guide](./UPSTASH_REDIS_SETUP.md)
   - [Authentication Implementation](../.kilocode/rules/memory-bank/authentication.md)

2. **Check Environment Variables**
   - Verify all required variables are set
   - Check for typos or missing values
   - Restart server after changes

3. **Clear Browser Data**
   - Clear cookies and cache
   - Try incognito/private mode
   - Try different browser

4. **Restart Development Server**

   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

5. **Check Database**
   - Ensure database is running
   - Verify connection string is correct
   - Check for migration issues

## Quick Reference

### Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"

# NextAuth
NEXTAUTH_SECRET="secure-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# Email Service (Resend)
RESEND_API_KEY="re_your-api-key"
```

### Default Admin Account

- **Email**: admin@crm.com
- **Password**: admin123
- **Role**: admin
- **Status**: Active, Email Verified

### Useful Commands

```bash
# Check users
npx tsx scripts/check-user.ts

# Verify email (dev only)
npx tsx scripts/verify-email.ts your-email@example.com

# Open Prisma Studio
npx prisma studio

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```
