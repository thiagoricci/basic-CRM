import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day';

    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch all analytics data in parallel
    const [
      revenueOverTime,
      dealsWonLost,
      averageDealSize,
      winRate,
      dealsByStage,
      averageTimeInStage,
      pipelineVelocity,
      activitiesByType,
      activitiesOverTime,
      activityHeatmap,
      topContactsByActivity,
      topCompaniesByActivity,
      taskCompletionRate,
      overdueTasksTrend,
      tasksCompletedOverTime,
      averageTimeToComplete,
      conversionFunnel,
      topCompaniesByDealValue,
      biggestDealsWonThisMonth,
      topContactsByDealValue,
    ] = await Promise.all([
      // Sales Performance
      fetchRevenueOverTime(start, end, groupBy),
      fetchDealsWonLost(start, end),
      fetchAverageDealSize(start, end),
      fetchWinRate(start, end),

      // Pipeline Analytics
      fetchDealsByStage(start, end),
      fetchAverageTimeInStage(start, end),
      fetchPipelineVelocity(start, end),

      // Activity Metrics
      fetchActivitiesByType(start, end),
      fetchActivitiesOverTime(start, end, groupBy),
      fetchActivityHeatmap(start, end),
      fetchTopContactsByActivity(start, end),
      fetchTopCompaniesByActivity(start, end),

      // Task Analytics
      fetchTaskCompletionRate(start, end),
      fetchOverdueTasksTrend(start, end, groupBy),
      fetchTasksCompletedOverTime(start, end, groupBy),
      fetchAverageTimeToComplete(start, end),

      // Conversion Funnel
      fetchConversionFunnel(start, end),

      // Top Performers
      fetchTopCompaniesByDealValue(start, end),
      fetchBiggestDealsWonThisMonth(),
      fetchTopContactsByDealValue(start, end),
    ]);

    return NextResponse.json({
      data: {
        revenueOverTime,
        dealsWonLost,
        averageDealSize,
        winRate,
        dealsByStage,
        averageTimeInStage,
        pipelineVelocity,
        activitiesByType,
        activitiesOverTime,
        activityHeatmap,
        topContactsByActivity,
        topCompaniesByActivity,
        taskCompletionRate,
        overdueTasksTrend,
        tasksCompletedOverTime,
        averageTimeToComplete,
        conversionFunnel,
        topCompaniesByDealValue,
        biggestDealsWonThisMonth,
        topContactsByDealValue,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching reports data:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch reports data' },
      { status: 500 }
    );
  }
}

// Sales Performance Helper Functions
async function fetchRevenueOverTime(start: Date, end: Date, groupBy: string) {
  const wonDeals = await prisma.deal.findMany({
    where: {
      status: 'won',
      actualCloseDate: {
        gte: start,
        lte: end,
      },
    },
    select: {
      actualCloseDate: true,
      value: true,
    },
  });

  // Group by date based on groupBy parameter
  const grouped = wonDeals.reduce((acc: Record<string, number>, deal) => {
    const date = new Date(deal.actualCloseDate!);
    let key: string;

    if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (groupBy === 'quarter') {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      key = `${date.getFullYear()}-Q${quarter}`;
    } else {
      key = date.toISOString().split('T')[0];
    }

    acc[key] = (acc[key] || 0) + deal.value;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchDealsWonLost(start: Date, end: Date) {
  const deals = await prisma.deal.findMany({
    where: {
      status: {
        in: ['won', 'lost'],
      },
      actualCloseDate: {
        gte: start,
        lte: end,
      },
    },
    select: {
      status: true,
      value: true,
    },
  });

  const result = [
    { status: 'won' as const, count: 0, value: 0 },
    { status: 'lost' as const, count: 0, value: 0 },
  ];

  deals.forEach((deal) => {
    const statusItem = result.find((r) => r.status === deal.status);
    if (statusItem) {
      statusItem.count++;
      statusItem.value += deal.value;
    }
  });

  return result;
}

async function fetchAverageDealSize(start: Date, end: Date) {
  const deals = await prisma.deal.findMany({
    where: {
      status: 'won',
      actualCloseDate: {
        gte: start,
        lte: end,
      },
    },
    select: {
      value: true,
    },
  });

  if (deals.length === 0) return 0;
  const total = deals.reduce((sum, deal) => sum + deal.value, 0);
  return total / deals.length;
}

async function fetchWinRate(start: Date, end: Date) {
  const deals = await prisma.deal.findMany({
    where: {
      status: {
        in: ['won', 'lost'],
      },
      actualCloseDate: {
        gte: start,
        lte: end,
      },
    },
    select: {
      status: true,
    },
  });

  const won = deals.filter((d) => d.status === 'won').length;
  const total = deals.length;

  if (total === 0) return 0;
  return (won / total) * 100;
}

// Pipeline Analytics Helper Functions
async function fetchDealsByStage(start: Date, end: Date) {
  const deals = await prisma.deal.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      stage: true,
      value: true,
    },
  });

  const grouped = deals.reduce((acc: Record<string, { count: number; value: number }>, deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = { count: 0, value: 0 };
    }
    acc[deal.stage].count++;
    acc[deal.stage].value += deal.value;
    return acc;
  }, {});

  return Object.entries(grouped).map(([stage, data]) => ({
    stage,
    count: data.count,
    value: data.value,
  }));
}

async function fetchAverageTimeInStage(start: Date, end: Date) {
  const stageHistory = await prisma.dealStageHistory.findMany({
    where: {
      changedAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      toStage: true,
      changedAt: true,
    },
  });

  // Group by stage and calculate average time
  const grouped = stageHistory.reduce((acc: Record<string, Date[]>, history) => {
    if (!acc[history.toStage]) {
      acc[history.toStage] = [];
    }
    acc[history.toStage].push(history.changedAt);
    return acc;
  }, {});

  return Object.entries(grouped).map(([stage, dates]) => {
    const avgTime = dates.length > 0
      ? dates.reduce((sum, date) => sum + date.getTime(), 0) / dates.length
      : 0;
    return { stage, days: avgTime / (1000 * 60 * 60 * 24) };
  });
}

async function fetchPipelineVelocity(start: Date, end: Date) {
  const deals = await prisma.deal.findMany({
    where: {
      status: 'won',
      actualCloseDate: {
        gte: start,
        lte: end,
      },
    },
    select: {
      createdAt: true,
      actualCloseDate: true,
    },
  });

  if (deals.length === 0) return 0;

  const totalDays = deals.reduce((sum, deal) => {
    const created = new Date(deal.createdAt).getTime();
    const closed = new Date(deal.actualCloseDate!).getTime();
    return sum + (closed - created) / (1000 * 60 * 60 * 24);
  }, 0);

  return totalDays / deals.length;
}

// Activity Metrics Helper Functions
async function fetchActivitiesByType(start: Date, end: Date) {
  const activities = await prisma.activity.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      type: true,
    },
  });

  const grouped = activities.reduce((acc: Record<string, number>, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([type, count]) => ({ type, count }));
}

async function fetchActivitiesOverTime(start: Date, end: Date, groupBy: string) {
  const activities = await prisma.activity.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const grouped = activities.reduce((acc: Record<string, number>, activity) => {
    const date = new Date(activity.createdAt);
    let key: string;

    if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (groupBy === 'week') {
      const weekNumber = Math.ceil(date.getDate() / 7);
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${weekNumber}`;
    } else {
      key = date.toISOString().split('T')[0];
    }

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchActivityHeatmap(start: Date, end: Date) {
  const activities = await prisma.activity.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group activities by day of week
  const groupedByDay = activities.reduce((acc: Record<number, any[]>, activity) => {
    const day = new Date(activity.createdAt).getDay();
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push({
      id: activity.id,
      type: activity.type,
      subject: activity.subject,
      description: activity.description,
      createdAt: activity.createdAt,
      contactId: activity.contactId,
      contactName: `${activity.contact.firstName} ${activity.contact.lastName}`,
    });
    return acc;
  }, {});

  // Convert to array and sort by day (0-6)
  return Array.from({ length: 7 }, (_, dayIndex) => ({
    day: dayIndex,
    activities: groupedByDay[dayIndex] || [],
  }));
}

async function fetchTopContactsByActivity(start: Date, end: Date) {
  const activities = await prisma.activity.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const grouped = activities.reduce((acc: Record<string, { contactId: string; name: string; count: number }>, activity) => {
    const contactId = activity.contactId;
    const name = `${activity.contact.firstName} ${activity.contact.lastName}`;
    if (!acc[contactId]) {
      acc[contactId] = { contactId, name, count: 0 };
    }
    acc[contactId].count++;
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

async function fetchTopCompaniesByActivity(start: Date, end: Date) {
  const activities = await prisma.activity.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      contact: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const grouped = activities.reduce((acc: Record<string, { companyId: string; name: string; count: number }>, activity) => {
    if (!activity.contact.company) return acc;
    const companyId = activity.contact.companyId!;
    const name = activity.contact.company.name;
    if (!acc[companyId]) {
      acc[companyId] = { companyId, name, count: 0 };
    }
    acc[companyId].count++;
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Task Analytics Helper Functions
async function fetchTaskCompletionRate(start: Date, end: Date) {
  const tasks = await prisma.task.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      completed: true,
    },
  });

  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return (completed / tasks.length) * 100;
}

async function fetchOverdueTasksTrend(start: Date, end: Date, groupBy: string) {
  const tasks = await prisma.task.findMany({
    where: {
      completed: false,
      dueDate: {
        lt: new Date(),
      },
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const grouped = tasks.reduce((acc: Record<string, number>, task) => {
    const date = new Date(task.createdAt);
    let key: string;

    if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (groupBy === 'week') {
      const weekNumber = Math.ceil(date.getDate() / 7);
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${weekNumber}`;
    } else {
      key = date.toISOString().split('T')[0];
    }

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchTasksCompletedOverTime(start: Date, end: Date, groupBy: string) {
  const tasks = await prisma.task.findMany({
    where: {
      completed: true,
      completedAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      completedAt: true,
    },
  });

  const grouped = tasks.reduce((acc: Record<string, number>, task) => {
    const date = new Date(task.completedAt!);
    let key: string;

    if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (groupBy === 'week') {
      const weekNumber = Math.ceil(date.getDate() / 7);
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${weekNumber}`;
    } else {
      key = date.toISOString().split('T')[0];
    }

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchAverageTimeToComplete(start: Date, end: Date) {
  const tasks = await prisma.task.findMany({
    where: {
      completed: true,
      completedAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      createdAt: true,
      completedAt: true,
    },
  });

  if (tasks.length === 0) return 0;

  const totalDays = tasks.reduce((sum, task) => {
    const created = new Date(task.createdAt).getTime();
    const completed = new Date(task.completedAt!).getTime();
    return sum + (completed - created) / (1000 * 60 * 60 * 24);
  }, 0);

  return totalDays / tasks.length;
}

// Conversion Funnel Helper Functions
async function fetchConversionFunnel(start: Date, end: Date) {
  const [totalContacts, totalLeads, totalCustomers, dealsCount, wonDeals] = await Promise.all([
    prisma.contact.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),
    prisma.contact.count({
      where: {
        status: 'lead',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),
    prisma.contact.count({
      where: {
        status: 'customer',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),
    prisma.deal.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),
    prisma.deal.count({
      where: {
        status: 'won',
        actualCloseDate: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);

  const funnel = [
    { stage: 'Leads', count: totalLeads, conversionRate: 100, dropOffRate: 0 },
    {
      stage: 'Customers',
      count: totalCustomers,
      conversionRate: totalLeads > 0 ? (totalCustomers / totalLeads) * 100 : 0,
      dropOffRate: totalLeads > 0 ? ((totalLeads - totalCustomers) / totalLeads) * 100 : 0,
    },
    {
      stage: 'Deals',
      count: dealsCount,
      conversionRate: totalCustomers > 0 ? (dealsCount / totalCustomers) * 100 : 0,
      dropOffRate: totalCustomers > 0 ? ((totalCustomers - dealsCount) / totalCustomers) * 100 : 0,
    },
    {
      stage: 'Won',
      count: wonDeals,
      conversionRate: dealsCount > 0 ? (wonDeals / dealsCount) * 100 : 0,
      dropOffRate: dealsCount > 0 ? ((dealsCount - wonDeals) / dealsCount) * 100 : 0,
    },
  ];

  return funnel;
}

// Top Performers Helper Functions
async function fetchTopCompaniesByDealValue(start: Date, end: Date) {
  const deals = await prisma.deal.findMany({
    where: {
      companyId: {
        not: null,
      },
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const grouped = deals.reduce((acc: Record<string, { companyId: string; name: string; totalValue: number }>, deal) => {
    const companyId = deal.companyId!;
    const name = deal.company?.name || 'Unknown';
    if (!acc[companyId]) {
      acc[companyId] = { companyId, name, totalValue: 0 };
    }
    acc[companyId].totalValue += deal.value;
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);
}

async function fetchBiggestDealsWonThisMonth() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const deals = await prisma.deal.findMany({
    where: {
      status: 'won',
      actualCloseDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      contact: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      value: 'desc',
    },
    take: 10,
  });

  return deals.map((deal) => ({
    dealId: deal.id,
    name: deal.name,
    value: deal.value,
    contactName: `${deal.contact.firstName} ${deal.contact.lastName}`,
  }));
}

async function fetchTopContactsByDealValue(start: Date, end: Date) {
  const deals = await prisma.deal.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const grouped = deals.reduce((acc: Record<string, { contactId: string; name: string; totalValue: number }>, deal) => {
    const contactId = deal.contactId;
    const name = `${deal.contact.firstName} ${deal.contact.lastName}`;
    if (!acc[contactId]) {
      acc[contactId] = { contactId, name, totalValue: 0 };
    }
    acc[contactId].totalValue += deal.value;
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);
}
