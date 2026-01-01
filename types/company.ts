import type { Contact } from './contact';
import type { Deal } from './deal';
import type { Activity } from './activity';
import type { Task } from './task';

export interface Company {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  employeeCount?: number | null;
  revenue?: number | null;
  createdAt: Date;
  updatedAt: Date;
  contacts?: Contact[];
  deals?: Deal[];
  activities?: Activity[];
  tasks?: Task[];
}

export interface CompanyWithRelations extends Company {
  _count?: {
    contacts: number;
    deals: number;
  };
}
