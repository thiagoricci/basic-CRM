'use client';

import { ActivityTypeChart } from './activity-type-chart';
import { ActivityOverTimeChart } from './activity-over-time-chart';
import { ActivityHeatmap } from './activity-heatmap';
import { TopContactsByActivity } from './top-contacts-by-activity';
import { TopCompaniesByActivity } from './top-companies-by-activity';
import type { ReportsData } from '@/types/reports';

interface ActivityMetricsTabProps {
  data: ReportsData;
}

export function ActivityMetricsTab({ data }: ActivityMetricsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityTypeChart data={data.activitiesByType} />
        <ActivityOverTimeChart data={data.activitiesOverTime} />
      </div>

      <ActivityHeatmap data={data.activityHeatmap} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopContactsByActivity data={data.topContactsByActivity} />
        <TopCompaniesByActivity data={data.topCompaniesByActivity} />
      </div>
    </div>
  );
}
