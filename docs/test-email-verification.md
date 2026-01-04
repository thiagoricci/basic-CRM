# Testing Email Verification Flow

This guide will help you test the email verification feature end-to-end.

## Prerequisites

1. **Resend Account Set Up**
   - Follow the setup guide: [`docs/setup-resend.md`](docs/setup-resend.md)
   - Verify your API key works with: `npm run test-email`

2. **Environment Variables Configured**
   - `RESEND_API_KEY` set in `.env.local`
   - `RESEND_FROM_EMAIL` set in `.env.local`
   - Both variables should be valid

3. **Development Server Running**
   - Run: `npm run dev`
   - Server should be running on `http://localhost:3000`

## Test Case 1: Sign-up with Email Verification

### Steps

1. **Navigate to Sign-up Page**

   ```
   http://localhost:3000/auth/signup
   ```

2. **Fill Out Sign-up Form**
   - Name: Test User
   - Email: `test@yourdomain.com` (use your actual email)
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`

3. **Submit Form**
   - Click "Sign Up" button
   - Wait for success message

4. **Check Your Email**
   - Open your email inbox
   - Look for email from: `noreply@yourdomain.com`
   - Subject: "Verify Your Email Address"
   - **Note**: Check spam folder if not in inbox

5. **Click Verification Link**
   - Click "Verify Email" button in email
   - Or copy/paste the verification link into browser

6. **Verify Success**
   - You should see: "Email verified successfully. You can now sign in."
   - Redirect to sign-in page

7. **Sign In**
   - Enter your email and password
   - Click "Sign In"
   - You should be redirected to dashboard

### Expected Results

✅ User created in database with `emailVerified: null`
✅ Verification email sent successfully
✅ Verification token stored in database
✅ Clicking link updates `emailVerified` to current timestamp
✅ Verification token deleted after use
✅ User can sign in after verification

### Troubleshooting

**Issue: No email received**

- Check spam folder
- Verify `RESEND_FROM_EMAIL` is correct
- Check Resend dashboard for delivery status
- Verify API key is valid

**Issue: "Invalid verification link" error**

- Link may have expired (24 hours)
- Link may have been clicked already
- Copy link carefully (no extra spaces)

**Issue: "Email not verified" when signing in**

- Ensure you clicked the verification link
- Check database for `emailVerified` timestamp
- Try resending verification email

## Test Case 2: Sign-in with Unverified Email

### Steps

1. **Create New Account**
   - Follow steps from Test Case 1
   - **Do NOT click verification link**

2. **Attempt to Sign In**
   - Navigate to: `http://localhost:3000/auth/signin`
   - Enter email and password
   - Click "Sign In"

3. **Verify Error Message**
   - You should see: "Email not verified. Please check your email for verification link."
   - Redirected to verification page or shown banner

### Expected Results

✅ Sign-in rejected with clear error message
✅ User redirected to verification page
✅ Email verification banner displayed

## Test Case 3: Resend Verification Email

### Steps

1. **Navigate to Verification Page**

   ```
   http://localhost:3000/auth/verify-email
   ```

2. **Click "Resend Verification Email" Button**
   - Button should be visible
   - Click to resend email

3. **Check Rate Limiting**
   - Click button multiple times rapidly
   - After 3rd click in 1 minute, should see rate limit error
   - Wait 1 minute, try again

4. **Check Your Email**
   - New verification email should arrive
   - Old verification token should be invalidated

### Expected Results

✅ New verification email sent
✅ Old verification token deleted
✅ Rate limiting works (3 requests/minute)
✅ Success message displayed

## Test Case 4: Expired Verification Link

### Steps

1. **Create Verification Link**
   - Sign up for new account
   - Get verification link from email

2. **Wait 24+ Hours**
   - Let the link expire
   - Or manually expire token in database

3. **Click Expired Link**
   - Navigate to expired verification link

4. **Verify Error Message**
   - Should see: "Verification link has expired"
   - Option to request new link

### Expected Results

✅ Expired link detected
✅ Clear error message displayed
✅ User can request new verification link

## Test Case 5: Invalid Verification Link

### Steps

1. **Use Invalid Token**
   - Navigate to: `http://localhost:3000/auth/verify-email?token=invalid-token-123`

2. **Verify Error Message**
   - Should see: "Invalid verification link"

### Expected Results

✅ Invalid token detected
✅ Clear error message displayed
✅ No security information leaked

## Test Case 6: Email Verification Banner

### Steps

1. **Sign In with Unverified Email**
   - Create account, don't verify
   - Attempt to sign in

2. **Check for Banner**
   - Banner should be visible at top of page
   - Should show: "Please verify your email address"
   - Should have "Resend Verification" button

3. **Click "Resend Verification"**
   - Banner should show success message
   - New email sent

### Expected Results

✅ Banner displayed for unverified users
✅ Banner not displayed for verified users
✅ Resend button works
✅ Success message displayed

## Test Case 7: Admin Email Verification

### Steps

1. **Sign In as Admin**
   - Email: `admin@crm.com`
   - Password: `admin123`

2. **Navigate to Admin Users Page**

   ```
   http://localhost:3000/admin/users
   ```

3. **Find Unverified User**
   - Look for user with `emailVerified: null`
   - Click "Verify Email" button

4. **Verify Success**
   - User's email should be verified
   - Activation email sent to user

### Expected Results

✅ Admin can verify user emails
✅ User receives activation email
✅ User can sign in after admin verification

## API Testing

### Test API Endpoints

**POST /api/auth/signup**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Expected: User created, verification email sent

**GET /api/auth/verify-email?token=xxx**

```bash
curl "http://localhost:3000/api/auth/verify-email?token=your-token-here"
```

Expected: Email verified, returns success message

**POST /api/auth/resend-verification**

```bash
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected: New verification email sent

## Database Verification

### Check User Table

```sql
SELECT id, email, emailVerified, isActive, createdAt
FROM "User"
WHERE email = 'test@example.com';
```

Expected:

- `emailVerified` should be `null` before verification
- `emailVerified` should have timestamp after verification

### Check VerificationToken Table

```sql
SELECT identifier, token, expires
FROM "VerificationToken"
WHERE identifier = 'test@example.com';
```

Expected:

- Token exists before verification
- Token deleted after verification

## Success Criteria

- [ ] Sign-up creates user and sends verification email
- [ ] Verification link works and verifies email
- [ ] Unverified users cannot sign in
- [ ] Resend verification email works
- [ ] Expired links are detected
- [ ] Invalid links are rejected
- [ ] Email verification banner displays correctly
- [ ] Admin can verify user emails
- [ ] Rate limiting works (3 requests/minute)
- [ ] Database records are correct

## Next Steps

After successful testing:

1. Test password reset flow
2. Test 2FA email codes
3. Test security alert emails
4. Test all email templates
5. Update documentation with test results

## Troubleshooting Common Issues

### Issue: "Failed to send email" in logs

**Check:**

- API key is correct
- Domain is verified in Resend
- Network connectivity
- Resend API is accessible

### Issue: Emails going to spam

**Check:**

- Using your own domain (not `@resend.dev`)
- SPF, DKIM, DMARC records configured
- Email content doesn't trigger spam filters
- Sender reputation is good

### Issue: Rate limiting not working

**Check:**

- Upstash Redis is configured
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` set
- Redis connection is working
- Check logs for Redis errors

### Issue: Verification link not working

**Check:**

- Token is valid in database
- Token hasn't expired
- Token hasn't been used already
- URL is correctly formatted

## Logging

Enable detailed logging to troubleshoot issues:

```typescript
// In lib/email.ts
console.log('[Email] Sending email to:', email);
console.log('[Email] API response:', data);
console.log('[Email] Error:', error);
```

Check browser console for client-side errors
Check server logs for API errors
Check Resend dashboard for delivery status

## Support

If you encounter issues:

1. Check Resend dashboard: https://resend.com/dashboard
2. Review application logs
3. Verify environment variables
4. Check database records
5. Review setup guide: docs/setup-resend.md
