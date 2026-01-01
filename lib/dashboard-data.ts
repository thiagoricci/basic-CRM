import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Contact } from '@/types/contact';

export interface DashboardData {
  contacts: Contact[];
  totalContacts: number;
  totalLeads: number;
  totalCustomers: number;
  conversionRate: number;
  growthData: { date: string; count: number }[];
}

async function getDashboardDataUncached(): Promise<DashboardData> {
  // Fetch statistics using database aggregation for optimal performance
  const [totalContacts, totalLeads, totalCustomers] = await Promise.all([
    prisma.contact.count(),
    prisma.contact.count({ where: { status: 'lead' } }),
    prisma.contact.count({ where: { status: 'customer' } }),
  ]);

  const conversionRate =
    totalContacts > 0 ? (totalCustomers / totalContacts) * 100 : 0;

  // Fetch only the 5 most recent contacts with minimal fields
  const recentContacts = await prisma.contact.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Fetch growth data using database aggregation for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const contactsByDate = await prisma.contact.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group contacts by date for the chart
  const growthData = contactsByDate.map(
    (item: { createdAt: Date; _count: { id: number } }) => ({
      date: new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count: item._count.id,
    })
  );

  return {
    contacts: recentContacts as Contact[],
    totalContacts,
    totalLeads,
    totalCustomers,
    conversionRate,
    growthData,
  };
}

// Cached version with tag for invalidation
export const getDashboardData = unstable_cache(
  async () => getDashboardDataUncached(),
  ['dashboard-data'],
  {
    tags: ['dashboard'],
    revalidate: 60, // Revalidate every 60 seconds as fallback
  }
);
