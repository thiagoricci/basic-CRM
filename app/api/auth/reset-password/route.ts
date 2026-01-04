import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit, getRateLimitHeaders, getRateLimitErrorResponse } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const ipAddress = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      // @ts-ignore
      require('@/lib/rate-limit').rateLimiters.resetPassword,
      ipAddress
    );

    if (!rateLimitResult.success) {
      return new NextResponse(getRateLimitErrorResponse(rateLimitResult), {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      });
    }

    const body = await request.json();
    const { token, password } = body;
    
    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { data: null, error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { data: null, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Find valid token
    const verificationToken = await (prisma as any).verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      return NextResponse.json(
        { data: null, error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }
    
    // Check if token is expired
    if (new Date(verificationToken.expires) < new Date()) {
      // Delete expired token
      await (prisma as any).verificationToken.delete({
        where: { token },
      });
      
      return NextResponse.json(
        { data: null, error: 'Reset link has expired' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await (prisma as any).user.findUnique({
      where: { email: verificationToken.identifier },
    });
    
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user password
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    // Delete used token
    await (prisma as any).verificationToken.delete({
      where: { token },
    });
    
    return NextResponse.json(
      { data: { message: 'Password reset successful' }, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ResetPassword] Error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
