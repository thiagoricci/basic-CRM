'use client';

import { useState } from 'react';
import { Check, Building2, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface Company {
  id: string;
  name: string;
}

interface CompanySelectorProps {
  value?: string;
  onChange: (companyId: string) => void;
  companies?: Company[];
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function CompanySelector({
  value,
  onChange,
  companies = [],
  loading = false,
  placeholder = 'Select a company',
  disabled = false,
  error,
}: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get selected company info
  const selectedCompany = companies.find((c) => c.id === value);

  // Filter companies based on search query
  const filteredCompanies = companies.filter((company) => {
    const name = company.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query);
  });

  const handleSelect = (companyId: string) => {
    onChange(companyId);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="company-selector">Company</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between text-left font-normal',
              !value && 'text-muted-foreground',
              error && 'border-destructive',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
          >
            {loading && value ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading company...</span>
              </div>
            ) : selectedCompany ? (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{selectedCompany.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 opacity-50" />
                <span>{placeholder}</span>
              </div>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Building2 className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search companies..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                disabled={disabled}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading companies...
                  </span>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <CommandEmpty>
                  {searchQuery ? 'No companies found' : 'No companies available'}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredCompanies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.id}
                      onSelect={() => handleSelect(company.id)}
                      disabled={disabled}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{company.name}</span>
                        </div>
                      </div>
                      {value === company.id && (
                        <Check className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
