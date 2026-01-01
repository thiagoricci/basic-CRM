'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/types/contact';

interface RecentContactsProps {
  contacts: Contact[];
}

export function RecentContacts({ contacts }: RecentContactsProps) {
  const recentContacts = contacts.slice(0, 5);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentContacts.length > 0 ? (
            <div className="space-y-4">
              {recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {contact.email}
                    </span>
                  </div>
                  <Badge
                    variant={contact.status === 'customer' ? 'default' : 'secondary'}
                  >
                    {contact.status}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No contacts yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
