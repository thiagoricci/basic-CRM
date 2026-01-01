'use client';

import { useParams, notFound } from 'next/navigation';
import useSWR from 'swr';
import { ContactProfile } from '@/components/contacts/contact-profile';
import { Contact } from '@/types/contact';

interface ContactResponse {
  data: Contact | null;
  error: string | null;
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<ContactResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch contact');
  }
  return response.json();
};

export default function ContactProfilePage() {
  const params = useParams();
  const contactId = params.id as string;

  // Use SWR to fetch contact data with automatic revalidation
  const { data, error, isLoading, mutate } = useSWR<ContactResponse>(
    `/api/contacts/${contactId}`,
    fetcher,
    {
      revalidateOnFocus: true, // Refresh when tab regains focus
      revalidateOnReconnect: true, // Refresh when network reconnects
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
    }
  );

  // Expose mutate function for manual revalidation
  (window as any).refreshContact = mutate;

  if (isLoading) {
    return (
      <div className="container space-y-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container space-y-8 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load contact</p>
          <button
            onClick={() => mutate()}
            className="mt-4 text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <ContactProfile contact={data.data} />;
}
