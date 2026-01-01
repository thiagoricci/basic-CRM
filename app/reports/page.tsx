'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { DateRangeFilter, DateRange } from '@/components/reports/date-range-filter';
import { ReportsTabs } from '@/components/reports/reports-tabs';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { ReportsData } from '@/types/reports';
import './globals.css';

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
      // Export all reports data - placeholder for now
      console.log('Exporting all reports data');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container space-y-8 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container space-y-8 py-8">
        <div className="flex items-center justify-center">
          <p className="text-red-500">Failed to load reports data</p>
        </div>
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
  const result = await response.json();
  return result.data;
};
