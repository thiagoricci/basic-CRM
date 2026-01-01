'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TasksCompletedOverTime } from './tasks-completed-over-time';
import { OverdueTasksTrend } from './overdue-tasks-trend';
import type { ReportsData } from '@/types/reports';

interface TaskAnalyticsTabProps {
  data: ReportsData;
}

export function TaskAnalyticsTab({ data }: TaskAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data.taskCompletionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Time to Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data.averageTimeToComplete.toFixed(1)} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data.overdueTasksTrend[data.overdueTasksTrend.length - 1]?.count || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TasksCompletedOverTime data={data.tasksCompletedOverTime} />
        <OverdueTasksTrend data={data.overdueTasksTrend} />
      </div>
    </div>
  );
}
