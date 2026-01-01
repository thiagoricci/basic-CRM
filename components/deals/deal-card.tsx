'use client';

import { Deal } from '@/types/deal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DollarSign, Calendar, User } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  index: number;
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

export function DealCard({ deal, onClick, index }: DealCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
            }`}
            onClick={onClick}
          >
        <div className="space-y-3">
          {/* Header with name and value */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2">{deal.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(deal.value)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          {deal.contact && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="line-clamp-1">
                {deal.contact.firstName} {deal.contact.lastName}
              </span>
            </div>
          )}

          {/* Expected close date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Expected: {formatDate(deal.expectedCloseDate)}</span>
          </div>

          {/* Stage and status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={stageColors[deal.stage]}>
              {deal.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge className={statusColors[deal.status]}>
              {deal.status.toUpperCase()}
            </Badge>
          </div>

          {/* Probability bar */}
          {deal.probability !== null && deal.probability > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Probability</span>
                <span>{deal.probability}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    deal.probability >= 75
                      ? 'bg-green-500'
                      : deal.probability >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${deal.probability}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
        </div>
      )}
    </Draggable>
  );
}
