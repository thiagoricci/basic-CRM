'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ActivityTypeChartProps {
  data: {
    type: string;
    count: number;
    color: string;
  }[];
}

const DEFAULT_DATA = [
  { type: 'Call', count: 0, color: '#3b82f6' },
  { type: 'Email', count: 0, color: '#8b5cf6' },
  { type: 'Meeting', count: 0, color: '#10b981' },
  { type: 'Note', count: 0, color: '#f59e0b' },
];

export function ActivityTypeChart({ data }: ActivityTypeChartProps) {
  const chartData = data.length > 0 ? data : DEFAULT_DATA;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Types</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ type, count }) => (count > 0 ? type : '')}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              formatter={(value, entry: any) => entry.payload.type}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
