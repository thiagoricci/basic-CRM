import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getUserFilter } from '@/lib/authorization';

export async function GET() {
  try {
    // Ensure user is authenticated
    await requireAuth();

    // Calculate date ranges for activity and task metrics
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Get user filter based on role
    const userFilter = await getUserFilter('read');

    // Fetch statistics and recent data using database aggregation for optimal performance
    const [
      totalContacts,
      totalLeads,
      totalCustomers,
      recentContacts,
      recentActivities,
      tasksDueToday,
      upcomingTasks,
      totalPipelineValue,
      dealsByStage,
      wonDealsValue,
      lostDealsValue,
      totalWonDeals,
      totalLostDeals,
      openDealsCount,
      recentDeals,
      // Activity metrics
      totalActivities,
      callCount,
      emailCount,
      meetingCount,
      noteCount,
      activitiesThisWeek,
      activitiesThisMonth,
      // Task metrics
      totalTasks,
      overdueTasks,
      completedTasks,
      lowPriorityTasks,
      mediumPriorityTasks,
      highPriorityTasks,
      // Company metrics
      totalCompanies,
      companiesWithDeals,
      topCompaniesByValue,
      companiesByIndustry,
      recentCompanies,
    ] = await Promise.all([
      prisma.contact.count({ where: userFilter.userId ? { userId: userFilter.userId } : {} }),
      prisma.contact.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), status: 'lead' } }),
      prisma.contact.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), status: 'customer' } }),
      prisma.contact.findMany({
        where: userFilter.userId ? { userId: userFilter.userId } : {},
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
      }),
      prisma.activity.findMany({
        where: userFilter.userId ? { userId: userFilter.userId } : {},
        select: {
          id: true,
          type: true,
          subject: true,
          description: true,
          createdAt: true,
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Count tasks due today
      prisma.task.count({
        where: {
          ...(userFilter.userId ? { userId: userFilter.userId } : {}),
          completed: false,
          dueDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      // Get next 5 upcoming tasks
      prisma.task.findMany({
        where: {
          ...(userFilter.userId ? { userId: userFilter.userId } : {}),
          completed: false,
        },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          priority: true,
          completed: true,
          contactId: true,
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      // Deal metrics
      prisma.deal.aggregate({
        where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), status: 'open' },
        _sum: { value: true },
      }),
      // Deals by stage
      prisma.deal.groupBy({
        by: ['stage'],
        _sum: { value: true },
        _count: true,
        where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), status: 'open' },
      }),
      // Won deals value
      prisma.deal.aggregate({
        where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), status: 'won' },
        _sum: { value: true },
      }),
      // Lost deals value
      prisma.deal.aggregate({
        where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), status: 'lost' },
        _sum: { value: true },
      }),
      // Total won deals count
      prisma.deal.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), status: 'won' } }),
      // Total lost deals count
      prisma.deal.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), status: 'lost' } }),
      // Open deals count
      prisma.deal.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), status: 'open' } }),
      // Recent deals
      prisma.deal.findMany({
        where: userFilter.userId ? { userId: userFilter.userId } : {},
        select: {
          id: true,
          name: true,
          value: true,
          stage: true,
          status: true,
          expectedCloseDate: true,
          createdAt: true,
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        }),
        // Activity metrics
        prisma.activity.count({ where: userFilter.userId ? { userId: userFilter.userId } : {} }),
        prisma.activity.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), type: 'call' } }),
        prisma.activity.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), type: 'email' } }),
        prisma.activity.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), type: 'meeting' } }),
        prisma.activity.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), type: 'note' } }),
        prisma.activity.count({
          where: {
            ...(userFilter.userId ? { userId: userFilter.userId } : {}),
            createdAt: {
              gte: startOfWeek,
            },
          },
        }),
        prisma.activity.count({
          where: {
            ...(userFilter.userId ? { userId: userFilter.userId } : {}),
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
        // Task metrics
        prisma.task.count({ where: userFilter.userId ? { userId: userFilter.userId } : {} }),
        prisma.task.count({
          where: {
            ...(userFilter.userId ? { userId: userFilter.userId } : {}),
            completed: false,
            dueDate: {
              lt: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.task.count({
          where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), completed: true },
        }),
        prisma.task.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), priority: 'low' } }),
        prisma.task.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), priority: 'medium' } }),
        prisma.task.count({ where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), priority: 'high' } }),
        // Company metrics (companies are shared resources, no user filtering)
        prisma.company.count({ where: {} }),
        prisma.company.count({
          where: {
            deals: {
              some: {},
            },
          },
        }),
        // Fetch deals with company names for top companies chart
        prisma.deal.findMany({
          where: { ...(userFilter.userId ? { userId: userFilter.userId } : {}), companyId: { not: null } },
          select: {
            companyId: true,
            value: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        }),
        prisma.company.groupBy({
          by: ['industry'],
          where: { industry: { not: null } },
          _count: true,
        }),
        prisma.company.findMany({
          where: {},
          select: {
            id: true,
            name: true,
            industry: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    const conversionRate =
      totalContacts > 0 ? (totalCustomers / totalContacts) * 100 : 0;

    // Deal metrics
    const pipelineValue = totalPipelineValue._sum.value || 0;
    const wonValue = wonDealsValue._sum.value || 0;
    const lostValue = lostDealsValue._sum.value || 0;
    const totalClosedDeals = totalWonDeals + totalLostDeals;
    const winRate = totalClosedDeals > 0 ? (totalWonDeals / totalClosedDeals) * 100 : 0;
    
    // Company metrics
    const totalDealValue = pipelineValue + wonValue + lostValue;
    const averageDealValue = totalCompanies > 0 ? (pipelineValue / totalCompanies) : 0;

    // Aggregate deals by company for top companies chart
    const companyValueMap = new Map<string, { name: string; totalValue: number }>();
    topCompaniesByValue.forEach((deal) => {
      if (deal.companyId && deal.company) {
        const existing = companyValueMap.get(deal.companyId) || { name: deal.company.name, totalValue: 0 };
        companyValueMap.set(deal.companyId, {
          name: existing.name,
          totalValue: existing.totalValue + deal.value,
        });
      }
    });

    const topCompaniesAggregated = Array.from(companyValueMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5)
      .map((item, index) => ({
        companyId: `company-${index}`,
        companyName: item.name,
        totalValue: item.totalValue,
      }));

    // Format deals by stage
    const dealsByStageMap: Record<string, { value: number; count: number }> = {};
    dealsByStage.forEach((item) => {
      dealsByStageMap[item.stage] = {
        value: item._sum.value || 0,
        count: item._count,
      };
    });

    // Fetch growth data for the last 30 days
    // thirtyDaysAgo is already defined at line 14

    // Get total contacts before the 30-day window
    const contactsBeforePeriod = await prisma.contact.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // Fetch all contacts from the last 30 days for growth chart
    const contactsForGrowth = await prisma.contact.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group contacts by date in JavaScript using PDT timezone
    const contactsByDateMap = new Map<number, number>();
    
    contactsForGrowth.forEach((contact) => {
      // Format date in PDT timezone for consistent grouping
      const pdtDate = new Date(contact.createdAt.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      }));
      pdtDate.setHours(0, 0, 0, 0);
      // Use timestamp as key for reliable grouping
      const dateKey = pdtDate.getTime();
      contactsByDateMap.set(dateKey, (contactsByDateMap.get(dateKey) || 0) + 1);
    });

    // Create array of dates with counts, sorted by date
    const contactsByDate = Array.from(contactsByDateMap.entries())
      .map(([timestamp, count]) => ({
        date: new Date(timestamp),
        count
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate cumulative growth (running total)
    let runningTotal = contactsBeforePeriod;
    const growthData = contactsByDate.map((item) => {
      runningTotal += item.count;
      return {
        date: item.date.toLocaleDateString('en-US', {
          timeZone: 'America/Los_Angeles',
          month: 'short',
          day: 'numeric',
        }),
        count: runningTotal,
      };
    });

    // Fetch activities over time for the last 30 days
    const activitiesForTimeChart = await prisma.activity.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group activities by date in JavaScript using PDT timezone
    const activitiesByDateMap = new Map<number, number>();
    
    activitiesForTimeChart.forEach((activity) => {
      const pdtDate = new Date(activity.createdAt.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      }));
      pdtDate.setHours(0, 0, 0, 0);
      const dateKey = pdtDate.getTime();
      activitiesByDateMap.set(dateKey, (activitiesByDateMap.get(dateKey) || 0) + 1);
    });

    // Create array of dates with counts, sorted by date
    const activitiesByDate = Array.from(activitiesByDateMap.entries())
      .map(([timestamp, count]) => ({
        date: new Date(timestamp),
        count
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Format activities over time data
    const activitiesOverTime = activitiesByDate.map((item) => ({
      date: item.date.toLocaleDateString('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'short',
        day: 'numeric',
      }),
      count: item.count,
    }));

    // Fetch task completion rate over time (last 30 days)
    const tasksCompletionData = await prisma.task.findMany({
      where: {
        ...(userFilter.userId ? { userId: userFilter.userId } : {}),
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        completed: true,
        completedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate completion rate by day
    const tasksByCompletionDateMap = new Map<number, { total: number; completed: number }>();
    
    tasksCompletionData.forEach((task) => {
      const pdtDate = new Date(task.createdAt.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      }));
      pdtDate.setHours(0, 0, 0, 0);
      const dateKey = pdtDate.getTime();
      
      const existing = tasksByCompletionDateMap.get(dateKey) || { total: 0, completed: 0 };
      tasksByCompletionDateMap.set(dateKey, {
        total: existing.total + 1,
        completed: existing.completed + (task.completed ? 1 : 0),
      });
    });

    // Create array of dates with completion rates, sorted by date
    const tasksCompletionByDate = Array.from(tasksByCompletionDateMap.entries())
      .map(([timestamp, data]) => ({
        date: new Date(timestamp),
        rate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Format task completion rate data
    const tasksCompletionOverTime = tasksCompletionByDate.map((item) => ({
      date: item.date.toLocaleDateString('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'short',
        day: 'numeric',
      }),
      rate: item.rate,
    }));

    return NextResponse.json({
      data: {
        contacts: recentContacts,
        recentActivities,
        totalContacts,
        totalLeads,
        totalCustomers,
        conversionRate,
        growthData,
        tasksDueToday,
        upcomingTasks,
        // Deal metrics
        pipelineValue,
        wonValue,
        lostValue,
        winRate,
        dealsByStage: dealsByStageMap,
        openDealsCount,
        totalWonDeals,
        totalLostDeals,
        recentDeals,
        // Activity metrics
        totalActivities,
        callCount,
        emailCount,
        meetingCount,
        noteCount,
        activitiesThisWeek,
        activitiesThisMonth,
        activitiesOverTime,
        // Task metrics
        totalTasks,
        overdueTasks,
        completedTasks,
        tasksByPriority: [
          { priority: 'Low', count: lowPriorityTasks, color: '#3b82f6' },
          { priority: 'Medium', count: mediumPriorityTasks, color: '#f59e0b' },
          { priority: 'High', count: highPriorityTasks, color: '#ef4444' },
        ],
        taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        tasksCompletionOverTime,
        // Company metrics
        totalCompanies,
        companiesWithDeals,
        averageDealValue,
        totalDealValue,
        topCompanies: topCompaniesAggregated,
        companiesByIndustry: companiesByIndustry
          .filter((item: any) => item.industry !== null)
          .map((item: any) => ({
            industry: item.industry || 'Unknown',
            count: item._count,
          })),
        recentCompanies,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { data: null, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
