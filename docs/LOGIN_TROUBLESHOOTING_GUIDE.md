# Login Troubleshooting Guide

## Issue: Cannot login with correct credentials

### Diagnostic Results ✅

Database checks show the admin user is correctly configured:

- **Email**: admin@crm.com
- **Password**: admin123 (verified with bcrypt)
- **Status**: Active ✅
- **Email Verified**: Yes ✅
- **2FA**: Disabled ✅

All authentication requirements are met in the database.

---

## Troubleshooting Steps

### Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try to sign in with admin@crm.com / admin123
4. Look for any error messages in red

**Common errors to look for:**

- `TypeError: fetch failed` - Network issue
- `ReferenceError: signIn is not defined` - NextAuth not imported
- `SyntaxError: Unexpected token` - JavaScript error

### Step 2: Check Network Tab

1. Open Developer Tools (F12)
2. Go to the **Network** tab
3. Try to sign in
4. Look for the `/api/auth/signin` request
5. Click on it and check:
   - **Status Code**: Should be 200 (not 401 or 500)
   - **Response**: Should contain `"success": true`

**What to expect:**

```json
{
  "data": {
    "success": true,
    "twoFactorEnabled": false,
    "userId": "cmjw3xfm4000043gs0085t2o7"
  },
  "error": null
}
```

**If you see 401 Unauthorized:**

- Check that password is exactly `admin123` (no extra spaces)
- Check that email is exactly `admin@crm.com` (no extra spaces)

**If you see 429 Too Many Requests:**

- Wait 1 hour before trying again (rate limiting: 10 requests/hour per IP)
- Or reset rate limiter by clearing Redis cache

### Step 3: Clear Browser Data

Sometimes cached data causes issues:

**Chrome/Edge:**

1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Cookies and other site data"
3. Click "Clear data"

**Firefox:**

1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Cookies"
3. Click "Clear Now"

**Safari:**

1. Safari > Preferences > Privacy
2. Click "Manage Website Data"
3. Remove localhost

### Step 4: Check Environment Variables

Verify your `.env.local` file has correct values:

```env
DATABASE_URL="postgresql://thiagoricci@localhost:5432/crm_db"
NEXTAUTH_SECRET="change-this-to-a-secure-random-string-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Important:**

- `NEXTAUTH_SECRET` must be set (even in development)
- `NEXTAUTH_URL` must match your dev server URL (usually `http://localhost:3000`)

### Step 5: Restart Development Server

Sometimes a fresh restart helps:

```bash
# Stop the dev server (Ctrl+C)
# Then start it again
npm run dev
```

### Step 6: Check NextAuth Session

After the `/api/auth/signin` API returns success, the form calls NextAuth's `signIn()` function. Check if this is working:

1. In browser Console, you should see: `[SignIn] Attempting sign in with: admin@crm.com`
2. Then check Network tab for `/api/auth/signin/credentials` request
3. This should also return 200 with session data

**If this fails:**

- Check that NextAuth is properly configured in `lib/auth.config.ts`
- Check that `NEXTAUTH_SECRET` is set in `.env.local`

### Step 7: Check Rate Limiting

The system has rate limiting (10 requests per hour per IP). If you've tried logging in multiple times:

**Option 1: Wait**

- Wait 1 hour before trying again

**Option 2: Check Redis Connection**

```bash
# Test if Redis is working
npm run check-user
```

**Option 3: Disable Rate Limiting (Development Only)**
Temporarily comment out rate limiting in `app/api/auth/signin/route.ts`:

```typescript
// Comment out lines 21-36
// const rateLimitResult = await checkRateLimit(...)
```

### Step 8: Test API Directly

Test the sign-in API with curl:

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"admin123"}'
```

**Expected response:**

```json
{
  "data": {
    "success": true,
    "twoFactorEnabled": false,
    "userId": "cmjw3xfm4000043gs0085t2o7"
  },
  "error": null
}
```

### Step 9: Check Database Connection

Ensure PostgreSQL is running:

```bash
# Check if PostgreSQL is running
pg_isready

# Or try to connect
psql -U thiagoricci -d crm_db
```

### Step 10: Reset Admin Password

If all else fails, reset the admin password:

```bash
npm run reset-admin-password
```

This will:

- Reset password to `admin123`
- Ensure user is active
- Ensure email is verified

---

## Common Issues and Solutions

### Issue 1: "Invalid email or password" but credentials are correct

**Possible causes:**

1. Extra spaces in email or password
2. Wrong email (case-sensitive)
3. Password was changed

**Solution:**

- Use exactly: `admin@crm.com` and `admin123`
- Or run: `npm run reset-admin-password`

### Issue 2: "Account is inactive"

**Solution:**

```bash
# Run the fix script
npm run fix-login
```

### Issue 3: "Please verify your email address"

**Solution:**

```bash
# Run the fix script
npm run fix-login
```

### Issue 4: Stuck on "Signing in..." loading state

**Possible causes:**

1. Network request is hanging
2. NextAuth session creation is failing
3. CORS issue

**Solution:**

- Check Network tab for failed requests
- Check Console for errors
- Try clearing browser cookies
- Restart dev server

### Issue 5: Redirected back to sign-in page after login

**Possible causes:**

1. Session not being created
2. Cookie not being set
3. NEXTAUTH_SECRET not set

**Solution:**

- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Clear browser cookies
- Restart dev server

---

## Diagnostic Scripts

We've created several diagnostic scripts to help troubleshoot:

### Run All Diagnostics

```bash
# Check user status
npm run check-user

# Test authentication logic
npm run test-auth

# Diagnose login issue
npm run diagnose-login

# Fix common issues
npm run fix-login

# Reset admin password
npm run reset-admin-password
```

### What Each Script Does

**`check-user`**: Lists all users and their status
**`test-auth`**: Tests authentication logic directly against database
**`diagnose-login`**: Comprehensive check of all login requirements
**`fix-login`**: Fixes common issues (inactive, unverified, password)
**`reset-admin-password`**: Resets admin password to `admin123`

---

## Still Having Issues?

If none of the above solutions work:

1. **Check the actual error message**: What exactly does it say?
2. **Check browser Console**: Any JavaScript errors?
3. **Check Network tab**: What's the API response?
4. **Check server logs**: Any errors in the terminal running `npm run dev`?

### Enable Debug Logging

Add more logging to see what's happening:

**In `components/auth/sign-in-form.tsx`:**

```typescript
// Add console.log after line 65
console.log('[SignIn] API Response:', data);
console.log('[SignIn] Response OK:', response.ok);
console.log('[SignIn] Data Success:', data.success);
```

**In `app/api/auth/signin/route.ts`:**

```typescript
// Add console.log at the beginning
console.log('[Auth] Sign-in request received:', { email, hasPassword: !!password });

// Add console.log before return
console.log('[Auth] Returning success:', {
  twoFactorEnabled: user.twoFactorEnabled,
  userId: user.id,
});
```

### Check NextAuth Configuration

Verify `lib/auth.config.ts` is correct:

```typescript
export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    Credentials({
      // ... configuration
    }),
  ],
  callbacks: {
    // ... callbacks
  },
};
```

---

## Quick Fix Checklist

- [ ] Ran `npm run diagnose-login` - all checks pass
- [ ] Cleared browser cookies and cache
- [ ] Verified NEXTAUTH_SECRET is set in `.env.local`
- [ ] Verified NEXTAUTH_URL is `http://localhost:3000`
- [ ] Checked browser Console for errors
- [ ] Checked Network tab for API response
- [ ] Restarted development server
- [ ] Ran `npm run fix-login` to reset user state
- [ ] Ran `npm run reset-admin-password` to reset password
- [ ] Checked PostgreSQL is running
- [ ] Checked Redis is running (for rate limiting)

---

## Next Steps

If you've tried everything and still can't login:

1. **Provide more information**:
   - What error message do you see?
   - What's in the browser Console?
   - What's the API response in Network tab?
   - What's in the server terminal logs?

2. **Try a different browser**:
   - Sometimes browser extensions interfere
   - Try Chrome, Firefox, Safari

3. **Check for conflicting processes**:
   - Make sure only one dev server is running
   - Check port 3000 is not in use by another app

4. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Contact Support

If you're still stuck, please provide:

1. The exact error message
2. Browser Console output
3. Network tab API response
4. Server terminal logs
5. Which troubleshooting steps you've tried

This will help identify the specific issue faster.
