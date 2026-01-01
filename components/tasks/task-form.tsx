'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { taskSchema, type TaskInput } from '@/lib/validations';
import { ContactSelector } from '@/components/contacts/contact-selector';

interface TaskFormProps {
  onSubmit: (data: TaskInput) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<TaskInput>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function TaskForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Create Task',
  isSubmitting = false,
}: TaskFormProps) {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const effectiveIsSubmitting = isSubmitting || internalIsSubmitting;

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      dueDate: initialData?.dueDate || new Date().toISOString(),
      priority: initialData?.priority || 'medium',
      contactId: initialData?.contactId || '',
    },
  });

  const handleSubmit = async (data: TaskInput) => {
    setInternalIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Call John about proposal"
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            placeholder="Add more details about this task..."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...form.register('description')}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('dueDate')
                    ? format(new Date(form.watch('dueDate')), 'PPP')
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    form.watch('dueDate')
                      ? new Date(form.watch('dueDate'))
                      : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      form.setValue('dueDate', date.toISOString());
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.dueDate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.dueDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select
              value={form.watch('priority')}
              onValueChange={(value) =>
                form.setValue('priority', value as 'low' | 'medium' | 'high')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.priority && (
              <p className="text-sm text-destructive">
                {form.formState.errors.priority.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contact *</Label>
          <ContactSelector
            value={form.watch('contactId')}
            onChange={(value) => form.setValue('contactId', value)}
          />
          {form.formState.errors.contactId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.contactId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={effectiveIsSubmitting}>
          {effectiveIsSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
