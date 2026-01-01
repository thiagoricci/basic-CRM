'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/types/activity';

interface RecentActivitiesProps {
  activities: Activity[];
}

const getActivityTypeColor = (type: string) => {
  switch (type) {
    case 'call':
      return 'default';
    case 'email':
      return 'secondary';
    case 'meeting':
      return 'outline';
    case 'note':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getActivityTypeIcon = (type: string) => {
  switch (type) {
    case 'call':
      return '📞';
    case 'email':
      return '📧';
    case 'meeting':
      return '📅';
    case 'note':
      return '📝';
    default:
      return '📌';
  }
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const recentActivities = activities.slice(0, 5);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/activities/${activity.id}`}
                  className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getActivityTypeColor(activity.type) as any}>
                        {getActivityTypeIcon(activity.type)} {activity.type}
                      </Badge>
                    </div>
                    <span className="font-medium">{activity.subject}</span>
                    <span className="text-sm text-muted-foreground">
                      {activity.contact?.firstName} {activity.contact?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No activities yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
