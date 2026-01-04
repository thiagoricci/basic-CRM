'use client';

import { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getRoleBadgeColor, getRoleName } from '@/types/permissions';

interface UserSelectorProps {
  value?: string | null;
  onChange: (userId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function UserSelector({
  value,
  onChange,
  disabled = false,
  placeholder = 'Assign to...',
  showAllOption = false,
  allOptionLabel = 'All Users',
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        const result = await response.json();

        if (result.error) {
          setError(result.error);
        } else {
          setUsers(result.data || []);
        }
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Don't render Select until users are loaded to ensure initial value is properly displayed
  // This prevents the Select component from being initialized with empty options
  // When Select is initialized with empty options, it can't properly display the initial value
  // even after options are loaded
  if (loading) {
    return (
      <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder={error} />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value || undefined}
      onValueChange={(val) => onChange(val === 'all' ? null : (val || null))}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="font-medium">{allOptionLabel}</div>
              </div>
            </div>
          </SelectItem>
        )}
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar || undefined} alt={user.name || 'User'} />
                <AvatarFallback>
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{user.name || 'Unknown'}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <Badge className={getRoleBadgeColor(user.role as any)}>
                {getRoleName(user.role as any)}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
