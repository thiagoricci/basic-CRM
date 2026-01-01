# Deal Status Chart Implementation Plan

## Objective

Add a new chart on the Dashboard Deals tab to compare deals by status (Open vs Won vs Lost), positioned on the right side of the existing "Deals by Stage" chart.

## Current State Analysis

### Dashboard Deals Tab Structure

- **PipelineMetrics**: Shows total pipeline value, won value, lost value, and win rate
- **PipelineChart**: Pie chart showing deals by stage (Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost)
- **RecentDeals**: List of 5 most recent deals

### Available Data from API

- `pipelineValue`: Sum of all open deals value
- `wonValue`: Sum of all won deals value
- `lostValue`: Sum of all lost deals value
- `totalWonDeals`: Count of won deals
- `totalLostDeals`: Count of lost deals
- `winRate`: Calculated win rate percentage

### Missing Data

- `openDealsCount`: Count of open deals (needed for the new chart)

## Implementation Plan

### 1. Update Dashboard API (`app/api/dashboard/route.ts`)

**Add open deals count query:**

```typescript
// Add to the Promise.all array (around line 55)
prisma.deal.count({ where: { status: 'open' } }),
```

**Update return object:**

```typescript
// Add to the return object (around line 464)
openDealsCount: openDealsCount,
```

### 2. Create DealStatusChart Component (`components/dashboard/deal-status-chart.tsx`)

**Component Features:**

- Pie chart comparing Open vs Won vs Lost deals
- Display both count and value for each status
- Color scheme:
  - Open: Blue (#3b82f6)
  - Won: Green (#10b981)
  - Lost: Red (#ef4444)
- Tooltip showing detailed information
- Legend for easy identification
- Empty state when no deals exist

**Component Props:**

```typescript
interface DealStatusChartProps {
  openDealsCount: number;
  openDealsValue: number;
  wonDealsCount: number;
  wonDealsValue: number;
  lostDealsCount: number;
  lostDealsValue: number;
}
```

### 3. Update DashboardTabs Component (`components/dashboard/dashboard-tabs.tsx`)

**Add new prop:**

```typescript
interface DashboardTabsProps {
  // ... existing props
  openDealsCount?: number; // Add this
  // ... rest of props
}
```

**Import the new component:**

```typescript
import { DealStatusChart } from '@/components/dashboard/deal-status-chart';
```

**Update Deals tab content:**

```typescript
<TabsContent value="deals" className="space-y-6 mt-6">
  <PipelineMetrics
    pipelineValue={pipelineValue}
    wonValue={wonValue}
    lostValue={lostValue}
    winRate={winRate}
  />
  <div className="grid gap-6 lg:grid-cols-2">
    <PipelineChart dealsByStage={dealsByStage} />
    <DealStatusChart
      openDealsCount={openDealsCount}
      openDealsValue={pipelineValue}
      wonDealsCount={totalWonDeals}
      wonDealsValue={wonValue}
      lostDealsCount={totalLostDeals}
      lostDealsValue={lostValue}
    />
  </div>
  <RecentDeals deals={recentDeals} />
</TabsContent>
```

### 4. Update Main Dashboard Page (`app/page.tsx`)

**Extract openDealsCount from API response:**

```typescript
const openDealsCount = data.openDealsCount || 0;
```

**Pass to DashboardTabs:**

```typescript
<DashboardTabs
  // ... existing props
  openDealsCount={openDealsCount}
  // ... rest of props
/>
```

## Design Considerations

### Chart Type

- **Pie Chart**: Best for showing proportions of a whole (Open + Won + Lost = all deals)
- Alternative: Bar Chart (could work but pie is more intuitive for status comparison)

### Visual Hierarchy

- Left side: Deals by Stage (shows pipeline progression)
- Right side: Deals by Status (shows outcome distribution)
- Both charts at the same level, equally important

### Color Scheme

- Consistent with existing color scheme used in other charts
- Open: Blue (neutral/active)
- Won: Green (positive outcome)
- Lost: Red (negative outcome)

### Responsive Design

- On large screens (lg breakpoint): 2-column grid
- On smaller screens: Stack vertically (1 column)

## Testing Checklist

- [ ] Dashboard API returns openDealsCount correctly
- [ ] DealStatusChart renders with all three statuses
- [ ] Chart displays both count and value in tooltip
- [ ] Empty state shows when no deals exist
- [ ] Colors match the intended scheme
- [ ] Responsive layout works on different screen sizes
- [ ] Chart updates when data changes
- [ ] Integration with DashboardTabs works correctly

## Files to Modify

1. `app/api/dashboard/route.ts` - Add open deals count query
2. `components/dashboard/deal-status-chart.tsx` - Create new component
3. `components/dashboard/dashboard-tabs.tsx` - Import and use new component
4. `app/page.tsx` - Pass openDealsCount to DashboardTabs

## Success Criteria

- New chart displays on the right side of PipelineChart
- Chart accurately shows Open, Won, and Lost deal counts and values
- Visual design is consistent with other dashboard charts
- Responsive layout works correctly
- No errors in console
