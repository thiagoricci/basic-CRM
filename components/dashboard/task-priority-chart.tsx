'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TaskPriorityChartProps {
  data: {
    priority: string;
    count: number;
    color: string;
  }[];
}

const DEFAULT_DATA = [
  { priority: 'Low', count: 0, color: '#3b82f6' },
  { priority: 'Medium', count: 0, color: '#f59e0b' },
  { priority: 'High', count: 0, color: '#ef4444' },
];

export function TaskPriorityChart({ data }: TaskPriorityChartProps) {
  const chartData = data.length > 0 ? data : DEFAULT_DATA;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Priority Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ priority, count }) => (count > 0 ? priority : '')}
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
              formatter={(value, entry: any) => entry.payload.priority}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
