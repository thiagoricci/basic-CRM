'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

interface TaskFiltersProps {
  onFilterChange: (filters: TaskFilters) => void;
}

export interface TaskFilters {
  status: 'all' | 'open' | 'completed' | 'overdue';
  priority: 'all' | 'low' | 'medium' | 'high';
  search: string;
}

export function TaskFilters({ onFilterChange }: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'open',
    priority: 'all',
    search: '',
  });

  const updateFilter = (key: keyof TaskFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
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
            All Tasks
          </Button>
          <Button
            variant={filters.status === 'open' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('status', 'open')}
          >
            Open
          </Button>
          <Button
            variant={filters.status === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('status', 'completed')}
          >
            Completed
          </Button>
          <Button
            variant={filters.status === 'overdue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('status', 'overdue')}
          >
            Overdue
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.priority}
            onValueChange={(value) =>
              updateFilter('priority', value as TaskFilters['priority'])
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks by title..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
