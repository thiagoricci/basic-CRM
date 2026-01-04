'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserForm } from '@/components/users/user-form';
import { User } from '@/types/user';
import { getRoleBadgeColor, getRoleName } from '@/types/permissions';
import { Shield, User as UserIcon, Mail, Calendar, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${params.id}`);
        const result = await response.json();

        if (result.error) {
          setError(result.error);
        } else {
          setUser(result.data);
        }
      } catch (err) {
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/admin/users');
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setUser(result.data);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Loading user...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back to Users
        </Button>
      </div>

      {user && (
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <div className="border-b p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-2xl">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleName(user.role)}
                    </Badge>
                    {user.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="ml-1 text-sm">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              {!isEditing && (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Edit User
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="p-6">
              <UserForm
                initialData={user as any}
                onSubmit={handleSubmit}
                submitLabel="Save Changes"
                isSubmitting={false}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 p-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Account Information</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Role:</span>
                  <span>{getRoleName(user.role)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span className="font-medium">Status:</span>
                  <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Created:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Bio</h2>
              <div className="p-4 bg-muted/50 rounded-lg">
                {user.bio || 'No bio provided'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
