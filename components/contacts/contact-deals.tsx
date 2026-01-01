'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DealForm } from '@/components/deals/deal-form';
import { DealList } from '@/components/deals/deal-list';
import { DealFilters, type DealFilters as DealFiltersType } from '@/components/deals/deal-filters';
import { DealPagination } from '@/components/deals/deal-pagination';
import { Deal } from '@/types/deal';
import { Plus } from 'lucide-react';

interface ContactDealsProps {
  contactId: string;
  onRefresh: () => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch deals');
  }
  return response.json();
};

export function ContactDeals({ contactId, onRefresh }: ContactDealsProps) {
  const [showDealForm, setShowDealForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<DealFiltersType>({
    stage: 'all',
    status: 'all',
    search: '',
    minValue: '',
    maxValue: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'name' | 'value' | 'stage' | 'status' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch all deals for this contact once (client-side filtering)
  const fetchUrl = `/api/deals?contactId=${contactId}`;

  const { data, error, isLoading, mutate } = useSWR(
    fetchUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      keepPreviousData: true,
    }
  );

  // Use fetched data
  const allDeals = data?.data || [];

  // Client-side filtering function
  const getFilteredDeals = (deals: Deal[], filters: DealFiltersType): Deal[] => {
    let filtered = [...deals];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((deal) => deal.status === filters.status);
    }

    // Filter by stage
    if (filters.stage !== 'all') {
      filtered = filtered.filter((deal) => deal.stage === filters.stage);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((deal) =>
        deal.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by value range
    if (filters.minValue) {
      const minVal = parseFloat(filters.minValue);
      if (!isNaN(minVal)) {
        filtered = filtered.filter((deal) => deal.value >= minVal);
      }
    }

    if (filters.maxValue) {
      const maxVal = parseFloat(filters.maxValue);
      if (!isNaN(maxVal)) {
        filtered = filtered.filter((deal) => deal.value <= maxVal);
      }
    }

    return filtered;
  };

  // Client-side sorting function
  const getSortedDeals = (deals: Deal[]): Deal[] => {
    const sorted = [...deals];
    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'stage':
          comparison = a.stage.localeCompare(b.stage);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'date':
          comparison = new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  // Apply client-side filters and sorting
  const filteredDeals = getFilteredDeals(allDeals, filters);
  const sortedDeals = getSortedDeals(filteredDeals);

  const handleFilterChange = (newFilters: DealFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // No API call needed - filtering is client-side
  };

  const handleSortChange = (field: 'name' | 'value' | 'stage' | 'status' | 'date') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc for date, asc for others
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc');
    }
  };

  const handleAddDeal = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          contactId,
        }),
      });

      if (response.ok) {
        setShowDealForm(false);
        mutate();
        await onRefresh();
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeal = async (id: string) => {
    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
        await onRefresh();
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  // Calculate pagination (client-side filtering)
  const totalPages = Math.ceil(sortedDeals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDeals = sortedDeals.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deals</h2>
          <p className="text-muted-foreground">
            Sales opportunities for this contact
          </p>
        </div>
        {!showDealForm && (
          <Button onClick={() => setShowDealForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        )}
      </div>

      {showDealForm && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">New Deal</h3>
            <button
              onClick={() => setShowDealForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
          <DealForm
            initialData={{ contactId }}
            onSubmit={handleAddDeal}
            onCancel={() => setShowDealForm(false)}
            submitLabel="Create Deal"
          />
        </div>
      )}

      {!data && isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading deals...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load deals</p>
          <Button onClick={() => mutate()} variant="outline" className="mt-4">
            Try again
          </Button>
        </div>
      ) : (
        <>
          <DealFilters filters={filters} onFilterChange={handleFilterChange} />

          {sortedDeals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No deals found</p>
            </div>
          ) : (
            <>
              <DealList
                deals={paginatedDeals}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
              />
            </>
          )}
        </>
      )}

      {totalPages > 1 && (
        <DealPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
