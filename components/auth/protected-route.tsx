'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/authorization';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: {
    resource: string;
    action: string;
  };
  requireRole?: string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requireRole,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          // Not authenticated, redirect to sign-in
          router.push('/auth/signin');
          return;
        }

        setUser(currentUser);

        // Check role requirements
        if (requireRole && !requireRole.includes(currentUser.role)) {
          setHasAccess(false);
          return;
        }

        // Check permission requirements
        if (requiredPermission) {
          const permissionCheck = await requirePermission(
            requiredPermission.resource as any,
            requiredPermission.action as any
          );

          if (!permissionCheck.success) {
            setHasAccess(false);
            return;
          }
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [router, requiredPermission, requireRole]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
