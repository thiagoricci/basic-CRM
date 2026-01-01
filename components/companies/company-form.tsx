'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { companySchema, type CompanyInput } from '@/lib/validations';

interface CompanyFormProps {
  initialData?: Partial<CompanyInput>;
  onSubmit: (data: CompanyInput) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CompanyForm({
  initialData,
  onSubmit,
  submitLabel = 'Save Company',
  isSubmitting = false,
  onSuccess,
  onCancel,
}: CompanyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      website: initialData?.website || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      employeeCount: initialData?.employeeCount,
      revenue: initialData?.revenue,
    },
  });

  const handleSubmit = async (data: CompanyInput) => {
    setError(null);
    try {
      await onSubmit(data);
      // Refresh dashboard data to reflect changes
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }
      // Call onSuccess callback if provided, otherwise redirect to companies list
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/companies');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save company');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" variant="required">
          Company Name
        </Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Acme Corporation"
          disabled={isSubmitting}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Select
          value={form.watch('industry')}
          onValueChange={(value) => form.setValue('industry', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="industry">
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="consulting">Consulting</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.industry && (
          <p className="text-sm text-destructive">
            {form.formState.errors.industry.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          {...form.register('website')}
          placeholder="https://example.com"
          disabled={isSubmitting}
        />
        {form.formState.errors.website && (
          <p className="text-sm text-destructive">
            {form.formState.errors.website.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...form.register('phone')}
          placeholder="+1 (555) 000-0000"
          disabled={isSubmitting}
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...form.register('address')}
          placeholder="123 Main St, City, State 12345"
          disabled={isSubmitting}
        />
        {form.formState.errors.address && (
          <p className="text-sm text-destructive">
            {form.formState.errors.address.message}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employeeCount">Employee Count</Label>
          <Input
            id="employeeCount"
            type="number"
            {...form.register('employeeCount', { valueAsNumber: true })}
            placeholder="100"
            disabled={isSubmitting}
          />
          {form.formState.errors.employeeCount && (
            <p className="text-sm text-destructive">
              {form.formState.errors.employeeCount.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="revenue">Annual Revenue</Label>
          <Input
            id="revenue"
            type="number"
            {...form.register('revenue', { valueAsNumber: true })}
            placeholder="1000000"
            disabled={isSubmitting}
          />
          {form.formState.errors.revenue && (
            <p className="text-sm text-destructive">
              {form.formState.errors.revenue.message}
            </p>
          )}
        </div>
      </div>

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
