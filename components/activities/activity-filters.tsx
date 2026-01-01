'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Search, X, Filter, Calendar as CalendarIcon } from 'lucide-react';

export interface ActivityFilters {
  type?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onChange: (filters: ActivityFilters) => void;
}

export function ActivityFilters({ filters, onChange }: ActivityFiltersProps) {
  const [showDateRange, setShowDateRange] = useState(false);

  const handleSearchChange = (value: string) => {
    onChange({ ...filters, search: value || undefined });
  };

  const handleTypeChange = (value: string) => {
    onChange({ ...filters, type: value === 'all' ? undefined : value });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    onChange({
      ...filters,
      fromDate: range?.from ? range.from.toISOString() : undefined,
      toDate: range?.to ? range.to.toISOString() : undefined,
    });
  };

  const handleClearFilters = () => {
    onChange({});
  };

  const hasActiveFilters =
    filters.type || filters.search || filters.fromDate || filters.toDate;

  return (
    <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={filters.type || 'all'}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <Popover open={showDateRange} onOpenChange={setShowDateRange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              {filters.fromDate || filters.toDate ? (
                <span className="truncate">
                  {filters.fromDate && format(new Date(filters.fromDate), 'MMM d, yyyy')}
                  {filters.fromDate && filters.toDate && ' - '}
                  {filters.toDate && format(new Date(filters.toDate), 'MMM d, yyyy')}
                </span>
              ) : (
                <span className="text-muted-foreground">Date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.fromDate ? new Date(filters.fromDate) : undefined,
                to: filters.toDate ? new Date(filters.toDate) : undefined,
              }}
              onSelect={handleDateRangeChange}
              initialFocus
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
            {filters.type && (
              <Badge variant="secondary" className="gap-1">
                Type: {filters.type}
                <button
                  onClick={() => handleTypeChange('all')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.search}"
                <button
                  onClick={() => handleSearchChange('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.fromDate || filters.toDate) && (
              <Badge variant="secondary" className="gap-1">
                {filters.fromDate && format(new Date(filters.fromDate), 'MMM d, yyyy')}
                {filters.fromDate && filters.toDate && ' - '}
                {filters.toDate && format(new Date(filters.toDate), 'MMM d, yyyy')}
                <button
                  onClick={() => {
                    onChange({
                      ...filters,
                      fromDate: undefined,
                      toDate: undefined,
                    });
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
  );
}
