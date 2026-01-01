'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Task } from '@/types/task';
import { TaskProfile } from '@/components/tasks/task-profile';

interface TaskResponse {
  data: Task;
  error: string | null;
}

const fetcher = async (url: string): Promise<TaskResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }
  return response.json();
};

export default function TaskProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<TaskResponse>(
    `/api/tasks/${params.id}`,
    fetcher
  );

  const handleUpdate = async (id: string, data: any) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        mutate();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/tasks');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container space-y-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container space-y-8 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Task not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-8">
      <TaskProfile
        task={data.data}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
