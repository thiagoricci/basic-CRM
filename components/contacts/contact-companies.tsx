'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Globe, Phone, MapPin, Users, DollarSign } from 'lucide-react';
import { Company } from '@/types/company';

interface ContactCompaniesProps {
  companyId: string | null | undefined;
  company?: Company | null;
  onCompanyClick?: (company: Company) => void;
}

export function ContactCompanies({ companyId, company, onCompanyClick }: ContactCompaniesProps) {
  // If no company assigned, show empty state
  if (!companyId || !company) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Company</h2>
          <p className="text-muted-foreground">
            Company information for this contact
          </p>
        </div>

        <div className="text-center py-12 rounded-lg border border-dashed">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No company assigned</p>
          <p className="text-sm text-muted-foreground mt-2">
            Assign this contact to a company to view company details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Company</h2>
        <p className="text-muted-foreground">
          Company information for this contact
        </p>
      </div>

      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onCompanyClick?.(company)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{company.name}</CardTitle>
                {company.industry && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {company.industry}
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {company.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline break-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            )}

            {company.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{company.phone}</p>
                </div>
              </div>
            )}

            {company.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-sm">{company.address}</p>
                </div>
              </div>
            )}

            {company.employeeCount !== null && company.employeeCount !== undefined && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Employees</p>
                  <p className="text-sm">{company.employeeCount}</p>
                </div>
              </div>
            )}

            {company.revenue !== null && company.revenue !== undefined && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-sm">
                    ${company.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
