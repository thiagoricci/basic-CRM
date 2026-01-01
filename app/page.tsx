'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import { Contact } from '@/types/contact';
import { Activity } from '@/types/activity';
import { Task } from '@/types/task';

interface DashboardData {
  contacts: Contact[];
  recentActivities: Activity[];
  totalContacts: number;
  totalLeads: number;
  totalCustomers: number;
  conversionRate: number;
  growthData: { date: string; count: number }[];
  tasksDueToday: number;
  upcomingTasks: Task[];
  // Deal metrics
  pipelineValue: number;
  wonValue: number;
  lostValue: number;
  winRate: number;
  dealsByStage: Record<string, { value: number; count: number }>;
  openDealsCount: number;
  totalWonDeals: number;
  totalLostDeals: number;
  recentDeals: any[];
  // Company metrics
  totalCompanies: number;
  companiesWithDeals: number;
  averageDealValue: number;
  totalDealValue: number;
  topCompanies: any[];
  companiesByIndustry: any[];
  recentCompanies: any[];
  // Activity metrics
  totalActivities: number;
  callCount: number;
  emailCount: number;
  meetingCount: number;
  noteCount: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  activitiesOverTime: { date: string; count: number }[];
  // Task metrics
  totalTasks: number;
  overdueTasks: number;
  completedTasks: number;
  tasksByPriority: { priority: string; count: number; color: string }[];
  taskCompletionRate: number;
  tasksCompletionOverTime: { date: string; rate: number }[];
}

interface DashboardResponse {
  data: DashboardData | null;
  error: string | null;
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return response.json();
};

export default function DashboardPage() {
  // Use SWR to fetch dashboard data with automatic revalidation
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
    '/api/dashboard',
    fetcher,
    {
      revalidateOnFocus: true, // Refresh when tab regains focus
      revalidateOnReconnect: true, // Refresh when network reconnects
      refreshInterval: 30000, // Poll every 30 seconds for near real-time updates
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
    }
  );

  // Expose mutate function for manual revalidation (only on client)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshDashboard = mutate;
    }
  }, [mutate]);

  if (isLoading) {
    return (
      <div className="container space-y-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container space-y-8 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <button
            onClick={() => mutate()}
            className="mt-4 text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your contact database and analytics
          </p>
        </div>
      </div>

      <DashboardTabs
        {...data.data}
        onToggleTaskComplete={async (id: string, completed: boolean) => {
          try {
            const response = await fetch(`/api/tasks/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ completed }),
            });
            if (response.ok) {
              mutate();
            }
          } catch (error) {
            console.error('Error toggling task completion:', error);
          }
        }}
      />
    </div>
  );
}
