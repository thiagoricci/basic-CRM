# Activities Enhancements Implementation Plan

## Overview

This plan outlines enhancements to the Activities feature to improve usability, searchability, and scalability. The implementation focuses on three main areas:

1. **Filtering and Search** - Enable users to filter by activity type, date range, and search by keyword
2. **Edit Functionality** - Allow users to edit activity subject and description
3. **Pagination** - Implement pagination for large activity lists

## Current State Analysis

### Already Implemented ✅

- **Activity Type Icons/Colors**: Distinct icons and colors for call (Phone, blue), email (Mail, purple), meeting (Users, orange), note (FileText, gray)
- **Relative Timestamps**: Display format like "2m ago", "3h ago", "5d ago" for recent activities

### Current Architecture

```
app/activities/page.tsx (Activities Page)
├── ActivityForm (Add new activity)
└── ActivityList (Display activities)
    └── SWR for data fetching
    └── Delete functionality

API Routes:
├── GET /api/activities (List all or by contactId)
└── POST /api/activities (Create activity)
└── DELETE /api/activities/[id] (Delete activity)
```

## Enhancement 1: Filtering and Search

### Requirements

Users should be able to:

- Filter activities by type (call, email, meeting, note)
- Filter activities by date range (from/to)
- Search activities by keyword (subject, description, contact name)
- Clear all filters at once

### Implementation Strategy

#### 1.1 UI Components

**File**: `components/activities/activity-filters.tsx` (NEW)

Create a filter bar component with:

- Activity type filter (multi-select dropdown)
- Date range picker (from/to dates)
- Search input field
- Clear filters button

**Design**:

```tsx
<div className="flex flex-wrap gap-4 p-4 bg-card border rounded-lg">
  <SearchInput placeholder="Search activities..." />
  <TypeFilter value={types} onChange={setTypes} />
  <DateRangePicker from={fromDate} to={toDate} />
  <ClearFiltersButton />
</div>
```

#### 1.2 API Enhancements

**File**: `app/api/activities/route.ts` (MODIFY)

Update GET endpoint to support query parameters:

- `type`: Filter by activity type (can be multiple)
- `search`: Search keyword
- `fromDate`: Start date filter
- `toDate`: End date filter
- `page`: Page number for pagination
- `limit`: Items per page

**Implementation**:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get('type'); // 'call' | 'email' | 'meeting' | 'note'
  const search = searchParams.get('search'); // keyword search
  const fromDate = searchParams.get('fromDate'); // ISO date string
  const toDate = searchParams.get('toDate'); // ISO date string
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const contactId = searchParams.get('contactId');

  const where: any = {};

  if (contactId) where.contactId = contactId;
  if (type) where.type = type;
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }

  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      {
        contact: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const activities = await prisma.activity.findMany({
    where,
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.activity.count({ where });

  return NextResponse.json({
    data: activities,
    error: null,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

#### 1.3 Integration with ActivityList

**File**: `components/activities/activity-list.tsx` (MODIFY)

Add filter state and pass to API:

```typescript
interface ActivityListProps {
  contactId?: string;
  showContactName?: boolean;
  onDelete?: (id: string) => Promise<void>;
  filters?: ActivityFilters; // NEW
}

interface ActivityFilters {
  type?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}
```

#### 1.4 Page Integration

**File**: `app/activities/page.tsx` (MODIFY)

Add filter state management and ActivityFilters component:

```typescript
const [filters, setFilters] = useState<ActivityFilters>({});

<ActivityFilters
  filters={filters}
  onChange={setFilters}
/>

<ActivityList
  ref={activityListRef}
  filters={filters}
  showContactName={true}
  onDelete={handleDeleteActivity}
/>
```

### Dependencies

- Install `date-fns` for date formatting: `npm install date-fns`
- Install shadcn/ui components needed:
  - `npx shadcn-ui@latest add popover` (for date picker)
  - `npx shadcn-ui@latest add calendar` (for date picker)

## Enhancement 2: Edit Functionality

### Requirements

Users should be able to:

- Click an edit button on an activity
- Modify subject and description fields
- Save changes with validation
- Cancel editing without saving

### Implementation Strategy

#### 2.1 API Enhancement

**File**: `app/api/activities/[id]/route.ts` (MODIFY)

Add PUT endpoint for updating activities:

```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = activitySchema.partial().parse(body);

    // Check if activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id: params.id },
    });

    if (!existingActivity) {
      return NextResponse.json({ data: null, error: 'Activity not found' }, { status: 404 });
    }

    // Update activity
    const activity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        subject: validatedData.subject,
        description: validatedData.description,
      },
    });

    // Revalidate cache
    revalidatePath('/activities');
    revalidatePath(`/contacts/${existingActivity.contactId}`);

    return NextResponse.json({ data: activity, error: null });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating activity:', error);
      return NextResponse.json({ data: null, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data: null, error: 'Failed to update activity' }, { status: 500 });
  }
}
```

#### 2.2 Edit Mode in ActivityList

**File**: `components/activities/activity-list.tsx` (MODIFY)

Add edit state and inline editing:

```typescript
const [editingId, setEditingId] = useState<string | null>(null);
const [editForm, setEditForm] = useState({ subject: '', description: '' });

const handleEdit = (activity: Activity) => {
  setEditingId(activity.id);
  setEditForm({
    subject: activity.subject,
    description: activity.description || '',
  });
};

const handleSaveEdit = async () => {
  // Validate
  if (!editForm.subject.trim()) {
    setError('Subject is required');
    return;
  }

  // Call API
  const response = await fetch(`/api/activities/${editingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editForm),
  });

  if (response.ok) {
    setEditingId(null);
    mutate(); // Refresh list
  }
};

const handleCancelEdit = () => {
  setEditingId(null);
  setEditForm({ subject: '', description: '' });
};
```

#### 2.3 Edit UI

Add edit button and inline form in activity card:

```tsx
{
  editingId === activity.id ? (
    // Edit mode
    <div className="space-y-2">
      <Input
        value={editForm.subject}
        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
        placeholder="Subject"
      />
      <textarea
        value={editForm.description}
        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
        placeholder="Description"
        className="w-full min-h-[80px] rounded-md border px-3 py-2"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSaveEdit}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
          Cancel
        </Button>
      </div>
    </div>
  ) : (
    // View mode
    <div>
      <h3 className="font-semibold">{activity.subject}</h3>
      {activity.description && (
        <p className="text-sm text-muted-foreground">{activity.description}</p>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleEdit(activity)}
        className="opacity-0 group-hover:opacity-100"
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Dependencies

- Import `Edit` icon from `lucide-react`

## Enhancement 3: Pagination

### Requirements

- Show a configurable number of activities per page (default: 20)
- Display pagination controls (previous, next, page numbers)
- Show total count and current page
- Support infinite scroll option (Load More button)

### Implementation Strategy

#### 3.1 API Pagination

Already implemented in Enhancement 1.1 (API supports `page` and `limit` params).

#### 3.2 Pagination Component

**File**: `components/activities/activity-pagination.tsx` (NEW)

Create a reusable pagination component:

```tsx
interface ActivityPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function ActivityPagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
}: ActivityPaginationProps) {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {total} activities
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
            )
            .map((page, i, arr) => (
              <React.Fragment key={page}>
                {i > 0 && arr[i - 1] !== page - 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              </React.Fragment>
            ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

#### 3.3 Integration with ActivityList

**File**: `components/activities/activity-list.tsx` (MODIFY)

Add pagination state and controls:

```typescript
const [page, setPage] = useState(1);
const limit = 20;

const {
  data: response,
  error,
  isLoading,
  mutate,
} = useSWR(
  `/api/activities?contactId=${contactId}&page=${page}&limit=${limit}&type=${filters?.type}&search=${filters?.search}`,
  fetcher,
  {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
  }
);

const activities = response?.data || [];
const pagination = response?.pagination;

// Reset to page 1 when filters change
useEffect(() => {
  setPage(1);
}, [filters]);
```

#### 3.4 Alternative: Load More Button

For a simpler approach, add a "Load More" button at the bottom:

```tsx
{
  activities.length > 0 && pagination && pagination.page < pagination.totalPages && (
    <div className="flex justify-center py-4">
      <Button variant="outline" onClick={() => setPage(page + 1)} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Load More'}
      </Button>
    </div>
  );
}
```

## Implementation Order

### Phase 1: API Foundation (Priority: HIGH)

1. Update `app/api/activities/route.ts` to support filters, search, and pagination
2. Add PUT endpoint to `app/api/activities/[id]/route.ts`
3. Test API endpoints with curl/Postman

### Phase 2: Filtering and Search (Priority: HIGH)

1. Install dependencies (date-fns, popover, calendar)
2. Create `components/activities/activity-filters.tsx`
3. Update `components/activities/activity-list.tsx` to accept filters
4. Update `app/activities/page.tsx` to manage filter state
5. Test filtering and search functionality

### Phase 3: Edit Functionality (Priority: MEDIUM)

1. Update `components/activities/activity-list.tsx` with edit mode
2. Add edit button and inline form
3. Implement save/cancel handlers
4. Test edit functionality

### Phase 4: Pagination (Priority: MEDIUM)

1. Create `components/activities/activity-pagination.tsx`
2. Update `components/activities/activity-list.tsx` with pagination state
3. Add pagination controls to UI
4. Test pagination with large datasets

## File Changes Summary

### New Files

- `components/activities/activity-filters.tsx` - Filter bar component
- `components/activities/activity-pagination.tsx` - Pagination controls

### Modified Files

- `app/api/activities/route.ts` - Add filter, search, pagination support
- `app/api/activities/[id]/route.ts` - Add PUT endpoint for updates
- `components/activities/activity-list.tsx` - Add edit mode, filters, pagination
- `app/activities/page.tsx` - Add filter state management
- `lib/validations.ts` - Update activitySchema for partial updates (if needed)

## Database Considerations

### Current Schema (No Changes Required)

```prisma
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
  @@index([type]) // Already exists - good for type filtering
}
```

### Performance Optimizations

The existing indexes are sufficient:

- `@@index([createdAt])` - Supports date range filtering
- `@@index([type])` - Supports type filtering
- `@@index([contactId])` - Supports contact-specific queries

For search functionality, consider adding a full-text search index in production:

```sql
CREATE INDEX idx_activities_subject_search ON activities USING gin(to_tsvector('english', subject));
CREATE INDEX idx_activities_description_search ON activities USING gin(to_tsvector('english', description));
```

## Testing Strategy

### Unit Tests

- Test API endpoints with various filter combinations
- Test validation schemas
- Test pagination logic

### Integration Tests

- Test filter + search + pagination together
- Test edit functionality end-to-end
- Test state management across components

### Manual Testing Checklist

- [ ] Filter by single activity type
- [ ] Filter by multiple activity types
- [ ] Search by subject keyword
- [ ] Search by description keyword
- [ ] Search by contact name
- [ ] Date range filtering (from only, to only, both)
- [ ] Clear all filters
- [ ] Edit activity subject
- [ ] Edit activity description
- [ ] Cancel edit without saving
- [ ] Save edit with validation
- [ ] Navigate between pages
- [ ] Load more button (if implemented)
- [ ] Pagination with filters applied
- [ ] Empty state handling

## UX Considerations

### Filtering UX

- Show active filters as removable chips/tags
- Display count of results for each filter option
- Debounce search input (300-500ms) to avoid excessive API calls
- Persist filters in URL query params for bookmarking/sharing

### Edit UX

- Show visual indication when in edit mode
- Auto-focus on subject field when edit mode opens
- Show validation errors inline
- Provide keyboard shortcuts (Enter to save, Escape to cancel)

### Pagination UX

- Show total count and current position
- Smooth transitions between pages
- Maintain scroll position when navigating
- Consider infinite scroll for better UX on mobile

## Performance Considerations

### API Optimization

- Use Prisma's `select` to only fetch needed fields
- Implement response caching for common queries
- Consider adding database query limits

### Frontend Optimization

- Debounce search input
- Use SWR's deduping to prevent duplicate requests
- Implement virtual scrolling for very large lists (1000+ items)
- Lazy load pagination component

## Future Enhancements

### Potential Additions

- **Activity Templates**: Pre-defined activity types with custom fields
- **Activity Reminders**: Set reminders for follow-up activities
- **Activity Comments**: Allow team members to comment on activities
- **Activity Attachments**: Upload files to activities
- **Bulk Actions**: Edit/delete multiple activities at once
- **Activity Analytics**: Charts showing activity distribution over time
- **Export Activities**: Export activities to CSV/Excel
- **Activity History**: Track changes to activities (audit log)

## Migration Notes

### No Database Migration Required

All enhancements are API and UI changes only. The existing database schema supports all required functionality.

### Backward Compatibility

- API changes are additive (new query parameters)
- Existing API calls without filters will work as before
- Pagination defaults to showing all results if no page/limit provided (or implement sensible defaults)

## Dependencies to Install

```bash
npm install date-fns
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add calendar
```

## Estimated Complexity

- **Filtering/Search**: Medium complexity
- **Edit Functionality**: Low-Medium complexity
- **Pagination**: Low complexity

Total implementation time: Depends on development speed, but each enhancement can be implemented and tested independently.

## Success Criteria

- [ ] Users can filter activities by type
- [ ] Users can filter activities by date range
- [ ] Users can search activities by keyword
- [ ] Users can edit activity subject and description
- [ ] Users can navigate through paginated results
- [ ] All features work together seamlessly
- [ ] Performance remains acceptable with large datasets
- [ ] UI follows "intentional minimalism" design philosophy
- [ ] All existing functionality remains intact

## Risk Mitigation

### Potential Issues

1. **Search Performance**: Full-text search may be slow with large datasets
   - Mitigation: Use database full-text search indexes, implement debouncing
2. **Filter Complexity**: Multiple filters may create complex queries
   - Mitigation: Test with realistic data volumes, optimize Prisma queries

3. **State Management**: Managing filter + pagination + edit state
   - Mitigation: Use React hooks effectively, keep state local to components

4. **UX Overload**: Too many controls may clutter the interface
   - Mitigation: Use collapsible filters, maintain clean design

## Conclusion

This implementation plan provides a clear roadmap for enhancing the Activities feature with filtering/search, edit functionality, and pagination. The enhancements are designed to be implemented incrementally, with each feature being testable independently. The plan maintains backward compatibility and follows the existing architecture and design patterns of the CRM system.
