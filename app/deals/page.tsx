'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { DealKanbanBoard } from '@/components/deals/deal-kanban-board';
import { DealList } from '@/components/deals/deal-list';
import { DealFilters, type DealFilters as DealFiltersType } from '@/components/deals/deal-filters';
import { Deal } from '@/types/deal';
import { DealPagination } from '@/components/deals/deal-pagination';
import { LoadingIndicator } from '@/components/deals/loading-indicator';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Plus } from 'lucide-react';

type ViewMode = 'board' | 'list';

interface DealsResponse {
  data: Deal[];
  error: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function DealsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [filters, setFilters] = useState<DealFiltersType>({
    stage: 'all',
    status: 'all',
    search: '',
    minValue: '',
    maxValue: '',
  });
  const [sortField, setSortField] = useState<'name' | 'value' | 'stage' | 'status' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all deals once (no query params)
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  };

  const { data, error, isLoading, mutate } = useSWR<DealsResponse>(
    '/api/deals',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleDealClick = (deal: Deal) => {
    router.push(`/deals/${deal.id}`);
  };

  const handleAddDeal = () => {
    router.push('/deals/new');
  };

  const handleFilterChange = (newFilters: DealFiltersType) => {
    setFilters(newFilters);
  };

  const handleSortChange = (field: 'name' | 'value' | 'stage' | 'status' | 'date') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter deals client-side
  const getFilteredDeals = () => {
    const allDeals = data?.data || [];
    return allDeals.filter((deal) => {
      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'open' && deal.status !== 'open') return false;
        if (filters.status === 'won' && deal.status !== 'won') return false;
        if (filters.status === 'lost' && deal.status !== 'lost') return false;
      }

      // Stage filter
      if (filters.stage !== 'all' && deal.stage !== filters.stage) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = deal.name.toLowerCase().includes(searchLower);
        const contactMatch = deal.contact
          ? `${deal.contact.firstName} ${deal.contact.lastName}`.toLowerCase().includes(searchLower)
          : false;
        if (!nameMatch && !contactMatch) return false;
      }

      // Min value filter
      if (filters.minValue && deal.value < parseFloat(filters.minValue)) {
        return false;
      }

      // Max value filter
      if (filters.maxValue && deal.value > parseFloat(filters.maxValue)) {
        return false;
      }

      return true;
    });
  };

  // Sort filtered deals
  const getSortedDeals = () => {
    const filtered = getFilteredDeals();
    const sorted = [...filtered];
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

  const totalPages = Math.ceil(getSortedDeals().length / ITEMS_PER_PAGE);
  const paginatedDeals = getSortedDeals().slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!data && isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading deals...</p>
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

  const filteredDeals = getFilteredDeals();

  return (
    <div className="container space-y-6 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Deals & Pipeline
            </h1>
            <p className="text-muted-foreground">
              Manage your sales opportunities
            </p>
          </div>
          <Button onClick={handleAddDeal} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'board' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('board')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Board View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
        </div>

        <DealFilters filters={filters} onFilterChange={handleFilterChange} />

        {isLoading && <LoadingIndicator />}

        {viewMode === 'board' ? (
          <div key="board">
            <DealKanbanBoard
              deals={filteredDeals}
              onDealClick={handleDealClick}
              onDealsChange={() => mutate()}
            />
          </div>
        ) : (
          <div key="list" className="space-y-6">
            <DealList
              deals={paginatedDeals}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
            <DealPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
