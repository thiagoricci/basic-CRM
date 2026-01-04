'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/users/user-form';
import { ArrowLeft } from 'lucide-react';

export default function NewUserPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/admin/users');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
        <p className="text-muted-foreground">
          Create a new user account for the CRM system.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive mb-6">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="p-6">
          <UserForm
            onSubmit={handleSubmit}
            submitLabel="Create User"
            isSubmitting={false}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </div>
  );
}
