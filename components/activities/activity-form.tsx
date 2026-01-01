'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContactSelector } from '@/components/contacts/contact-selector';
import { activitySchema, type ActivityInput } from '@/lib/validations';

interface ActivityFormProps {
  contactId?: string;
  initialData?: Partial<ActivityInput>;
  onSubmit: (data: ActivityInput) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ActivityForm({
  contactId,
  initialData,
  onSubmit,
  submitLabel = 'Add Activity',
  isSubmitting = false,
  onSuccess,
  onCancel,
}: ActivityFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: initialData?.type || 'note',
      subject: initialData?.subject || '',
      description: initialData?.description || '',
      contactId: initialData?.contactId || contactId || '',
    },
  });

  const handleSubmit = async (data: ActivityInput) => {
    setError(null);
    try {
      await onSubmit(data);
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add activity');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="type" variant="required">
          Activity Type
        </Label>
        <Select
          defaultValue={form.getValues('type')}
          onValueChange={(value) => form.setValue('type', value as any)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.type && (
          <p className="text-sm text-destructive">
            {form.formState.errors.type.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" variant="required">
          Subject
        </Label>
        <Input
          id="subject"
          {...form.register('subject')}
          placeholder="Activity subject"
          disabled={isSubmitting}
        />
        {form.formState.errors.subject && (
          <p className="text-sm text-destructive">
            {form.formState.errors.subject.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...form.register('description')}
          placeholder="Add more details..."
          disabled={isSubmitting}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={4}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {!contactId && (
        <div className="space-y-2">
          <Label htmlFor="contactId" variant="required">
            Contact
          </Label>
          <ContactSelector
            value={form.watch('contactId')}
            onChange={(contactId) => form.setValue('contactId', contactId)}
            disabled={isSubmitting}
            error={form.formState.errors.contactId?.message}
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
