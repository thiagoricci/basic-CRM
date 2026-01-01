'use client';

import { Task } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, AlertTriangle, CheckSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UpcomingTasksProps {
  tasksDueToday: number;
  upcomingTasks: Task[];
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
}

export function UpcomingTasks({
  tasksDueToday,
  upcomingTasks,
  onToggleComplete,
}: UpcomingTasksProps) {
  return (
    <div>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
          <Link
            href="/tasks"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-4 p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasksDueToday}</p>
              <p className="text-sm text-muted-foreground">tasks due today</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {upcomingTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No upcoming tasks
            </p>
          ) : (
            upcomingTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                  task.completed ? 'opacity-60' : ''
                } ${
                  isOverdue(task) && !task.completed
                    ? 'bg-destructive/5 border border-destructive/20'
                    : ''
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked: boolean) =>
                    onToggleComplete(task.id, checked)
                  }
                  className="mt-1"
                />

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/tasks/${task.id}`}
                    className={`font-medium hover:underline block ${
                      task.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.title}
                  </Link>

                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    </div>

                    {isOverdue(task) && !task.completed && (
                      <div className="flex items-center gap-1.5 text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Overdue</span>
                      </div>
                    )}

                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <Badge className={`text-xs ${colors[priority]}`} variant="secondary">
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

function isOverdue(task: Task): boolean {
  return (
    !task.completed &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
  );
}
