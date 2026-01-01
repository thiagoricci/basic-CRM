'use client';

import { useState, useEffect } from 'react';
import { Check, User, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Contact } from '@/types/contact';

interface ContactSelectorProps {
  value?: string;
  onChange: (contactId: string) => void;
  disabled?: boolean;
  error?: string;
}

export function ContactSelector({
  value,
  onChange,
  disabled = false,
  error,
}: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch contacts on mount
  useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch('/api/contacts');
        const result = await response.json();

        if (result.error) {
          setFetchError(result.error);
        } else {
          setContacts(result.data || []);
        }
      } catch (err) {
        setFetchError('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, []);

  // Get selected contact info
  const selectedContact = contacts.find((c) => c.id === value);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      contact.email.toLowerCase().includes(query)
    );
  });

  const handleSelect = (contactId: string) => {
    onChange(contactId);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between text-left font-normal',
              !value && 'text-muted-foreground',
              error && 'border-destructive',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
          >
            {selectedContact ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  {selectedContact.firstName} {selectedContact.lastName}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 opacity-50" />
                <span>Select a contact...</span>
              </div>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <User className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search contacts..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                disabled={disabled}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading contacts...
                  </span>
                </div>
              ) : fetchError ? (
                <div className="p-4 text-center text-sm text-destructive">
                  {fetchError}
                </div>
              ) : filteredContacts.length === 0 ? (
                <CommandEmpty>
                  {searchQuery ? 'No contacts found' : 'No contacts available'}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredContacts.map((contact) => (
                    <CommandItem
                      key={contact.id}
                      value={contact.id}
                      onSelect={() => handleSelect(contact.id)}
                      disabled={disabled}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {contact.email}
                          </span>
                        </div>
                      </div>
                      {value === contact.id && (
                        <Check className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
