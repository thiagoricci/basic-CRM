'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

interface BiggestDealsWonThisMonthProps {
  data: {
    dealId: string;
    name: string;
    value: number;
    contactName: string;
  }[];
}

export function BiggestDealsWonThisMonth({ data }: BiggestDealsWonThisMonthProps) {
  const handleExport = () => {
    exportToCSV(data, 'biggest-deals-won-this-month');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Biggest Deals Won This Month</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No deals won this month
                </TableCell>
              </TableRow>
            ) : (
              data.map((deal) => (
                <TableRow key={deal.dealId}>
                  <TableCell>{deal.name}</TableCell>
                  <TableCell>{deal.contactName}</TableCell>
                  <TableCell className="text-right">
                    ${deal.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
