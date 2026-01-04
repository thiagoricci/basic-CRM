import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getRateLimitHeaders, getRateLimitErrorResponse } from '@/lib/rate-limit';
import { sendPasswordResetEmail, generateVerificationToken } from '@/lib/email';
import { getClientIP } from '@/lib/security';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const ipAddress = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      // @ts-ignore
      require('@/lib/rate-limit').rateLimiters.forgotPassword,
      ipAddress
    );

    if (!rateLimitResult.success) {
      return new NextResponse(getRateLimitErrorResponse(rateLimitResult), {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      });
    }

    const body = await request.json();
    const { email } = body;
    
    // Validate email
    if (!email) {
      return NextResponse.json(
        { data: null, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { data: null, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await (prisma as any).user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    // Don't reveal if user exists or not (security)
    if (!user) {
      return NextResponse.json(
        { data: null, error: null },
        { status: 200 }
      );
    }
    
    // Generate reset token
    const token = generateVerificationToken();
    
    // Store token
    await (prisma as any).verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (emailError) {
      console.error('[ForgotPassword] Failed to send password reset email:', emailError);
      // Continue - token is stored, user can request resend
    }
    
    return NextResponse.json(
      { data: { message: 'If an account exists, you will receive a password reset email' }, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to send password reset email' },
      { status: 500 }
    );
  }
}
