'use client';

import { ConversionFunnelChart } from './conversion-funnel-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ReportsData } from '@/types/reports';

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
              {data.conversionFunnel.map((stage: { stage: string; count: number; conversionRate: number; dropOffRate: number }) => (
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
