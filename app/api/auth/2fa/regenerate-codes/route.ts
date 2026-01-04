import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBackupCodes } from '@/lib/totp';
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

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { data: null, error: 'Two-factor authentication is not enabled' },
        { status: 400 }
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

    // Delete all existing backup codes
    await prisma.twoFactorBackupCode.deleteMany({
      where: { userId: user.id },
    });

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes();

    // Store new backup codes in database
    await prisma.twoFactorBackupCode.createMany({
      data: newBackupCodes.map((code) => ({
        userId: user.id,
        code,
        used: false,
      })),
    });

    return NextResponse.json(
      {
        data: { backupCodes: newBackupCodes },
        error: null,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('[2FA] Error regenerating backup codes:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to regenerate backup codes' },
      { status: 500 }
    );
  }
}
