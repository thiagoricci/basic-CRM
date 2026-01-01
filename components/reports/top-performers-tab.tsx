'use client';

import { TopCompaniesByDealValue } from './top-companies-by-deal-value';
import { TopContactsByActivity } from './top-contacts-by-activity';
import { BiggestDealsWonThisMonth } from './biggest-deals-won-this-month';
import { TopContactsByDealValue } from './top-contacts-by-deal-value';
import type { ReportsData } from '@/types/reports';

interface TopPerformersTabProps {
  data: ReportsData;
}

export function TopPerformersTab({ data }: TopPerformersTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <TopCompaniesByDealValue data={data.topCompaniesByDealValue} />
        <TopContactsByActivity data={data.topContactsByActivity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BiggestDealsWonThisMonth data={data.biggestDealsWonThisMonth} />
        <TopContactsByDealValue data={data.topContactsByDealValue} />
      </div>
    </div>
  );
}
