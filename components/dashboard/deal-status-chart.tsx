'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DealStatusChartProps {
  openDealsCount: number;
  openDealsValue: number;
  wonDealsCount: number;
  wonDealsValue: number;
  lostDealsCount: number;
  lostDealsValue: number;
}

const statusColors: Record<string, string> = {
  open: '#3b82f6',
  won: '#10b981',
  lost: '#ef4444',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  won: 'Won',
  lost: 'Lost',
};

export function DealStatusChart({
  openDealsCount,
  openDealsValue,
  wonDealsCount,
  wonDealsValue,
  lostDealsCount,
  lostDealsValue,
}: DealStatusChartProps) {
  const data = [
    {
      name: statusLabels.open,
      value: openDealsValue,
      count: openDealsCount,
      status: 'open',
    },
    {
      name: statusLabels.won,
      value: wonDealsValue,
      count: wonDealsCount,
      status: 'won',
    },
    {
      name: statusLabels.lost,
      value: lostDealsValue,
      count: lostDealsCount,
      status: 'lost',
    },
  ].filter((item) => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deals by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No deals found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Deals by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => {
                  return `${entry.name}: ${entry.count} deals`;
                }}
                outerRadius={80}
              >
                {data.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={statusColors[(entry as any).status] || '#94a3b8'}
                  />
                ))}
              </Pie>
              <Legend
                formatter={(value, entry: any) => entry.payload.name}
              />
              <Tooltip
                content={(props: any) => {
                  if (!props.active || !props.payload) return null;
                  const payload = props.payload as any;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{payload[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].count} deals
                      </p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
