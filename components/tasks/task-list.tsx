'use client';

import { Task } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
}

export function TaskList({ tasks, onToggleComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={`p-4 hover:shadow-md transition-shadow ${
            task.completed ? 'opacity-60' : ''
          } ${
            isOverdue(task) && !task.completed
              ? 'border-destructive bg-destructive/5'
              : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) =>
                onToggleComplete(task.id, checked as boolean)
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
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

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

              {task.completed && task.completedAt && (
                <div className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    Completed {format(new Date(task.completedAt), 'MMM d')}
                  </span>
                </div>
              )}

              {task.contact && (
                <Link
                  href={`/contacts/${task.contact.id}`}
                  className="text-primary hover:underline font-medium"
                >
                  {task.contact.firstName} {task.contact.lastName}
                </Link>
              )}
            </div>
          </div>
        </Card>
      ))}
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
    <Badge className={colors[priority]} variant="secondary">
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
