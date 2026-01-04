import { requireAuth } from '@/lib/auth';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  // Check authentication - redirect to sign-in if not authenticated
  await requireAuth();

  // Render the client component with all interactive features
  return <DashboardClient />;
}
