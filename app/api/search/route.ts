import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    // Return empty results if no query
    if (!query.trim()) {
      return NextResponse.json({
        contacts: { total: 0, results: [] },
        companies: { total: 0, results: [] },
        deals: { total: 0, results: [] },
        tasks: { total: 0, results: [] },
      });
    }

    // Search across all entities in parallel
    const [contacts, companies, deals, tasks] = await Promise.all([
      // Search contacts
      prisma.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phoneNumber: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Search companies
      prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
            { website: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          industry: true,
          website: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Search deals
      prisma.deal.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          value: true,
          stage: true,
          status: true,
          expectedCloseDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Search tasks
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          priority: true,
          completed: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      contacts: { total: contacts.length, results: contacts },
      companies: { total: companies.length, results: companies },
      deals: { total: deals.length, results: deals },
      tasks: { total: tasks.length, results: tasks },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        contacts: { total: 0, results: [] },
        companies: { total: 0, results: [] },
        deals: { total: 0, results: [] },
        tasks: { total: 0, results: [] },
        error: 'Search failed',
      },
      { status: 500 }
    );
  }
}
