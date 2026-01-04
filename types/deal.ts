import type { Company } from './company';
import type { User } from './user';

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: Date;
  actualCloseDate: Date | null;
  status: DealStatus;
  probability: number | null;
  description: string | null;
  contactId: string;
  userId?: string | null;
  contact?: Contact;
  companyId?: string | null;
  company?: Company;
  user?: User | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealInput {
  name: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string;
  actualCloseDate?: string;
  status: DealStatus;
  probability?: number;
  description?: string;
  contactId: string;
  companyId?: string | null;
  userId?: string | null;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type DealStatus = 'open' | 'won' | 'lost';

export interface DealMetrics {
  totalPipelineValue: number;
  wonDealsValue: number;
  lostDealsValue: number;
  winRate: number;
  dealsByStage: Record<DealStage, number>;
  averageDealSize: number;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  status: 'lead' | 'customer';
  createdAt: Date;
  updatedAt: Date;
}
