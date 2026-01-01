'use client';

import { PipelineFunnelChart } from './pipeline-funnel-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReportsData } from '@/types/reports';

interface PipelineAnalyticsTabProps {
  data: ReportsData;
}

export function PipelineAnalyticsTab({ data }: PipelineAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <PipelineFunnelChart data={data.dealsByStage} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average Time in Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.averageTimeInStage.map((stage: { stage: string; days: number }) => (
                <div key={stage.stage} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{stage.stage}</span>
                  <span className="font-medium">{stage.days.toFixed(1)} days</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.pipelineVelocity.toFixed(1)} days</p>
            <p className="text-sm text-muted-foreground">
              Average time from lead to won
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
