import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/authorization';
import { userSchema } from '@/lib/validations';
import bcrypt from 'bcrypt';

// GET /api/admin/users/[id] - Get user by ID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await requirePermission('user', 'read');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
    });

    if (!user) {
      return NextResponse.json(
        { data: null, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user, error: null });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await requirePermission('user', 'update');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { data: null, error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate data (password is optional when updating)
    const updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role,
      bio: body.bio,
      isActive: body.isActive,
    };

    // Only validate and update password if provided
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    // Check if email already exists (excluding current user)
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { data: null, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ data: updatedUser, error: null });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { data: null, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { data: null, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await requirePermission('user', 'delete');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { data: null, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the last admin
    const adminCount = await prisma.user.count({
      where: { role: 'admin', isActive: true },
    });

    if (existingUser.role === 'admin' && adminCount === 1) {
      return NextResponse.json(
        { data: null, error: 'Cannot delete the last admin user' },
        { status: 400 }
      );
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
