# Repetitive Tasks & Workflows

This file documents repetitive tasks and their workflows for future reference.

## Add Task Management Feature

**Last performed:** December 31, 2025

**Files to modify:**

- `prisma/schema.prisma` - Add Task model with Contact relationship
- `types/task.ts` - Create TypeScript interfaces for Task
- `lib/validations.ts` - Add task validation schema
- `app/api/tasks/route.ts` - Create GET (list) and POST (create) endpoints
- `app/api/tasks/[id]/route.ts` - Create GET (single), PUT (update), DELETE, PATCH (toggle complete) endpoints
- `app/tasks/page.tsx` - Create tasks list page
- `app/tasks/[id]/page.tsx` - Create task profile page
- `app/tasks/new/page.tsx` - Create new task page
- `components/tasks/task-list.tsx` - Create task list component
- `components/tasks/task-form.tsx` - Create task form component
- `components/tasks/task-profile.tsx` - Create task profile component
- `components/tasks/task-filters.tsx` - Create task filters component
- `components/tasks/task-pagination.tsx` - Create task pagination component
- `components/dashboard/upcoming-tasks.tsx` - Create upcoming tasks component for dashboard
- `components/contacts/contact-tasks.tsx` - Create tasks tab for contact profile
- `app/api/dashboard/route.ts` - Update to fetch upcoming tasks
- `components/layout/navigation.tsx` - Add Tasks link to navigation
- `app/page.tsx` - Add UpcomingTasks component to dashboard
- `components/contacts/contact-profile.tsx` - Add Tasks tab with Information, Activities, and Tasks

**Steps:**

1. Add Task model to Prisma schema with Contact relationship and cascade delete
2. Create TypeScript interfaces for Task and TaskInput
3. Add task validation schema with type constraints (low, medium, high priorities)
4. Create Task API endpoints following RESTful pattern (including PATCH for toggle complete)
5. Build tasks list page with filtering, search, and pagination
6. Create task profile page with full CRUD operations
7. Create new task page for task creation
8. Implement task form with contact selector and validation
9. Add task filters component (by status, priority, and search)
10. Implement task pagination for large datasets
11. Update dashboard to show upcoming tasks (tasks due today and next 5 tasks)
12. Add cascade deletion: deleting a contact deletes all associated tasks
13. Create contact-tasks component for contact profile Tasks tab
14. Update contact profile to include Tasks tab with Information, Activities, and Tasks
15. Test all CRUD operations and filtering functionality

**Important notes:**

- Task priorities: low, medium, high
- Task must be linked to a contact (contactId is required)
- Cascade delete: when contact is deleted, all tasks are automatically deleted
- Tasks are ordered by dueDate (soonest first)
- Task pagination: configurable items per page (default 10)
- Filters can be combined (status + priority + search)
- Task completion: PATCH endpoint toggles completed status and sets/clears completedAt timestamp
- Task status calculated: open (not completed), completed (completed), overdue (not completed AND dueDate < now)
- Contact selector should show contact name and email for easy identification
- Tasks tab on contact profile shows all tasks for that contact
- Create task from contact profile pre-fills contact

**Example implementation:**

```typescript
// Task model in Prisma schema
model Task {
  id          String    @id @default(uuid())
  title       String
  description String?
  dueDate     DateTime
  priority    String    @default("medium")
  completed   Boolean   @default(false)
  completedAt DateTime?
  contactId   String
  contact     Contact   @relation(fields: [contactId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([contactId])
  @@index([dueDate])
  @@index([completed])
  @@index([priority])
}

// Task validation schema
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Priority is required',
  }),
  contactId: z.string().uuid('Invalid contact ID'),
});

// API route example - PATCH /api/tasks/[id] (toggle complete)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json({ data: null, error: 'Task not found' }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
      },
    });

    return NextResponse.json({ data: updatedTask, error: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: 'Failed to update task' }, { status: 500 });
  }
}
```

## Add Activity Management Feature

**Last performed:** December 31, 2025

**Files to modify:**

- `prisma/schema.prisma` - Add Activity model with Contact relationship
- `types/activity.ts` - Create TypeScript interfaces for Activity
- `lib/validations.ts` - Add activity validation schema
- `app/api/activities/route.ts` - Create GET (list) and POST (create) endpoints
- `app/api/activities/[id]/route.ts` - Create GET (single), PUT (update), DELETE endpoints
- `app/activities/page.tsx` - Create activities list page
- `app/activities/[id]/page.tsx` - Create activity profile page
- `components/activities/activity-list.tsx` - Create activity list component
- `components/activities/activity-form.tsx` - Create activity form component
- `components/activities/activity-profile.tsx` - Create activity profile component
- `components/activities/activity-filters.tsx` - Create activity filters component
- `components/activities/activity-pagination.tsx` - Create activity pagination component
- `components/contacts/contact-selector.tsx` - Create contact selector for activity form
- `components/dashboard/recent-activities.tsx` - Create recent activities component for dashboard
- `app/api/dashboard/route.ts` - Update to fetch recent activities
- `components/layout/navigation.tsx` - Add Activities link to navigation
- `app/page.tsx` - Add RecentActivities component to dashboard

**Steps:**

1. Add Activity model to Prisma schema with Contact relationship and cascade delete
2. Create TypeScript interfaces for Activity and ActivityInput
3. Add activity validation schema with type constraints (call, email, meeting, note)
4. Create Activity API endpoints following RESTful pattern
5. Build activities list page with filtering, search, and pagination
6. Create activity profile page with full CRUD operations
7. Implement activity form with contact selector and validation
8. Add activity filters component (by type and date range)
9. Implement activity pagination for large datasets
10. Update dashboard to show recent activities
11. Add cascade deletion: deleting a contact deletes all associated activities
12. Test all CRUD operations and filtering functionality

**Important notes:**

- Activity types: call, email, meeting, note
- Activity must be linked to a contact (contactId is required)
- Cascade delete: when contact is deleted, all activities are automatically deleted
- Activities are ordered by createdAt (newest first)
- Activity pagination: configurable items per page (default 10)
- Filters can be combined (type + date range)
- Contact selector should show contact name and email for easy identification

**Example implementation:**

```typescript
// Activity model in Prisma schema
model Activity {
  id          String   @id @default(uuid())
  type        String
  subject     String
  description String?
  contactId   String
  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([contactId])
  @@index([createdAt])
  @@index([type])
}

// Activity validation schema
export const activitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note'], {
    required_error: 'Activity type is required',
  }),
  subject: z.string().min(1, 'Subject is required').max(255),
  description: z.string().max(1000).optional(),
  contactId: z.string().uuid('Invalid contact ID'),
});

// API route example - GET /api/activities
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const where: any = {};
  if (type && type !== 'all') {
    where.type = type;
  }
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const activities = await prisma.activity.findMany({
    where,
    include: { contact: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: activities, error: null });
}
```

## Add Phone Number Uniqueness

**Last performed:** December 30, 2025

**Files to modify:**

- `prisma/schema.prisma` - Add @unique constraint to phoneNumber field
- `lib/validations.ts` - Add phone number format validation
- `app/api/contacts/route.ts` - Add phone number uniqueness check on POST
- `app/api/contacts/[id]/route.ts` - Add phone number uniqueness check on PUT

**Steps:**

1. Update Prisma schema to add `@unique` constraint to phoneNumber field
2. Add index on phoneNumber for performance: `@@index([phoneNumber])`
3. Run database migration: `npx prisma db push --accept-data-loss`
4. Check for existing duplicates before migration (use check script)
5. Update validation schema with phone number format rules (10-20 characters)
6. Add phone number uniqueness check in POST /api/contacts
7. Add phone number uniqueness check in PUT /api/contacts/[id] (excluding current contact)
8. Test all scenarios (create, update, duplicate handling)
9. Update documentation

**Important notes:**

- Phone number field is optional (String?), so multiple contacts can have null values
- Unique constraint doesn't apply to null values in PostgreSQL
- When updating a contact, exclude the current contact from uniqueness check
- Check for existing duplicates before running migration to avoid failures
- Format validation: 10-20 characters minimum/maximum
- Clear error messages: "Phone number already exists"

**Example implementation:**

```typescript
// POST route - check uniqueness before creation
if (validatedData.phoneNumber) {
  const existingPhone = await prisma.contact.findUnique({
    where: { phoneNumber: validatedData.phoneNumber },
  });

  if (existingPhone) {
    return NextResponse.json({ data: null, error: 'Phone number already exists' }, { status: 400 });
  }
}

// PUT route - check uniqueness excluding current contact
if (validatedData.phoneNumber && validatedData.phoneNumber !== existingContact.phoneNumber) {
  const duplicatePhone = await prisma.contact.findUnique({
    where: { phoneNumber: validatedData.phoneNumber },
  });

  if (duplicatePhone) {
    return NextResponse.json({ data: null, error: 'Phone number already exists' }, { status: 400 });
  }
}
```

## Add New API Endpoint

**Description**: Create a new API route following the established pattern

**Files to modify**:

- `app/api/[resource]/route.ts` (or `app/api/[resource]/[id]/route.ts` for nested routes)
- `lib/queries.ts` (add database query functions)
- `lib/validations.ts` (add validation schemas if needed)

**Steps**:

1. Create the API route file in the appropriate directory
2. Implement HTTP methods (GET, POST, PUT, DELETE) as needed
3. Add database query functions to `lib/queries.ts`
4. Add validation schemas to `lib/validations.ts` if creating/updating data
5. Test the endpoint with curl or Postman
6. Update TypeScript types in `types/` if needed

**Important notes**:

- Always use the consistent response format: `{ data: T | null, error: string | null }`
- Use appropriate HTTP status codes (200, 201, 400, 404, 500)
- Always wrap database operations in try-catch blocks
- Validate input data on the server side

## Add New UI Component

**Description**: Create a new reusable UI component using shadcn/ui primitives

**Files to modify**:

- `components/[category]/[component-name].tsx`
- `components/ui/` (if adding new shadcn component)

**Steps**:

1. Check if shadcn/ui provides the needed primitive component
2. If yes, install it: `npx shadcn-ui@latest add [component]`
3. Create the component file in the appropriate category directory
4. Implement the component wrapping shadcn/ui primitives
5. Add TypeScript interfaces for props
6. Follow the "intentional minimalism" design philosophy
7. Test the component in isolation

**Important notes**:

- NEVER build custom modals, dropdowns, or buttons from scratch if shadcn/ui provides them
- You may wrap and style library components to achieve the avant-garde look
- Focus on distinctive typography, spacing, and micro-interactions
- Avoid generic AI aesthetics (purple gradients, Inter font, etc.)

## Add New Page Route

**Description**: Create a new page in the Next.js App Router

**Files to modify**:

- `app/[route]/page.tsx` (or `app/[route]/[id]/page.tsx` for dynamic routes)
- `app/layout.tsx` (if adding new navigation item)

**Steps**:

1. Create the page.tsx file in the appropriate directory
2. Determine if it should be a Server Component or Client Component
3. Implement the page logic and UI
4. Add navigation link if needed
5. Test the route in the browser
6. Add loading state if needed (loading.tsx)

**Important notes**:

- Use Server Components by default, only use Client Components when necessary
- Fetch data directly in Server Components when possible
- Use Next.js fetch API with revalidation for data fetching
- Follow the established component structure

## Database Schema Migration

**Description**: Apply database schema changes

**Files to modify**:

- `schema.sql` or `prisma/schema.prisma`
- Database (via psql or Prisma migrate)

**Steps**:

1. Update the schema file with new changes
2. Create a migration file if using Prisma
3. Test the migration on a development database
4. Update TypeScript types in `types/` to reflect schema changes
5. Update query functions in `lib/queries.ts` if needed
6. Document the migration

**Important notes**:

- Always create indexes on frequently queried columns
- Use parameterized queries to prevent SQL injection
- Test migrations thoroughly before applying to production
- Keep migration files for rollback capability

## Add Form Validation

**Description**: Add validation to a form using Zod

**Files to modify**:

- `lib/validations.ts` (add schema)
- Component file using the form

**Steps**:

1. Define the Zod schema with appropriate validation rules
2. Export the schema and its inferred type
3. Use `react-hook-form` with `zodResolver`
4. Add error display to form fields
5. Test validation on client and server side

**Important notes**:

- Always validate on both client and server side
- Use clear, user-friendly error messages
- Leverage Zod's built-in validation methods (email, min, max, etc.)
- Export the inferred type for TypeScript safety

## Add Chart Component

**Description**: Create a new chart using Recharts

**Files to modify**:

- `components/[category]/[chart-name].tsx`
- Page component that uses the chart

**Steps**:

1. Install Recharts if not already installed
2. Create the chart component
3. Define the data structure for the chart
4. Configure the chart type (Line, Pie, Bar, etc.)
5. Add styling and responsive design
6. Test with sample data

**Important notes**:

- Use Recharts via shadcn/ui when possible
- Ensure charts are responsive
- Add appropriate labels and tooltips
- Consider color contrast and accessibility

## Add Deal Management Feature

**Last performed:** December 31, 2025

**Files to modify:**

- `prisma/schema.prisma` - Add Deal model with Contact relationship
- `types/deal.ts` - Create TypeScript interfaces for Deal
- `lib/validations.ts` - Add deal validation schema
- `app/api/deals/route.ts` - Create GET (list) and POST (create) endpoints
- `app/api/deals/[id]/route.ts` - Create GET (single), PUT (update), DELETE, PATCH (update stage) endpoints
- `app/deals/page.tsx` - Create deals list page
- `app/deals/[id]/page.tsx` - Create deal profile page
- `app/deals/new/page.tsx` - Create new deal page
- `components/deals/deal-list.tsx` - Create deal list component
- `components/deals/deal-form.tsx` - Create deal form component
- `components/deals/deal-profile.tsx` - Create deal profile component
- `components/deals/deal-filters.tsx` - Create deal filters component
- `components/deals/deal-pagination.tsx` - Create deal pagination component
- `components/deals/deal-kanban-board.tsx` - Create Kanban board component
- `components/deals/deal-kanban-column.tsx` - Create Kanban column component
- `components/deals/deal-card.tsx` - Create deal card component
- `components/deals/loading-indicator.tsx` - Create loading indicator component
- `components/dashboard/pipeline-metrics.tsx` - Create pipeline metrics component for dashboard
- `components/dashboard/pipeline-chart.tsx` - Create pipeline chart component for dashboard
- `components/dashboard/recent-deals.tsx` - Create recent deals component for dashboard
- `components/contacts/contact-deals.tsx` - Create deals tab for contact profile
- `app/api/dashboard/route.ts` - Update to fetch deal analytics
- `components/layout/navigation.tsx` - Add Deals link to navigation
- `app/page.tsx` - Add Deals tab to dashboard
- `components/dashboard/dashboard-tabs.tsx` - Update to include Deals tab

**Steps:**

1. Add Deal model to Prisma schema with Contact relationship and cascade delete
2. Create TypeScript interfaces for Deal and DealInput
3. Add deal validation schema with type constraints (lead, qualified, proposal, negotiation, closed_won, closed_lost stages)
4. Create Deal API endpoints following RESTful pattern (including PATCH for stage updates)
5. Build deals list page with filtering, search, and pagination
6. Create deal profile page with full CRUD operations
7. Create new deal page for deal creation
8. Implement deal form with contact selector and validation
9. Add deal filters component (by stage, status, value range, date range, and search)
10. Implement deal pagination for large datasets
11. Create Kanban board component with drag-and-drop functionality
12. Create Kanban column components for each stage
13. Create deal card component for displaying deals
14. Implement loading indicator for deals
15. Update dashboard to show pipeline metrics and recent deals
16. Add cascade deletion: deleting a contact deletes all associated deals
17. Create contact-deals component for contact profile Deals tab
18. Update contact profile to include Deals tab with Information, Activities, Tasks, and Deals
19. Test all CRUD operations and filtering functionality
20. Test drag-and-drop functionality on Kanban board

**Important notes:**

- Deal stages: lead, qualified, proposal, negotiation, closed_won, closed_lost
- Deal status: open, won, lost
- Deal must be linked to a contact (contactId is required)
- Cascade delete: when contact is deleted, all deals are automatically deleted
- Deals are ordered by createdAt (newest first)
- Deal pagination: configurable items per page (default 10)
- Filters can be combined (stage + status + value range + date range + search)
- Deal stage updates: PATCH endpoint updates stage and status
- When moving to closed_won stage, status automatically becomes 'won'
- When moving to closed_lost stage, status automatically becomes 'lost'
- For other stages, status becomes 'open'
- Contact selector should show contact name and email for easy identification
- Deals tab on contact profile shows all deals for that contact
- Create deal from contact profile pre-fills contact
- Kanban board uses @hello-pangea/dnd for drag-and-drop functionality
- Dragging a deal to a new column automatically updates its stage via API

**Example implementation:**

````typescript
// Deal model in Prisma schema
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
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([contactId])
  @@index([stage])
  @@index([status])
  @@index([expectedCloseDate])
  @@index([actualCloseDate])
}

// Deal validation schema
export const dealSchema = z.object({
  name: z.string().min(1, 'Deal name is required').max(255),
  value: z.number().min(0, 'Deal value must be positive'),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'], {
    required_error: 'Stage is required',
  }),
  expectedCloseDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  actualCloseDate: z.string().optional(),
  status: z.enum(['open', 'won', 'lost'], {
    required_error: 'Status is required',
  }),
  probability: z.number().min(0).max(100).optional(),
  description: z.string().max(1000).optional(),
  contactId: z.string().uuid('Invalid contact ID'),
});

// API route example - PATCH /api/deals/[id] (update stage)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { stage, status } = body;

    const updatedDeal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        stage,
        status,
        actualCloseDate: status === 'won' || status === 'lost' ? new Date() : null,
      },
    });

    return NextResponse.json({ data: updatedDeal, error: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: 'Failed to update deal' }, { status: 500 });
  }
}

## Add Company Management Feature

**Last performed:** December 31, 2025

**Files to modify:**

- `prisma/schema.prisma` - Add Company model with Contact and Deal relationships
- `types/company.ts` - Create TypeScript interfaces for Company
- `lib/validations.ts` - Add company validation schema
- `app/api/companies/route.ts` - Create GET (list) and POST (create) endpoints
- `app/api/companies/[id]/route.ts` - Create GET (single), PUT (update), DELETE endpoints
- `app/companies/page.tsx` - Create companies list page
- `app/companies/[id]/page.tsx` - Create company profile page
- `app/companies/new/page.tsx` - Create new company page
- `components/companies/company-table.tsx` - Create company list component
- `components/companies/company-form.tsx` - Create company form component
- `components/companies/company-profile.tsx` - Create company profile component
- `components/companies/company-filters.tsx` - Create company filters component
- `components/companies/company-pagination.tsx` - Create company pagination component
- `components/companies/company-contacts.tsx` - Create contacts tab for company profile
- `components/companies/company-deals.tsx` - Create deals tab for company profile
- `components/companies/company-activities.tsx` - Create activities tab for company profile
- `components/companies/company-tasks.tsx` - Create tasks tab for company profile
- `components/companies/company-selector.tsx` - Create company selector for contact and deal forms
- `components/dashboard/company-analytics-cards.tsx` - Create company analytics cards for dashboard
- `components/dashboard/top-companies-chart.tsx` - Create top companies chart for dashboard
- `components/dashboard/companies-by-industry-chart.tsx` - Create companies by industry chart for dashboard
- `components/dashboard/recent-companies.tsx` - Create recent companies component for dashboard
- `app/api/dashboard/route.ts` - Update to fetch company analytics
- `components/layout/navigation.tsx` - Add Companies link to navigation
- `components/dashboard/dashboard-tabs.tsx` - Update to include Companies tab
- `components/contacts/contact-form.tsx` - Add company selector to contact form
- `components/deals/deal-form.tsx` - Add company selector to deal form

**Steps:**

1. Add Company model to Prisma schema with Contact and Deal relationships
2. Create TypeScript interfaces for Company and CompanyInput
3. Add company validation schema with type constraints (industry, website, phone, address, employeeCount, revenue)
4. Create Company API endpoints following RESTful pattern
5. Build companies list page with filtering, search, and pagination
6. Create company profile page with full CRUD operations
7. Create new company page for company creation
8. Implement company form with validation
9. Add company filters component (by industry and search)
10. Implement company pagination for large datasets
11. Create company profile tabs: Information, Contacts, Deals, Activities, Tasks
12. Add cascade deletion: deleting a company sets companyId to null on related contacts and deals
13. Create company selector for contact and deal forms
14. Update dashboard to show company analytics (total companies, companies with deals, top companies, companies by industry)
15. Add Companies link to navigation
16. Update dashboard tabs to include Companies tab
17. Test all CRUD operations and filtering functionality

**Important notes:**

- Company fields: name (required, unique), industry, website, phone, address, employeeCount, revenue
- Company name must be unique
- Cascade deletion: when company is deleted, companyId is set to null on related contacts and deals (not cascade delete)
- Companies can have multiple contacts and deals
- Contacts can be assigned to companies (via companyId field)
- Deals can be assigned to companies (via companyId field)
- Companies are ordered by createdAt (newest first)
- Company pagination: configurable items per page (default 10)
- Filters can be combined (industry + search)
- Company selector should show company name and industry for easy identification
- Company profile shows all related contacts, deals, activities, and tasks
- Create contact/deal from company profile pre-fills company

**Example implementation:**

```typescript
// Company model in Prisma schema
model Company {
  id            String    @id @default(uuid())
  name          String    @unique
  industry      String?
  website       String?
  phone         String?
  address       String?
  employeeCount Int?
  revenue       Float?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  contacts      Contact[]
  deals         Deal[]

  @@index([name])
  @@index([industry])
}

// Company validation schema
export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255),
  industry: z.string().max(100).optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  phone: z.string().min(10).max(20).optional(),
  address: z.string().max(500).optional(),
  employeeCount: z.number().int().positive().optional(),
  revenue: z.number().positive().optional(),
});

// API route example - DELETE /api/companies/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Update all related contacts to set companyId to null
    await prisma.contact.updateMany({
      where: { companyId: params.id },
      data: { companyId: null },
    });

    // Update all related deals to set companyId to null
    await prisma.deal.updateMany({
      where: { companyId: params.id },
      data: { companyId: null },
    });

    // Delete the company
    await prisma.company.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: 'Failed to delete company' }, { status: 500 });
  }
}
````

```

```
