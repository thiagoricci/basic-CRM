import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, getCurrentUserId } from '@/lib/authorization';
import { userSchema } from '@/lib/validations';
import bcrypt from 'bcrypt';

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await requirePermission('user', 'read');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastSignInAt: true,
        lastSignInIp: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: users, error: null });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await requirePermission('user', 'create');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = userSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { data: null, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        bio: validatedData.bio,
        isActive: validatedData.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: user, error: null }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { data: null, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { data: null, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
