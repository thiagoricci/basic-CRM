'use client';

import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityPagination } from '@/components/activities/activity-pagination';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Activity } from '@/types/activity';
import { Phone, Mail, Users, FileText, Trash2, Edit } from 'lucide-react';

export interface ActivityListRef {
  refetch: () => Promise<void>;
}

interface ActivityListProps {
  contactId?: string;
  showContactName?: boolean;
  onDelete?: (id: string) => Promise<void>;
  onPageChange?: (page: number) => void;
  filters?: {
    type?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  };
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

export const ActivityList = forwardRef<ActivityListRef, ActivityListProps>(
  ({ contactId, showContactName = false, onDelete, onPageChange, filters = {} }, ref) => {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ subject: '', description: '' });
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const subjectInputRef = useRef<HTMLInputElement>(null);

  // Fetcher function for SWR
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const result = await response.json();
    return result; // Return full response including pagination
  };

  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (contactId) params.append('contactId', contactId);
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    return params.toString();
  };

  // Use SWR to fetch activities with automatic revalidation
  const { data: response, error, isLoading, mutate } = useSWR<{
    data: Activity[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(
    `/api/activities?${buildQueryString()}`,
    fetcher,
    {
      revalidateOnFocus: true, // Refresh when tab regains focus
      revalidateOnReconnect: true, // Refresh when network reconnects
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
    }
  );

  const activities = response?.data || [];
  const pagination = response?.pagination;
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;
  const limit = pagination?.limit || 20;

  // Reset to page 1 when filters change
  useEffect(() => {
    // This effect will run when filters change
    // The parent component should handle resetting page to 1
  }, [filters.type, filters.search, filters.fromDate, filters.toDate]);

  // Expose refetch function to parent component
  useImperativeHandle(ref, () => ({
    refetch: async () => {
      await mutate();
    },
  }));

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(deleteDialog.id);
      } else {
        const response = await fetch(`/api/activities/${deleteDialog.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete activity');
        }
      }
      setDeleteDialog({ open: false, id: null });
      mutate(); // Refresh activities after deletion
    } catch (error) {
      console.error('Error deleting activity:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setEditForm({
      subject: activity.subject,
      description: activity.description || '',
    });
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    // Validate
    if (!editForm.subject.trim()) {
      setEditError('Subject is required');
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      const response = await fetch(`/api/activities/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update activity');
      }

      setEditingId(null);
      setEditForm({ subject: '', description: '' });
      mutate(); // Refresh list
    } catch (error: any) {
      setEditError(error.message || 'Failed to update activity');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ subject: '', description: '' });
    setEditError(null);
  };

  // Auto-focus subject input when entering edit mode
  useEffect(() => {
    if (editingId && subjectInputRef.current) {
      subjectInputRef.current.focus();
    }
  }, [editingId]);

  // Handle keyboard shortcuts
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Failed to load activities</div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          No activities yet
        </p>
        <p className="text-sm text-muted-foreground">
          Add your first activity to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type as keyof typeof activityIcons];
          const colorClass =
            activityColors[activity.type as keyof typeof activityColors];
          
          return (
            <div
              key={activity.id}
              className="group relative flex gap-4"
              onClick={() => router.push(`/activities/${activity.id}`)}
            >
                {/* Timeline line */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-border" />
                )}

                {/* Activity icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${colorClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Activity content */}
                <div className="flex min-w-0 flex-1 cursor-pointer">
                  <div className="flex w-full items-start justify-between gap-4">
                    {editingId === activity.id ? (
                      // Edit mode
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <input
                              ref={subjectInputRef}
                              type="text"
                              value={editForm.subject}
                              onChange={(e) =>
                                setEditForm({ ...editForm, subject: e.target.value })
                              }
                              onKeyDown={handleEditKeyDown}
                              placeholder="Subject"
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                            {editError && (
                              <p className="text-sm text-destructive">{editError}</p>
                            )}
                          </div>
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                            onKeyDown={handleEditKeyDown}
                            placeholder="Add more details..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={saving}
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {activity.subject}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>

                        {showContactName && activity.contact && (
                          <p className="text-sm text-muted-foreground">
                            {activity.contact.firstName} {activity.contact.lastName}
                          </p>
                        )}

                        {activity.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {activity.description}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.createdAt)}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-1">
                      {editingId !== activity.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(activity);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            title="Edit activity"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ open: true, id: activity.id });
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            title="Delete activity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
        })}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && onPageChange && (
        <ActivityPagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, id: deleteDialog.id })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null })}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
  }
);

ActivityList.displayName = 'ActivityList';
