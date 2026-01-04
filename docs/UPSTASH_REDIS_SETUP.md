# Upstash Redis Setup Guide

This guide will help you set up Upstash Redis for rate limiting in your CRM application.

## Why Upstash Redis?

Upstash Redis provides:

- **Distributed rate limiting** across multiple server instances
- **Persistent storage** that survives server restarts
- **Low latency** with edge caching
- **Free tier** for development and small projects
- **Easy integration** with Next.js and other frameworks

## Step-by-Step Setup

### 1. Create an Upstash Account

1. Go to [https://console.upstash.com/](https://console.upstash.com/)
2. Click "Sign Up" or "Log In" with your GitHub, Google, or email account
3. Complete the registration process

### 2. Create a Redis Database

1. After logging in, click **"Create Database"** button
2. Choose a region closest to your users (recommended: `us-east-1` for US, `eu-west-1` for Europe)
3. Select the **Free** tier (10,000 commands/day, 256MB storage)
4. Click **"Create"**
5. Wait for the database to be provisioned (usually takes a few seconds)

### 3. Get Your Redis Credentials

Once your database is created, you'll see a dashboard with connection details:

1. Look for the **"REST API"** section (not the "Direct Connection" section)
2. Copy the **UPSTASH_REDIS_REST_URL**:
   - It looks like: `https://your-db-name.upstash.io`
3. Copy the **UPSTASH_REDIS_REST_TOKEN**:
   - It looks like: `AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - This is a long alphanumeric string starting with `A`

### 4. Add Credentials to Your Environment

Add the following to your `.env.local` file:

```env
# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-db-name.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

**Important:**

- Never commit `.env.local` to version control
- Use different databases for development and production
- Keep your tokens secure and rotate them periodically

### 5. Verify Configuration

Restart your development server:

```bash
npm run dev
```

You should see these logs in your terminal:

```
[RateLimit] Redis client initialized successfully
```

If Redis is not configured, you'll see:

```
[RateLimit] Redis not configured. Rate limiting will be disabled.
[RateLimit] To enable rate limiting, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local
```

## Testing Rate Limiting

Once configured, test rate limiting by:

1. **Sign-in rate limiting** (10 requests per hour):

   ```bash
   # Try signing in 11 times with wrong credentials
   # The 11th request should return 429 status
   ```

2. **Sign-up rate limiting** (3 requests per hour):

   ```bash
   # Try signing up 4 times
   # The 4th request should return 429 status
   ```

3. **Forgot password rate limiting** (3 requests per hour):
   ```bash
   # Try requesting password reset 4 times
   # The 4th request should return 429 status
   ```

## Rate Limiting Configuration

Current rate limits configured in `lib/rate-limit.ts`:

| Endpoint            | Limit       | Window   | Purpose                       |
| ------------------- | ----------- | -------- | ----------------------------- |
| Sign-in             | 10 requests | 1 hour   | Prevent brute force attacks   |
| Sign-up             | 3 requests  | 1 hour   | Prevent spam account creation |
| Forgot Password     | 3 requests  | 1 hour   | Prevent email flooding        |
| Reset Password      | 5 requests  | 1 hour   | Prevent token abuse           |
| Verify Email        | 10 requests | 1 hour   | Prevent token abuse           |
| Resend Verification | 3 requests  | 1 minute | Prevent email flooding        |
| Enable 2FA          | 3 requests  | 1 hour   | Prevent abuse                 |
| Verify 2FA          | 10 requests | 1 hour   | Prevent brute force           |

## Troubleshooting

### Issue: "Redis client was initialized without url or token"

**Solution:** Make sure both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in `.env.local` and are not empty strings.

### Issue: "Failed to parse URL from /pipeline"

**Solution:** This error occurs when Redis is not properly configured. The application will fall back to allowing all requests (fail open). To fix, verify your Upstash credentials are correct.

### Issue: Rate limiting not working

**Solution:** Check the console logs for initialization messages. If you see "Redis not configured", verify your environment variables are set correctly.

### Issue: Connection refused / timeout

**Solution:**

- Verify your Upstash database is active (not paused)
- Check if you're using the correct region
- Ensure your network allows outbound connections to Upstash

## Production Best Practices

1. **Use separate databases** for development, staging, and production
2. **Enable encryption** for production databases
3. **Monitor usage** in the Upstash dashboard
4. **Set up alerts** for approaching rate limits
5. **Rotate tokens** periodically for security
6. **Upgrade tiers** as your application grows

## Monitoring

Monitor your Redis usage in the Upstash dashboard:

- **Commands**: Track total commands executed
- **Memory**: Monitor storage usage
- **Connections**: View active connections
- **Latency**: Check response times

## Cost

Upstash Redis pricing (as of 2026):

| Tier       | Commands/day | Storage | Price         |
| ---------- | ------------ | ------- | ------------- |
| Free       | 10,000       | 256MB   | $0            |
| Pro        | 1M           | 5GB     | $5/month      |
| Scale      | 10M          | 50GB    | $50/month     |
| Enterprise | Custom       | Custom  | Contact sales |

For most small to medium applications, the **Free tier** is sufficient.

## Alternative: In-Memory Rate Limiting

If you don't want to use Upstash Redis, the application includes a fallback mechanism:

- When Redis is not configured, rate limiting is disabled
- All requests are allowed (fail open)
- This is suitable for development environments only

**Note:** In-memory rate limiting is NOT recommended for production because:

- It doesn't work across multiple server instances
- It resets on server restart
- It doesn't provide distributed rate limiting

## Additional Resources

- [Upstash Documentation](https://upstash.com/docs)
- [Upstash Redis Client](https://github.com/upstash/upstash-redis)
- [Rate Limiting Best Practices](https://upstash.com/docs/ratelimit/overview)

## Support

If you encounter issues:

1. Check the Upstash dashboard for database status
2. Review the console logs for error messages
3. Verify your environment variables are set correctly
4. Contact Upstash support at [support@upstash.com](mailto:support@upstash.com)
