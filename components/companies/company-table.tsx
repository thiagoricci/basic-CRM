'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink } from 'lucide-react';
import type { CompanyWithRelations } from '@/types/company';

interface CompanyTableProps {
  companies: CompanyWithRelations[];
  onRowClick?: (company: CompanyWithRelations) => void;
}

export function CompanyTable({ companies, onRowClick }: CompanyTableProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Contacts</TableHead>
            <TableHead>Deals</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow
              key={company.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick?.(company)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {company.name}
                </div>
              </TableCell>
              <TableCell>
                {company.industry ? (
                  <Badge variant="secondary">{company.industry}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{company._count?.contacts || 0}</TableCell>
              <TableCell>{company._count?.deals || 0}</TableCell>
              <TableCell>{formatDate(company.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick?.(company);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
