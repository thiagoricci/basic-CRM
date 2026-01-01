export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string | null;
  contactId: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityInput {
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description?: string;
  contactId: string;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';
