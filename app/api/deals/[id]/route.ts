import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dealSchema } from '@/lib/validations';
import { requirePermission, canAccessRecord } from '@/lib/authorization';

// GET /api/deals/[id] - Get single deal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check read permission
    const permissionCheck = await requirePermission('deal', 'read');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            status: true,
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

    if (!deal) {
      return NextResponse.json(
        { data: null, error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('read', deal.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: deal, error: null });
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}

// PUT /api/deals/[id] - Update deal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check update permission
    const permissionCheck = await requirePermission('deal', 'update');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = dealSchema.parse(body);
    
    // Verify deal exists
    const existingDeal = await prisma.deal.findUnique({
      where: { id: params.id },
    });
    
    if (!existingDeal) {
      return NextResponse.json(
        { data: null, error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('update', existingDeal.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }
    
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
    
    // Validate company assignment matches contact's company
    if (contact.companyId && validatedData.companyId && contact.companyId !== validatedData.companyId) {
      return NextResponse.json(
        { data: null, error: 'Company must match the contact\'s company' },
        { status: 400 }
      );
    }
    
    // Validate user assignment matches contact's user
    if (contact.userId && validatedData.userId && contact.userId !== validatedData.userId) {
      return NextResponse.json(
        { data: null, error: 'Assigned user must match the contact\'s assigned user' },
        { status: 400 }
      );
    }

    // Determine actual close date
    let actualCloseDate = validatedData.actualCloseDate
      ? new Date(validatedData.actualCloseDate)
      : null;
    
    // Auto-set actual close date when status changes to won or lost
    if (validatedData.status === 'won' || validatedData.status === 'lost') {
      // Always set to current date when status is won or lost
      actualCloseDate = new Date();
    } else if (validatedData.status === 'open') {
      // Clear actual close date when status changes back to open
      actualCloseDate = null;
    }
    
    // Auto-set stage when status changes
    let stage = validatedData.stage;
    if (validatedData.status === 'won') {
      stage = 'closed_won';
    } else if (validatedData.status === 'lost') {
      stage = 'closed_lost';
    }
    
    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        value: validatedData.value,
        stage,
        expectedCloseDate: new Date(validatedData.expectedCloseDate),
        actualCloseDate,
        status: validatedData.status,
        probability: validatedData.probability || 0,
        description: validatedData.description,
        contactId: validatedData.contactId,
        companyId: validatedData.companyId || null,
        userId: validatedData.userId || existingDeal.userId,
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

    return NextResponse.json({ data: deal, error: null });
  } catch (error) {
    console.error('Error updating deal:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { data: null, error: 'Invalid input data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { data: null, error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

// PATCH /api/deals/[id] - Update deal stage (for drag-and-drop)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check update permission
    const permissionCheck = await requirePermission('deal', 'update');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { stage, status } = body;
    
    // Verify deal exists
    const existingDeal = await prisma.deal.findUnique({
      where: { id: params.id },
    });
    
    if (!existingDeal) {
      return NextResponse.json(
        { data: null, error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('update', existingDeal.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }

    const updateData: any = {};
    
    if (stage) {
      updateData.stage = stage;
    }
    
    if (status) {
      updateData.status = status;
      // Set actual close date when status changes to won or lost
      if (status === 'won' || status === 'lost') {
        updateData.actualCloseDate = new Date();
      }
      
      // Auto-set stage when status changes (only if stage not explicitly provided)
      if (status === 'won' && !stage) {
        updateData.stage = 'closed_won';
      } else if (status === 'lost' && !stage) {
        updateData.stage = 'closed_lost';
      }
    }
    
    // Auto-set stage when dragging to closed_won or closed_lost stages
    if (stage === 'closed_won' && !status) {
      updateData.status = 'won';
      updateData.actualCloseDate = new Date();
    } else if (stage === 'closed_lost' && !status) {
      updateData.status = 'lost';
      updateData.actualCloseDate = new Date();
    }

    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ data: deal, error: null });
  } catch (error) {
    console.error('Error updating deal stage:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to update deal stage' },
      { status: 500 }
    );
  }
}

// DELETE /api/deals/[id] - Delete deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check delete permission
    const permissionCheck = await requirePermission('deal', 'delete');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
    });
    
    if (!deal) {
      return NextResponse.json(
        { data: null, error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('delete', deal.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }
    
    await prisma.deal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
