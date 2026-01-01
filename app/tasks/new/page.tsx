'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskInput } from '@/lib/validations';

function NewTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contactId = searchParams.get('contactId');

  const handleCreateTask = async (data: TaskInput) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/tasks/${result.data.id}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="container space-y-8 py-8">
      <div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Task</h1>
          <p className="text-muted-foreground">
            Create a new action item for your contacts
          </p>
        </div>
      </div>

      <div>
        <TaskForm
          onSubmit={handleCreateTask}
          initialData={contactId ? { contactId } : undefined}
          submitLabel="Create Task"
        />
      </div>
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTaskContent />
    </Suspense>
  );
}
