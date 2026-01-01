'use client';

import { useState, useEffect } from 'react';
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
import { CompanySelector } from '@/components/companies/company-selector';
import { contactSchema, type ContactInput } from '@/lib/validations';

interface ContactFormProps {
  initialData?: Partial<ContactInput>;
  onSubmit: (data: ContactInput) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContactForm({
  initialData,
  onSubmit,
  submitLabel = 'Save Contact',
  isSubmitting = false,
  onSuccess,
  onCancel,
}: ContactFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  useEffect(() => {
    // Fetch companies for dropdown
    fetch('/api/companies')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCompanies(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch companies:', err))
      .finally(() => setCompaniesLoading(false));
  }, []);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      status: initialData?.status || 'lead',
      jobTitle: initialData?.jobTitle || '',
      companyId: initialData?.companyId || '',
    },
  });

  const handleSubmit = async (data: ContactInput) => {
    setError(null);
    try {
      await onSubmit(data);
      // Refresh dashboard data to reflect changes
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }
      // Call onSuccess callback if provided, otherwise redirect to contacts list
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/contacts');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save contact');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" variant="required">
            First Name
          </Label>
          <Input
            id="firstName"
            {...form.register('firstName')}
            placeholder="John"
            disabled={isSubmitting}
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" variant="required">
            Last Name
          </Label>
          <Input
            id="lastName"
            {...form.register('lastName')}
            placeholder="Doe"
            disabled={isSubmitting}
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
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
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          {...form.register('phoneNumber')}
          placeholder="+1 (555) 000-0000"
          disabled={isSubmitting}
        />
        {form.formState.errors.phoneNumber && (
          <p className="text-sm text-destructive">
            {form.formState.errors.phoneNumber.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" variant="required">
          Status
        </Label>
        <Select
          defaultValue={form.getValues('status')}
          onValueChange={(value) => form.setValue('status', value as 'lead' | 'customer')}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.status && (
          <p className="text-sm text-destructive">
            {form.formState.errors.status.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          {...form.register('jobTitle')}
          placeholder="Software Engineer"
          disabled={isSubmitting}
        />
        {form.formState.errors.jobTitle && (
          <p className="text-sm text-destructive">
            {form.formState.errors.jobTitle.message}
          </p>
        )}
      </div>

      <CompanySelector
        value={form.watch('companyId')}
        onChange={(value) => form.setValue('companyId', value)}
        companies={companies}
        loading={companiesLoading}
        placeholder="Select a company (optional)"
      />
      {form.formState.errors.companyId && (
        <p className="text-sm text-destructive">
          {form.formState.errors.companyId.message}
        </p>
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
