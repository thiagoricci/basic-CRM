'use client';

import { RevenueTrendChart } from './revenue-trend-chart';
import { DealsWonLostChart } from './deals-won-lost-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReportsData } from '@/types/reports';

interface SalesPerformanceTabProps {
  data: ReportsData;
}

export function SalesPerformanceTab({ data }: SalesPerformanceTabProps) {
  return (
    <div className="space-y-6">
      {/* Revenue Trend */}
      <RevenueTrendChart data={data.revenueOverTime} />

      {/* Deals Won vs Lost */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DealsWonLostChart data={data.dealsWonLost} />
        <Card>
          <CardHeader>
            <CardTitle>Average Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${data.averageDealSize.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Win Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{data.winRate.toFixed(1)}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
