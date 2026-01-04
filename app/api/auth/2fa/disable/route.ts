import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // Disable 2FA for user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Delete all backup codes
    await prisma.twoFactorBackupCode.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json(
      {
        data: { success: true },
        error: null,
      }
    );
  } catch (error) {
    console.error('[2FA] Error disabling 2FA:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to disable two-factor authentication' },
      { status: 500 }
    );
  }
}
