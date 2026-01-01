'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DealForm } from '@/components/deals/deal-form';
import { type DealInput } from '@/lib/validations';

export default function NewDealPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: DealInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create deal');
      }

      // Refresh dashboard data to reflect changes
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }

      router.push('/deals');
    } catch (error: any) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container space-y-8 py-8">
      <div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Deal
          </h1>
          <p className="text-muted-foreground">
            Add a new deal to your sales pipeline
          </p>
        </div>

        <DealForm
          onSubmit={handleSubmit}
          submitLabel="Create Deal"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
