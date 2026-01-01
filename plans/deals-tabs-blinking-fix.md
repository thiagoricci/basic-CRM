# Fix Deals Tabs Blinking Issue

## Problem

When switching between status tabs (All Deals, Open, Won, Lost) in the Deals & Pipeline page, the entire content disappears and shows a loading state, causing a jarring blinking effect.

## Root Cause

The deals page (`app/deals/page.tsx`) uses manual `useState` with `loading` state. When filters change:

1. `setLoading(true)` is called
2. This hides ALL content and shows "Loading deals..." message
3. After fetch completes, content reappears

This causes a full content flash/blink on every tab switch.

## Solution

Update the deals page to use SWR (Stale-While-Revalidate) like the tasks page, which:

- Keeps previous data visible during transitions
- Shows only a subtle loading indicator overlay
- Provides smooth, non-disruptive tab switching

## Implementation Plan

### 1. Update app/deals/page.tsx

**Changes:**

- Replace manual `useState` with `useSWR` for data fetching
- Remove `loading` state and `fetchDeals` function
- Add SWR configuration with `keepPreviousData: true`
- Add subtle loading indicator (like tasks page)
- Keep data visible during transitions

**Key SWR Configuration:**

```typescript
const { data, error, isLoading, mutate } = useSWR<DealsResponse>(fetchUrl, fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 2000,
  keepPreviousData: true, // This is critical for smooth transitions
});
```

### 2. Create LoadingIndicator Component for Deals

**File:** `components/deals/loading-indicator.tsx`

Create a subtle loading indicator that shows over existing content (like tasks page):

```typescript
export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Updating deals...</span>
      </div>
    </div>
  );
}
```

### 3. Update DealKanbanBoard Component

**File:** `components/deals/deal-kanban-board.tsx`

**Changes:**

- Remove internal state management
- Accept `deals` as prop instead of fetching internally
- Remove `loading` and `error` states
- Simplify to a pure presentational component

**Before:**

```typescript
const [deals, setDeals] = useState<Deal[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetchDeals();
}, []);
```

**After:**

```typescript
interface DealKanbanBoardProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onAddDeal: () => void;
}

export function DealKanbanBoard({ deals, onDealClick, onAddDeal }: DealKanbanBoardProps) {
  const getDealsByStage = (stageId: string) => {
    return deals.filter((deal) => deal.stage === stageId);
  };
  // ... rest of component
}
```

### 4. Update DealList Component

**File:** `components/deals/deal-list.tsx`

**No changes needed** - already accepts `deals` as prop and is a pure presentational component.

## Benefits

1. **Smooth Transitions**: Previous data stays visible while new data loads
2. **Better UX**: No jarring content flashes/blinks
3. **Consistent Behavior**: Matches tasks page implementation
4. **Better Performance**: SWR handles caching and deduplication automatically
5. **Reduced Code**: Less state management logic

## Testing Checklist

- [ ] Switch between All Deals, Open, Won, Lost tabs - content should stay visible
- [ ] Search functionality should work smoothly
- [ ] Stage filter dropdown should work smoothly
- [ ] Value range filters should work smoothly
- [ ] Board view and List view should both work smoothly
- [ ] Loading indicator should appear subtly during fetch
- [ ] Error states should still display correctly
- [ ] Pagination should work correctly in list view

## Files to Modify

1. `app/deals/page.tsx` - Main page component
2. `components/deals/deal-kanban-board.tsx` - Remove internal state, accept deals as prop
3. `components/deals/loading-indicator.tsx` - Create new component (optional, can reuse tasks version)

## Migration Notes

- SWR is already installed (used in tasks page)
- Pattern matches existing tasks page implementation
- No breaking changes to API or data structure
- All existing functionality preserved
