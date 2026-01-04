# Email Verification Troubleshooting Guide

## Status: ✅ Email Sending is Working

**What's Working:**

- ✅ Resend API is configured correctly
- ✅ Emails are being sent successfully
- ✅ Verification tokens are being generated
- ✅ Tokens are being stored in database
- ✅ Verification API endpoint is working correctly

**Test Results:**

- Test email sent successfully to `onboarding@resend.dev`
- Direct API test: `curl` to verify-email endpoint returned 200 OK
- Token creation and storage: Working perfectly

## The Issue

When you sign up through the web interface and click the verification link, you get a 400 error with "Invalid or expired verification link".

## Possible Causes & Solutions

### 1. Using Old/Expired Token

**Symptom:** You're clicking a link from an old email

**Solution:**

1. Clear your database: `npm run clear-db`
2. Sign up again with your email
3. Use the NEW verification link from the NEW email

### 2. Signup Failed Silently

**Symptom:** User was created but email wasn't sent due to error

**Solution:**
Check browser console and server logs for errors during signup:

```bash
# Check server logs for signup errors
# Look for: [Signup] Failed to send verification email
```

### 3. Token Not Being Stored

**Symptom:** User created but token not saved to database

**Solution:**
Run the signup flow test to verify token storage:

```bash
npm run test-signup
```

This will create a test user and verify token is stored correctly.

### 4. Rate Limiting Blocking Request

**Symptom:** Too many verification attempts

**Solution:**
Wait 1 hour and try again, or check rate limit:

```bash
npm run check-tokens
```

## How to Test Email Verification Properly

### Step 1: Clear Database

```bash
npm run clear-db
```

### Step 2: Start Dev Server

```bash
npm run dev
```

### Step 3: Sign Up

1. Go to: `http://localhost:3000/auth/signup`
2. Enter your email address
3. Create a password (min 8 characters)
4. Click "Sign Up"

### Step 4: Check Email

1. Open your email inbox
2. Find the verification email from `onboarding@resend.dev`
3. Check spam folder if not in inbox

### Step 5: Click Verification Link

1. Click the "Verify Email" button in the email
2. You should see: "Email verified successfully. You can now sign in."
3. Click "Go to Sign In" button

### Step 6: Sign In

1. Go to: `http://localhost:3000/auth/signin`
2. Enter your email and password
3. Sign in to your account

## Debugging Commands

### Check Verification Tokens

```bash
npm run check-tokens
```

Shows all tokens in database and their status.

### Test Email Sending

```bash
npm run test-email
```

Sends a test email to verify Resend is working.

### Test Signup Flow

```bash
npm run test-signup
```

Creates a test user and verifies token creation/storage.

### Clear Database

```bash
npm run clear-db
```

Removes all users and verification tokens.

### Manually Verify Email

```bash
npm run verify-email your-email@example.com
```

Manually marks a user's email as verified.

## Common Issues

### Issue: "Email already registered"

**Cause:** User with this email already exists

**Solution:**

1. Sign in with existing account, OR
2. Use a different email address, OR
3. Delete existing user: `npm run delete-user your-email@example.com`

### Issue: "Too many requests"

**Cause:** Rate limiting triggered

**Solution:**
Wait 1 hour and try again.

### Issue: "Invalid or expired verification link"

**Cause:** Token not found in database or expired

**Solution:**

1. Request a new verification email from sign-in page
2. Sign up again with a fresh account

## Email Service Configuration

Your Resend configuration:

- **API Key:** `re_3viFNkEk...` ✅
- **From Email:** `onboarding@resend.dev` ✅
- **Status:** Working correctly ✅

## Next Steps

1. ✅ Email sending is working
2. ✅ Verification API is working
3. ✅ Database operations are working
4. Test the full signup flow through web interface
5. If issues persist, check browser console for JavaScript errors
6. Check server terminal for error messages during signup

## Support

If you continue to experience issues:

1. Check browser console (F12) for JavaScript errors
2. Check server terminal for error messages
3. Verify you're using the latest verification link from the email
4. Make sure dev server is running: `npm run dev`
5. Clear database and start fresh: `npm run clear-db`
