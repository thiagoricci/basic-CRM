'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset?: 'today' | 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'custom';
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'Today', value: 'today' as const },
    { label: 'This Week', value: 'thisWeek' as const },
    { label: 'This Month', value: 'thisMonth' as const },
    { label: 'This Quarter', value: 'thisQuarter' as const },
    { label: 'Custom', value: 'custom' as const },
  ];

  const handlePresetChange = (preset: DateRange['preset']) => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now.setHours(23, 59, 59, 999));

    switch (preset) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'thisWeek':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      default:
        startDate = value.startDate;
    }

    onChange({ startDate, endDate, preset });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value.preset || 'custom'}
        onValueChange={(v) => handlePresetChange(v as DateRange['preset'])}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
            <Calendar className="mr-2 h-4 w-4" />
            {format(value.startDate, 'MMM dd, yyyy')} - {format(value.endDate, 'MMM dd, yyyy')}
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarComponent
            mode="range"
            selected={{ from: value.startDate, to: value.endDate }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange({ startDate: range.from, endDate: range.to, preset: 'custom' });
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
