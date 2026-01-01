export interface ReportsData {
  // Sales Performance
  revenueOverTime: { date: string; revenue: number }[];
  dealsWonLost: { status: 'won' | 'lost'; count: number; value: number }[];
  averageDealSize: number;
  winRate: number;

  // Pipeline Analytics
  dealsByStage: { stage: string; count: number; value: number }[];
  averageTimeInStage: { stage: string; days: number }[];
  pipelineVelocity: number;

  // Activity Metrics
  activitiesByType: { type: string; count: number }[];
  activitiesOverTime: { date: string; count: number }[];
  activityHeatmap: ActivityHeatmapData[];
  topContactsByActivity: { contactId: string; name: string; count: number }[];
  topCompaniesByActivity: { companyId: string; name: string; count: number }[];

  // Task Analytics
  taskCompletionRate: number;
  overdueTasksTrend: { date: string; count: number }[];
  tasksCompletedOverTime: { date: string; count: number }[];
  averageTimeToComplete: number;

  // Conversion Funnel
  conversionFunnel: {
    stage: string;
    count: number;
    conversionRate: number;
    dropOffRate: number;
  }[];

  // Top Performers
  topCompaniesByDealValue: { companyId: string; name: string; totalValue: number }[];
  biggestDealsWonThisMonth: {
    dealId: string;
    name: string;
    value: number;
    contactName: string;
  }[];
  topContactsByDealValue: { contactId: string; name: string; totalValue: number }[];
}

export interface ActivityHeatmapData {
  day: number;
  activities: ActivityCard[];
}

export interface ActivityCard {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string | null;
  createdAt: Date;
  contactId: string;
  contactName: string;
}
