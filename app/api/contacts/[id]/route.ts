import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validations';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requirePermission, canAccessRecord } from '@/lib/authorization';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check read permission
    const permissionCheck = await requirePermission('contact', 'read');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        company: true, // Include company data
        user: true, // Include user data
      },
    });

    if (!contact) {
      return NextResponse.json(
        { data: null, error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('read', contact.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: contact, error: null });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch contact' },
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
    const permissionCheck = await requirePermission('contact', 'update');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = contactSchema.parse(body);
    
    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: params.id },
    });
    
    if (!existingContact) {
      return NextResponse.json(
        { data: null, error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('update', existingContact.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }
    
    // Check for duplicate email (excluding current contact)
    if (validatedData.email !== existingContact.email) {
      const duplicateEmail = await prisma.contact.findUnique({
        where: { email: validatedData.email },
      });
      
      if (duplicateEmail) {
        return NextResponse.json(
          { data: null, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Check for duplicate phone number (excluding current contact)
    if (validatedData.phoneNumber && validatedData.phoneNumber !== existingContact.phoneNumber) {
      const duplicatePhone = await prisma.contact.findFirst({
        where: { phoneNumber: validatedData.phoneNumber },
      });
      
      if (duplicatePhone) {
        return NextResponse.json(
          { data: null, error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update contact (preserve userId if not provided)
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber || null,
        status: validatedData.status,
        jobTitle: validatedData.jobTitle || null,
        companyId: validatedData.companyId || null,
        userId: validatedData.userId || existingContact.userId,
      },
    });

    // Revalidate cache for Dashboard, Contacts, and Contact Profile pages
    revalidateTag('dashboard');
    revalidatePath('/contacts');
    revalidatePath(`/contacts/${params.id}`);

    return NextResponse.json({ data: contact, error: null });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating contact:', error);
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { data: null, error: 'Failed to update contact' },
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
    const permissionCheck = await requirePermission('contact', 'delete');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: params.id },
    });
    
    if (!existingContact) {
      return NextResponse.json(
        { data: null, error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('delete', existingContact.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }
    
    // Delete contact
    await prisma.contact.delete({
      where: { id: params.id },
    });

    // Revalidate cache for Dashboard and Contacts pages
    revalidateTag('dashboard');
    revalidatePath('/contacts');

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
