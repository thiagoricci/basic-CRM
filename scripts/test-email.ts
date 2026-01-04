import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Check if required environment variables are set
const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

if (!apiKey) {
  console.error('❌ Error: RESEND_API_KEY is not set in .env.local');
  console.error('Please add: RESEND_API_KEY="re_your-api-key-here"');
  process.exit(1);
}

if (!fromEmail) {
  console.error('❌ Error: RESEND_FROM_EMAIL is not set in .env.local');
  console.error('Please add: RESEND_FROM_EMAIL="noreply@yourdomain.com"');
  process.exit(1);
}

// Initialize Resend client
const resend = new Resend(apiKey);

// Test email content
const testEmail = {
  from: fromEmail,
  to: fromEmail, // Send to the same email for testing
  subject: '✅ CRM Email Service Test - Success!',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Test Successful</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info { background: #d1ecf1; border-left: 4px solid #0dcaf0; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Email Service Test Successful!</h1>
        </div>
        <div class="content">
          <p>Great news! Your Resend email service is configured correctly.</p>
          
          <div class="success">
            <p style="margin: 0;"><strong>✅ Configuration Valid</strong></p>
            <ul style="margin: 10px 0 0 20px;">
              <li>API Key: Valid</li>
              <li>From Email: ${fromEmail}</li>
              <li>Email Sending: Working</li>
            </ul>
          </div>

          <div class="info">
            <p style="margin: 0;"><strong>What's Next?</strong></p>
            <p style="margin: 10px 0 0 0;">Your CRM can now send:</p>
            <ul style="margin: 10px 0 0 20px;">
              <li>Email verification messages</li>
              <li>Password reset links</li>
              <li>Two-factor authentication codes</li>
              <li>Security alerts</li>
              <li>Account activation/deactivation notifications</li>
            </ul>
          </div>

          <p><strong>Test the email verification flow:</strong></p>
          <ol style="margin: 10px 0 0 20px;">
            <li>Start the development server: <code>npm run dev</code></li>
            <li>Go to: <a href="http://localhost:3000/auth/signup">http://localhost:3000/auth/signup</a></li>
            <li>Create a new account</li>
            <li>Check your email for the verification link</li>
            <li>Click the link to verify your email</li>
            <li>Sign in with your verified account</li>
          </ol>

          <p style="margin-top: 20px;"><strong>Configuration Details:</strong></p>
          <ul style="margin: 10px 0 0 20px;">
            <li>API Key: ${apiKey.substring(0, 10)}...</li>
            <li>From Email: ${fromEmail}</li>
            <li>Test Date: ${new Date().toISOString()}</li>
          </ul>
        </div>
        <div class="footer">
          <p>© 2026 CRM Contact Manager. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

async function sendTestEmail() {
  console.log('📧 Testing email service configuration...\n');
  console.log('Configuration:');
  console.log(`  API Key: ${apiKey?.substring(0, 10) || 'Not set'}...`);
  console.log(`  From Email: ${fromEmail}\n`);

  try {
    console.log('🚀 Sending test email...');
    const { data, error } = await resend.emails.send(testEmail);

    if (error) {
      console.error('\n❌ Email sending failed!\n');
      console.error('Error Details:');
      console.error(`  Type: ${error.name || 'Unknown'}`);
      console.error(`  Message: ${error.message || 'No message'}`);
      console.error(`  Status: ${error.statusCode || 'Unknown'}`);

      console.error('\n🔧 Troubleshooting Steps:');
      console.error('1. Verify your API key is correct');
      console.error('2. Check that your domain is verified in Resend dashboard');
      console.error('3. Ensure RESEND_FROM_EMAIL matches your verified domain');
      console.error('4. Check Resend dashboard: https://resend.com/dashboard');
      console.error('5. Review setup guide: docs/setup-resend.md\n');

      process.exit(1);
    }

    console.log('\n✅ Email sent successfully!\n');
    console.log('Email Details:');
    console.log(`  ID: ${data?.id}`);
    console.log(`  From Email: ${fromEmail}`);
    console.log(`  Test Date: ${new Date().toISOString()}\n`);

    console.log('📬 Check your inbox!');
    console.log(`  Email should arrive at: ${fromEmail}`);
    console.log('  Check spam folder if not in inbox\n');

    console.log('✨ Your email service is ready to use!\n');
    console.log('Next steps:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Test email verification flow');
    console.log('  3. Test password reset flow');
    console.log('  4. Test 2FA email codes\n');

  } catch (error) {
    console.error('\n❌ Unexpected error occurred!\n');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the test
sendTestEmail();
