# Activity Heatmap Improvements Plan

## Current State

The Activity Heatmap currently displays a 7x24 grid (days × hours) with color intensity based on activity count. This is a traditional GitHub-style heatmap visualization.

## Requirements

1. **Remove hourly granularity** - No need for hours of the day
2. **Show weekly calendar view** - Columns should be days of the week only
3. **Display activity cards** - Each activity should be shown as a card in its day column
4. **Color coding by type** - Use the same colors as ActivityTypeChart:
   - Call: `#3b82f6` (blue)
   - Email: `#10b981` (green)
   - Meeting: `#f59e0b` (amber)
   - Note: `#8b5cf6` (purple)

## Implementation Plan

### Step 1: Update API Endpoint

**File**: `app/api/reports/route.ts`

**Changes needed**:

- Modify `fetchActivityHeatmap()` function to return activity details instead of aggregated counts
- Return activity objects with: `id`, `type`, `subject`, `description`, `createdAt`, `contactId`, `contact` (name)
- Group activities by day of week (0-6, where 0 = Sunday)
- Return data structure:
  ```typescript
  {
    day: number; // 0-6
    activities: {
      id: string;
      type: 'call' | 'email' | 'meeting' | 'note';
      subject: string;
      description: string | null;
      createdAt: Date;
      contactId: string;
      contactName: string;
    }
    [];
  }
  [];
  ```

**Current implementation** (lines 364-390):

```typescript
async function fetchActivityHeatmap(start: Date, end: Date) {
  const activities = await prisma.activity.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const heatmap = activities.reduce((acc: Record<string, number>, activity) => {
    const date = new Date(activity.createdAt);
    const day = date.getDay();
    const hour = date.getHours();
    const key = `${day}-${hour}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(heatmap).map(([key, count]) => {
    const [day, hour] = key.split('-');
    return { day: parseInt(day), hour: parseInt(hour), count };
  });
}
```

**New implementation**:

```typescript
async function fetchActivityHeatmap(start: Date, end: Date) {
  const activities = await prisma.activity.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group activities by day of week
  const groupedByDay = activities.reduce((acc: Record<number, any[]>, activity) => {
    const day = new Date(activity.createdAt).getDay();
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push({
      id: activity.id,
      type: activity.type,
      subject: activity.subject,
      description: activity.description,
      createdAt: activity.createdAt,
      contactId: activity.contactId,
      contactName: `${activity.contact.firstName} ${activity.contact.lastName}`,
    });
    return acc;
  }, {});

  // Convert to array and sort by day (0-6)
  return Array.from({ length: 7 }, (_, dayIndex) => ({
    day: dayIndex,
    activities: groupedByDay[dayIndex] || [],
  }));
}
```

### Step 2: Update TypeScript Types

**File**: `types/reports.ts`

**Add new interface**:

```typescript
export interface ActivityHeatmapData {
  day: number;
  activities: ActivityCard[];
}

export interface ActivityCard {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string | null;
  createdAt: Date;
  contactId: string;
  contactName: string;
}
```

### Step 3: Redesign ActivityHeatmap Component

**File**: `components/reports/activity-heatmap.tsx`

**New component structure**:

- 7 columns (one for each day of the week)
- Each column header shows day name (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
- Each column contains activity cards stacked vertically
- Activity cards show:
  - Color-coded left border based on activity type
  - Activity type icon
  - Subject text
  - Contact name
  - Time (formatted as HH:MM AM/PM)
- Cards should be clickable to navigate to activity profile
- Responsive design: on mobile, stack columns vertically

**Design considerations**:

- Column width: Should be wide enough to display activity cards clearly
- Card height: Compact but readable
- Spacing: Consistent gaps between cards and columns
- Scrollable: If many activities, column should be scrollable
- Empty state: Show "No activities" message for days with no activities

**Color scheme** (matching ActivityTypeChart):

```typescript
const ACTIVITY_COLORS = {
  call: '#3b82f6', // blue
  email: '#10b981', // green
  meeting: '#f59e0b', // amber
  note: '#8b5cf6', // purple
};
```

**Activity type icons** (from lucide-react):

- Call: `Phone`
- Email: `Mail`
- Meeting: `Users`
- Note: `FileText`

### Step 4: Component Implementation Details

**Layout structure**:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Activity Calendar</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-7 gap-4">
      {data.map((dayData) => (
        <div key={dayData.day} className="flex flex-col">
          {/* Day Header */}
          <div className="text-center font-medium mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayData.day]}
          </div>

          {/* Activity Cards */}
          <div className="flex-1 space-y-2 max-h-96 overflow-y-auto">
            {dayData.activities.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">No activities</div>
            ) : (
              dayData.activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

**ActivityCard component** (inline or separate):

```tsx
function ActivityCard({ activity }: { activity: ActivityCard }) {
  const color = ACTIVITY_COLORS[activity.type];
  const icon = ACTIVITY_ICONS[activity.type];

  const time = new Date(activity.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className="p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors"
      style={{ borderLeft: `3px solid ${color}` }}
      onClick={() => (window.location.href = `/activities/${activity.id}`)}
    >
      <div className="flex items-start gap-2">
        <Icon name={icon} className="h-4 w-4 mt-0.5" style={{ color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{activity.subject}</p>
          <p className="text-xs text-muted-foreground truncate">{activity.contactName}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
}
```

### Step 5: Responsive Design

**Desktop (lg)**: 7 columns side by side
**Tablet (md)**: 4 columns on first row, 3 on second
**Mobile (sm)**: Stack all columns vertically, each taking full width

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
```

### Step 6: Testing Checklist

- [ ] API returns correct data structure
- [ ] Activities grouped by day of week correctly
- [ ] Activity cards display with correct colors
- [ ] Activity cards are clickable and navigate to correct profile
- [ ] Empty days show "No activities" message
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] Scrollable columns work when many activities
- [ ] Time formatting is correct (12-hour format with AM/PM)
- [ ] Contact names display correctly
- [ ] Activity subjects truncate properly if too long
- [ ] Hover effects work on activity cards

### Step 7: Additional Enhancements (Optional)

- Add week navigation (previous/next week)
- Show date range in header
- Add activity count badge on day headers
- Filter by activity type
- Search activities by subject or contact name
- Export to CSV functionality (keep existing)

## Files to Modify

1. `app/api/reports/route.ts` - Update `fetchActivityHeatmap()` function
2. `types/reports.ts` - Add new interfaces for activity calendar data
3. `components/reports/activity-heatmap.tsx` - Complete redesign of component

## Success Criteria

- Activity Heatmap shows weekly calendar view with 7 columns
- Each column displays day name and activity cards
- Activity cards are color-coded by type (blue, green, amber, purple)
- Cards show subject, contact name, and time
- Cards are clickable to navigate to activity profile
- Responsive design works across all screen sizes
- Empty days display appropriate message
- Performance is acceptable with many activities
