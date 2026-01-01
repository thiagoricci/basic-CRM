import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activitySchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};

    if (contactId) {
      where.contactId = contactId;
    }

    if (type) {
      where.type = type;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        // Include the entire end date by setting to end of day
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          contact: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Fetch activities with pagination
    const activities = await prisma.activity.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.activity.count({ where });
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: activities,
      error: null,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = activitySchema.parse(body);

    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: validatedData.contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { data: null, error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        type: validatedData.type,
        subject: validatedData.subject,
        description: validatedData.description || null,
        contactId: validatedData.contactId,
      },
    });

    // Revalidate cache for activities and contact profile pages
    revalidatePath('/activities');
    revalidatePath(`/contacts/${validatedData.contactId}`);

    return NextResponse.json({ data: activity, error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating activity:', error);
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { data: null, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
