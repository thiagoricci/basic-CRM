# Deals/Pipeline Feature - Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive Deals/Pipeline management feature for the CRM. The feature will track sales opportunities through a visual pipeline with Kanban board functionality, similar to Trello.

## Feature Requirements

### Core Functionality

1. **Deal CRUD Operations**
   - Create, view, edit, delete deals
   - Deal fields: name, value, stage, expectedCloseDate, actualCloseDate, status, contactId
   - Cascade deletion with contacts

2. **Pipeline Stages**
   - Lead/Prospecting
   - Qualified
   - Proposal
   - Negotiation
   - Closed Won
   - Closed Lost

3. **Kanban Board View**
   - Visual pipeline with columns for each stage
   - Drag-and-drop to move deals between stages
   - Real-time stage updates
   - Deal cards showing key information

4. **Deal List View**
   - Table view with all deals
   - Filters by stage, status, date range, value range
   - Search by deal name
   - Pagination for large datasets

5. **Deal Detail Page**
   - Full deal information display
   - Edit/delete functionality
   - Linked contact information
   - Associated activities and tasks
   - Stage history (future enhancement)

6. **Dashboard Metrics**
   - Total pipeline value
   - Deals by stage distribution
   - Win rate percentage
   - Revenue forecasts
   - Recent deals widget

## Implementation Plan

### Phase 1: Database & Types

#### 1.1 Update Prisma Schema

**File**: `prisma/schema.prisma`

Add Deal model:

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
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([contactId])
  @@index([stage])
  @@index([status])
  @@index([expectedCloseDate])
  @@index([actualCloseDate])
}
```

Update Contact model to include deals relation:

```prisma
model Contact {
  // ... existing fields
  deals Deal[]
}
```

**Stage values**: 'lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
**Status values**: 'open', 'won', 'lost'

#### 1.2 Create TypeScript Types

**File**: `types/deal.ts`

```typescript
export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: Date;
  actualCloseDate: Date | null;
  status: DealStatus;
  probability: number | null;
  description: string | null;
  contactId: string;
  contact?: Contact;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealInput {
  name: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string;
  actualCloseDate?: string;
  status: DealStatus;
  probability?: number;
  description?: string;
  contactId: string;
}

export type DealStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';
export type DealStatus = 'open' | 'won' | 'lost';

export interface DealMetrics {
  totalPipelineValue: number;
  wonDealsValue: number;
  lostDealsValue: number;
  winRate: number;
  dealsByStage: Record<DealStage, number>;
  averageDealSize: number;
}
```

#### 1.3 Update Validation Schema

**File**: `lib/validations.ts`

Add deal validation:

```typescript
export const dealSchema = z.object({
  name: z.string().min(1, 'Deal name is required').max(255),
  value: z.number().min(0, 'Deal value must be a positive number'),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'], {
    required_error: 'Stage is required',
  }),
  expectedCloseDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  actualCloseDate: z.string().optional(),
  status: z.enum(['open', 'won', 'lost'], {
    required_error: 'Status is required',
  }),
  probability: z.number().min(0).max(100).optional(),
  description: z.string().max(1000).optional(),
  contactId: z.string().uuid('Invalid contact ID'),
});

export type DealInput = z.infer<typeof dealSchema>;
```

### Phase 2: API Routes

#### 2.1 Create Deal List & Create API

**File**: `app/api/deals/route.ts`

- GET: List all deals with filtering (stage, status, date range, value range)
- POST: Create new deal

Query parameters for GET:

- `stage`: Filter by stage
- `status`: Filter by status
- `startDate`: Filter by expected close date (from)
- `endDate`: Filter by expected close date (to)
- `minValue`: Filter by minimum deal value
- `maxValue`: Filter by maximum deal value
- `search`: Search by deal name

#### 2.2 Create Deal Single Item API

**File**: `app/api/deals/[id]/route.ts`

- GET: Get single deal by ID
- PUT: Update deal
- DELETE: Delete deal
- PATCH: Update deal stage (for drag-and-drop)

#### 2.3 Update Dashboard API

**File**: `app/api/dashboard/route.ts`

Add deal metrics:

- Total pipeline value
- Deals by stage
- Win rate
- Recent deals (last 5)
- Revenue forecast

### Phase 3: Frontend Components

#### 3.1 Deal Components Directory

Create: `components/deals/`

Components to create:

- `deal-kanban-board.tsx` - Main Kanban board with columns
- `deal-kanban-column.tsx` - Single column component
- `deal-card.tsx` - Individual deal card
- `deal-list.tsx` - Table view of deals
- `deal-form.tsx` - Create/edit form
- `deal-profile.tsx` - Deal detail page
- `deal-filters.tsx` - Filter controls for list view
- `deal-pagination.tsx` - Pagination for list view
- `deal-selector.tsx` - Select deal for activities/tasks (future)

#### 3.2 Dashboard Components

Create: `components/dashboard/`

- `pipeline-metrics.tsx` - Pipeline analytics cards
- `pipeline-chart.tsx` - Visual chart of deals by stage
- `recent-deals.tsx` - Recent deals widget

#### 3.3 Navigation Update

**File**: `components/layout/navigation.tsx`

Add "Deals" link to navigation

### Phase 4: Pages

#### 4.1 Pipeline Board Page

**File**: `app/deals/page.tsx`

Default view showing Kanban board

- Toggle between Board and List views
- Filter controls
- "Add Deal" button

#### 4.2 Deal Profile Page

**File**: `app/deals/[id]/page.tsx`

- Deal information display
- Edit/delete buttons
- Contact information
- Associated activities
- Associated tasks
- Stage history (future)

#### 4.3 New Deal Page

**File**: `app/deals/new/page.tsx`

- Deal creation form
- Contact selector
- Validation
- Success redirect

### Phase 5: Dashboard Integration

**File**: `app/page.tsx`

Add to dashboard:

- PipelineMetrics component
- PipelineChart component
- RecentDeals component

### Phase 6: UI/UX Details

#### 6.1 Kanban Board Design

- Horizontal scrollable columns
- Drag-and-drop using @hello-pangea/dnd or react-beautiful-dnd
- Deal cards showing:
  - Deal name
  - Value (formatted as currency)
  - Contact name
  - Expected close date
  - Status indicator
- Column headers showing:
  - Stage name
  - Total value in stage
  - Deal count

#### 6.2 Stage Color Coding

- Lead: Gray
- Qualified: Blue
- Proposal: Purple
- Negotiation: Orange
- Closed Won: Green
- Closed Lost: Red

#### 6.3 Deal Status Badges

- Open: Gray badge
- Won: Green badge with checkmark
- Lost: Red badge with X

#### 6.4 Probability Visualization

- Progress bar showing deal probability (0-100%)
- Color-coded based on probability range

### Phase 7: Database Migration

```bash
npx prisma migrate dev --name add_deals
npx prisma generate
```

## Technical Considerations

### Drag-and-Drop Library

Options:

1. **@hello-pangea/dnd** (recommended)
   - Modern fork of react-beautiful-dnd
   - Better TypeScript support
   - Active maintenance

2. **react-beautiful-dnd**
   - Widely used
   - Good documentation
   - Less active maintenance

3. **@dnd-kit/core**
   - More flexible
   - Steeper learning curve
   - Better performance

**Recommendation**: Use @hello-pangea/dnd for simplicity and good TypeScript support

### State Management

- Use React hooks for local state (selected deal, filters)
- Server components for initial data fetch
- Client components for interactivity (drag-and-drop, forms)

### Performance

- Lazy load Kanban columns for large pipelines
- Virtual scrolling for deal lists
- Debounce search input
- Optimize database queries with proper indexes

### Accessibility

- Keyboard navigation for deal cards
- Screen reader support for drag-and-drop
- ARIA labels for stage columns
- Focus management on modal/dialog

## File Structure

```
app/
├── deals/
│   ├── page.tsx                    # Pipeline board (default)
│   ├── [id]/
│   │   └── page.tsx                # Deal profile
│   └── new/
│       └── page.tsx                # New deal form
└── api/
    └── deals/
        ├── route.ts                 # GET (list), POST (create)
        └── [id]/
            └── route.ts             # GET, PUT, DELETE, PATCH (stage update)

components/
├── deals/
│   ├── deal-kanban-board.tsx       # Main Kanban board
│   ├── deal-kanban-column.tsx      # Single column
│   ├── deal-card.tsx               # Deal card component
│   ├── deal-list.tsx               # Table view
│   ├── deal-form.tsx               # Create/edit form
│   ├── deal-profile.tsx            # Deal detail page
│   ├── deal-filters.tsx            # Filter controls
│   └── deal-pagination.tsx         # Pagination
├── dashboard/
│   ├── pipeline-metrics.tsx        # Pipeline analytics
│   ├── pipeline-chart.tsx           # Deals by stage chart
│   └── recent-deals.tsx            # Recent deals widget
└── layout/
    └── navigation.tsx              # Add Deals link

types/
└── deal.ts                         # Deal TypeScript interfaces

lib/
└── validations.ts                   # Add deal schema

prisma/
└── schema.prisma                   # Add Deal model
```

## Implementation Order

1. **Database & Types** (Foundation)
   - Update Prisma schema
   - Create TypeScript types
   - Add validation schema
   - Run migration

2. **API Routes** (Backend)
   - Create deal CRUD endpoints
   - Update dashboard API
   - Test endpoints

3. **Core Components** (Building blocks)
   - Deal card
   - Deal form
   - Deal profile
   - Deal filters

4. **Kanban Board** (Complex feature)
   - Install drag-and-drop library
   - Create Kanban column
   - Create Kanban board
   - Implement drag-and-drop

5. **List View** (Alternative view)
   - Create deal list
   - Add pagination

6. **Pages** (Integration)
   - Pipeline board page
   - Deal profile page
   - New deal page

7. **Dashboard Integration** (Analytics)
   - Pipeline metrics
   - Pipeline chart
   - Recent deals

8. **Navigation & Polish** (UX)
   - Add navigation link
   - Add animations
   - Test and refine

## Testing Checklist

- [ ] Deal CRUD operations work correctly
- [ ] Drag-and-drop moves deals between stages
- [ ] Stage updates persist to database
- [ ] Filters work (stage, status, date, value, search)
- [ ] Pagination works for large datasets
- [ ] Dashboard metrics are accurate
- [ ] Charts render correctly
- [ ] Contact relationship works (cascade delete)
- [ ] Form validation works on client and server
- [ ] Currency formatting is correct
- [ ] Date formatting is correct
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works
- [ ] Loading states display correctly
- [ ] Error handling works gracefully

## Future Enhancements (Post-MVP)

1. **Stage History**
   - Track when deals move between stages
   - Calculate average time in each stage
   - Stage conversion rates

2. **Deal Activities**
   - Log activities specific to deals
   - Activity timeline on deal profile

3. **Deal Tasks**
   - Create tasks linked to deals
   - Task completion tracking

4. **Custom Stages**
   - Allow users to customize pipeline stages
   - Add/remove/reorder stages

5. **Deal Templates**
   - Pre-defined deal configurations
   - Quick deal creation

6. **Advanced Analytics**
   - Revenue forecasting
   - Deal velocity
   - Sales team performance
   - Deal probability scoring

7. **Collaboration**
   - Deal comments/notes
   - @mentions
   - Deal assignments

8. **Integrations**
   - Email integration for deal updates
   - Calendar integration for close dates
   - CRM platform sync

## Dependencies to Install

```bash
npm install @hello-pangea/dnd
```

## Notes

- Follow existing patterns from contacts, activities, and tasks
- Use shadcn/ui components for UI elements
- Maintain "intentional minimalism" design philosophy
- Ensure consistent button styling (Plus, Edit, Delete icons)
- Use Dialog components for confirmations
- Implement proper error handling
- Add loading states for async operations
- Follow TypeScript best practices
- Write clean, maintainable code
