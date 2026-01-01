'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsCards } from '@/components/dashboard/analytics-cards';
import { StatusChart } from '@/components/dashboard/status-chart';
import { GrowthChart } from '@/components/dashboard/growth-chart';
import { RecentContacts } from '@/components/dashboard/recent-contacts';
import { ActivityAnalyticsCards } from '@/components/dashboard/activity-analytics-cards';
import { ActivityTypeChart } from '@/components/dashboard/activity-type-chart';
import { ActivitiesOverTimeChart } from '@/components/dashboard/activities-over-time-chart';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { TaskAnalyticsCards } from '@/components/dashboard/task-analytics-cards';
import { TaskPriorityChart } from '@/components/dashboard/task-priority-chart';
import { TaskCompletionChart } from '@/components/dashboard/task-completion-chart';
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';
import { PipelineMetrics } from '@/components/dashboard/pipeline-metrics';
import { PipelineChart } from '@/components/dashboard/pipeline-chart';
import { RecentDeals } from '@/components/dashboard/recent-deals';
import { DealStatusChart } from '@/components/dashboard/deal-status-chart';
import { CompanyAnalyticsCards } from '@/components/dashboard/company-analytics-cards';
import { TopCompaniesChart } from '@/components/dashboard/top-companies-chart';
import { CompaniesByIndustryChart } from '@/components/dashboard/companies-by-industry-chart';
import { RecentCompanies } from '@/components/dashboard/recent-companies';
import { Contact } from '@/types/contact';
import { Activity } from '@/types/activity';
import { Task } from '@/types/task';

interface DashboardTabsProps {
  // Contact data
  contacts: Contact[];
  totalContacts: number;
  totalLeads: number;
  totalCustomers: number;
  conversionRate: number;
  growthData: { date: string; count: number }[];

  // Activity data
  recentActivities: Activity[];
  totalActivities: number;
  callCount: number;
  emailCount: number;
  meetingCount: number;
  noteCount: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  activitiesOverTime: { date: string; count: number }[];

  // Task data
  tasksDueToday: number;
  upcomingTasks: Task[];
  totalTasks: number;
  overdueTasks: number;
  completedTasks: number;
  tasksByPriority: { priority: string; count: number; color: string }[];
  taskCompletionRate: number;
  tasksCompletionOverTime: { date: string; rate: number }[];

  // Deal data
  pipelineValue: number;
  wonValue: number;
  lostValue: number;
  winRate: number;
  dealsByStage: Record<string, { value: number; count: number }>;
  openDealsCount: number;
  totalWonDeals: number;
  totalLostDeals: number;
  recentDeals: any[];

  // Company data
  totalCompanies: number;
  companiesWithDeals: number;
  averageDealValue: number;
  totalDealValue: number;
  topCompanies: any[];
  companiesByIndustry: any[];
  recentCompanies: any[];

  onToggleTaskComplete: (id: string, completed: boolean) => Promise<void>;
}

export function DashboardTabs({
  // Contact data
  contacts,
  totalContacts,
  totalLeads,
  totalCustomers,
  conversionRate,
  growthData,
  // Activity data
  recentActivities,
  totalActivities,
  callCount,
  emailCount,
  meetingCount,
  noteCount,
  activitiesThisWeek,
  activitiesThisMonth,
  activitiesOverTime,
  // Task data
  tasksDueToday,
  upcomingTasks,
  totalTasks,
  overdueTasks,
  completedTasks,
  tasksByPriority,
  taskCompletionRate,
  tasksCompletionOverTime,
  // Deal data
  pipelineValue,
  wonValue,
  lostValue,
  winRate,
  dealsByStage,
  openDealsCount,
  totalWonDeals,
  totalLostDeals,
  recentDeals,
  // Company data
  totalCompanies,
  companiesWithDeals,
  averageDealValue,
  totalDealValue,
  topCompanies,
  companiesByIndustry,
  recentCompanies,
  onToggleTaskComplete,
}: DashboardTabsProps) {
  // Prepare activity type chart data
  const activityTypeData = [
    { type: 'Call', count: callCount, color: '#3b82f6' },
    { type: 'Email', count: emailCount, color: '#8b5cf6' },
    { type: 'Meeting', count: meetingCount, color: '#10b981' },
    { type: 'Note', count: noteCount, color: '#f59e0b' },
  ];

  // Prepare pipeline chart data
  const pipelineChartData = Object.entries(dealsByStage).map(([stage, data]) => ({
    stage,
    value: data.value,
    count: data.count,
  }));

  return (
    <Tabs defaultValue="contacts" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
        <TabsTrigger value="companies">Companies</TabsTrigger>
        <TabsTrigger value="deals">Deals</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="activities">Activities</TabsTrigger>
      </TabsList>

      <TabsContent value="contacts" className="space-y-6 mt-6">
        <AnalyticsCards
          totalContacts={totalContacts}
          totalLeads={totalLeads}
          totalCustomers={totalCustomers}
          conversionRate={conversionRate}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <StatusChart leads={totalLeads} customers={totalCustomers} />
          <GrowthChart data={growthData} />
        </div>
        <RecentContacts contacts={contacts} />
      </TabsContent>

      <TabsContent value="companies" className="space-y-6 mt-6">
        <CompanyAnalyticsCards
          totalCompanies={totalCompanies}
          companiesWithDeals={companiesWithDeals}
          averageDealValue={averageDealValue}
          totalDealValue={totalDealValue}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <TopCompaniesChart data={topCompanies} />
          <CompaniesByIndustryChart data={companiesByIndustry} />
        </div>
        <RecentCompanies companies={recentCompanies} />
      </TabsContent>

      <TabsContent value="deals" className="space-y-6 mt-6">
        <PipelineMetrics
          pipelineValue={pipelineValue}
          wonValue={wonValue}
          lostValue={lostValue}
          winRate={winRate}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <PipelineChart dealsByStage={dealsByStage} />
          <DealStatusChart
            openDealsCount={openDealsCount}
            openDealsValue={pipelineValue}
            wonDealsCount={totalWonDeals}
            wonDealsValue={wonValue}
            lostDealsCount={totalLostDeals}
            lostDealsValue={lostValue}
          />
        </div>
        <RecentDeals deals={recentDeals} />
      </TabsContent>

      <TabsContent value="tasks" className="space-y-6 mt-6">
        <TaskAnalyticsCards
          totalTasks={totalTasks}
          tasksDueToday={tasksDueToday}
          overdueTasks={overdueTasks}
          completedTasks={completedTasks}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <TaskPriorityChart data={tasksByPriority} />
          <TaskCompletionChart data={tasksCompletionOverTime} />
        </div>
        <UpcomingTasks
          tasksDueToday={tasksDueToday}
          upcomingTasks={upcomingTasks}
          onToggleComplete={onToggleTaskComplete}
        />
      </TabsContent>

      <TabsContent value="activities" className="space-y-6 mt-6">
        <ActivityAnalyticsCards
          totalActivities={totalActivities}
          callCount={callCount}
          emailCount={emailCount}
          meetingCount={meetingCount}
          noteCount={noteCount}
          activitiesThisWeek={activitiesThisWeek}
          activitiesThisMonth={activitiesThisMonth}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityTypeChart data={activityTypeData} />
          <ActivitiesOverTimeChart data={activitiesOverTime} />
        </div>
        <RecentActivities activities={recentActivities} />
      </TabsContent>
    </Tabs>
  );
}
