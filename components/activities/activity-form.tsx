'use client';

import { useState, useEffect } from 'react';
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
import { UserSelector } from '@/components/users/user-selector';
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
  const [userDisabled, setUserDisabled] = useState(false);

const form = useForm<ActivityInput>({
  resolver: zodResolver(activitySchema),
  defaultValues: {
    type: initialData?.type || 'note',
    subject: initialData?.subject || '',
    description: initialData?.description || '',
    contactId: initialData?.contactId || contactId || '',
    userId: initialData?.userId || undefined,
  },
});

// Update form when initialData changes (e.g., when switching to edit mode)
useEffect(() => {
  if (initialData) {
    form.reset({
      type: initialData.type,
      subject: initialData.subject,
      description: initialData.description || '',
      contactId: initialData.contactId,
      userId: initialData.userId ?? undefined,
    });
    
    // Disable user field if contact has a user assigned
    if (initialData.contactId && !initialData.userId) {
      setUserDisabled(true);
    } else {
      setUserDisabled(false);
    }
  }
}, [initialData, form]);

// Handle contact selection to auto-fill user
const handleContactSelect = (contact: any) => {
  // Auto-fill user if contact has one
  if (contact.userId) {
    form.setValue('userId', contact.userId);
    setUserDisabled(true);
  } else {
    setUserDisabled(false);
  }
};

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
            onContactSelect={handleContactSelect}
            disabled={isSubmitting}
            error={form.formState.errors.contactId?.message}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="userId">Assigned To</Label>
        <UserSelector
          value={form.watch('userId') || undefined}
          onChange={(value) => form.setValue('userId', value as any)}
          disabled={userDisabled}
          placeholder={userDisabled ? 'Auto-filled from contact' : 'Assign to a user (optional)'}
        />
        {form.formState.errors.userId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.userId.message}
          </p>
        )}
      </div>

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
