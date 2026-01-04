import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTOTPCode } from '@/lib/totp';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch full user from database
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { data: null, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check rate limit (3 requests per hour per user)
    const rateLimitResult = await checkRateLimit(
      (prisma as any).rateLimiters.enable2FA,
      user.id
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { data: null, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get request body
    const body = await request.json();
    const { secret, code } = body;

    // Validate input
    if (!secret || !code) {
      return NextResponse.json(
        { data: null, error: 'Secret and code are required' },
        { status: 400 }
      );
    }

    // Verify TOTP code
    const isValid = verifyTOTPCode(secret, code);

    if (!isValid) {
      return NextResponse.json(
        { data: null, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Enable 2FA for user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    });

    return NextResponse.json(
      {
        data: { success: true },
        error: null,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('[2FA] Error verifying 2FA setup:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to verify two-factor authentication setup' },
      { status: 500 }
    );
  }
}
