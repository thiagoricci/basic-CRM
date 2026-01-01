'use client';

import { Deal } from '@/types/deal';
import { DealCard } from '@/components/deals/deal-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droppable } from '@hello-pangea/dnd';

interface DealKanbanColumnProps {
  stage: string;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

const stageLabels: Record<string, string> = {
  lead: 'Lead / Prospecting',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

const stageColors: Record<string, string> = {
  lead: 'border-l-4 border-l-gray-400',
  qualified: 'border-l-4 border-l-blue-400',
  proposal: 'border-l-4 border-l-purple-400',
  negotiation: 'border-l-4 border-l-orange-400',
  closed_won: 'border-l-4 border-l-green-400',
  closed_lost: 'border-l-4 border-l-red-400',
};

export function DealKanbanColumn({
  stage,
  deals,
  onDealClick,
}: DealKanbanColumnProps) {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card
      className={`flex flex-col h-full min-w-[300px] max-w-[350px] ${stageColors[stage]}`}
    >
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">
            {stageLabels[stage]}
          </h3>
          <Badge variant="secondary">{deals.length}</Badge>
        </div>
        {totalValue > 0 && (
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalValue)}
          </p>
        )}
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-muted/30' : ''
            }`}
          >
            {deals.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No deals in this stage
              </div>
            ) : (
              deals.map((deal, index) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  index={index}
                  onClick={() => onDealClick(deal)}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );
}
