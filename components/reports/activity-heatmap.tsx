'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Phone, Mail, Users, FileText } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';
import type { ActivityHeatmapData, ActivityCard } from '@/types/reports';

interface ActivityHeatmapProps {
  data: ActivityHeatmapData[];
}

const ACTIVITY_COLORS = {
  call: '#3b82f6',
  email: '#10b981',
  meeting: '#f59e0b',
  note: '#8b5cf6',
};

const ACTIVITY_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText,
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const handleExport = () => {
    // Flatten activities for CSV export
    const flattenedActivities = data.flatMap((dayData) =>
      dayData.activities.map((activity) => ({
        day: DAY_NAMES[dayData.day],
        ...activity,
      }))
    );
    exportToCSV(flattenedActivities, 'activity-calendar');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity Calendar</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {data.map((dayData) => (
            <div key={dayData.day} className="flex flex-col h-full">
              {/* Day Header */}
              <div className="text-center font-medium mb-3 pb-2 border-b">
                {DAY_NAMES[dayData.day]}
              </div>

              {/* Activity Cards */}
              <div className="flex-1 space-y-2 max-h-96 overflow-y-auto pr-1">
                {dayData.activities.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No activities
                  </div>
                ) : (
                  dayData.activities.map((activity) => (
                    <ActivityCardItem key={activity.id} activity={activity} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityCardItem({ activity }: { activity: ActivityCard }) {
  const color = ACTIVITY_COLORS[activity.type];
  const Icon = ACTIVITY_ICONS[activity.type];

  const time = new Date(activity.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleClick = () => {
    window.location.href = `/activities/${activity.id}`;
  };

  return (
    <div
      className="p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors"
      style={{ borderLeft: `3px solid ${color}` }}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={activity.subject}>
            {activity.subject}
          </p>
          <p className="text-xs text-muted-foreground truncate" title={activity.contactName}>
            {activity.contactName}
          </p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
}
