'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ActivityForm } from '@/components/activities/activity-form';
import { ActivityList, ActivityListRef } from '@/components/activities/activity-list';
import { ActivityFilters } from '@/components/activities/activity-filters';
import { ActivityInput } from '@/lib/validations';
import { Activity } from '@/types/activity';
import { Plus } from 'lucide-react';

export default function ActivitiesPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    type?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }>({});

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: typeof filters) => {
    setPage(1);
    setFilters(newFilters);
  };
  const activityListRef = useRef<ActivityListRef>(null);

  const handleAddActivity = async (data: ActivityInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to add activity');
      }

      setIsAdding(false);
      setPage(1); // Reset to first page after adding
      // Refresh activity list to show newly added activity
      await activityListRef.current?.refetch();
    } catch (error: any) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    const response = await fetch(`/api/activities/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete activity');
    }
    
    // Refresh activity list to show updated list
    await activityListRef.current?.refetch();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container space-y-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
            <p className="text-muted-foreground">
              Track all your interactions with contacts
            </p>
          </div>
          {!isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Activity
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Activity Form */}
        {isAdding && (
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">New Activity</h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
              <ActivityForm
                onSubmit={handleAddActivity}
                isSubmitting={isSubmitting}
                onSuccess={() => setIsAdding(false)}
              />
            </div>
          </div>
        )}

        {/* Activity List */}
        <div className={isAdding ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <ActivityFilters filters={filters} onChange={handleFilterChange} />
          <ActivityList
            ref={activityListRef}
            filters={{ ...filters, page, limit: 20 }}
            showContactName={true}
            onDelete={handleDeleteActivity}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
