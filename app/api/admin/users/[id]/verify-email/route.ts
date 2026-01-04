import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { sendAccountActivatedEmail } from '@/lib/email';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const session = await requireRole('admin');
    const currentUser = session.user;

    // Find user to verify
    const user = await (prisma as any).user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ data: null, error: 'User not found' }, { status: 404 });
    }

    // Verify email
    const updatedUser = await (prisma as any).user.update({
      where: { id: params.id },
      data: { emailVerified: new Date() },
    });

    // Delete any existing verification tokens
    await (prisma as any).verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    // Send activation email
    await sendAccountActivatedEmail(user.email, user.name);

    return NextResponse.json(
      {
        data: {
          message: 'Email verified successfully',
          user: updatedUser,
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[AdminVerifyEmail] Error:', error);
    return NextResponse.json({ data: null, error: 'Failed to verify email' }, { status: 500 });
  }
}
