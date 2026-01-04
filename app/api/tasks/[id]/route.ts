import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskSchema } from '@/lib/validations';
import { requirePermission, canAccessRecord } from '@/lib/authorization';

// GET /api/tasks/[id] - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check read permission
    const permissionCheck = await requirePermission('task', 'read');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const task = await prisma.task.findUnique({
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

    if (!task) {
      return NextResponse.json(
        { data: null, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('read', task.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: task, error: null });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check update permission
    const permissionCheck = await requirePermission('task', 'update');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = taskSchema.parse(body);
    
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { data: null, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('update', existingTask.userId);
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
    
    // Validate user assignment matches contact's user
    if (contact.userId && validatedData.userId && contact.userId !== validatedData.userId) {
      return NextResponse.json(
        { data: null, error: 'Assigned user must match the contact\'s assigned user' },
        { status: 400 }
      );
    }
    
    // Update task (preserve userId if not provided)
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        dueDate: new Date(validatedData.dueDate),
        priority: validatedData.priority,
        contactId: validatedData.contactId,
        userId: validatedData.userId || existingTask.userId,
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
      },
    });

    return NextResponse.json({ data: task, error: null });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { data: null, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    console.error('Error updating task:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check delete permission
    const permissionCheck = await requirePermission('task', 'delete');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { data: null, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('delete', existingTask.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }
    
    // Delete task
    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id]/toggle-complete - Toggle task completion
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check update permission
    const permissionCheck = await requirePermission('task', 'update');
    if (!permissionCheck.success) {
      return NextResponse.json(
        { data: null, error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { completed } = body;
    
    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { data: null, error: 'completed must be a boolean' },
        { status: 400 }
      );
    }
    
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { data: null, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user can access this record
    const accessCheck = await canAccessRecord('update', existingTask.userId);
    if (!accessCheck.success) {
      return NextResponse.json(
        { data: null, error: accessCheck.error },
        { status: 403 }
      );
    }
    
    // Update task completion status
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
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
      },
    });

    return NextResponse.json({ data: task, error: null });
  } catch (error) {
    console.error('Error toggling task completion:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to toggle task completion' },
      { status: 500 }
    );
  }
}
