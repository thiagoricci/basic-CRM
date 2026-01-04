import { getSession, getCurrentUser } from '@/lib/auth';
import {
  hasPermission,
  canReadAllRecords,
  canManageUsers,
  canAccessAnalytics,
} from '@/types/permissions';
import type { UserRole, ResourceType, PermissionAction } from '@/types/permissions';

/**
 * Check if current user has permission to perform action on resource
 */
export async function requirePermission(
  resource: ResourceType,
  action: PermissionAction
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: 'Not authenticated' };
  }

  const userRole = session.user.role;

  if (!hasPermission(userRole, resource, action)) {
    return {
      success: false,
      error: `You don't have permission to ${action} ${resource}s`,
    };
  }

  return { success: true };
}

/**
 * Check if current user can access specific record
 * Admins can access all records
 * Managers can read all records, but only edit their own
 * Reps can only access their own records
 */
export async function canAccessRecord(
  action: PermissionAction,
  recordUserId: string | null
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: 'Not authenticated' };
  }

  const userRole = session.user.role;
  const currentUserId = session.user.id;

  // Admins can access all records
  if (userRole === 'admin') {
    return { success: true };
  }

  // Managers can read all records
  if (userRole === 'manager' && action === 'read') {
    return { success: true };
  }

  // For non-admin users, check ownership
  if (!recordUserId || recordUserId !== currentUserId) {
    return {
      success: false,
      error: 'You can only access your own records',
    };
  }

  return { success: true };
}

/**
 * Get user filter for Prisma queries based on role
 * Returns where clause to filter records by user ownership
 */
export async function getUserFilter(
  action: PermissionAction
): Promise<{ userId?: string }> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Not authenticated');
  }

  const userRole = session.user.role;
  const currentUserId = session.user.id;

  // Admins and managers can see all records (no filter)
  if (userRole === 'admin' || (userRole === 'manager' && action === 'read')) {
    return {};
  }

  // Reps and managers (for write operations) can only see their own records
  return { userId: currentUserId };
}

/**
 * Check if current user can manage other users
 */
export async function requireUserManagement(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: 'Not authenticated' };
  }

  if (!canManageUsers(session.user.role)) {
    return {
      success: false,
      error: "You don't have permission to manage users",
    };
  }

  return { success: true };
}

/**
 * Check if current user can access system analytics
 */
export async function requireAnalyticsAccess(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: 'Not authenticated' };
  }

  const userRole = session.user.role;

  if (!canAccessAnalytics(userRole)) {
    return {
      success: false,
      error: "You don't have permission to view system analytics",
    };
  }

  return { success: true };
}

/**
 * Get current user's ID
 * Throws error if not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user.id;
}

/**
 * Get current user's role
 * Throws error if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user.role as UserRole;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const role = await getCurrentUserRole();
    return role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Check if current user is manager or admin
 */
export async function isManagerOrAdmin(): Promise<boolean> {
  try {
    const role = await getCurrentUserRole();
    return role === 'admin' || role === 'manager';
  } catch {
    return false;
  }
}
