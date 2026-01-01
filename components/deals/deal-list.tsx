'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/types/deal';

interface DealListProps {
  deals: Deal[];
  sortField: 'name' | 'value' | 'stage' | 'status' | 'date';
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'value' | 'stage' | 'status' | 'date') => void;
}

const stageColors: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  qualified: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  proposal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  closed_won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed_lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusColors: Record<string, string> = {
  open: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function DealList({
  deals,
  sortField,
  sortDirection,
  onSortChange,
}: DealListProps) {
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground">
        <div
          className="col-span-3 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('name')}
        >
          Deal Name
          <SortIcon field="name" />
        </div>
        <div
          className="col-span-2 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('value')}
        >
          Value
          <SortIcon field="value" />
        </div>
        <div
          className="col-span-2 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('stage')}
        >
          Stage
          <SortIcon field="stage" />
        </div>
        <div
          className="col-span-2 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('status')}
        >
          Status
          <SortIcon field="status" />
        </div>
        <div
          className="col-span-2 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('date')}
        >
          Expected Close
          <SortIcon field="date" />
        </div>
        <div className="col-span-1 flex items-center">Contact</div>
      </div>

      {deals.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No deals found
        </div>
      ) : (
        <div className="divide-y">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="grid grid-cols-12 gap-4 p-4 transition-colors hover:bg-accent"
            >
              <Link
                href={`/deals/${deal.id}`}
                className="col-span-3 flex items-center font-medium hover:underline"
              >
                {deal.name}
              </Link>
              <div className="col-span-2 flex items-center font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(deal.value)}
              </div>
              <div className="col-span-2 flex items-center">
                <Badge className={stageColors[deal.stage]}>
                  {deal.stage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              </div>
              <div className="col-span-2 flex items-center">
                <Badge className={statusColors[deal.status]}>
                  {deal.status.toUpperCase()}
                </Badge>
              </div>
              <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                {new Date(deal.expectedCloseDate).toLocaleDateString()}
              </div>
              <div className="col-span-1 flex items-center text-sm text-muted-foreground">
                {deal.contact
                  ? `${deal.contact.firstName} ${deal.contact.lastName}`
                  : '-'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
