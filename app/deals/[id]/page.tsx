
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Deal } from '@/types/deal';
import { DealProfile } from '@/components/deals/deal-profile';

export default function DealProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeal();
  }, [params.id]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/deals/${params.id}`);
      const result = await response.json();

      if (result.data) {
        setDeal(result.data);
      } else {
        setError(result.error || 'Deal not found');
      }
    } catch (err) {
      setError('Failed to fetch deal');
      console.error('Error fetching deal:', err);
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function for child components
  useEffect(() => {
    (window as any).refreshDeal = fetchDeal;
    return () => {
      delete (window as any).refreshDeal;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return null;
  }

  return <DealProfile deal={deal} />;
}
