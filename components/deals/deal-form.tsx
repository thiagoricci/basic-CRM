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
import { dealSchema, type DealInput } from '@/lib/validations';

interface DealFormProps {
  initialData?: Partial<DealInput>;
  onSubmit: (data: DealInput) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DealForm({
  initialData,
  onSubmit,
  submitLabel = 'Save Deal',
  isSubmitting = false,
  onSuccess,
  onCancel,
}: DealFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
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

  useEffect(() => {
    // Fetch contacts for dropdown
    fetch('/api/contacts')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setContacts(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch contacts:', err));
  }, []);

  const form = useForm<DealInput>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: initialData?.name || '',
      value: initialData?.value || 0,
      stage: initialData?.stage || 'lead',
      expectedCloseDate: initialData?.expectedCloseDate || '',
      actualCloseDate: initialData?.actualCloseDate || '',
      status: initialData?.status || 'open',
      probability: initialData?.probability || 0,
      description: initialData?.description || '',
      contactId: initialData?.contactId || '',
      companyId: initialData?.companyId || '',
    },
  });

  const handleSubmit = async (data: DealInput) => {
    setError(null);
    try {
      await onSubmit(data);
      // Refresh dashboard data to reflect changes
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }
      // Call onSuccess callback if provided, otherwise redirect to deals list
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/deals');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save deal');
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="name" variant="required">
          Deal Name
        </Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Enterprise Software License - Acme Corp"
          disabled={isSubmitting}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="value" variant="required">
            Deal Value ($)
          </Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            min="0"
            {...form.register('value', { valueAsNumber: true })}
            placeholder="50000"
            disabled={isSubmitting}
          />
          {form.formState.errors.value && (
            <p className="text-sm text-destructive">
              {form.formState.errors.value.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            type="number"
            min="0"
            max="100"
            {...form.register('probability', { valueAsNumber: true })}
            placeholder="50"
            disabled={isSubmitting}
          />
          {form.formState.errors.probability && (
            <p className="text-sm text-destructive">
              {form.formState.errors.probability.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stage" variant="required">
            Stage
          </Label>
          <Select
            defaultValue={form.getValues('stage')}
            onValueChange={(value) =>
              form.setValue('stage', value as any)
            }
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead / Prospecting</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.stage && (
            <p className="text-sm text-destructive">
              {form.formState.errors.stage.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" variant="required">
            Status
          </Label>
          <Select
            defaultValue={form.getValues('status')}
            onValueChange={(value) =>
              form.setValue('status', value as any)
            }
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-sm text-destructive">
              {form.formState.errors.status.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expectedCloseDate" variant="required">
            Expected Close Date
          </Label>
          <Input
            id="expectedCloseDate"
            type="date"
            {...form.register('expectedCloseDate')}
            disabled={isSubmitting}
          />
          {form.formState.errors.expectedCloseDate && (
            <p className="text-sm text-destructive">
              {form.formState.errors.expectedCloseDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="actualCloseDate">Actual Close Date</Label>
          <Input
            id="actualCloseDate"
            type="date"
            {...form.register('actualCloseDate')}
            disabled={isSubmitting}
          />
          {form.formState.errors.actualCloseDate && (
            <p className="text-sm text-destructive">
              {form.formState.errors.actualCloseDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactId" variant="required">
          Contact
        </Label>
        <Select
          defaultValue={form.getValues('contactId')}
          onValueChange={(value) => form.setValue('contactId', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a contact" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName} - {contact.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.contactId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.contactId.message}
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...form.register('description')}
          placeholder="Additional details about this deal..."
          rows={4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
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
          onClick={() => (onCancel ? onCancel() : router.back())}
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
