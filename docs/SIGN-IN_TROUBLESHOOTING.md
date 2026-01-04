# Sign-In Troubleshooting Guide

## Issue: Unable to Sign In

### Problem Symptoms

- "Invalid email or password" error when attempting to sign in
- Browser autofill inserting invalid email addresses (e.g., `user@/path/to/file`)
- Sign-in form not accepting valid credentials

### Root Causes

1. **Browser Autofill Interference**: Browser may autofill with incorrect or stale data
2. **Password Mismatch**: Password in database doesn't match what user is entering
3. **Email Verification Required**: User account exists but email is not verified
4. **Account Inactive**: User account is marked as inactive

### Solutions

#### Solution 1: Reset Admin Password

If you're having trouble with the admin account, reset the password to a known value:

```bash
npx tsx scripts/reset-admin-password.ts
```

This will reset `admin@crm.com` password to `admin123`.

#### Solution 2: Clear Browser Autofill Data

Browser autofill can cause issues by inserting invalid email addresses:

**Chrome:**

1. Go to Settings > Autofill > Passwords
2. Find localhost:3000 entries
3. Remove saved passwords
4. Refresh sign-in page

**Or use Incognito/Private mode** to test without autofill interference.

#### Solution 3: Manual Form Entry

The sign-in form now includes:

- **Form reset on mount**: Clears fields when page loads
- **Email validation**: Validates format before submission

Always manually type email and password to avoid autofill issues.

#### Solution 4: Check User Status

Verify user account status:

```bash
npx tsx scripts/check-user.ts
```

This shows:

- Email verification status
- Account active status
- 2FA enabled status

**Important**: Unverified users cannot sign in. Users must verify their email first.

#### Solution 5: Verify Correct Credentials

Use these default credentials for admin account:

- **Email**: `admin@crm.com`
- **Password**: `admin123` (after running reset script)

### Common Error Messages

#### "Invalid email or password"

**Possible causes:**

- Wrong password
- Email not found in database
- Account inactive
- Email not verified

**Solution:**

1. Check email is correct
2. Reset password if needed
3. Verify account is active and email is verified

#### "Please enter a valid email address"

**Possible causes:**

- Browser autofill inserted invalid email
- Typo in email address

**Solution:**

1. Clear form and manually type email
2. Check email format (should contain @ and .)
3. Disable browser autofill temporarily

#### "Account is inactive. Please contact your administrator."

**Possible causes:**

- User account marked as inactive in database

**Solution:**

- Contact administrator to activate account
- Or update user status via admin panel (if available)

#### "Please verify your email address before signing in."

**Possible causes:**

- User account exists but email is not verified

**Solution:**

1. Check email inbox for verification link
2. Use "Resend Verification" button on sign-in page
3. Or manually verify via admin panel

### Prevention Tips

1. **Use consistent credentials**: Keep track of admin credentials
2. **Regular password resets**: Reset password periodically for security
3. **Monitor user status**: Check user verification status regularly
4. **Test sign-in flow**: Verify sign-in works after changes

### Additional Resources

- [Authentication Documentation](./AUTHENTICATION.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Security Best Practices](./security.md)

### Getting Help

If you continue to have sign-in issues:

1. Check browser console for errors
2. Verify database connection is working
3. Check server logs for error messages
4. Review authentication configuration in `.env.local`

### Quick Reference Commands

```bash
# Check user status
npx tsx scripts/check-user.ts

# Reset admin password
npx tsx scripts/reset-admin-password.ts

# Verify email for a user
npx tsx scripts/verify-email.ts
```
