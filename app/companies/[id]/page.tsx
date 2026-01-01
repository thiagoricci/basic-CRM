'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyProfile } from '@/components/companies/company-profile';
import { CompanyContacts } from '@/components/companies/company-contacts';
import { CompanyDeals } from '@/components/companies/company-deals';
import { CompanyActivities } from '@/components/companies/company-activities';
import { CompanyTasks } from '@/components/companies/company-tasks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, DollarSign, Phone, Mail, Calendar, CheckSquare } from 'lucide-react';
import useSWR from 'swr';

interface Company {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  employeeCount?: number | null;
  revenue?: number | null;
  createdAt: Date;
  updatedAt: Date;
  contacts?: any[];
  deals?: any[];
  activities?: any[];
  tasks?: any[];
}

interface CompanyApiResponse {
  data: Company;
  error: string | null;
}

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('information');

  // Fetcher function for SWR
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  };

  // Fetch company data
  const { data, error, isLoading } = useSWR<CompanyApiResponse>(
    `/api/companies/${params.id}`,
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  const company = data?.data;

  const handleUpdate = async (id: string, data: any) => {
    const response = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Refresh data
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/companies/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      router.push('/companies');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-foreground" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground mt-2">{error || 'Company not found'}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          {company.industry && (
            <span className="ml-3 text-muted-foreground">
              • {company.industry}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="information" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Information
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contacts ({company.contacts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Deals ({company.deals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks ({company.tasks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Activities ({company.activities?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="information" className="mt-6">
          <CompanyProfile
            company={company}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <CompanyContacts
            contacts={company.contacts || []}
            onContactClick={(contact) => router.push(`/contacts/${contact.id}`)}
          />
        </TabsContent>

        <TabsContent value="deals" className="mt-6">
          <CompanyDeals
            deals={company.deals || []}
            onDealClick={(deal) => router.push(`/deals/${deal.id}`)}
          />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <CompanyTasks
            tasks={company.tasks || []}
            onTaskClick={(task) => router.push(`/tasks/${task.id}`)}
          />
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <CompanyActivities
            activities={company.activities || []}
            onActivityClick={(activity) => router.push(`/activities/${activity.id}`)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
