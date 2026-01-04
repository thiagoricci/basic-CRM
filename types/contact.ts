import type { Company } from './company';
import type { User } from './user';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  status: 'lead' | 'customer';
  jobTitle?: string | null;
  companyId?: string | null;
  company?: Company;
  userId?: string | null;
  user?: User | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  status: 'lead' | 'customer';
  jobTitle?: string;
  companyId?: string | null;
  userId?: string | null;
}

export type ContactStatus = 'lead' | 'customer';
