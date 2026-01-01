'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

interface DealFiltersProps {
  filters: DealFilters;
  onFilterChange: (filters: DealFilters) => void;
}

export interface DealFilters {
  stage: 'all' | 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  status: 'all' | 'open' | 'won' | 'lost';
  search: string;
  minValue: string;
  maxValue: string;
}

export function DealFilters({ filters, onFilterChange }: DealFiltersProps) {
  // Local state for immediate UI updates (only for search input)
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync searchInput with filters.search when it changes externally
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Debounce search input
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilter('search', searchInput);
      }
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchInput, filters.search]);

  const updateFilter = (key: keyof DealFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.status === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('status', 'all')}
          >
            All Deals
          </Button>
          <Button
            variant={filters.status === 'open' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('status', 'open')}
          >
            Open
          </Button>
          <Button
            variant={filters.status === 'won' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('status', 'won')}
          >
            Won
          </Button>
          <Button
            variant={filters.status === 'lost' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('status', 'lost')}
          >
            Lost
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.stage}
            onValueChange={(value) =>
              updateFilter('stage', value as DealFilters['stage'])
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search deals by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Min Value ($):
          </span>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={filters.minValue}
            onChange={(e) => updateFilter('minValue', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Max Value ($):
          </span>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="No limit"
            value={filters.maxValue}
            onChange={(e) => updateFilter('maxValue', e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
