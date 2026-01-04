import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getClientIP, getUserAgent, logSignInAttempt, detectSuspiciousActivity } from '@/lib/security';
import { sendSecurityAlertEmail } from '@/lib/email';
import { checkRateLimit, getRateLimitHeaders, rateLimiters } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[Auth API] Sign-in request received:', {
      email,
      hasPassword: !!password,
      passwordLength: password?.length,
    });

    // Validate input
    if (!email || !password) {
      console.log('[Auth API] Validation failed: Missing email or password');
      return NextResponse.json(
        { data: null, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check rate limit (10 requests per hour per IP)
    const ipAddress = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      rateLimiters.signin,
      ipAddress
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { data: null, error: 'Too many sign-in attempts. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log('[Auth API] User lookup result:', user ? {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    } : 'User not found');

    if (!user) {
      console.log('[Auth API] User not found in database');
      // Log failed attempt
      await logSignInAttempt({
        userId: 'unknown',
        ipAddress,
        userAgent: getUserAgent(request),
        success: false,
        failureReason: 'User not found',
      });

      return NextResponse.json(
        { data: null, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { data: null, error: 'Account is inactive. Please contact your administrator.' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Log failed sign-in attempt
      await logSignInAttempt({
        userId: user.id,
        ipAddress,
        userAgent: getUserAgent(request),
        success: false,
        failureReason: 'Email not verified',
      });

      return NextResponse.json(
        {
          data: null,
          error: 'Please verify your email address before signing in. Check your inbox for verification link.',
          requiresEmailVerification: true,
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('[Auth API] Password verification result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('[Auth API] Password does not match');
      // Log failed attempt
      await logSignInAttempt({
        userId: user.id,
        ipAddress,
        userAgent: getUserAgent(request),
        success: false,
        failureReason: 'Invalid password',
      });

      return NextResponse.json(
        { data: null, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[Auth API] Password verified successfully');

    // Check for suspicious activity
    const suspicious = await detectSuspiciousActivity(user.id, ipAddress);
    
    if (suspicious.isSuspicious) {
      // Send security alert email
      await sendSecurityAlertEmail(
        user.email,
        user.name,
        suspicious.reason || 'Suspicious sign-in activity detected',
        `IP Address: ${ipAddress}\nTime: ${new Date().toISOString()}`
      );
    }

    // Log successful sign-in attempt
    await logSignInAttempt({
      userId: user.id,
      ipAddress,
      userAgent: getUserAgent(request),
      success: true,
    });

    // Return success with 2FA status
    const responseData = {
      data: {
        success: true,
        twoFactorEnabled: user.twoFactorEnabled,
        userId: user.id,
      },
      error: null,
    };

    console.log('[Auth API] Returning success:', responseData);

    return NextResponse.json(
      responseData,
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('[Auth] Error in sign-in:', error);
    return NextResponse.json(
      { data: null, error: 'An error occurred during sign-in' },
      { status: 500 }
    );
  }
}
