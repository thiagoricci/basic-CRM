'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, TrendingUp, Percent } from 'lucide-react';

interface AnalyticsCardsProps {
  totalContacts: number;
  totalLeads: number;
  totalCustomers: number;
  conversionRate: number;
}

export function AnalyticsCards({
  totalContacts,
  totalLeads,
  totalCustomers,
  conversionRate,
}: AnalyticsCardsProps) {
  const cards = [
    {
      title: 'Total Contacts',
      value: totalContacts,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Total Leads',
      value: totalLeads,
      icon: UserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: Percent,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 dark:bg-violet-950',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
