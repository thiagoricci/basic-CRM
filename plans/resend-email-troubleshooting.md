# Resend Email Troubleshooting Plan

## Issue: Not Receiving Email Confirmation from Resend

## Root Cause Analysis

The email sending code in `lib/email.ts` is correctly implemented, but there are configuration issues preventing emails from being sent or delivered.

### Identified Issues:

1. **Sender Email Domain Not Verified**: The `RESEND_FROM_EMAIL` is set to a placeholder domain that isn't verified in Resend
2. **Environment Variables**: May not be properly configured in `.env.local`
3. **Domain Configuration**: Need to either use Resend's default domain or verify a custom domain

## Step-by-Step Resolution

### Step 1: Verify Environment Variables

Check your `.env.local` file (NOT `.env.example`) contains:

```env
RESEND_API_KEY="re_your-actual-api-key-here"
RESEND_FROM_EMAIL="your-verified-email@domain.com"
```

**Important:**

- `.env.local` is never committed to git (it's in `.gitignore`)
- `.env.example` is just a template - it's not used by the application
- Restart your dev server after changing environment variables: `npm run dev`

### Step 2: Choose Email Configuration Option

#### Option A: Use Resend's Default Domain (For Testing Only)

**Pros:**

- Works immediately without domain setup
- Good for development and testing

**Cons:**

- Emails may go to spam
- Not suitable for production
- Limited to 100 emails/day

**Configuration:**

```env
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

**Note:** This is Resend's default sending domain that's already verified.

#### Option B: Verify Your Own Domain (Recommended for Production)

**Steps:**

1. Go to [https://resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown in Resend to your domain's DNS settings
5. Wait 5-10 minutes for DNS propagation
6. Click "Verify" in Resend dashboard
7. Create a sender email address matching your domain

**Configuration:**

```env
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### Step 3: Test Email Sending

Run the test script to verify your configuration:

```bash
npm run test-email
```

This will send a test email and show you:

- Whether the API key is valid
- Whether the domain is verified
- Whether emails can be sent successfully

### Step 4: Check Application Logs

When you try to send an email (e.g., during sign-up), check your terminal for log messages:

**Success logs:**

```
[Email] Verification email sent to: user@example.com
```

**Error logs:**

```
[Email] Failed to send verification email: { error details }
```

### Step 5: Verify Email Delivery in Resend Dashboard

1. Go to [https://resend.com/dashboard](https://resend.com/dashboard)
2. Click on "Emails" tab
3. Check if your email appears in the list
4. Click on the email to see delivery status:
   - **Delivered**: Email was sent successfully
   - **Bounced**: Email address is invalid or mailbox full
   - **Rejected**: Domain not verified or API key issue
   - **Complained**: Recipient marked as spam

### Step 6: Check Spam Folder

If the email was sent but you don't see it in your inbox:

- Check your spam/junk folder
- Add the sender email to your contacts
- Mark the email as "not spam" if found

## Common Issues and Solutions

### Issue: "Invalid API Key"

**Solution:**

- Verify your API key is correct in `.env.local`
- Check for extra spaces or quotes
- Ensure you're using `.env.local` (not `.env.example`)

### Issue: "Domain not verified"

**Solution:**

- Use Resend's default domain: `onboarding@resend.dev`
- Or verify your own domain in Resend dashboard
- Wait 10-15 minutes for DNS propagation

### Issue: "Email not received"

**Solution:**

- Check Resend dashboard for delivery status
- Check spam/junk folder
- Verify the recipient email address is correct
- Check application logs for errors

### Issue: "Rate limit errors"

**Solution:**

- Resend free tier: 100 emails/day
- Check your usage in Resend dashboard
- Upgrade to paid plan if needed

## Quick Fix (Immediate Testing)

If you want to test emails immediately without domain verification:

1. Update `.env.local`:

```env
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

2. Restart dev server: `npm run dev`

3. Run test script: `npm run test-email`

4. Check your email (including spam folder)

## Production Checklist

Before going to production:

- [ ] Verify your own domain in Resend
- [ ] Set up SPF, DKIM, and DMARC records
- [ ] Update `RESEND_FROM_EMAIL` to your verified domain
- [ ] Test all email templates (verification, password reset, 2FA)
- [ ] Monitor email deliverability in Resend dashboard
- [ ] Set up alerts for failed sends
- [ ] Review bounce and complaint rates

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email Deliverability Guide](https://resend.com/docs/deliverability)
- [DNS Configuration Guide](https://resend.com/docs/domains)

## Support

If you continue to have issues:

1. Check Resend dashboard for error details
2. Review application logs
3. Verify DNS records
4. Check API key permissions
5. Contact Resend support: support@resend.com
