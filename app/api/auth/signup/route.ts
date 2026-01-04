import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit, getRateLimitHeaders, getRateLimitErrorResponse } from '@/lib/rate-limit';
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email';
import { getClientIP } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const ipAddress = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      // @ts-ignore
      require('@/lib/rate-limit').rateLimiters.signup,
      ipAddress
    );

    if (!rateLimitResult.success) {
      return new NextResponse(getRateLimitErrorResponse(rateLimitResult), {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      });
    }

    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { data: null, error: 'Name, email, and password are required' },
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

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { data: null, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length > 100) {
      return NextResponse.json(
        { data: null, error: 'Name must be less than 100 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { data: null, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with emailVerified: null (requires email verification)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'rep',
        isActive: true,
        emailVerified: null, // NEW: Email not verified yet
      },
    });
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    
    // Store verification token in database
    try {
      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: verificationToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
      console.log('[Signup] Verification token created successfully for:', user.email);
    } catch (tokenError) {
      console.error('[Signup] Failed to create verification token:', tokenError);
      // Continue - user is created, they can request resend
    }
    
    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      console.log('[Signup] Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('[Signup] Failed to send verification email:', emailError);
      // Continue - user is created, they can request resend
    }
    
    // Return success message (don't return user - they need to verify email first)
    return NextResponse.json(
      {
        data: {
          message: 'Account created successfully. Please check your email to verify your account.',
          email: user.email,
        },
        error: null
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
