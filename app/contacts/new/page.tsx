'use client';

import { ContactForm } from '@/components/contacts/contact-form';
import { type ContactInput } from '@/types/contact';

export default function NewContactPage() {
  const handleSubmit = async (data: ContactInput) => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create contact');
    }

    const newContact = await response.json();
    return newContact.data;
  };

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Contact</h1>
        <p className="text-muted-foreground">
          Add a new contact to your database
        </p>
      </div>

      <ContactForm onSubmit={handleSubmit} submitLabel="Create Contact" />
    </div>
  );
}
