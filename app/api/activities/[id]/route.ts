import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { activitySchema } from '@/lib/validations';
import { requirePermission, canAccessRecord } from '@/lib/authorization';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check read permission
    const permissionCheck = await requirePermission('activity', 'read');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    // Fetch activity with related contact information
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { data: null, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('read', activity.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: activity, error: null });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check update permission
    const permissionCheck = await requirePermission('activity', 'update');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input (partial validation - only validate provided fields)
    const validatedData = activitySchema.partial().parse(body);
    
    // Check if activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id: params.id },
    });
    
    if (!existingActivity) {
      return NextResponse.json(
        { data: null, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('update', existingActivity.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }
    
    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: existingActivity.contactId },
    });
    
    if (!contact) {
      return NextResponse.json(
        { data: null, error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    // Validate user assignment matches contact's user
    if (contact.userId && validatedData.userId && contact.userId !== validatedData.userId) {
      return NextResponse.json(
        { data: null, error: 'Assigned user must match the contact\'s assigned user' },
        { status: 400 }
      );
    }
    
    // Update activity (preserve userId if not provided)
    const activity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        subject: validatedData.subject,
        description: validatedData.description,
        userId: validatedData.userId || existingActivity.userId,
      },
    });

    // Revalidate cache for activities and contact profile pages
    revalidatePath('/activities');
    revalidatePath(`/contacts/${existingActivity.contactId}`);

    return NextResponse.json({ data: activity, error: null });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating activity:', error);
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { data: null, error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check delete permission
    const permissionCheck = await requirePermission('activity', 'delete');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    // Check if activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id: params.id },
    });
    
    if (!existingActivity) {
      return NextResponse.json(
        { data: null, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('delete', existingActivity.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }
    
    // Delete activity
    await prisma.activity.delete({
      where: { id: params.id },
    });

    // Revalidate cache for activities and contact profile pages
    revalidatePath('/activities');
    revalidatePath(`/contacts/${existingActivity.contactId}`);

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
