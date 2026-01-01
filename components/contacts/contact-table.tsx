'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/types/contact';
import { formatPhoneNumber } from '@/lib/utils';

interface ContactTableProps {
  contacts: Contact[];
  selectedContacts: string[];
  onSelectionChange: (selected: string[]) => void;
  sortField: 'name' | 'email' | 'phone' | 'status' | 'date';
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'email' | 'phone' | 'status' | 'date') => void;
}

export function ContactTable({
  contacts,
  selectedContacts,
  onSelectionChange,
  sortField,
  sortDirection,
  onSortChange,
}: ContactTableProps) {
  const [allSelected, setAllSelected] = useState(false);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setAllSelected(checked);
    onSelectionChange(checked ? contacts.map((c) => c.id) : []);
  };

  const handleSelectContact = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedContacts, id]);
    } else {
      onSelectionChange(selectedContacts.filter((c) => c !== id));
    }
  };

  const isAllSelected =
    contacts.length > 0 && selectedContacts.length === contacts.length;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground">
        <div className="col-span-1 flex items-center">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
          />
        </div>
        <div
          className="col-span-3 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('name')}
        >
          Name
          <SortIcon field="name" />
        </div>
        <div
          className="col-span-3 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('email')}
        >
          Email
          <SortIcon field="email" />
        </div>
        <div
          className="col-span-2 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('phone')}
        >
          Phone
          <SortIcon field="phone" />
        </div>
        <div
          className="col-span-2 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('status')}
        >
          Status
          <SortIcon field="status" />
        </div>
        <div
          className="col-span-1 flex items-center cursor-pointer hover:text-foreground transition-colors select-none"
          onClick={() => onSortChange('date')}
        >
          Created
          <SortIcon field="date" />
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No contacts found
        </div>
      ) : (
        <div className="divide-y">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`grid grid-cols-12 gap-4 p-4 transition-colors hover:bg-accent ${
                selectedContacts.includes(contact.id) ? 'bg-accent' : ''
              }`}
            >
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={(checked) =>
                    handleSelectContact(contact.id, checked as boolean)
                  }
                  aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                />
              </div>
              <Link
                href={`/contacts/${contact.id}`}
                className="col-span-3 flex items-center font-medium hover:underline"
              >
                {contact.firstName} {contact.lastName}
              </Link>
              <div className="col-span-3 flex items-center text-muted-foreground">
                {contact.email}
              </div>
              <div className="col-span-2 flex items-center text-muted-foreground">
                {formatPhoneNumber(contact.phoneNumber) || '-'}
              </div>
              <div className="col-span-2 flex items-center">
                <Badge
                  variant={contact.status === 'customer' ? 'default' : 'secondary'}
                >
                  {contact.status}
                </Badge>
              </div>
              <div className="col-span-1 flex items-center text-sm text-muted-foreground">
                {new Date(contact.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
