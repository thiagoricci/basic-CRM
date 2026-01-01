'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskList } from '@/components/tasks/task-list';
import { TaskFilters, type TaskFilters as TaskFiltersType } from '@/components/tasks/task-filters';
import { TaskPagination } from '@/components/tasks/task-pagination';
import { TaskForm } from '@/components/tasks/task-form';
import { LoadingIndicator } from '@/components/tasks/loading-indicator';
import { Task } from '@/types/task';
import { Plus } from 'lucide-react';

interface TasksResponse {
  data: Task[];
  error: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function TasksPage() {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersType>({
    status: 'open',
    priority: 'all',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all tasks once (no query params)
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  };

  const { data, error, isLoading, mutate } = useSWR<TasksResponse>(
    '/api/tasks',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
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
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        mutate();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Filter tasks client-side
  const getFilteredTasks = () => {
    const allTasks = data?.data || [];
    return allTasks.filter((task) => {
      // Status filter
      if (filters.status !== 'all') {
        const now = new Date();
        const dueDate = new Date(task.dueDate);

        if (filters.status === 'open' && task.completed) return false;
        if (filters.status === 'completed' && !task.completed) return false;
        if (filters.status === 'overdue' && (task.completed || dueDate >= now)) return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const contactMatch = task.contact
          ? `${task.contact.firstName} ${task.contact.lastName}`.toLowerCase().includes(searchLower)
          : false;
        if (!titleMatch && !contactMatch) return false;
      }

      return true;
    });
  };

  // Calculate pagination
  const filteredTasks = getFilteredTasks();
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  if (!data && isLoading) {
    return (
      <div className="container space-y-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container space-y-8 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load tasks</p>
          <Button onClick={() => mutate()} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your action items and deadlines
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <TaskFilters onFilterChange={handleFilterChange} />

      {isLoading && <LoadingIndicator />}

      <TaskList tasks={paginatedTasks} onToggleComplete={handleToggleComplete} />

      {totalPages > 1 && (
        <TaskPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
