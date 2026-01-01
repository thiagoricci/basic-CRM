'use client';

import { useParams, notFound } from 'next/navigation';
import useSWR from 'swr';
import { ActivityProfile } from '@/components/activities/activity-profile';
import { Activity } from '@/types/activity';

interface ActivityResponse {
  data: Activity | null;
  error: string | null;
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<ActivityResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch activity');
  }
  return response.json();
};

export default function ActivityDetailPage() {
  const params = useParams();
  const activityId = params.id as string;

  // Use SWR to fetch activity data with automatic revalidation
  const { data, error, isLoading, mutate } = useSWR<ActivityResponse>(
    `/api/activities/${activityId}`,
    fetcher,
    {
      revalidateOnFocus: true, // Refresh when tab regains focus
      revalidateOnReconnect: true, // Refresh when network reconnects
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
    }
  );

  // Expose mutate function for manual revalidation
  (window as any).refreshActivity = mutate;

  if (isLoading) {
    return (
      <div className="container space-y-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container space-y-8 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load activity</p>
          <button
            onClick={() => mutate()}
            className="mt-4 text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <ActivityProfile activity={data.data} />;
}
