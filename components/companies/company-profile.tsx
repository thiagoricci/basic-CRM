'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CompanyForm } from './company-form';
import { Edit2, Trash2, ArrowLeft, Building2, Globe, Phone, MapPin, Users, DollarSign } from 'lucide-react';
import type { Company } from '@/types/company';

interface CompanyProfileProps {
  company: Company;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CompanyProfile({ company, onUpdate, onDelete }: CompanyProfileProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleUpdate = async (data: any) => {
    await onUpdate(company.id, data);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(company.id);
    setDeleteDialogOpen(false);
    router.push('/companies');
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {isEditing ? (
        <CompanyForm
          initialData={{
            name: company.name,
            industry: company.industry || undefined,
            website: company.website || undefined,
            phone: company.phone || undefined,
            address: company.address || undefined,
            employeeCount: company.employeeCount || undefined,
            revenue: company.revenue || undefined,
          }}
          onSubmit={(data) => handleUpdate(data)}
          submitLabel="Update Company"
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{company.name}</h3>
                <div className="flex gap-2 mt-2">
                  {company.industry && (
                    <Badge variant="secondary">{company.industry}</Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-6">
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {company.website}
                    </a>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {company.phone}
                    </span>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {company.address}
                    </span>
                  </div>
                )}

                {company.employeeCount !== null && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {company.employeeCount?.toLocaleString() || 0} employees
                    </span>
                  </div>
                )}

                {company.revenue !== null && company.revenue !== undefined && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      ${company.revenue.toLocaleString()} / year
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  <p>Created: {formatDate(company.createdAt)}</p>
                  <p>Last Updated: {formatDate(company.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Company Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Contacts</p>
                  <p className="text-2xl font-bold">
                    {company.contacts?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deals</p>
                  <p className="text-2xl font-bold">
                    {company.deals?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{company.name}</strong>? This will
              remove the company but will not delete any associated contacts or deals.
              Contacts and deals will remain in the system without a company association.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
