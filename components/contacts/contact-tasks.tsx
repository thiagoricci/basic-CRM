'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskList } from '@/components/tasks/task-list';
import { TaskFilters, type TaskFilters as TaskFiltersType } from '@/components/tasks/task-filters';
import { TaskPagination } from '@/components/tasks/task-pagination';
import { LoadingIndicator } from '@/components/tasks/loading-indicator';
import { Task } from '@/types/task';
import { Plus } from 'lucide-react';

interface ContactTasksProps {
  contactId: string;
  onRefresh: () => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

export function ContactTasks({ contactId, onRefresh }: ContactTasksProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersType>({
    status: 'open',
    priority: 'all',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all tasks for this contact once (client-side filtering)
  const fetchUrl = `/api/tasks?contactId=${contactId}`;

  const { data, error, isLoading, mutate } = useSWR(
    fetchUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      keepPreviousData: true,
    }
  );

  // Use fetched data
  const allTasks = data?.data || [];

  // Client-side filtering function
  const getFilteredTasks = (tasks: Task[], filters: TaskFiltersType): Task[] => {
    let filtered = [...tasks];

    // Filter by status
    if (filters.status !== 'all') {
      const now = new Date();
      filtered = filtered.filter((task) => {
        if (filters.status === 'open') {
          return !task.completed;
        } else if (filters.status === 'completed') {
          return task.completed;
        } else if (filters.status === 'overdue') {
          return !task.completed && new Date(task.dueDate) < now;
        }
        return true;
      });
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Apply client-side filters
  const filteredTasks = getFilteredTasks(allTasks, filters);

  const handleFilterChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // No API call needed - filtering is client-side
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        mutate();
        await onRefresh();
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleAddTask = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          contactId,
        }),
      });

      if (response.ok) {
        setShowTaskForm(false);
        mutate();
        await onRefresh();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
        await onRefresh();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Calculate pagination (client-side filtering)
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Action items for this contact
          </p>
        </div>
        {!showTaskForm && (
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {showTaskForm && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">New Task</h3>
            <button
              onClick={() => setShowTaskForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
          <TaskForm
            initialData={{ contactId }}
            onSubmit={handleAddTask}
            onCancel={() => setShowTaskForm(false)}
            submitLabel="Create Task"
          />
        </div>
      )}

      {!data && isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load tasks</p>
          <Button onClick={() => mutate()} variant="outline" className="mt-4">
            Try again
          </Button>
        </div>
      ) : (
        <>
          <TaskFilters onFilterChange={handleFilterChange} />

          {/* Only show loading indicator when refreshing, not on initial load */}
          {isLoading && data && <LoadingIndicator />}

          <TaskList
            tasks={paginatedTasks}
            onToggleComplete={handleToggleComplete}
          />
        </>
      )}

      {totalPages > 1 && (
        <TaskPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
