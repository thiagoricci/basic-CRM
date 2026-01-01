import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dealSchema } from '@/lib/validations';

// GET /api/deals - List all deals with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const stage = searchParams.get('stage');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minValue = searchParams.get('minValue');
    const maxValue = searchParams.get('maxValue');
    const search = searchParams.get('search');

    const where: any = {};

    // Filter by contact ID if provided
    if (contactId) {
      where.contactId = contactId;
    }

    if (stage && stage !== 'all') {
      where.stage = stage;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (startDate && endDate) {
      where.expectedCloseDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (minValue || maxValue) {
      where.value = {};
      if (minValue) {
        where.value.gte = parseFloat(minValue);
      }
      if (maxValue) {
        where.value.lte = parseFloat(maxValue);
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const deals = await prisma.deal.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: deals, error: null });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

// POST /api/deals - Create new deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = dealSchema.parse(body);

    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: validatedData.contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { data: null, error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Auto-set stage when status changes
    let stage = validatedData.stage;
    if (validatedData.status === 'won') {
      stage = 'closed_won';
    } else if (validatedData.status === 'lost') {
      stage = 'closed_lost';
    }
    
    const deal = await prisma.deal.create({
      data: {
        name: validatedData.name,
        value: validatedData.value,
        stage,
        expectedCloseDate: new Date(validatedData.expectedCloseDate),
        actualCloseDate: validatedData.actualCloseDate
          ? new Date(validatedData.actualCloseDate)
          : (validatedData.status === 'won' || validatedData.status === 'lost') ? new Date() : null,
        status: validatedData.status,
        probability: validatedData.probability || 0,
        description: validatedData.description,
        contactId: validatedData.contactId,
        companyId: validatedData.companyId || null,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: deal, error: null }, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { data: null, error: 'Invalid input data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { data: null, error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
