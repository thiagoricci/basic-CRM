import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { companySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry && industry !== 'all') {
      where.industry = industry;
    }

    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: {
              contacts: true,
              deals: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      data: companies,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = companySchema.parse(body);

    // Check if company name already exists
    const existingCompany = await prisma.company.findUnique({
      where: { name: validatedData.name },
    });

    if (existingCompany) {
      return NextResponse.json(
        { data: null, error: 'Company name already exists' },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
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

    return NextResponse.json({ data: company, error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { data: null, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    console.error('Error creating company:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
