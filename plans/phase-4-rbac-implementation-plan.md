# Phase 4: Role-Based Access Control (RBAC) Implementation Plan

## Overview

Implement comprehensive Role-Based Access Control (RBAC) to enable team collaboration with proper data isolation and permission management.

**Phase**: 4 - Role-Based Access Control
**Status**: Planning
**Priority**: Critical for team collaboration
**Estimated Complexity**: High

## Current State

### Existing Infrastructure

- ✅ User model with role field (`admin`, `manager`, `rep`)
- ✅ userId foreign keys on Contact, Activity, Task, and Deal models
- ✅ Authentication system working (Phase 3 complete)
- ✅ Session management with user role in JWT token
- ✅ Helper functions: `getSession()`, `getCurrentUser()`, `requireAuth()`, `requireRole()`

### Current Limitations

- ❌ No permission enforcement on API routes
- ❌ No data filtering based on user ownership
- ❌ No "Assigned to" fields in forms
- ❌ All users can see and edit all records
- ❌ No admin user management UI
- ❌ Navigation not role-aware

## RBAC Design

### Role Definitions

#### 1. Admin (Full Access)

- **Can do everything**:
  - Create, read, update, delete all contacts, activities, tasks, deals
  - Manage all users (create, update, delete, activate/deactivate)
  - Verify user emails
  - Reset user passwords
  - Change user roles
  - View all records regardless of ownership
  - Access all analytics and reports
  - Manage system settings

#### 2. Manager (Team Lead)

- **Can do**:
  - Create, read, update, delete their own contacts, activities, tasks, deals
  - View all records in the system (read-only access to team data)
  - Create new users (reps only)
  - View analytics and reports
- **Cannot do**:
  - Delete or modify other users' records
  - Manage admin users
  - Change user roles
  - Verify user emails
  - Access system settings

#### 3. Rep (Sales Representative)

- **Can do**:
  - Create, read, update, delete their own contacts, activities, tasks, deals
  - View their own analytics
- **Cannot do**:
  - View other users' records
  - Delete or modify other users' records
  - Manage users
  - View system-wide analytics
  - Access admin features

### Permission Matrix

| Action                | Admin | Manager        | Rep |
| --------------------- | ----- | -------------- | --- |
| Create contacts       | ✅    | ✅             | ✅  |
| Read own contacts     | ✅    | ✅             | ✅  |
| Read all contacts     | ✅    | ✅             | ❌  |
| Update own contacts   | ✅    | ✅             | ✅  |
| Update all contacts   | ✅    | ❌             | ❌  |
| Delete own contacts   | ✅    | ✅             | ✅  |
| Delete all contacts   | ✅    | ❌             | ❌  |
| Create activities     | ✅    | ✅             | ✅  |
| Read own activities   | ✅    | ✅             | ✅  |
| Read all activities   | ✅    | ✅             | ❌  |
| Update own activities | ✅    | ✅             | ✅  |
| Update all activities | ✅    | ❌             | ❌  |
| Delete own activities | ✅    | ✅             | ✅  |
| Delete all activities | ✅    | ❌             | ❌  |
| Create tasks          | ✅    | ✅             | ✅  |
| Read own tasks        | ✅    | ✅             | ✅  |
| Read all tasks        | ✅    | ✅             | ❌  |
| Update own tasks      | ✅    | ✅             | ✅  |
| Update all tasks      | ✅    | ❌             | ❌  |
| Delete own tasks      | ✅    | ✅             | ✅  |
| Delete all tasks      | ✅    | ❌             | ❌  |
| Create deals          | ✅    | ✅             | ✅  |
| Read own deals        | ✅    | ✅             | ✅  |
| Read all deals        | ✅    | ✅             | ❌  |
| Update own deals      | ✅    | ✅             | ✅  |
| Update all deals      | ✅    | ❌             | ❌  |
| Delete own deals      | ✅    | ✅             | ✅  |
| Delete all deals      | ✅    | ❌             | ❌  |
| Create users          | ✅    | ✅ (reps only) | ❌  |
| Read all users        | ✅    | ✅             | ❌  |
| Update users          | ✅    | ❌             | ❌  |
| Delete users          | ✅    | ❌             | ❌  |
| Change user roles     | ✅    | ❌             | ❌  |
| Verify user emails    | ✅    | ❌             | ❌  |
| View system analytics | ✅    | ✅             | ❌  |
| Access admin panel    | ✅    | ❌             | ❌  |

## Implementation Plan

### Phase 4.1: Permission System Foundation

#### 1.1 Create Permission Types and Constants

**File**: `types/permissions.ts`

```typescript
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

// Helper function to check if role has permission
export function hasPermission(
  role: UserRole,
  resource: ResourceType,
  action: PermissionAction
): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some((p) => p.resource === resource && p.action === action);
}

// Helper function to check if role can read all records
export function canReadAllRecords(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}

// Helper function to check if role can manage users
export function canManageUsers(role: UserRole): boolean {
  return role === 'admin';
}
```

#### 1.2 Create Authorization Helper Functions

**File**: `lib/authorization.ts`

```typescript
import { getSession, getCurrentUser } from '@/lib/auth';
import { hasPermission, canReadAllRecords, canManageUsers } from '@/types/permissions';
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
  resourceType: ResourceType,
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
  if (userRole === 'manager' && resourceType === 'read') {
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
export async function getUserFilter(resourceType: ResourceType): Promise<{ userId?: string }> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Not authenticated');
  }

  const userRole = session.user.role;
  const currentUserId = session.user.id;

  // Admins and managers can see all records (no filter)
  if (userRole === 'admin' || (userRole === 'manager' && resourceType === 'read')) {
    return {};
  }

  // Reps and managers (for write operations) can only see their own records
  return { userId: currentUserId };
}

/**
 * Check if current user can manage other users
 */
export async function requireUserManagement(): Promise<{ success: boolean; error?: string }> {
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
export async function requireAnalyticsAccess(): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: 'Not authenticated' };
  }

  const userRole = session.user.role;

  if (userRole === 'rep') {
    return {
      success: false,
      error: "You don't have permission to view system analytics",
    };
  }

  return { success: true };
}
```

### Phase 4.2: API Route Protection

#### 2.1 Update Contacts API Routes

**File**: `app/api/contacts/route.ts` (GET, POST)

**Changes**:

- Add permission checks for create and read operations
- Filter contacts by userId based on user role
- Admins/managers see all, reps see only their own

**File**: `app/api/contacts/[id]/route.ts` (GET, PUT, DELETE)

**Changes**:

- Add permission checks for read, update, delete operations
- Check record ownership before allowing updates/deletes
- Admins can access all, managers/reps only their own

#### 2.2 Update Activities API Routes

**File**: `app/api/activities/route.ts` (GET, POST)

**Changes**:

- Add permission checks for create and read operations
- Filter activities by userId based on user role

**File**: `app/api/activities/[id]/route.ts` (GET, PUT, DELETE)

**Changes**:

- Add permission checks for read, update, delete operations
- Check record ownership

#### 2.3 Update Tasks API Routes

**File**: `app/api/tasks/route.ts` (GET, POST)

**Changes**:

- Add permission checks for create and read operations
- Filter tasks by userId based on user role

**File**: `app/api/tasks/[id]/route.ts` (GET, PUT, DELETE, PATCH)

**Changes**:

- Add permission checks for read, update, delete operations
- Check record ownership

#### 2.4 Update Deals API Routes

**File**: `app/api/deals/route.ts` (GET, POST)

**Changes**:

- Add permission checks for create and read operations
- Filter deals by userId based on user role

**File**: `app/api/deals/[id]/route.ts` (GET, PUT, DELETE, PATCH)

**Changes**:

- Add permission checks for read, update, delete operations
- Check record ownership

#### 2.5 Update Dashboard API Route

**File**: `app/api/dashboard/route.ts`

**Changes**:

- Add permission check for analytics access
- Filter data based on user role:
  - Admins: See all data
  - Managers: See all data
  - Reps: See only their own data

#### 2.6 Update Reports API Route

**File**: `app/api/reports/route.ts`

**Changes**:

- Add permission check for analytics access
- Filter data based on user role
- Reps only see their own reports

### Phase 4.3: "Assigned To" Fields

#### 3.1 Update Contact Form

**File**: `components/contacts/contact-form.tsx`

**Changes**:

- Add "Assigned to" field (user selector)
- Only show for admins and managers
- Default to current user for reps
- Filter available users based on role:
  - Admins: Can assign to any user
  - Managers: Can assign to any rep
  - Reps: Auto-assign to themselves

#### 3.2 Update Activity Form

**File**: `components/activities/activity-form.tsx`

**Changes**:

- Add "Assigned to" field (user selector)
- Similar logic to contact form

#### 3.3 Update Task Form

**File**: `components/tasks/task-form.tsx`

**Changes**:

- Add "Assigned to" field (user selector)
- Similar logic to contact form

#### 3.4 Update Deal Form

**File**: `components/deals/deal-form.tsx`

**Changes**:

- Add "Assigned to" field (user selector)
- Similar logic to contact form

#### 3.5 Create User Selector Component

**File**: `components/users/user-selector.tsx`

**Purpose**: Reusable component for selecting users

**Features**:

- Dropdown with user list
- Show user name and email
- Filter by role (optional)
- Multi-select support (optional)

### Phase 4.4: UI Component Protection

#### 4.1 Create Protected Component Wrapper

**File**: `components/auth/protected-component.tsx`

**Purpose**: Wrap components that should only be visible to specific roles

```typescript
import { useSession } from 'next-auth/react';
import type { UserRole } from '@/types/permissions';

interface ProtectedComponentProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function ProtectedComponent({
  children,
  allowedRoles,
  fallback = null
}: ProtectedComponentProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return <>{fallback}</>;
  }

  const hasAccess = allowedRoles.includes(session.user.role);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

#### 4.2 Update Navigation Component

**File**: `components/layout/navigation.tsx`

**Changes**:

- Hide "Users" link for reps
- Hide "Admin" link for non-admins
- Show role badge in user dropdown

#### 4.3 Update Contact Table

**File**: `components/contacts/contact-table.tsx`

**Changes**:

- Show "Assigned to" column
- Add user avatar/name display
- Filter rows based on user role

#### 4.4 Update Activity List

**File**: `components/activities/activity-list.tsx`

**Changes**:

- Show "Assigned to" column
- Filter rows based on user role

#### 4.5 Update Task List

**File**: `components/tasks/task-list.tsx`

**Changes**:

- Show "Assigned to" column
- Filter rows based on user role

#### 4.6 Update Deal List/Kanban

**File**: `components/deals/deal-list.tsx` and `components/deals/deal-kanban-board.tsx`

**Changes**:

- Show "Assigned to" column/card
- Filter based on user role

### Phase 4.5: Admin User Management

#### 5.1 Create Admin Users List Page

**File**: `app/admin/users/page.tsx`

**Purpose**: List and manage all users

**Features**:

- Table with user information (name, email, role, status, created at)
- Filter by role and status
- Search by name or email
- Actions: Edit, Delete, Activate/Deactivate, Verify Email
- Create new user button (admins only)
- Role badge display

#### 5.2 Create User Profile Page

**File**: `app/admin/users/[id]/page.tsx`

**Purpose**: View and edit user details

**Features**:

- User information display (name, email, role, status, avatar, bio)
- Edit mode for admins
- Change role (admin only)
- Activate/deactivate user
- Verify email
- Reset password
- View user's contacts, activities, tasks, deals count
- View sign-in history

#### 5.3 Create User Form Component

**File**: `components/users/user-form.tsx`

**Purpose**: Create/edit user form

**Features**:

- Name, email, password fields
- Role selector (admin only)
- Status toggle (active/inactive)
- Password strength indicator
- Email uniqueness validation

#### 5.4 Update Admin Users API Routes

**File**: `app/api/admin/users/route.ts` (GET, POST)

**Changes**:

- Add permission checks (admin only)
- List all users with pagination
- Create new user

**File**: `app/api/admin/users/[id]/route.ts` (GET, PUT, DELETE)

**Changes**:

- Add permission checks (admin only)
- Get user details
- Update user (role, status, email verification)
- Delete user

### Phase 4.6: Data Migration

#### 6.1 Assign Existing Records to Admin User

**Script**: `prisma/migrate-to-rbac.ts`

**Purpose**: Ensure all existing records have a userId

**Steps**:

1. Find admin user (admin@crm.com)
2. Find all contacts without userId
3. Assign them to admin user
4. Repeat for activities, tasks, deals

### Phase 4.7: Testing

#### 7.1 Unit Tests

- Test permission helper functions
- Test authorization checks
- Test user filter generation

#### 7.2 Integration Tests

- Test API route protection
- Test data filtering by role
- Test ownership checks

#### 7.3 End-to-End Tests

- Test admin user can access all features
- Test manager can read all but only edit own
- Test rep can only access own records
- Test "Assigned to" field functionality
- Test user management (admin only)

### Phase 4.8: Documentation

#### 8.1 Update README

- Add RBAC section
- Document role permissions
- Add user management guide

#### 8.2 Update API Documentation

- Document permission requirements
- Add RBAC examples

#### 8.3 Create User Guide

- How to use "Assigned to" fields
- How to manage users (admin)
- Role-based access explanation

## Success Criteria

- [ ] Permission system implemented with role definitions
- [ ] All API routes protected with permission checks
- [ ] Data filtering by user role working
- [ ] "Assigned to" fields added to all forms
- [ ] Admin user management UI implemented
- [ ] Navigation updated based on user role
- [ ] Protected component wrapper created
- [ ] Data migration completed
- [ ] All tests passing
- [ ] Documentation updated

## Known Risks

1. **Data Migration Complexity**: Existing records without userId need proper assignment
2. **Performance Impact**: Additional permission checks on every API call
3. **User Experience**: Reps may be confused by limited visibility
4. **Edge Cases**: Records created before RBAC may have null userId

## Mitigation Strategies

1. **Data Migration**: Create comprehensive migration script with rollback
2. **Performance**: Optimize permission checks, add caching where appropriate
3. **User Experience**: Clear messaging about role-based access
4. **Edge Cases**: Handle null userId gracefully, assign to admin by default

## Next Steps After Phase 4

- Phase 4.1: Social login (OAuth providers: Google, GitHub)
- Phase 4.2: Enhanced security features (IP intelligence, CAPTCHA)
- Phase 4.3: Device fingerprinting
- Phase 4.4: Automatic account locking for suspicious activity

## Dependencies

- Phase 3 (Authentication) - Complete ✅
- NextAuth.js session management - Complete ✅
- User model with role field - Complete ✅
- userId foreign keys on all models - Complete ✅

## Timeline

- Phase 4.1: Permission System Foundation - 1 day
- Phase 4.2: API Route Protection - 2 days
- Phase 4.3: "Assigned To" Fields - 1 day
- Phase 4.4: UI Component Protection - 1 day
- Phase 4.5: Admin User Management - 2 days
- Phase 4.6: Data Migration - 0.5 day
- Phase 4.7: Testing - 1 day
- Phase 4.8: Documentation - 0.5 day

**Total Estimated Time**: 9 days
