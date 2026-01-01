import type { Company } from './company';

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
  companyId?: string;
}

export type ContactStatus = 'lead' | 'customer';
