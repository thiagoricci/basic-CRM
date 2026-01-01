# Fix Tasks Component Tab Switching Blink

## Problem Summary

The Tasks component blinks/flickers when switching between tabs (All Tasks, Open, Completed, Overdue). This is caused by:

1. SWR loading state replacing all content with skeleton during revalidation
2. Motion animations re-triggering on each render
3. State updates causing unnecessary re-renders

## Solution: Hybrid Approach (Approach 5)

Combine three techniques for the best UX:

1. **Conditional Loading**: Only show skeleton on initial load, not during revalidation
2. **Optimistic UI**: Show cached data while fetching new data
3. **Smooth Animations**: Use layout animations to prevent jarring transitions

## Implementation Plan

### Step 1: Update SWR Configuration in app/tasks/page.tsx

**Changes needed:**

- Modify loading condition from `isLoading` to `!data && isLoading`
- Add SWR configuration options for better caching behavior
- Add a subtle loading indicator during revalidation

**Specific modifications:**

```typescript
// Line 49: Add SWR options
const { data, error, isLoading, mutate } = useSWR<TasksResponse>(
  fetchUrl,
  fetcher,
  {
    revalidateOnFocus: false, // Prevent refetch on window focus
    dedupingInterval: 2000,   // Dedupe requests within 2 seconds
    keepPreviousData: true,   // Keep old data while revalidating
  }
);

// Line 100: Change loading condition
if (!data && isLoading) {
  // Show skeleton only on initial load
  return <LoadingSkeleton />;
}

// Add subtle loading indicator during revalidation
{isLoading && data && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
    <span>Updating tasks...</span>
  </div>
)}
```

### Step 2: Optimize Motion Animations in components/tasks/task-list.tsx

**Changes needed:**

- Add `layout` prop to motion.div for smooth layout transitions
- Use `layoutId` to preserve element identity during re-renders
- Optimize animation timing to prevent jarring effects

**Specific modifications:**

```typescript
// Line 29: Add layout prop to motion.div
<motion.div
  key={task.id}
  layout
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.05 }}
>
```

### Step 3: Add Smooth Transitions to Task Filters

**Changes needed:**

- Add `layout` prop to TaskFilters motion.div
- Ensure filter buttons transition smoothly

**Specific modifications:**

```typescript
// Line 34: Add layout prop to motion.div
<motion.div
  layout
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="space-y-4"
>
```

### Step 4: Add Loading Indicator Component

**Create new component:** `components/tasks/loading-indicator.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';

export function LoadingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground"
    >
      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      <span>Updating tasks...</span>
    </motion.div>
  );
}
```

### Step 5: Update Page Layout with Loading Indicator

**Modify app/tasks/page.tsx:**

- Import LoadingIndicator component
- Place it between TaskFilters and TaskList
- Show it only when `isLoading && data`

## Expected Results

After implementation:

- ✅ No visible blink when switching tabs
- ✅ Smooth transitions between filter states
- ✅ Cached data remains visible during revalidation
- ✅ Subtle loading indicator provides feedback
- ✅ Motion animations play smoothly without jarring effects

## Testing Checklist

- [ ] Switch between All Tasks, Open, Completed, Overdue tabs
- [ ] Verify no blink/flicker occurs
- [ ] Check that loading indicator appears during revalidation
- [ ] Test with slow network (Chrome DevTools throttling)
- [ ] Verify animations play smoothly
- [ ] Test with empty task lists
- [ ] Test with large task lists (pagination)
- [ ] Verify search and priority filters work smoothly

## Files to Modify

1. `app/tasks/page.tsx` - Main tasks page
2. `components/tasks/task-list.tsx` - Task list component
3. `components/tasks/task-filters.tsx` - Task filters component
4. `components/tasks/loading-indicator.tsx` - New component

## Technical Details

### Why This Works

1. **Conditional Loading**: By checking `!data && isLoading`, we only show the skeleton when there's truly no data (initial load). During revalidation, `data` exists, so the skeleton doesn't appear.

2. **keepPreviousData**: SWR option keeps the old data visible while fetching new data, preventing the "blank state" blink.

3. **layout prop**: Framer Motion's layout prop enables smooth transitions when elements change position or are added/removed.

4. **Subtle Loading Indicator**: Instead of replacing all content with a skeleton, we show a small spinner that doesn't disrupt the UI.

### Performance Considerations

- No additional network requests
- Minimal CPU overhead from animations
- Better perceived performance due to optimistic UI
- Reduced layout thrashing with layout animations

## Rollback Plan

If issues arise:

1. Revert SWR options changes
2. Remove layout props from motion components
3. Remove LoadingIndicator component
4. Restore original loading condition

## Future Enhancements

- Add skeleton loader for individual task items during revalidation
- Implement optimistic updates for checkbox toggles
- Add swipe gestures for mobile tab switching
- Implement virtual scrolling for large task lists
