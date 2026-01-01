# Companies View Fix Plan

## Problem

When users click on a company from the companies list, the company profile page opens but:

- Activities tab shows "No activities recorded for this company" (empty)
- Tasks tab shows "No tasks for this company" (empty)

## Root Cause

1. The API endpoint `/api/companies/[id]` only fetches contacts and deals, not activities and tasks
2. The company profile page passes empty arrays (`activities={[]}`, `tasks={[]}`) to Activities and Tasks tabs
3. Activities and tasks are linked to contacts, not directly to companies, so they need to be aggregated

## Database Schema Analysis

From `prisma/schema.prisma`:

- `Activity` model has `contactId` field linking to `Contact`
- `Task` model has `contactId` field linking to `Contact`
- `Contact` model has `companyId` field linking to `Company`
- `Company` model has `contacts` relation (one-to-many)

To get activities/tasks for a company, we need to:

1. Fetch all contacts for the company
2. Fetch all activities for those contacts
3. Fetch all tasks for those contacts

## Implementation Plan

### 1. Update API Endpoint

**File**: `app/api/companies/[id]/route.ts`

**Changes**:

- Modify GET endpoint to fetch activities and tasks from company's contacts
- Add nested includes for contacts' activities and tasks
- Return aggregated activities and tasks in response

**Implementation**:

```typescript
// Update the Prisma query to include activities and tasks from contacts
const company = await prisma.company.findUnique({
  where: { id: params.id },
  include: {
    contacts: {
      orderBy: { createdAt: 'desc' },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
      },
    },
    deals: {
      orderBy: { createdAt: 'desc' },
    },
    _count: {
      select: {
        contacts: true,
        deals: true,
      },
    },
  },
});

// Aggregate activities and tasks from contacts
const activities = company.contacts.flatMap((contact) => contact.activities);
const tasks = company.contacts.flatMap((contact) => contact.tasks);

// Return with aggregated data
return NextResponse.json({
  data: {
    ...company,
    activities,
    tasks,
  },
  error: null,
});
```

### 2. Update Company Type

**File**: `types/company.ts`

**Changes**:

- Add `activities?: Activity[]` field
- Add `tasks?: Task[]` field
- Import Activity and Task types

**Implementation**:

```typescript
import type { Contact } from './contact';
import type { Deal } from './deal';
import type { Activity } from './activity';
import type { Task } from './task';

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
  activities?: Activity[]; // NEW
  tasks?: Task[]; // NEW
}
```

### 3. Update Company Profile Page

**File**: `app/companies/[id]/page.tsx`

**Changes**:

- Pass `company.activities` to `CompanyActivities` component
- Pass `company.tasks` to `CompanyTasks` component
- Update Company interface to include activities and tasks

**Implementation**:

```typescript
// Update the Company interface to include activities and tasks
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
  activities?: any[];  // NEW
  tasks?: any[];       // NEW
}

// Update tabs to pass activities and tasks
<TabsContent value="activities" className="mt-4">
  <CompanyActivities
    activities={company.activities || []}
    onActivityClick={(activity) => router.push(`/activities/${activity.id}`)}
  />
</TabsContent>

<TabsContent value="tasks" className="mt-4">
  <CompanyTasks
    tasks={company.tasks || []}
    onTaskClick={(task) => router.push(`/tasks/${task.id}`)}
  />
</TabsContent>
```

## Expected Result

After implementing these changes:

- Clicking on a company from the companies list opens the company profile page
- Company information is displayed (already working)
- Contacts tab shows all contacts at the company (already working)
- Deals tab shows all deals for the company (already working)
- **Activities tab shows all activities associated with the company's contacts** (FIXED)
- **Tasks tab shows all tasks associated with the company's contacts** (FIXED)

## Testing Checklist

- [ ] Navigate to companies list page
- [ ] Click on a company with contacts
- [ ] Verify company information displays correctly
- [ ] Verify contacts tab shows company's contacts
- [ ] Verify deals tab shows company's deals
- [ ] Verify activities tab shows activities from company's contacts
- [ ] Verify tasks tab shows tasks from company's contacts
- [ ] Click on activities to navigate to activity profiles
- [ ] Click on tasks to navigate to task profiles
- [ ] Test with company that has no contacts (should show empty states)
- [ ] Test with company that has contacts but no activities/tasks (should show empty states)
