'use client';

import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActivityForm } from '@/components/activities/activity-form';
import { Activity, type ActivityInput } from '@/types/activity';
import { Phone, Mail, Users, FileText, User, ArrowLeft, Trash2, Edit } from 'lucide-react';

interface ActivityProfileProps {
  activity: Activity;
}

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText,
};

const activityColors = {
  call: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  email: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  meeting: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  note: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
};

export function ActivityProfile({ activity }: ActivityProfileProps) {
  const router = useRouter();
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(activity);

  const handleUpdate = async (data: ActivityInput) => {
    const response = await fetch(`/api/activities/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update activity');
    }

    const result = await response.json();
    const updatedActivity = result.data;
    
    // Update local state with new activity data
    setCurrentActivity(updatedActivity);
    
    // Refresh activity data to reflect changes
    if ((window as any).refreshActivity) {
      (window as any).refreshActivity();
    }
    
    // Exit edit mode after successful update
    setIsEditing(false);
    
    return updatedActivity;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/activities/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      router.push('/activities');
    } catch (error) {
      console.error('Error deleting activity:', error);
      setIsDeleting(false);
    }
  };

  const Icon = activityIcons[currentActivity.type as keyof typeof activityIcons];
  const colorClass = activityColors[currentActivity.type as keyof typeof activityColors];

  const initialData: Partial<ActivityInput> = {
    type: currentActivity.type,
    subject: currentActivity.subject,
    description: currentActivity.description || '',
    contactId: currentActivity.contactId,
    userId: currentActivity.userId ?? undefined,
  };

  if (isEditing) {
    return (
      <div className="container space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Activity</h1>
          <p className="text-muted-foreground">
            Update activity details below
          </p>
        </div>

        <ActivityForm
          initialData={initialData}
          onSubmit={handleUpdate}
          submitLabel="Update Activity"
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
        {/* Header with back button */}
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
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  {currentActivity.subject}
                </h1>
                <Badge variant="outline" className="text-xs">
                  {currentActivity.type}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {new Date(currentActivity.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
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

        {/* Activity details card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {/* Activity type icon */}
          <div className="mb-6 flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${colorClass}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Activity Type
              </p>
              <p className="text-lg font-semibold capitalize">
                {currentActivity.type}
              </p>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Subject
            </p>
            <p className="text-lg">{currentActivity.subject}</p>
          </div>

          {/* Description */}
          {currentActivity.description && (
            <div className="mb-6 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="text-base whitespace-pre-wrap">
                {currentActivity.description}
              </p>
            </div>
          )}

          {/* Contact information */}
          <div className="mb-6 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Related Contact
                  </p>
                  <p className="text-lg font-semibold">
                    {currentActivity.contact?.firstName} {currentActivity.contact?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentActivity.contact?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/contacts/${currentActivity.contactId}`)}
              >
                View Contact
              </Button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Date Created
              </p>
              <p className="text-base">
                {new Date(currentActivity.createdAt).toLocaleDateString('en-US', {
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
              <p className="text-base">
                {new Date(currentActivity.updatedAt).toLocaleDateString('en-US', {
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
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              Are you sure you want to delete this activity? This action cannot be undone.
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
