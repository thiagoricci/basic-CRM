import type { User } from './user';

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string | null;
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

export interface ActivityInput {
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description?: string;
  contactId: string;
  userId?: string | null;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';
