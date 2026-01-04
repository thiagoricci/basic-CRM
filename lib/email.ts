import { Resend } from 'resend';
import crypto from 'crypto';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY || '');

// Email templates
export const emailTemplates = {
  verification: (name: string, verifyUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thanks for signing up for CRM Contact Manager! Please verify your email address to get started.</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verify Email</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 12px;">${verifyUrl}</p>
          <div class="warning">
            <p style="margin: 0;"><strong>This link will expire in 24 hours.</strong></p>
          </div>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2026 CRM Contact Manager. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (name: string, resetUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .danger { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 12px;">${resetUrl}</p>
          <div class="warning">
            <p style="margin: 0;"><strong>This link will expire in 1 hour.</strong></p>
          </div>
          <div class="danger">
            <p style="margin: 0;"><strong>If you didn't request this password reset, please ignore this email and your password won't be changed.</strong></p>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 CRM Contact Manager. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  twoFactorCode: (name: string, code: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Verification Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .code { background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .danger { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Verification Code</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Use the following verification code to complete your sign-in:</p>
          <div class="code">${code}</div>
          <div class="warning">
            <p style="margin: 0;"><strong>This code will expire in 5 minutes.</strong></p>
          </div>
          <div class="danger">
            <p style="margin: 0;"><strong>If you didn't request this code, please ignore this email and secure your account immediately.</strong></p>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 CRM Contact Manager. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  accountActivated: (name: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Activated</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Activated</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your account has been successfully activated. You can now sign in to CRM Contact Manager.</p>
          <div class="success">
            <p style="margin: 0;"><strong>Your account is now active and ready to use!</strong></p>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 CRM Contact Manager. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  accountDeactivated: (name: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Deactivated</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Deactivated</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your account has been deactivated. You will no longer be able to sign in to CRM Contact Manager.</p>
          <div class="warning">
            <p style="margin: 0;"><strong>If you believe this is an error, please contact your administrator.</strong></p>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 CRM Contact Manager. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  securityAlert: (name: string, alertType: string, details: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Alert</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .danger { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info { background: #d1ecf1; border-left: 4px solid #0dcaf0; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Security Alert</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We detected unusual activity on your account:</p>
          <div class="danger">
            <p style="margin: 0;"><strong>${alertType}</strong></p>
          </div>
          <div class="info">
            <p style="margin: 0;"><strong>Details:</strong><br>${details}</p>
          </div>
          <p>If this was you, you can safely ignore this email.</p>
          <p><strong>If this wasn't you, please secure your account immediately:</strong></p>
          <ul>
            <li>Change your password</li>
            <li>Enable two-factor authentication</li>
            <li>Review your sign-in history</li>
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

// Generate verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate 6-digit 2FA code
export function generateTwoFactorCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@crm.com',
      to: email,
      subject: 'Verify Your Email Address',
      html: emailTemplates.verification(name, verifyUrl),
    });

    if (error) {
      console.error('[Email] Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }

    console.log('[Email] Verification email sent to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Error sending verification email:', error);
    throw error;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@crm.com',
      to: email,
      subject: 'Reset Your Password',
      html: emailTemplates.passwordReset(name, resetUrl),
    });

    if (error) {
      console.error('[Email] Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    console.log('[Email] Password reset email sent to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Error sending password reset email:', error);
    throw error;
  }
}

// Send 2FA code email
export async function sendTwoFactorCodeEmail(email: string, name: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@crm.com',
      to: email,
      subject: 'Your Verification Code',
      html: emailTemplates.twoFactorCode(name, code),
    });

    if (error) {
      console.error('[Email] Failed to send 2FA code email:', error);
      throw new Error('Failed to send 2FA code email');
    }

    console.log('[Email] 2FA code email sent to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Error sending 2FA code email:', error);
    throw error;
  }
}

// Send account activation email
export async function sendAccountActivatedEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@crm.com',
      to: email,
      subject: 'Your Account Has Been Activated',
      html: emailTemplates.accountActivated(name),
    });

    if (error) {
      console.error('[Email] Failed to send activation email:', error);
      throw new Error('Failed to send activation email');
    }

    console.log('[Email] Activation email sent to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Error sending activation email:', error);
    throw error;
  }
}

// Send account deactivation email
export async function sendAccountDeactivatedEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@crm.com',
      to: email,
      subject: 'Your Account Has Been Deactivated',
      html: emailTemplates.accountDeactivated(name),
    });

    if (error) {
      console.error('[Email] Failed to send deactivation email:', error);
      throw new Error('Failed to send deactivation email');
    }

    console.log('[Email] Deactivation email sent to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Error sending deactivation email:', error);
    throw error;
  }
}

// Send security alert email
export async function sendSecurityAlertEmail(email: string, name: string, alertType: string, details: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@crm.com',
      to: email,
      subject: '⚠️ Security Alert for Your Account',
      html: emailTemplates.securityAlert(name, alertType, details),
    });

    if (error) {
      console.error('[Email] Failed to send security alert email:', error);
      throw new Error('Failed to send security alert email');
    }

    console.log('[Email] Security alert email sent to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Error sending security alert email:', error);
    throw error;
  }
}
