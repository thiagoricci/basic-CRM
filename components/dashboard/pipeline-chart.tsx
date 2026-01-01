'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PipelineChartProps {
  dealsByStage: Record<string, { value: number; count: number }>;
}

const stageColors: Record<string, string> = {
  lead: '#9ca3af',
  qualified: '#3b82f6',
  proposal: '#8b5cf6',
  negotiation: '#f97316',
  closed_won: '#10b981',
  closed_lost: '#ef4444',
};

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export function PipelineChart({ dealsByStage }: PipelineChartProps) {
  const data = Object.entries(dealsByStage)
    .filter(([_, data]) => data.value > 0)
    .map(([stage, data]) => ({
      name: stageLabels[stage] || stage,
      value: data.value,
      count: data.count,
      stage,
    }));

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
          <CardTitle>Deals by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No deals in pipeline
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Deals by Stage</CardTitle>
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
                    fill={stageColors[(entry as any).stage] || '#94a3b8'}
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
