import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { companySchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        contacts: {
          orderBy: { createdAt: 'desc' },
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
            },
            tasks: {
              orderBy: { dueDate: 'asc' },
            },
          },
        },
        deals: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            contacts: true,
            deals: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { data: null, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Aggregate activities and tasks from all contacts
    const activities = company.contacts.flatMap((contact) => contact.activities);
    const tasks = company.contacts.flatMap((contact) => contact.tasks);

    // Return company with aggregated activities and tasks
    return NextResponse.json({
      data: {
        ...company,
        activities,
        tasks,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch company' },
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
    const validatedData = companySchema.parse(body);

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { data: null, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if new name conflicts with another company
    if (validatedData.name !== existingCompany.name) {
      const nameConflict = await prisma.company.findUnique({
        where: { name: validatedData.name },
      });

      if (nameConflict) {
        return NextResponse.json(
          { data: null, error: 'Company name already exists' },
          { status: 400 }
        );
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        industry: validatedData.industry || null,
        website: validatedData.website || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        employeeCount: validatedData.employeeCount || null,
        revenue: validatedData.revenue || null,
      },
    });

    return NextResponse.json({ data: updatedCompany, error: null });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { data: null, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    console.error('Error updating company:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { data: null, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Delete company (this will set companyId to null for all contacts and deals)
    await prisma.company.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      data: { message: 'Company deleted successfully' },
      error: null,
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
