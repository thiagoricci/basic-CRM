'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Phone, Mail, Calendar, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Activity } from '@/types/activity';

interface CompanyActivitiesProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
}

export function CompanyActivities({ activities, onActivityClick }: CompanyActivitiesProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      call: Phone,
      email: Mail,
      meeting: Calendar,
      note: User,
    };
    return icons[type] || User;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      call: 'bg-blue-100 text-blue-800',
      email: 'bg-green-100 text-green-800',
      meeting: 'bg-purple-100 text-purple-800',
      note: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities ({activities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No activities recorded for this company</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow
                    key={activity.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onActivityClick?.(activity)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = getActivityIcon(activity.type);
                          return <Icon className="h-4 w-4" />;
                        })()}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getActivityColor(
                            activity.type
                          )}`}
                        >
                          {activity.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{activity.subject}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {activity.contact ? `${activity.contact.firstName} ${activity.contact.lastName}` : 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(activity.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {activity.contact && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onActivityClick?.(activity);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
