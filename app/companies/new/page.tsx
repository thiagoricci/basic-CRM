'use client';

import { useRouter } from 'next/navigation';
import { CompanyForm } from '@/components/companies/company-form';
import { companySchema, type CompanyInput } from '@/lib/validations';

export default function NewCompanyPage() {
  const router = useRouter();

  const handleSubmit = async (data: CompanyInput) => {
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      router.push(`/companies/${result.data.id}`);
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create company');
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Company</h1>
        <p className="text-muted-foreground">
          Add a new company to your CRM
        </p>
      </div>

      <CompanyForm
        onSubmit={handleSubmit}
        submitLabel="Create Company"
      />
    </div>
  );
}
