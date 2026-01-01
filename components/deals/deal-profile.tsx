'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DealForm } from '@/components/deals/deal-form';
import { Deal, type DealInput } from '@/types/deal';
import { DollarSign, Calendar, User, Edit, Trash2, ArrowLeft, TrendingUp } from 'lucide-react';

interface DealProfileProps {
  deal: Deal;
}

const stageColors: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  qualified: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  proposal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  closed_won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed_lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusColors: Record<string, string> = {
  open: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function DealProfile({ deal }: DealProfileProps) {
  const router = useRouter();
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(deal);

  const handleUpdate = async (data: DealInput) => {
    const response = await fetch(`/api/deals/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update deal');
    }

    const result = await response.json();
    const updatedDeal = result.data;

    // Update local state with new deal data
    setCurrentDeal(updatedDeal);

    // Refresh deal data to reflect changes
    if ((window as any).refreshDeal) {
      (window as any).refreshDeal();
    }

    // Refresh dashboard data to reflect changes
    if ((window as any).refreshDashboard) {
      (window as any).refreshDashboard();
    }

    // Exit edit mode after successful update
    setIsEditing(false);

    return updatedDeal;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/deals/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }

      // Refresh dashboard data to reflect changes
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }

      router.push('/deals');
    } catch (error) {
      console.error('Error deleting deal:', error);
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const initialData: Partial<DealInput> = {
    name: currentDeal.name,
    value: currentDeal.value,
    stage: currentDeal.stage,
    expectedCloseDate: new Date(currentDeal.expectedCloseDate).toISOString().split('T')[0],
    actualCloseDate: currentDeal.actualCloseDate
      ? new Date(currentDeal.actualCloseDate).toISOString().split('T')[0]
      : '',
    status: currentDeal.status,
    probability: currentDeal.probability || 0,
    description: currentDeal.description || '',
    contactId: currentDeal.contactId,
    companyId: currentDeal.companyId || '',
  };

  if (isEditing) {
    return (
      <div className="container space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Deal</h1>
          <p className="text-muted-foreground">
            Update deal information below
          </p>
        </div>

        <DealForm
          initialData={initialData}
          onSubmit={handleUpdate}
          submitLabel="Update Deal"
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
                {currentDeal.name}
              </h1>
              <p className="text-muted-foreground">
                {currentDeal.contact
                  ? `${currentDeal.contact.firstName} ${currentDeal.contact.lastName}`
                  : 'No contact assigned'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="information" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Information
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2">
              <User className="h-4 w-4" />
              Contact & Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="information" className="mt-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Deal Value
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(currentDeal.value)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Probability
                  </p>
                  <p className="text-2xl font-bold">
                    {currentDeal.probability || 0}%
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Stage
                  </p>
                  <Badge className={stageColors[currentDeal.stage]}>
                    {currentDeal.stage
                      .replace('_', ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge className={statusColors[currentDeal.status]}>
                    {currentDeal.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Expected Close Date
                  </p>
                  <p className="text-lg">
                    {formatDate(currentDeal.expectedCloseDate)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Actual Close Date
                  </p>
                  <p className="text-lg">
                    {formatDate(currentDeal.actualCloseDate)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-lg whitespace-pre-wrap">
                  {currentDeal.description || 'No description provided'}
                </p>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Created
                  </p>
                  <p className="text-lg">
                    {new Date(currentDeal.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p className="text-lg">
                    {new Date(currentDeal.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
              {currentDeal.contact ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Associated Contact
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Name
                        </p>
                        <p className="text-lg">
                          {currentDeal.contact.firstName}{' '}
                          {currentDeal.contact.lastName}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                        <p className="text-lg">{currentDeal.contact.email}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Phone
                        </p>
                        <p className="text-lg">
                          {currentDeal.contact.phoneNumber || 'Not provided'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Status
                        </p>
                        <Badge
                          variant={
                            currentDeal.contact.status === 'customer'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {currentDeal.contact.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      router.push(`/contacts/${currentDeal.contact?.id}`)
                    }
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    View Contact Profile
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No contact associated with this deal.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              Are you sure you want to delete {currentDeal.name} worth{' '}
              {formatCurrency(currentDeal.value)}? This action cannot be undone.
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
