import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTOTPSecret, generateBackupCodes, generateQRCodeURL } from '@/lib/totp';
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

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { data: null, error: 'Two-factor authentication is already enabled' },
        { status: 400 }
      );
    }

    // Generate TOTP secret
    const secret = generateTOTPSecret();

    // Generate 10 backup codes
    const backupCodes = generateBackupCodes();

    // Generate QR code URL
    const qrCodeUrl = generateQRCodeURL(user.email, secret);

    // Store backup codes in database (not enabled yet)
    await (prisma as any).twoFactorBackupCode.createMany({
      data: backupCodes.map((code) => ({
        userId: user.id,
        code,
        used: false,
      })),
    });

    // Store temporary secret in session (will be verified later)
    // For now, we'll return it and verify in the next step

    return NextResponse.json(
      {
        data: {
          secret,
          qrCodeUrl,
          backupCodes,
        },
        error: null,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('[2FA] Error enabling 2FA:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to enable two-factor authentication' },
      { status: 500 }
    );
  }
}
