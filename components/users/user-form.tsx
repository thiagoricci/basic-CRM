'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { userSchema, type UserInput } from '@/lib/validations';

interface UserFormProps {
  initialData?: Partial<UserInput>;
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({
  initialData,
  onSubmit,
  submitLabel = 'Save User',
  isSubmitting = false,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || 'rep',
      bio: initialData?.bio || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      await onSubmit(data);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/users');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" variant="required">
          Name
        </Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="John Doe"
          disabled={isSubmitting}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {typeof form.formState.errors.name?.message === 'string' ? form.formState.errors.name.message : 'Invalid name'}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" variant="required">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          placeholder="john.doe@example.com"
          disabled={isSubmitting}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {typeof form.formState.errors.email?.message === 'string' ? form.formState.errors.email.message : 'Invalid email'}
          </p>
        )}
      </div>

      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="password" variant="required">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            {...form.register('password')}
            placeholder="••••••••••••"
            disabled={isSubmitting}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {typeof form.formState.errors.password?.message === 'string' ? form.formState.errors.password.message : 'Invalid password'}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role" variant="required">
          Role
        </Label>
        <Select
          defaultValue={form.getValues('role')}
          onValueChange={(value) => form.setValue('role', value as 'admin' | 'manager' | 'rep')}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="rep">Rep</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.role && (
          <p className="text-sm text-destructive">
            {typeof form.formState.errors.role?.message === 'string' ? form.formState.errors.role.message : 'Invalid role'}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          {...form.register('bio')}
          placeholder="Tell us about yourself..."
          disabled={isSubmitting}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={4}
        />
        {form.formState.errors.bio && (
          <p className="text-sm text-destructive">
            {typeof form.formState.errors.bio?.message === 'string' ? form.formState.errors.bio.message : 'Invalid bio'}
          </p>
        )}
      </div>

      {!initialData && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...form.register('isActive')}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="isActive" className="font-normal">
              Active
            </Label>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel ? onCancel() : router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
