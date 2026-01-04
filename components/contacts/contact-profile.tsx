'use client';

import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContactForm } from '@/components/contacts/contact-form';
import { ActivityForm } from '@/components/activities/activity-form';
import { ActivityList, ActivityListRef } from '@/components/activities/activity-list';
import { ContactTasks } from '@/components/contacts/contact-tasks';
import { ContactDeals } from '@/components/contacts/contact-deals';
import { ContactCompanies } from '@/components/contacts/contact-companies';
import { Contact, type ContactInput } from '@/types/contact';
import { ActivityInput } from '@/lib/validations';
import { formatPhoneNumber } from '@/lib/utils';
import { Plus, User, Activity, CheckSquare, DollarSign, Edit, Trash2, ArrowLeft, Building2 } from 'lucide-react';

interface ContactProfileProps {
  contact: Contact;
}

export function ContactProfile({ contact }: ContactProfileProps) {
  const router = useRouter();
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentContact, setCurrentContact] = useState(contact);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const activityListRef = useRef<ActivityListRef>(null);

  const handleUpdate = async (data: ContactInput) => {
    const response = await fetch(`/api/contacts/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update contact');
    }

    const result = await response.json();
    const updatedContact = result.data;
    
    // Update local state with new contact data
    setCurrentContact(updatedContact);
    
    // Refresh contact data to reflect changes
    if ((window as any).refreshContact) {
      (window as any).refreshContact();
    }
    
    // Refresh dashboard data to reflect changes
    if ((window as any).refreshDashboard) {
      (window as any).refreshDashboard();
    }
    
    // Exit edit mode after successful update
    setIsEditing(false);
    
    return updatedContact;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      // Refresh dashboard data to reflect changes
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }

      router.push('/contacts');
    } catch (error) {
      console.error('Error deleting contact:', error);
      setIsDeleting(false);
    }
  };

  const handleAddActivity = async (data: ActivityInput) => {
    setIsSubmittingActivity(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to add activity');
      }

      setShowActivityForm(false);
      // Refresh activity list to show newly added activity
      await activityListRef.current?.refetch();
    } catch (error: any) {
      throw error;
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    const response = await fetch(`/api/activities/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete activity');
    }
    
    // Refresh activity list to show updated list
    await activityListRef.current?.refetch();
  };

  const initialData: Partial<ContactInput> = {
    firstName: currentContact.firstName,
    lastName: currentContact.lastName,
    email: currentContact.email,
    phoneNumber: currentContact.phoneNumber || '',
    status: currentContact.status,
    jobTitle: currentContact.jobTitle || '',
    companyId: currentContact.companyId ?? undefined,
    userId: currentContact.userId ?? undefined,
  };

  if (isEditing) {
    return (
      <div className="container space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
          <p className="text-muted-foreground">
            Update contact information below
          </p>
        </div>

        <ContactForm
          initialData={initialData}
          onSubmit={handleUpdate}
          submitLabel="Update Contact"
          isSubmitting={false}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentContact.firstName} {currentContact.lastName}
              </h1>
              <p className="text-muted-foreground">{currentContact.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Tabs defaultValue="information" className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-5">
            <TabsTrigger value="information" className="gap-2">
              <User className="h-4 w-4" />
              Information
            </TabsTrigger>
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Activity className="h-4 w-4" />
              Activities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="information" className="mt-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    First Name
                  </p>
                  <p className="text-lg">{currentContact.firstName}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </p>
                  <p className="text-lg">{currentContact.lastName}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg">{currentContact.email}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="text-lg">{formatPhoneNumber(currentContact.phoneNumber) || 'Not provided'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge variant={currentContact.status === 'customer' ? 'default' : 'secondary'}>
                    {currentContact.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Date Added
                  </p>
                  <p className="text-lg">
                    {new Date(currentContact.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </p>
                <p className="text-lg">
                  {new Date(currentContact.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <div>
              <ContactCompanies
                companyId={currentContact.companyId}
                company={currentContact.company}
                onCompanyClick={(company) => router.push(`/companies/${company.id}`)}
              />
            </div>
          </TabsContent>

          <TabsContent value="deals" className="mt-6">
            <div>
              <ContactDeals
                contactId={params.id as string}
                onRefresh={async () => {
                  if ((window as any).refreshContact) {
                    (window as any).refreshContact();
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <div>
              <ContactTasks
                contactId={params.id as string}
                onRefresh={async () => {
                  if ((window as any).refreshContact) {
                    (window as any).refreshContact();
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Activities</h2>
                  <p className="text-muted-foreground">
                    Track interactions with this contact
                  </p>
                </div>
                {!showActivityForm && (
                  <Button
                    onClick={() => setShowActivityForm(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Activity
                  </Button>
                )}
              </div>

              {showActivityForm && (
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">New Activity</h3>
                    <button
                      onClick={() => setShowActivityForm(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                  <ActivityForm
                    contactId={params.id as string}
                    onSubmit={handleAddActivity}
                    isSubmitting={isSubmittingActivity}
                    onSuccess={() => setShowActivityForm(false)}
                  />
                </div>
              )}

              <ActivityList
                ref={activityListRef}
                contactId={params.id as string}
                showContactName={false}
                onDelete={handleDeleteActivity}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              Are you sure you want to delete {currentContact.firstName} {currentContact.lastName}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
