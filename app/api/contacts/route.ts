import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validations';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requirePermission, getUserFilter, getCurrentUserId } from '@/lib/authorization';

export async function GET() {
  try {
    // Check read permission
    const permissionCheck = await requirePermission('contact', 'read');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    // Get user filter based on role
    const userFilter = await getUserFilter('read');

    const contacts = await prisma.contact.findMany({
      where: userFilter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: contacts, error: null });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check create permission
    const permissionCheck = await requirePermission('contact', 'create');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Debug: log the received body
    console.log('Received contact data:', JSON.stringify(body, null, 2));
    console.log('userId value:', body.userId, 'Type:', typeof body.userId);
    
    // Validate input
    const validatedData = contactSchema.parse(body);
    
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));
    
    // Check for duplicate email
    const existingEmail = await prisma.contact.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { data: null, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Check for duplicate phone number (if provided)
    if (validatedData.phoneNumber) {
      const existingPhone = await prisma.contact.findFirst({
        where: { phoneNumber: validatedData.phoneNumber },
      });

      if (existingPhone) {
        return NextResponse.json(
          { data: null, error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    // Get current user ID
    const userId = await getCurrentUserId();

    // Create contact with user assignment
    const contact = await prisma.contact.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber || null,
        status: validatedData.status,
        jobTitle: validatedData.jobTitle || null,
        companyId: validatedData.companyId || null,
        userId: validatedData.userId || userId, // Use provided userId or current user
      },
    });

    // Revalidate cache for Dashboard and Contacts pages
    revalidateTag('dashboard');
    revalidatePath('/contacts');

    return NextResponse.json({ data: contact, error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating contact:', error);
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { data: null, error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
