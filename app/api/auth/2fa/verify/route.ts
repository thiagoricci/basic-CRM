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

    // Check rate limit (10 requests per hour per user)
    const rateLimitResult = await checkRateLimit(
      (prisma as any).rateLimiters.verify2FA,
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
    const { code } = body;

    // Validate input
    if (!code) {
      return NextResponse.json(
        { data: null, error: 'Code is required' },
        { status: 400 }
      );
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { data: null, error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      );
    }

    // Try TOTP verification first
    const isValidTOTP = verifyTOTPCode(user.twoFactorSecret, code);

    if (isValidTOTP) {
      return NextResponse.json(
        {
          data: { success: true, method: 'totp' },
          error: null,
        },
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Try backup code verification
    const backupCode = await prisma.twoFactorBackupCode.findFirst({
      where: {
        userId: user.id,
        code: code.toUpperCase(),
        used: false,
      },
    });

    if (backupCode) {
      // Mark backup code as used
      await prisma.twoFactorBackupCode.update({
        where: { id: backupCode.id },
        data: { used: true },
      });

      return NextResponse.json(
        {
          data: { success: true, method: 'backup' },
          error: null,
        },
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    return NextResponse.json(
      { data: null, error: 'Invalid verification code' },
      {
        status: 400,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('[2FA] Error verifying 2FA:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to verify two-factor authentication code' },
      { status: 500 }
    );
  }
}
