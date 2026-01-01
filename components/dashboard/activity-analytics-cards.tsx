'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Phone, Mail, Calendar, FileText } from 'lucide-react';

interface ActivityAnalyticsCardsProps {
  totalActivities: number;
  callCount: number;
  emailCount: number;
  meetingCount: number;
  noteCount: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
}

export function ActivityAnalyticsCards({
  totalActivities,
  callCount,
  emailCount,
  meetingCount,
  noteCount,
  activitiesThisWeek,
  activitiesThisMonth,
}: ActivityAnalyticsCardsProps) {
  const cards = [
    {
      title: 'Total Activities',
      value: totalActivities,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'This Week',
      value: activitiesThisWeek,
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      title: 'This Month',
      value: activitiesThisMonth,
      icon: FileText,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 dark:bg-violet-950',
    },
    {
      title: 'Most Common',
      value: getMostCommonActivity(callCount, emailCount, meetingCount, noteCount),
      icon: getMostCommonIcon(callCount, emailCount, meetingCount, noteCount),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
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

function getMostCommonActivity(call: number, email: number, meeting: number, note: number): string {
  const max = Math.max(call, email, meeting, note);
  if (max === 0) return 'None';
  if (max === call) return 'Calls';
  if (max === email) return 'Emails';
  if (max === meeting) return 'Meetings';
  return 'Notes';
}

function getMostCommonIcon(call: number, email: number, meeting: number, note: number): any {
  const max = Math.max(call, email, meeting, note);
  if (max === call) return Phone;
  if (max === email) return Mail;
  if (max === meeting) return Calendar;
  return FileText;
}
