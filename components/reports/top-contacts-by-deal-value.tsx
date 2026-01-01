'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

interface TopContactsByDealValueProps {
  data: { contactId: string; name: string; totalValue: number }[];
}

export function TopContactsByDealValue({ data }: TopContactsByDealValueProps) {
  const handleExport = () => {
    exportToCSV(data, 'top-contacts-by-deal-value');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Contacts by Deal Value</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Total Deal Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((contact, index) => (
              <TableRow key={contact.contactId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell className="text-right">
                  ${contact.totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
