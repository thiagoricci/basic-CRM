'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesPerformanceTab } from './sales-performance-tab';
import { PipelineAnalyticsTab } from './pipeline-analytics-tab';
import { ActivityMetricsTab } from './activity-metrics-tab';
import { TaskAnalyticsTab } from './task-analytics-tab';
import { ConversionFunnelTab } from './conversion-funnel-tab';
import { TopPerformersTab } from './top-performers-tab';
import type { ReportsData } from '@/types/reports';

interface ReportsTabsProps {
  data: ReportsData;
}

export function ReportsTabs({ data }: ReportsTabsProps) {
  return (
    <Tabs defaultValue="sales-performance" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="sales-performance">Sales Performance</TabsTrigger>
        <TabsTrigger value="pipeline-analytics">Pipeline Analytics</TabsTrigger>
        <TabsTrigger value="activity-metrics">Activity Metrics</TabsTrigger>
        <TabsTrigger value="task-analytics">Task Analytics</TabsTrigger>
        <TabsTrigger value="conversion-funnel">Conversion Funnel</TabsTrigger>
        <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
      </TabsList>

      <TabsContent value="sales-performance" className="space-y-6 mt-6">
        <SalesPerformanceTab data={data} />
      </TabsContent>

      <TabsContent value="pipeline-analytics" className="space-y-6 mt-6">
        <PipelineAnalyticsTab data={data} />
      </TabsContent>

      <TabsContent value="activity-metrics" className="space-y-6 mt-6">
        <ActivityMetricsTab data={data} />
      </TabsContent>

      <TabsContent value="task-analytics" className="space-y-6 mt-6">
        <TaskAnalyticsTab data={data} />
      </TabsContent>

      <TabsContent value="conversion-funnel" className="space-y-6 mt-6">
        <ConversionFunnelTab data={data} />
      </TabsContent>

      <TabsContent value="top-performers" className="space-y-6 mt-6">
        <TopPerformersTab data={data} />
      </TabsContent>
    </Tabs>
  );
}
