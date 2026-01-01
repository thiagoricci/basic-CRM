'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CompanyTable } from '@/components/companies/company-table';
import { CompanyFilters } from '@/components/companies/company-filters';
import { CompanyPagination } from '@/components/companies/company-pagination';
import { Plus } from 'lucide-react';
import useSWR from 'swr';
import type { CompanyWithRelations } from '@/types/company';

interface CompanyApiResponse {
  data: CompanyWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error: string | null;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetcher function for SWR
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  };

  // Fetch companies with SWR for smooth tab transitions
  const { data, error, isLoading } = useSWR<CompanyApiResponse>(
    `/api/companies?search=${encodeURIComponent(search)}&industry=${industry}&page=${page}&limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  const companies = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowClick = (company: CompanyWithRelations) => {
    router.push(`/companies/${company.id}`);
  };

  const handleAddCompany = () => {
    router.push('/companies/new');
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-1">
            {pagination.total} {pagination.total === 1 ? 'company' : 'companies'}
          </p>
        </div>
        <Button onClick={handleAddCompany}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <CompanyFilters
        search={search}
        onSearchChange={handleSearchChange}
        industry={industry}
        onIndustryChange={handleIndustryChange}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No companies found</p>
          <Button
            variant="outline"
            onClick={handleAddCompany}
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Company
          </Button>
        </div>
      ) : (
        <>
          {/* Companies Table */}
          <CompanyTable companies={companies} onRowClick={handleRowClick} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <CompanyPagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
