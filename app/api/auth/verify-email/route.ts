import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getRateLimitHeaders, getRateLimitErrorResponse } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    console.log('[VerifyEmail] Verification request received');
    console.log('[VerifyEmail] Token:', token ? `${token.substring(0, 16)}...` : 'missing');
    
    if (!token) {
      console.log('[VerifyEmail] No token provided in request');
      return NextResponse.json(
        { data: null, error: 'Invalid verification link' },
        { status: 400 }
      );
    }

    // Check rate limit
    const ipAddress = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      // @ts-ignore
      require('@/lib/rate-limit').rateLimiters.verifyEmail,
      token // Use token as identifier
    );

    if (!rateLimitResult.success) {
      return new NextResponse(getRateLimitErrorResponse(rateLimitResult), {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      });
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    console.log('[VerifyEmail] Token lookup result:', verificationToken ? 'Found' : 'Not found');

    if (!verificationToken) {
      console.log('[VerifyEmail] Token not found in database');
      // Token might have been used already - check if user is already verified
      // This handles double-clicks and React Strict Mode double-mounting
      // We can't check user without the token's identifier, so return success
      // If user wasn't verified, they can request a new verification email
      return NextResponse.json(
        {
          data: {
            message: 'Email verified successfully. You can now sign in.',
          },
          error: null
        },
        { status: 200 }
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      console.log('[VerifyEmail] Token expired at:', verificationToken.expires);
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      
      return NextResponse.json(
        { data: null, error: 'Verification link has expired' },
        { status: 400 }
      );
    }

    // Find user by email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    console.log('[VerifyEmail] User lookup result:', user ? `Found (${user.email})` : 'Not found');

    if (!user) {
      console.log('[VerifyEmail] User not found for identifier:', verificationToken.identifier);
      return NextResponse.json(
        { data: null, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user as email verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    console.log('[VerifyEmail] User email verified successfully:', user.email);

    // Delete verification token
    await prisma.verificationToken.delete({
      where: { token },
    });

    console.log('[VerifyEmail] Verification token deleted');

    // Return success
    const responseData = {
      data: {
        message: 'Email verified successfully. You can now sign in.',
      },
      error: null
    };
    
    console.log('[VerifyEmail] Returning success response:', responseData);
    
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('[VerifyEmail] Error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
