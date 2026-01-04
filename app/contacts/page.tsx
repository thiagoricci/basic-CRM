'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContactTable } from '@/components/contacts/contact-table';
import { Contact } from '@/types/contact';
import { Plus } from 'lucide-react';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lead' | 'customer'>('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'email' | 'phone' | 'status' | 'date' | 'assignedTo'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch('/api/contacts');
        const data = await response.json();
        if (data.data) {
          setContacts(data.data);
          setFilteredContacts(data.data);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, []);

  useEffect(() => {
    let filtered = contacts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(query) ||
          contact.lastName.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((contact) => contact.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'phone':
          comparison = (a.phoneNumber || '').localeCompare(b.phoneNumber || '');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'assignedTo':
          comparison = (a.user?.name || '').localeCompare(b.user?.name || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredContacts(filtered);
  }, [searchQuery, statusFilter, contacts, sortField, sortDirection]);

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedContacts.map((id) =>
          fetch(`/api/contacts/${id}`, { method: 'DELETE' })
        )
      );

      // Refresh dashboard data to reflect changes
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }

      setContacts(contacts.filter((c) => !selectedContacts.includes(c.id)));
      setSelectedContacts([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting contacts:', error);
    }
  };

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage and track all your customer contacts
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'lead' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('lead')}
              >
                Leads
              </Button>
              <Button
                variant={statusFilter === 'customer' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('customer')}
              >
                Customers
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedContacts.length > 0 && (
              <>
                <Button variant="outline" onClick={() => setSelectedContacts([])}>
                  Deselect all
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  Delete ({selectedContacts.length})
                </Button>
              </>
            )}
            <Button onClick={() => router.push('/contacts/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Loading...
        </div>
      ) : (
        <ContactTable
          contacts={filteredContacts}
          selectedContacts={selectedContacts}
          onSelectionChange={setSelectedContacts}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(field: 'name' | 'email' | 'phone' | 'status' | 'date' | 'assignedTo') => {
            if (sortField === field) {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
              setSortField(field);
              setSortDirection('asc');
            }
          }}
        />
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">
              Delete {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}?
            </h2>
            <p className="text-muted-foreground mb-6">
              This action cannot be undone. Are you sure you want to delete these contacts?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSelected}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
