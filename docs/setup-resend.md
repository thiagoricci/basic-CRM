# Setting Up Resend Email Service

This guide will help you set up Resend to send emails for email verification, password resets, 2FA codes, and security alerts.

## Prerequisites

- A Resend account (free tier available)
- A domain name (or use Resend's default domain for testing)

## Step 1: Create a Resend Account

1. Go to [https://resend.com/](https://resend.com/)
2. Click "Sign Up"
3. Create your account
4. Verify your email address

## Step 2: Get Your API Key

1. After signing in, navigate to [https://resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give your API key a name (e.g., "CRM Development")
4. Copy the API key (it starts with `re_`)
5. **Important**: Store this key securely - you won't be able to see it again!

## Step 3: Set Up Your Sending Domain

### Option A: Use Resend's Default Domain (For Testing Only)

Resend provides a default domain (`@resend.dev`) for testing purposes.

**Pros:**

- No setup required
- Works immediately

**Cons:**

- Emails may go to spam
- Not suitable for production
- Limited daily sending (100 emails/day)

### Option B: Use Your Own Domain (Recommended for Production)

1. Navigate to [https://resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Click "Add Domain"

#### Configure DNS Records

Resend will show you DNS records to add to your domain:

**For a subdomain (e.g., `noreply.yourdomain.com`):**

```
Type: CNAME
Name: noreply
Value: resend.dev
TTL: 3600
```

**For the main domain:**

You'll need to add:

1. TXT record for domain verification
2. MX records for email delivery

Follow the instructions in the Resend dashboard for your specific domain.

#### Verify Your Domain

1. After adding DNS records, wait 5-10 minutes for propagation
2. Click "Verify" in Resend dashboard
3. Once verified, your domain status will show "Active"

#### Create a Sender Email Address

1. Navigate to [https://resend.com/domains](https://resend.com/domains)
2. Click on your domain
3. Click "Add Sender"
4. Enter your sender email (e.g., `noreply@yourdomain.com`)
5. Click "Add Sender"

**Note**: The sender email must match your verified domain.

## Step 4: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Email service (Resend)
RESEND_API_KEY="re_your-actual-api-key-here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

**Important:**

- Never commit `.env.local` to version control
- Use `.env.example` for template variables only
- Keep your API keys secure

## Step 5: Test Email Sending

Run the email test script to verify your configuration:

```bash
npm run test-email
```

This will send a test email to verify that:

- API key is valid
- Domain is verified
- Emails can be sent successfully

## Step 6: Verify Email Templates Work

The CRM includes several email templates:

1. **Email Verification** - Sent when users sign up
2. **Password Reset** - Sent when users request password reset
3. **2FA Code** - Sent when users enable 2FA or sign in with 2FA
4. **Account Activated** - Sent when admin activates a user
5. **Account Deactivated** - Sent when admin deactivates a user
6. **Security Alert** - Sent when suspicious activity is detected

All templates use:

- Responsive HTML design
- Gradient headers
- Clear call-to-action buttons
- Professional branding

## Troubleshooting

### Issue: "Invalid API Key"

**Solution:**

- Verify your API key is correct
- Check for extra spaces or quotes
- Ensure you're using the `.env.local` file (not `.env.example`)

### Issue: "Domain not verified"

**Solution:**

- Check DNS records are correctly configured
- Wait 10-15 minutes for DNS propagation
- Verify domain in Resend dashboard
- Check that sender email matches verified domain

### Issue: Emails going to spam

**Solution:**

- Use your own domain (not `@resend.dev`)
- Set up SPF, DKIM, and DMARC records
- Check email content for spam triggers
- Build sender reputation gradually

### Issue: Rate limit errors

**Solution:**

- Resend free tier: 100 emails/day
- Resend paid plans: Higher limits available
- Check your usage at [https://resend.com/dashboard](https://resend.com/dashboard)

### Issue: "Failed to send email" in logs

**Solution:**

- Check application logs for detailed error messages
- Verify Resend API is accessible
- Check network connectivity
- Verify environment variables are loaded correctly

## Production Considerations

### Security

- **Never** commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys periodically
- Monitor API key usage in Resend dashboard

### Deliverability

- Use your own domain (not `@resend.dev`)
- Set up proper DNS records (SPF, DKIM, DMARC)
- Monitor email deliverability metrics
- Handle bounces and complaints

### Monitoring

- Monitor email sending rates
- Track delivery status
- Monitor bounce and complaint rates
- Set up alerts for failed sends

### Scaling

- Resend free tier: 100 emails/day
- Resend paid plans: Higher limits available
- Consider email queue for high-volume sending
- Implement retry logic for failed sends

## Cost

**Resend Pricing (as of 2026):**

- **Free Tier**: 100 emails/day, 3,000 emails/month
- **Starter**: $20/month for 50,000 emails/month
- **Growth**: $80/month for 300,000 emails/month
- **Scale**: $250/month for 1,000,000 emails/month

For most small CRM deployments, the free tier is sufficient.

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email Deliverability Guide](https://resend.com/docs/deliverability)
- [DNS Configuration Guide](https://resend.com/docs/domains)

## Next Steps

After setting up Resend:

1. Test email verification flow
2. Test password reset flow
3. Test 2FA email codes
4. Test security alert emails
5. Monitor email delivery in Resend dashboard
6. Update documentation with your domain information

## Support

If you encounter issues:

1. Check Resend dashboard for error details
2. Review application logs
3. Verify DNS records
4. Check API key permissions
5. Contact Resend support: [support@resend.com](mailto:support@resend.com)
