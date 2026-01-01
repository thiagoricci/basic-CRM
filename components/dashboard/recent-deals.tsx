'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RecentDealsProps {
  deals: any[];
}

export function RecentDeals({ deals }: RecentDealsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (deals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No deals yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deals.slice(0, 5).map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{deal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {deal.contact
                          ? `${deal.contact.firstName} ${deal.contact.lastName}`
                          : 'No contact'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(deal.value)}
                    </p>
                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(new Date(deal.expectedCloseDate))}</span>
                    </div>
                  </div>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
