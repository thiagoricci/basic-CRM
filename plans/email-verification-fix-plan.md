# Email Verification Issue - Root Cause Analysis & Fix Plan

**Status**: ❌ OUTDATED - See [`email-verification-double-call-fix.md`](email-verification-double-call-fix.md) for correct root cause and solution

## Problem Summary

When a user signs up with a new account, they receive an email verification link from Resend. However:

1. **Symptom 1**: After submitting signup form, user is redirected to sign-in page with message "Email verified successfully. Please sign in to continue." (misleading - email hasn't been verified yet)
2. **Symptom 2**: Clicking the verification link in email shows "Invalid or expired verification link"
3. **Symptom 3**: Despite the error, user can sign in successfully with their credentials

## Root Cause Analysis

### Issue 1: Misleading Success Message in Sign-In Form

**Location**: `components/auth/sign-in-form.tsx` lines 30-34

```typescript
useEffect(() => {
  if (checkEmail === 'true') {
    setSuccessMessage('Email verified successfully. Please sign in to continue.');
  }
}, [checkEmail]);
```

**Problem**: The `checkEmail=true` query parameter is set by the signup flow when user is redirected to sign-in page. This message incorrectly suggests email is already verified, but actually the user just needs to check their email.

**Impact**: User confusion - they think email is verified when it's not

### Issue 2: Verification Token Not Found (Primary Issue)

**Location**: `app/api/auth/verify-email/route.ts` lines 34-43

The verification API looks up token by `token` field:

```typescript
const verificationToken = await (prisma as any).verificationToken.findUnique({
  where: { token },
});
```

**Potential Root Causes**:

1. **Token Storage Issue**: Token might not be stored correctly in database during signup
2. **Token Lookup Issue**: Token might be stored but lookup fails
3. **Token Expiration**: Token might expire before user clicks link
4. **URL Encoding Issue**: Token in URL might be corrupted during encoding/decoding
5. **Database Connection Issue**: Prisma client might not be properly initialized

### Issue 3: Sign-in Works Despite Verification Failure

**Location**: `app/api/auth/signin/route.ts` lines 84-102

```typescript
// Check if email is verified
if (!user.emailVerified) {
  return NextResponse.json(
    {
      data: null,
      error: 'Please verify your email address before signing in...',
      requiresEmailVerification: true,
    },
    { status: 403 }
  );
}
```

**Problem**: This check should prevent sign-in if email is not verified, but user reports sign-in works. This suggests either:

- User's email was actually verified (token worked but error message was wrong)
- There's a bypass in the sign-in logic
- The error message on verification page is misleading

## Investigation Steps

### Step 1: Check Verification Token Storage

Run diagnostic script to verify:

- User exists in database
- Verification token exists for user
- Token is not expired
- Token identifier matches user email

### Step 2: Verify Email Sending

Check:

- Resend email is sent successfully
- Verification URL in email is correct
- Token in URL matches token in database

### Step 3: Test Verification Link

Click the verification link and check:

- Token is passed correctly to API
- API can find token in database
- Token is not expired
- User email is updated correctly

### Step 4: Check Sign-in Logic

Verify:

- Sign-in API correctly checks emailVerified field
- User cannot sign in if email is not verified
- Error message is clear and helpful

## Fix Plan

### Fix 1: Update Sign-In Success Message

**File**: `components/auth/sign-in-form.tsx`

Change misleading message from:

```typescript
setSuccessMessage('Email verified successfully. Please sign in to continue.');
```

To:

```typescript
setSuccessMessage(
  'Account created successfully. Please check your email to verify your account before signing in.'
);
```

### Fix 2: Add Better Error Messages in Verification Page

**File**: `app/auth/verify-email/page.tsx`

Add more specific error messages:

- "Token not found" vs "Token expired"
- "User not found" vs "Invalid link"
- Show email address being verified

### Fix 3: Add Diagnostic Logging

**File**: `app/api/auth/verify-email/route.ts`

Add detailed logging to track:

- Token received
- Token lookup result
- User lookup result
- Verification success/failure

### Fix 4: Improve Token Validation

**File**: `app/api/auth/verify-email/route.ts`

Add additional checks:

- Validate token format
- Check if user exists before updating
- Handle edge cases (multiple tokens, etc.)

### Fix 5: Add Resend Verification Button

**File**: `components/auth/sign-in-form.tsx`

Already implemented but ensure it shows when email verification is required.

## Testing Plan

### Test 1: Complete Signup Flow

1. Sign up with new email
2. Verify user is created in database
3. Verify verification token is created
4. Verify email is sent
5. Click verification link
6. Verify email is marked as verified
7. Sign in with credentials

### Test 2: Verification Link Scenarios

1. Test with valid token
2. Test with expired token
3. Test with invalid token
4. Test with already used token
5. Test with missing token

### Test 3: Sign-in Scenarios

1. Try to sign in with unverified email (should fail)
2. Try to sign in with verified email (should succeed)
3. Try to sign in with wrong password (should fail)
4. Try to sign in with non-existent email (should fail)

## Questions for User

1. **Can you check the verification email you received?**
   - What is the full verification URL?
   - Does the token in the URL look correct (64-character hex string)?

2. **Can you run the diagnostic script?**
   - `npx ts-node scripts/diagnose-verification-issue.ts thiagoricci@gmail.com`
   - This will show us the verification tokens in the database

3. **What happens when you click the verification link?**
   - Does the page show "Invalid or expired verification link"?
   - Or does it show "Email verified successfully"?

4. **Can you check the database directly?**
   - Is the user's `emailVerified` field null or set to a date?
   - Are there any verification tokens for this user?

## Next Steps

1. **Create diagnostic script** to check verification tokens in database
2. **Fix misleading success message** in sign-in form
3. **Add better error messages** in verification page
4. **Add diagnostic logging** to verification API
5. **Test complete flow** end-to-end
6. **Document root cause** and resolution

## Priority

**High Priority**:

- Fix misleading success message (user confusion)
- Add diagnostic logging (troubleshooting)
- Create diagnostic script (root cause investigation)

**Medium Priority**:

- Improve error messages (UX)
- Add token validation (robustness)

**Low Priority**:

- Add more detailed error pages (nice to have)
