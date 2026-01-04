import type { User } from './user';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt: Date | null;
  contactId: string;
  userId?: string | null;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  user?: User | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskInput {
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  contactId: string;
  userId?: string | null;
}

export type TaskStatus = 'open' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';
