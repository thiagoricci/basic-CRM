import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { activitySchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Update activity
    const activity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        subject: validatedData.subject,
        description: validatedData.description,
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
