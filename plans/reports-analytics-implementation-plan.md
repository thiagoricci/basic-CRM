# Reports & Analytics - Implementation Plan

## Overview

This document provides a detailed, step-by-step implementation plan for the Reports & Analytics feature. Each step includes specific files to create/modify, code examples, and important considerations.

## Phase 1: Foundation (Week 1)

### Step 1.1: Database Schema Changes

**Files to modify:**

- `prisma/schema.prisma`

**Action:** Add DealStageHistory model to track stage transitions

```prisma
model DealStageHistory {
  id        String   @id @default(uuid())
  dealId    String
  deal      Deal     @relation(fields: [dealId], references: [id], onDelete: Cascade)
  fromStage String?
  toStage   String
  changedAt DateTime @default(now())

  @@index([dealId])
  @@index([changedAt])
  @@index([toStage])
}
```

**Update Deal model:**

```prisma
model Deal {
  // ... existing fields ...
  stageHistory DealStageHistory[]
}
```

**Run migration:**

```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

**Important notes:**

- This change is required for pipeline velocity analytics
- Existing deals won't have history (only new stage transitions will be tracked)
- Consider backfilling stage history for existing deals if needed

### Step 1.2: Create Reports API Endpoint

**Files to create:**

- `app/api/reports/route.ts`

**Action:** Create comprehensive reports endpoint with date range filtering

```typescript
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

// Helper functions for each data fetch
async function fetchRevenueOverTime(start: Date, end: Date, groupBy: string) {
  // Implementation for revenue aggregation
}

// ... other helper functions
```

**Important notes:**

- Use Promise.all for parallel data fetching
- Implement proper date parsing and validation
- Add error handling for each helper function
- Consider caching for expensive queries

### Step 1.3: Create CSV Export Utility

**Files to create:**

- `lib/csv-export.ts`

**Action:** Create utility functions for CSV export

```typescript
export function exportToCSV<T>(data: T[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]) as (keyof T)[];
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle nested objects, dates, and special characters
          if (value instanceof Date) {
            return value.toISOString();
          }
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          // Escape quotes and commas
          const stringValue = String(value ?? '');
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

**Important notes:**

- Handle nested objects and dates properly
- Escape special characters (commas, quotes, newlines)
- Add BOM for Excel compatibility if needed
- Test with various data types

### Step 1.4: Create Date Range Filter Component

**Files to create:**

- `components/reports/date-range-filter.tsx`

**Action:** Create reusable date range filter with presets

```typescript
'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset?: 'today' | 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'custom';
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'Today', value: 'today' as const },
    { label: 'This Week', value: 'thisWeek' as const },
    { label: 'This Month', value: 'thisMonth' as const },
    { label: 'This Quarter', value: 'thisQuarter' as const },
    { label: 'Custom', value: 'custom' as const },
  ];

  const handlePresetChange = (preset: DateRange['preset']) => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now.setHours(23, 59, 59, 999));

    switch (preset) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'thisWeek':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      default:
        startDate = value.startDate;
    }

    onChange({ startDate, endDate, preset });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value.preset || 'custom'}
        onValueChange={(v) => handlePresetChange(v as DateRange['preset'])}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
            <Calendar className="mr-2 h-4 w-4" />
            {format(value.startDate, 'MMM dd, yyyy')} - {format(value.endDate, 'MMM dd, yyyy')}
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarComponent
            mode="range"
            selected={{ from: value.startDate, to: value.endDate }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange({ startDate: range.from, endDate: range.to, preset: 'custom' });
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

**Important notes:**

- Install date-fns: `npm install date-fns`
- Use shadcn/ui Calendar and Popover components
- Handle timezone considerations
- Ensure preset logic matches business requirements

## Phase 2: Core Reports Components (Week 1-2)

### Step 2.1: Create Reports Page

**Files to create:**

- `app/reports/page.tsx`

**Action:** Create main reports page with tabbed interface

```typescript
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { DateRangeFilter, DateRange } from '@/components/reports/date-range-filter';
import { ReportsTabs } from '@/components/reports/reports-tabs';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface ReportsData {
  // ... all report data types
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    preset: 'thisMonth',
  });

  const [isExporting, setIsExporting] = useState(false);

  const { data, error, isLoading } = useSWR<ReportsData>(
    `/api/reports?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60000,
      dedupingInterval: 5000,
    }
  );

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      // Export all reports data
      // Implementation depends on export utility
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container space-y-8 py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container space-y-8 py-8">
        <p className="text-red-500">Failed to load reports data</p>
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <Button onClick={handleExportAll} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export All
        </Button>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* Reports Tabs */}
      <ReportsTabs data={data} />
    </div>
  );
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch reports data');
  }
  return response.json();
};
```

**Important notes:**

- Use SWR for efficient data fetching
- Implement loading and error states
- Add export functionality
- Follow dashboard pattern for consistency

### Step 2.2: Create Reports Tabs Component

**Files to create:**

- `components/reports/reports-tabs.tsx`

**Action:** Create tabbed interface for different report categories

```typescript
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesPerformanceTab } from './sales-performance-tab';
import { PipelineAnalyticsTab } from './pipeline-analytics-tab';
import { ActivityMetricsTab } from './activity-metrics-tab';
import { TaskAnalyticsTab } from './task-analytics-tab';
import { ConversionFunnelTab } from './conversion-funnel-tab';
import { TopPerformersTab } from './top-performers-tab';

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
```

**Important notes:**

- Follow dashboard tabs pattern for consistency
- Each tab is a separate component for maintainability
- Use shadcn/ui Tabs component

### Step 2.3: Create Sales Performance Tab

**Files to create:**

- `components/reports/sales-performance-tab.tsx`
- `components/reports/revenue-trend-chart.tsx`

**Action:** Implement sales performance analytics

```typescript
'use client';

import { RevenueTrendChart } from './revenue-trend-chart';
import { DealsWonLostChart } from './deals-won-lost-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
              ${data.averageDealSize.toLocaleString()}
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
```

```typescript
'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

interface RevenueTrendChartProps {
  data: { date: string; revenue: number }[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const handleExport = () => {
    exportToCSV(data, 'revenue-trend');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue Over Time</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

**Important notes:**

- Use Recharts for visualizations
- Add export button to each chart
- Format currency values appropriately
- Handle empty data states

### Step 2.4: Create Conversion Funnel Tab

**Files to create:**

- `components/reports/conversion-funnel-tab.tsx`
- `components/reports/conversion-funnel-chart.tsx`

**Action:** Implement conversion funnel visualization

```typescript
'use client';

import { ConversionFunnelChart } from './conversion-funnel-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ConversionFunnelTabProps {
  data: ReportsData;
}

export function ConversionFunnelTab({ data }: ConversionFunnelTabProps) {
  return (
    <div className="space-y-6">
      <ConversionFunnelChart data={data.conversionFunnel} />

      <Card>
        <CardHeader>
          <CardTitle>Conversion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Drop-off Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.conversionFunnel.map((stage) => (
                <TableRow key={stage.stage}>
                  <TableCell>{stage.stage}</TableCell>
                  <TableCell>{stage.count}</TableCell>
                  <TableCell>{stage.conversionRate.toFixed(1)}%</TableCell>
                  <TableCell>{stage.dropOffRate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

```typescript
'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

interface ConversionFunnelChartProps {
  data: {
    stage: string;
    count: number;
    conversionRate: number;
    dropOffRate: number;
  }[];
}

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const handleExport = () => {
    exportToCSV(data, 'conversion-funnel');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Conversion Funnel</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={100} />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'count' ? value : `${value.toFixed(1)}%`,
                name === 'count' ? 'Count' : name,
              ]}
            />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

**Important notes:**

- Funnel chart uses horizontal bar chart
- Show both count and percentages
- Include conversion and drop-off rates
- Add export functionality

## Phase 3: Advanced Analytics (Week 2-3)

### Step 3.1: Create Activity Metrics Tab

**Files to create:**

- `components/reports/activity-metrics-tab.tsx`
- `components/reports/activity-heatmap.tsx`
- `components/reports/top-contacts-by-activity.tsx`

**Action:** Implement activity metrics with heatmap and leaderboards

```typescript
'use client';

import { ActivityTypeChart } from './activity-type-chart';
import { ActivityOverTimeChart } from './activity-over-time-chart';
import { ActivityHeatmap } from './activity-heatmap';
import { TopContactsByActivity } from './top-contacts-by-activity';
import { TopCompaniesByActivity } from './top-companies-by-activity';

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
```

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

interface ActivityHeatmapProps {
  data: { day: string; hour: number; count: number }[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const handleExport = () => {
    exportToCSV(data, 'activity-heatmap');
  };

  // Group data by day and hour for heatmap display
  const heatmapData = data.reduce((acc, item) => {
    const key = `${item.day}-${item.hour}`;
    acc[key] = item.count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity Heatmap</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div key={dayIndex} className="space-y-1">
              <div className="text-xs text-muted-foreground">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]}
              </div>
              {Array.from({ length: 24 }).map((_, hourIndex) => {
                const key = `${dayIndex}-${hourIndex}`;
                const count = heatmapData[key] || 0;
                const intensity = Math.min(count / 10, 1); // Normalize to 0-1

                return (
                  <div
                    key={hourIndex}
                    className="h-6 rounded-sm"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                    }}
                    title={`${hourIndex}:00 - ${count} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Important notes:**

- Heatmap shows activity intensity by day and hour
- Use color opacity to represent activity count
- Include tooltips for detailed information
- Export functionality

### Step 3.2: Create Task Analytics Tab

**Files to create:**

- `components/reports/task-analytics-tab.tsx`
- `components/reports/tasks-completed-over-time.tsx`

**Action:** Implement task analytics with completion trends

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TasksCompletedOverTime } from './tasks-completed-over-time';
import { OverdueTasksTrend } from './overdue-tasks-trend';

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
```

**Important notes:**

- Show key metrics at top
- Display trends over time
- Use line charts for time series data
- Export functionality

### Step 3.3: Create Top Performers Tab

**Files to create:**

- `components/reports/top-performers-tab.tsx`
- `components/reports/top-companies-by-deal-value.tsx`
- `components/reports/biggest-deals-won-this-month.tsx`

**Action:** Implement top performers leaderboards

```typescript
'use client';

import { TopCompaniesByDealValue } from './top-companies-by-deal-value';
import { TopContactsByActivity } from './top-contacts-by-activity';
import { BiggestDealsWonThisMonth } from './biggest-deals-won-this-month';
import { TopContactsByDealValue } from './top-contacts-by-deal-value';

interface TopPerformersTabProps {
  data: ReportsData;
}

export function TopPerformersTab({ data }: TopPerformersTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <TopCompaniesByDealValue data={data.topCompaniesByDealValue} />
        <TopContactsByActivity data={data.topContactsByActivity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BiggestDealsWonThisMonth data={data.biggestDealsWonThisMonth} />
        <TopContactsByDealValue data={data.topContactsByDealValue} />
      </div>
    </div>
  );
}
```

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

interface TopCompaniesByDealValueProps {
  data: { companyId: string; name: string; totalValue: number }[];
}

export function TopCompaniesByDealValue({ data }: TopCompaniesByDealValueProps) {
  const handleExport = () => {
    exportToCSV(data, 'top-companies-by-deal-value');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Companies by Deal Value</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Total Deal Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((company, index) => (
              <TableRow key={company.companyId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell className="text-right">
                  ${company.totalValue.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

**Important notes:**

- Show rankings for top performers
- Use tables for detailed lists
- Format currency values appropriately
- Export functionality

## Phase 4: Integration and Polish (Week 3)

### Step 4.1: Update Navigation

**Files to modify:**

- `components/layout/navigation.tsx`

**Action:** Add Reports link to navigation

```typescript
import { BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Reports', icon: BarChart3 }, // Add this
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/activities', label: 'Activities', icon: FileText },
];
```

**Important notes:**

- Place Reports after Dashboard for logical flow
- Use appropriate icon (BarChart3)
- Test navigation on mobile and desktop

### Step 4.2: Add Print Styles

**Files to create:**

- `app/reports/globals.css` (or add to existing globals.css)

**Action:** Add print-specific styles

```css
@media print {
  .no-print {
    display: none !important;
  }

  .print-break {
    page-break-before: always;
  }

  .chart-container {
    page-break-inside: avoid;
  }

  @page {
    margin: 1cm;
  }

  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```

**Important notes:**

- Hide navigation and buttons during print
- Prevent page breaks in middle of charts
- Ensure colors print correctly
- Test print preview

### Step 4.3: Add Loading States

**Action:** Ensure all components have proper loading states

```typescript
// Example loading skeleton
{isLoading ? (
  <div className="animate-pulse space-y-4">
    <div className="h-8 w-48 bg-muted rounded" />
    <div className="h-4 w-64 bg-muted rounded" />
  </div>
) : (
  // Actual content
)}
```

**Important notes:**

- Use consistent loading patterns
- Match skeleton to actual content layout
- Provide feedback for long-running operations

### Step 4.4: Add Error Handling

**Action:** Implement comprehensive error handling

```typescript
// Example error boundary
if (error) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">
            Failed to load report data
          </p>
          <Button onClick={() => mutate()}>
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Important notes:**

- Provide clear error messages
- Offer retry functionality
- Log errors for debugging
- Graceful degradation

## Phase 5: Testing and Documentation (Week 3-4)

### Step 5.1: Test All Components

**Action:** Comprehensive testing checklist

- [ ] All charts render correctly
- [ ] Date range filters work properly
- [ ] Export functionality works for all reports
- [ ] Print layout is correct
- [ ] Loading states display properly
- [ ] Error states display properly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG AA standards

### Step 5.2: Performance Testing

**Action:** Measure and optimize performance

- [ ] API response time < 2 seconds
- [ ] Page load time < 3 seconds
- [ ] Chart rendering time < 500ms
- [ ] Export generation time < 1 second
- [ ] Memory usage is reasonable
- [ ] No memory leaks

### Step 5.3: Update Documentation

**Files to update:**

- `.kilocode/rules/memory-bank/context.md`
- `.kilocode/rules/memory-bank/architecture.md`
- `docs/API_DOCUMENTATION.md`

**Action:** Document new Reports feature

**Important notes:**

- Update architecture diagram
- Document new API endpoints
- Add component relationships
- Update feature list

## Summary

This implementation plan provides a structured approach to building the Reports & Analytics feature in phases:

1. **Phase 1 (Week 1):** Foundation - Database changes, API endpoints, utility functions
2. **Phase 2 (Week 1-2):** Core Reports - Main page, tabs, basic analytics
3. **Phase 3 (Week 2-3):** Advanced Analytics - Heatmaps, leaderboards, trends
4. **Phase 4 (Week 3):** Integration - Navigation, print styles, polish
5. **Phase 5 (Week 3-4):** Testing - Comprehensive testing and documentation

Each phase builds on the previous one, allowing for incremental development and testing. The plan includes specific files, code examples, and important considerations for each step.

## Next Steps

After reviewing this plan:

1. Approve or modify the implementation plan
2. Switch to Code mode to begin implementation
3. Start with Phase 1: Foundation
4. Follow steps in order
5. Test each phase before moving to the next
