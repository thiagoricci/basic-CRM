export type UserRole = 'admin' | 'manager' | 'rep';
export type ResourceType = 'contact' | 'activity' | 'task' | 'deal' | 'user';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface Permission {
  resource: ResourceType;
  action: PermissionAction;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Admin has all permissions
    { resource: 'contact', action: 'create' },
    { resource: 'contact', action: 'read' },
    { resource: 'contact', action: 'update' },
    { resource: 'contact', action: 'delete' },
    { resource: 'activity', action: 'create' },
    { resource: 'activity', action: 'read' },
    { resource: 'activity', action: 'update' },
    { resource: 'activity', action: 'delete' },
    { resource: 'task', action: 'create' },
    { resource: 'task', action: 'read' },
    { resource: 'task', action: 'update' },
    { resource: 'task', action: 'delete' },
    { resource: 'deal', action: 'create' },
    { resource: 'deal', action: 'read' },
    { resource: 'deal', action: 'update' },
    { resource: 'deal', action: 'delete' },
    { resource: 'user', action: 'create' },
    { resource: 'user', action: 'read' },
    { resource: 'user', action: 'update' },
    { resource: 'user', action: 'delete' },
  ],
  manager: [
    // Manager can manage own records and read all records
    { resource: 'contact', action: 'create' },
    { resource: 'contact', action: 'read' },
    { resource: 'contact', action: 'update' },
    { resource: 'contact', action: 'delete' },
    { resource: 'activity', action: 'create' },
    { resource: 'activity', action: 'read' },
    { resource: 'activity', action: 'update' },
    { resource: 'activity', action: 'delete' },
    { resource: 'task', action: 'create' },
    { resource: 'task', action: 'read' },
    { resource: 'task', action: 'update' },
    { resource: 'task', action: 'delete' },
    { resource: 'deal', action: 'create' },
    { resource: 'deal', action: 'read' },
    { resource: 'deal', action: 'update' },
    { resource: 'deal', action: 'delete' },
    { resource: 'user', action: 'create' }, // Can create reps only
    { resource: 'user', action: 'read' },
  ],
  rep: [
    // Rep can only manage own records
    { resource: 'contact', action: 'create' },
    { resource: 'contact', action: 'read' },
    { resource: 'contact', action: 'update' },
    { resource: 'contact', action: 'delete' },
    { resource: 'activity', action: 'create' },
    { resource: 'activity', action: 'read' },
    { resource: 'activity', action: 'update' },
    { resource: 'activity', action: 'delete' },
    { resource: 'task', action: 'create' },
    { resource: 'task', action: 'read' },
    { resource: 'task', action: 'update' },
    { resource: 'task', action: 'delete' },
    { resource: 'deal', action: 'create' },
    { resource: 'deal', action: 'read' },
    { resource: 'deal', action: 'update' },
    { resource: 'deal', action: 'delete' },
  ],
};

/**
 * Check if role has permission to perform action on resource
 */
export function hasPermission(
  role: UserRole,
  resource: ResourceType,
  action: PermissionAction
): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some(
    (p) => p.resource === resource && p.action === action
  );
}

/**
 * Check if role can read all records (not just own)
 */
export function canReadAllRecords(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}

/**
 * Check if role can manage users
 */
export function canManageUsers(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * Check if role can access system analytics
 */
export function canAccessAnalytics(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}

/**
 * Get human-readable role name
 */
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    rep: 'Sales Representative',
  };
  return roleNames[role] || role;
}

/**
 * Get role badge color class
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    rep: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}
