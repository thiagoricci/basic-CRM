'use client';

import { Deal } from '@/types/deal';
import { DealKanbanColumn } from '@/components/deals/deal-kanban-column';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

interface DealKanbanBoardProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDealsChange: () => void; // Callback to trigger data refresh
}

const stages: Array<{ id: string; label: string }> = [
  { id: 'lead', label: 'Lead / Prospecting' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed_won', label: 'Closed Won' },
  { id: 'closed_lost', label: 'Closed Lost' },
];

export function DealKanbanBoard({
  deals,
  onDealClick,
  onDealsChange,
}: DealKanbanBoardProps) {
  const getDealsByStage = (stageId: string) => {
    return deals.filter((deal) => deal.stage === stageId);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside any droppable area
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the deal being moved
    const deal = deals.find((d) => d.id === draggableId);
    if (!deal) {
      return;
    }

    // If stage changed, update the deal
    if (destination.droppableId !== source.droppableId) {
      try {
        // Determine new status based on stage
        let newStatus = deal.status;
        if (destination.droppableId === 'closed_won') {
          newStatus = 'won';
        } else if (destination.droppableId === 'closed_lost') {
          newStatus = 'lost';
        } else {
          newStatus = 'open';
        }

        // Update the deal via API
        const response = await fetch(`/api/deals/${draggableId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stage: destination.droppableId,
            status: newStatus,
          }),
        });

        if (!response.ok) {
          console.error('Failed to update deal stage');
          return;
        }

        // Trigger data refresh
        onDealsChange();
      } catch (error) {
        console.error('Error updating deal stage:', error);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Sales Pipeline
        </h2>
        <p className="text-muted-foreground">
          Drag deals between stages to update their status
        </p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <DealKanbanColumn
            key={stage.id}
            stage={stage.id}
            deals={getDealsByStage(stage.id)}
            onDealClick={onDealClick}
          />
        ))}
      </div>
      </div>
    </DragDropContext>
  );
}
