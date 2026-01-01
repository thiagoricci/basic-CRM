import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validations';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
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
    const body = await request.json();

    // Validate input
    const validatedData = contactSchema.parse(body);

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

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber || null,
        status: validatedData.status,
        jobTitle: validatedData.jobTitle || null,
        companyId: validatedData.companyId || null,
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
