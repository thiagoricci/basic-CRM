import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getRateLimitHeaders, getRateLimitErrorResponse, rateLimiters } from '@/lib/rate-limit';
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email';
import { getClientIP } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json({ data: null, error: 'Email is required' }, { status: 400 });
    }

    // Check rate limit (per email address)
    const rateLimitResult = await checkRateLimit(
      rateLimiters.resendVerification,
      email.toLowerCase()
    );

    if (!rateLimitResult.success) {
      return new NextResponse(getRateLimitErrorResponse(rateLimitResult), {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      });
    }

    // Find user by email
    const user = await (prisma as any).user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        {
          data: {
            message: 'If an account exists with this email, a verification link has been sent.',
          },
          error: null,
        },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ data: null, error: 'Email is already verified' }, { status: 400 });
    }

    // Delete any existing verification tokens
    await (prisma as any).verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    // Store verification token
    await (prisma as any).verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json(
      {
        data: { message: 'Verification email sent successfully' },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ResendVerification] Error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
