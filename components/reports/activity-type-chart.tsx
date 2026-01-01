'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

interface ActivityTypeChartProps {
  data: { type: string; count: number }[];
}

const COLORS = {
  call: '#3b82f6',
  email: '#10b981',
  meeting: '#f59e0b',
  note: '#8b5cf6',
};

export function ActivityTypeChart({ data }: ActivityTypeChartProps) {
  const handleExport = () => {
    exportToCSV(data, 'activity-type');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activities by Type</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.type}: ${entry.count}`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.type as keyof typeof COLORS] || '#6b7280'}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [value, 'Count']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
