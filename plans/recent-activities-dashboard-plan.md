# Recent Activities Dashboard Implementation Plan

## Overview

Add a "Recent Activities" section to the dashboard that displays the last 5 activities by date, following the same pattern as the existing "Recent Contacts" component.

## Current State Analysis

### Existing Components

- **Dashboard API Route** (`app/api/dashboard/route.ts`): Fetches contacts statistics, recent contacts, and growth data
- **Dashboard Page** (`app/page.tsx`): Client component that displays analytics cards, charts, and recent contacts
- **RecentContacts Component** (`components/dashboard/recent-contacts.tsx`): Shows last 5 contacts with links to their profiles
- **Activities API** (`app/api/activities/route.ts`): Already supports fetching activities with filtering and pagination

### Activities Data Structure

```typescript
interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string | null;
  contactId: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Steps

### Step 1: Update Dashboard API Route

**File**: `app/api/dashboard/route.ts`

**Changes**:

- Add a query to fetch the 5 most recent activities
- Include contact information for each activity (id, firstName, lastName)
- Order by `createdAt` in descending order
- Add `recentActivities` to the response data

**Implementation**:

```typescript
// Fetch only the 5 most recent activities with minimal fields
const recentActivities = await prisma.activity.findMany({
  select: {
    id: true,
    type: true,
    subject: true,
    description: true,
    createdAt: true,
    contact: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    },
  },
  orderBy: { createdAt: 'desc' },
  take: 5,
});
```

### Step 2: Create RecentActivities Component

**File**: `components/dashboard/recent-activities.tsx`

**Design Decisions**:

- Follow the same pattern as `RecentContacts` component
- Use Card component from shadcn/ui
- Display activity type, subject, and related contact
- Link to contact profile when clicking on an activity
- Use badges to distinguish activity types (call, email, meeting, note)
- Apply staggered animations for each activity item
- Show empty state when no activities exist

**Component Structure**:

```typescript
interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  // Display last 5 activities
  // Each item shows:
  // - Activity type (badge with color coding)
  // - Subject
  // - Contact name (link to profile)
  // - Date/time
}
```

**Activity Type Badge Colors**:

- Call: Blue/Info
- Email: Purple/Secondary
- Meeting: Green/Success
- Note: Yellow/Warning

### Step 3: Update Dashboard Page Interfaces

**File**: `app/page.tsx`

**Changes**:

- Add `Activity` type import
- Update `DashboardData` interface to include `recentActivities`
- Update `DashboardResponse` interface if needed
- Import `RecentActivities` component

```typescript
interface DashboardData {
  contacts: Contact[];
  recentActivities: Activity[];
  totalContacts: number;
  totalLeads: number;
  totalCustomers: number;
  conversionRate: number;
  growthData: { date: string; count: number }[];
}
```

### Step 4: Add RecentActivities to Dashboard Page

**File**: `app/page.tsx`

**Placement**:

- Add below `RecentContacts` component
- Use the same animation pattern (staggered entrance)
- Maintain consistent spacing and layout

**Implementation**:

```typescript
// After RecentContacts component
<RecentActivities activities={data.data.recentActivities} />
```

**Layout Considerations**:

- Consider stacking RecentContacts and RecentActivities vertically
- Or create a grid layout with both components side-by-side on larger screens
- Maintain responsive design for mobile/tablet/desktop

## Design Consistency

### Typography

- Use same font sizes and weights as RecentContacts
- Activity subject: font-medium
- Contact name: text-sm text-muted-foreground
- Date: text-xs text-muted-foreground

### Spacing

- Card padding: consistent with other cards
- Activity item spacing: space-y-4
- Padding within each activity item: p-3

### Animations

- Card entrance: opacity 0 → 1, scale 0.95 → 1, duration 0.5s, delay 0.6s
- Item stagger: opacity 0 → 1, x -20 → 0, duration 0.3s, delay index \* 0.05

### Colors

- Activity type badges: distinct colors for each type
- Hover states: hover:bg-accent
- Links: text-primary hover:underline

## Performance Considerations

### Database Query Optimization

- Use `select` to fetch only required fields
- Limit to 5 activities
- Index on `createdAt` ensures efficient sorting
- Single query with `include` for contact data

### Caching

- Activities will be cached by Next.js
- Revalidation happens every 30 seconds (same as dashboard data)
- No additional API calls needed

## Testing Checklist

### API Testing

- [ ] Dashboard API returns recentActivities array
- [ ] Activities are ordered by createdAt descending
- [ ] Each activity includes contact information
- [ ] Empty array returned when no activities exist

### Component Testing

- [ ] RecentActivities renders correctly
- [ ] Displays up to 5 activities
- [ ] Activity type badges show correct colors
- [ ] Contact links navigate to correct profile
- [ ] Empty state displays when no activities
- [ ] Animations play on load

### Integration Testing

- [ ] Dashboard displays both RecentContacts and RecentActivities
- [ ] Layout is responsive on mobile/tablet/desktop
- [ ] Data refreshes when new activities are added
- [ ] No console errors

## Future Enhancements

### Phase 2 Improvements

- Add activity type filter to RecentActivities
- Show activity description preview (truncated)
- Add "View All Activities" link
- Include activity count per type
- Show time relative to now (e.g., "2 hours ago")

### Advanced Features

- Real-time updates with WebSocket
- Activity type filtering in dashboard
- Activity statistics (total calls, emails, etc.)
- Activity trends over time
- Integration with contact profile activities

## Files to Modify

1. `app/api/dashboard/route.ts` - Add recent activities query
2. `components/dashboard/recent-activities.tsx` - Create new component
3. `app/page.tsx` - Add RecentActivities component and update interfaces

## Files to Reference

1. `components/dashboard/recent-contacts.tsx` - Pattern to follow
2. `app/api/activities/route.ts` - Activities query pattern
3. `types/activity.ts` - Activity type definitions
4. `prisma/schema.prisma` - Database schema

## Estimated Complexity

- **Difficulty**: Low
- **Time**: Short
- **Risk**: Minimal (follows established patterns)
- **Dependencies**: None (all dependencies already installed)

## Success Criteria

- [ ] Dashboard displays last 5 activities by date
- [ ] Each activity shows type, subject, and contact
- [ ] Clicking on activity navigates to contact profile
- [ ] Component matches design aesthetic of dashboard
- [ ] Responsive layout works on all screen sizes
- [ ] No performance degradation
- [ ] Empty state displays correctly
