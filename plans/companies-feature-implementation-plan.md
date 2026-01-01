# Companies Feature Implementation Plan

## Overview

Add comprehensive Companies feature to the CRM Contact Manager, enabling users to group contacts under organizations and track company-level information.

## Feature Summary

**Companies** represent businesses/organizations that contacts work for. This feature allows:

- Grouping multiple contacts under one company
- Tracking company-level information (industry, website, revenue, etc.)
- Viewing all contacts, deals, activities, and tasks associated with a company
- Company-level analytics and metrics

## Database Schema Changes

### 1. Add Company Model

Create new `Company` model in `prisma/schema.prisma`:

```prisma
model Company {
  id              String    @id @default(uuid())
  name            String    @unique
  industry        String?
  website         String?
  phone           String?
  address         String?
  employeeCount   Int?
  revenue         Float?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  contacts        Contact[]
  deals           Deal[]

  @@index([name])
  @@index([industry])
  @@index([createdAt])
}
```

### 2. Modify Contact Model

Add fields to `Contact` model in `prisma/schema.prisma`:

```prisma
model Contact {
  id          String     @id @default(uuid())
  firstName   String
  lastName    String
  email       String     @unique
  phoneNumber String?    @unique
  status      String     @default("lead")
  jobTitle    String?    // NEW: Job title at company
  companyId   String?    // NEW: Optional company reference
  company     Company?   @relation(fields: [companyId], references: [id], onDelete: SetNull)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  activities  Activity[]
  tasks       Task[]
  deals       Deal[]

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@index([phoneNumber])
  @@index([companyId])  // NEW: Index for company lookups
}
```

### 3. Modify Deal Model

Add field to `Deal` model in `prisma/schema.prisma`:

```prisma
model Deal {
  id                String    @id @default(uuid())
  name              String
  value             Float
  stage             String    @default("lead")
  expectedCloseDate DateTime
  actualCloseDate   DateTime?
  status            String    @default("open")
  probability       Int?      @default(0)
  description       String?
  contactId         String
  contact           Contact   @relation(fields: [contactId], references: [id], onDelete: Cascade)
  companyId         String?   // NEW: Optional company reference
  company           Company?  @relation(fields: [companyId], references: [id], onDelete: SetNull)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([contactId])
  @@index([stage])
  @@index([status])
  @@index([expectedCloseDate])
  @@index([actualCloseDate])
  @@index([companyId])  // NEW: Index for company lookups
}
```

### 4. Database Migration

Run migration: `npx prisma migrate dev --name add_companies`

## TypeScript Types

### Create `types/company.ts`

```typescript
export interface Company {
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
  contacts?: Contact[];
  deals?: Deal[];
}

export interface CompanyWithRelations extends Company {
  _count?: {
    contacts: number;
    deals: number;
  };
}
```

### Update `types/contact.ts`

Add `jobTitle` and `companyId` fields to Contact interface.

### Update `types/deal.ts`

Add `companyId` field to Deal interface.

## Validation Schemas

### Update `lib/validations.ts`

Add company validation schema:

```typescript
export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255),
  industry: z.string().max(100).optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20)
    .optional()
    .or(z.literal('')),
  address: z.string().max(500).optional(),
  employeeCount: z.number().int().min(0).optional(),
  revenue: z.number().min(0).optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;
```

Update contact schema to include jobTitle and companyId:

```typescript
export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email format'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20)
    .optional()
    .or(z.literal('')),
  status: z.enum(['lead', 'customer'], { required_error: 'Status is required' }),
  jobTitle: z.string().max(100).optional(),
  companyId: z.string().uuid('Invalid company ID').optional().or(z.literal('')),
});
```

Update deal schema to include companyId:

```typescript
export const dealSchema = z.object({
  name: z.string().min(1, 'Deal name is required').max(255),
  value: z.number().min(0, 'Deal value must be positive'),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'], {
    required_error: 'Stage is required',
  }),
  expectedCloseDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  actualCloseDate: z.string().optional(),
  status: z.enum(['open', 'won', 'lost'], { required_error: 'Status is required' }),
  probability: z.number().min(0).max(100).optional(),
  description: z.string().max(1000).optional(),
  contactId: z.string().uuid('Invalid contact ID'),
  companyId: z.string().uuid('Invalid company ID').optional().or(z.literal('')),
});
```

## API Routes

### 1. Create `app/api/companies/route.ts`

**GET /api/companies** - List all companies with pagination and filtering

- Query params: search, industry, page, limit
- Returns: Array of companies with contact/deal counts

**POST /api/companies** - Create new company

- Body: CompanyInput
- Returns: Created company

### 2. Create `app/api/companies/[id]/route.ts`

**GET /api/companies/[id]** - Get single company with relations

- Returns: Company with contacts, deals, activities, tasks

**PUT /api/companies/[id]** - Update company

- Body: Partial<CompanyInput>
- Returns: Updated company

**DELETE /api/companies/[id]** - Delete company

- Sets companyId to null for all associated contacts and deals
- Returns: Success message

### 3. Update `app/api/contacts/route.ts`

Update POST to accept jobTitle and companyId fields.

### 4. Update `app/api/contacts/[id]/route.ts`

Update PUT to accept jobTitle and companyId fields.

### 5. Update `app/api/deals/route.ts`

Update POST to accept companyId field.

### 6. Update `app/api/deals/[id]/route.ts`

Update PUT to accept companyId field.

### 7. Update `app/api/dashboard/route.ts`

Add company analytics:

- Total companies
- Top 5 companies by deal value
- Companies by industry distribution

## Frontend Components

### 1. Create `components/companies/company-list.tsx`

- Table view of all companies
- Columns: Name, Industry, Website, Contacts Count, Deals Count, Created At
- Search by company name
- Filter by industry
- Pagination

### 2. Create `components/companies/company-table.tsx`

- Reusable table component for companies
- Sortable columns
- Row click to navigate to company profile

### 3. Create `components/companies/company-form.tsx`

- Form for creating/editing companies
- Fields: name, industry, website, phone, address, employeeCount, revenue
- Validation with react-hook-form + zod
- Submit and Cancel buttons

### 4. Create `components/companies/company-profile.tsx`

- Company information display
- Edit mode with inline form
- Delete button with confirmation
- Back button to companies list

### 5. Create `components/companies/company-filters.tsx`

- Filter controls for companies list
- Industry dropdown
- Search input

### 6. Create `components/companies/company-pagination.tsx`

- Pagination controls for companies list

### 7. Create `components/companies/company-contacts.tsx`

- Tab component showing all contacts at company
- Contact list with job titles
- Link to contact profiles
- Add contact button (opens contact form with companyId pre-filled)

### 8. Create `components/companies/company-deals.tsx`

- Tab component showing all deals for company
- Deal list with values and stages
- Link to deal profiles
- Add deal button (opens deal form with companyId pre-filled)

### 9. Create `components/companies/company-activities.tsx`

- Tab component showing all activities related to company (via contacts)
- Activity list with contact names
- Link to activity profiles

### 10. Create `components/companies/company-tasks.tsx`

- Tab component showing all tasks related to company (via contacts)
- Task list with contact names and due dates
- Link to task profiles

### 11. Create `components/companies/company-selector.tsx`

- Dropdown selector for choosing a company
- Used in contact and deal forms
- Searchable list of companies

### 12. Create `components/dashboard/company-analytics-cards.tsx`

- Analytics cards for companies
- Total Companies
- Companies with Active Deals
- Average Deal Value by Company

### 13. Create `components/dashboard/top-companies-chart.tsx`

- Bar chart showing top companies by deal value
- Top 10 companies

### 14. Create `components/dashboard/companies-by-industry-chart.tsx`

- Pie/donut chart showing companies by industry

### 15. Create `components/dashboard/recent-companies.tsx`

- List of recently added companies (last 5)

## Pages

### 1. Create `app/companies/page.tsx`

- Companies list page
- Uses CompanyList, CompanyFilters, CompanyPagination
- "Add Company" button
- Fetches companies from API (client-side filtering with SWR)

### 2. Create `app/companies/[id]/page.tsx`

- Company profile page
- Uses CompanyProfile with tabs
- Tabs: Information, Contacts, Deals, Activities, Tasks
- Fetches single company from API

### 3. Create `app/companies/new/page.tsx`

- New company page
- Uses CompanyForm
- Creates new company via API
- Redirects to company profile on success

## Dashboard Updates

### 1. Update `components/dashboard/dashboard-tabs.tsx`

Add Companies tab to dashboard tabs:

- Contacts, Activities, Tasks, Deals, Companies

### 2. Update `app/page.tsx`

Add Companies tab content:

- CompanyAnalyticsCards
- TopCompaniesChart
- CompaniesByIndustryChart
- RecentCompanies

### 3. Update `app/api/dashboard/route.ts`

Add company analytics data:

```typescript
const companyAnalytics = {
  totalCompanies: await prisma.company.count(),
  topCompaniesByValue: await prisma.deal.groupBy({
    by: ['companyId'],
    where: { companyId: { not: null } },
    _sum: { value: true },
    orderBy: { _sum: { value: 'desc' } },
    take: 5,
  }),
  companiesByIndustry: await prisma.company.groupBy({
    by: ['industry'],
    where: { industry: { not: null } },
    _count: true,
  }),
  recentCompanies: await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  }),
};
```

## Navigation Updates

### 1. Update `components/layout/navigation.tsx`

Add Companies link to main navigation:

- Dashboard, Contacts, Activities, Tasks, Deals, Companies, Docs

### 2. Update `components/layout/app-navigation.tsx`

Add Companies link to app navigation.

## Contact Form Updates

### 1. Update `components/contacts/contact-form.tsx`

Add fields:

- Job Title (text input, optional)
- Company (CompanySelector dropdown, optional)

### 2. Update `components/contacts/contact-profile.tsx`

Display job title and company information.

### 3. Update `components/contacts/contact-table.tsx`

Add column for Company name.

## Deal Form Updates

### 1. Update `components/deals/deal-form.tsx`

Add field:

- Company (CompanySelector dropdown, optional)

### 2. Update `components/deals/deal-profile.tsx`

Display company information.

### 3. Update `components/deals/deal-list.tsx`

Add column for Company name.

## UI Standardization

Follow established UI patterns:

- **Add Button**: Plus icon, primary variant
- **Edit Button**: Edit icon, outline variant
- **Delete Button**: Trash2 icon, destructive variant
- **Back Button**: ArrowLeft icon, outline variant
- **Dialog**: shadcn/ui Dialog for confirmations
- **Form**: Cancel button first, Submit button second
- **Loading States**: Consistent loading indicators
- **Error Handling**: Clear error messages

## Data Fetching Strategy

Use SWR for companies data fetching (similar to tasks and deals):

- Fetch all companies once on page load
- Filter locally to eliminate tab blinking
- Revalidate on create/update/delete operations

## Cascade Deletion Behavior

- **Deleting a company**: Sets companyId to null for all associated contacts and deals (does not delete contacts or deals)
- **Deleting a contact**: Cascade deletes all activities and tasks, but does not affect company or other contacts at same company
- **Deleting a deal**: Does not affect company or contacts

## Implementation Order

### Phase 1: Database & Types

1. Update Prisma schema (Company model, Contact/Deal modifications)
2. Run database migration
3. Create TypeScript types for Company
4. Update Contact and Deal types
5. Add company validation schema
6. Update contact and deal validation schemas

### Phase 2: API Routes

1. Create companies API routes (GET, POST, PUT, DELETE)
2. Update contacts API routes (jobTitle, companyId)
3. Update deals API routes (companyId)
4. Update dashboard API route (company analytics)

### Phase 3: Core Components

1. Create CompanyForm component
2. Create CompanyProfile component
3. Create CompanySelector component
4. Create CompanyTable component

### Phase 4: List & Filter Components

1. Create CompanyList component
2. Create CompanyFilters component
3. Create CompanyPagination component

### Phase 5: Company Profile Tabs

1. Create CompanyContacts component
2. Create CompanyDeals component
3. Create CompanyActivities component
4. Create CompanyTasks component

### Phase 6: Pages

1. Create companies list page
2. Create company profile page
3. Create new company page

### Phase 7: Dashboard Integration

1. Create CompanyAnalyticsCards component
2. Create TopCompaniesChart component
3. Create CompaniesByIndustryChart component
4. Create RecentCompanies component
5. Update dashboard tabs to include Companies
6. Update dashboard page to show company analytics

### Phase 8: Navigation & Integration

1. Update navigation components
2. Update ContactForm to include jobTitle and company
3. Update ContactProfile to display job title and company
4. Update ContactTable to show company column
5. Update DealForm to include company
6. Update DealProfile to display company
7. Update DealList to show company column

### Phase 9: Testing & Polish

1. Test all CRUD operations for companies
2. Test company-contact relationships
3. Test company-deal relationships
4. Test dashboard company analytics
5. Test filtering and search
6. Verify UI consistency
7. Check responsive design

## Important Considerations

1. **Company Uniqueness**: Company name must be unique (enforced at database level)
2. **Optional Relationships**: companyId is optional for both contacts and deals
3. **Job Title**: New field on Contact model, optional
4. **Website Validation**: Must be valid URL format if provided
5. **Revenue & Employee Count**: Numeric fields, optional
6. **Industry**: Text field, optional (for filtering and analytics)
7. **Performance**: Add indexes on companyId for efficient queries
8. **Data Integrity**: Set null on cascade (don't delete contacts/deals when company deleted)

## Testing Checklist

- [ ] Create company with all fields
- [ ] Create company with minimal fields (name only)
- [ ] Update company information
- [ ] Delete company (verify contacts/deals not deleted)
- [ ] Create contact with company assignment
- [ ] Update contact company assignment
- [ ] Remove company from contact
- [ ] Create deal with company assignment
- [ ] Update deal company assignment
- [ ] View company profile with all tabs
- [ ] Filter companies by industry
- [ ] Search companies by name
- [ ] View company analytics on dashboard
- [ ] Verify top companies chart accuracy
- [ ] Verify companies by industry chart
- [ ] Test company selector in contact form
- [ ] Test company selector in deal form
- [ ] Verify company column in contact table
- [ ] Verify company column in deal table
- [ ] Test responsive design on mobile
- [ ] Verify UI consistency with existing pages

## API Documentation Updates

Update `docs/API_DOCUMENTATION.md` to include:

- Companies endpoints documentation
- Updated contacts endpoints (jobTitle, companyId)
- Updated deals endpoints (companyId)
- Company relationship examples

## Migration Notes

1. **Existing Data**: Existing contacts will have companyId = null initially
2. **Data Migration**: Optional script to assign contacts to companies based on email domain
3. **Backward Compatibility**: All existing features continue to work without companies
4. **Zero Downtime**: Migration can be applied without application restart

## Future Enhancements (Post-Implementation)

- Company hierarchy (parent/child companies)
- Company territories/regions
- Company notes and documents
- Company activity feed
- Advanced company analytics
- Company comparison reports
- Company merge functionality
- Import companies from CSV
- Company tags and categories
