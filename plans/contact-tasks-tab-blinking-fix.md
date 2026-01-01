# Contact Tasks Tab Blinking Fix

## Problem

The `ContactTasks` component (used in the contact profile's Tasks tab) currently uses API-based filtering with query parameters. When users switch between filter tabs (Open, Completed, Overdue), the component:

1. Sets `loading(true)` - hiding ALL content
2. Makes API call with filter params
3. Shows "Loading tasks..." message
4. After fetch completes, shows filtered data
5. Result: Full content flash/blink on every tab switch

## Solution

Apply the same client-side filtering pattern used in the Tasks and Deals pages:

1. Fetch ALL tasks for the contact once (without query params)
2. Apply filters client-side (instant, no API call)
3. Keep previous data visible during transitions
4. Only show subtle "Updating..." indicator when refreshing

## Files to Modify

### Primary File

- `components/contacts/contact-tasks.tsx` - Refactor to use client-side filtering

## Implementation Details

### Changes to ContactTasks Component

#### 1. Update SWR Fetch URL

**Before:**

```typescript
// Build query string for API
const queryParams = new URLSearchParams();
queryParams.append('contactId', contactId);
if (filters.status !== 'all') queryParams.append('status', filters.status);
if (filters.priority !== 'all') queryParams.append('priority', filters.priority);
if (filters.search) queryParams.append('search', filters.search);

const queryString = queryParams.toString();
const fetchUrl = `/api/tasks${queryString ? `?${queryString}` : ''}`;

const { data, error, isLoading, mutate } = useSWR(fetchUrl, fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 2000,
  keepPreviousData: true,
});
```

**After:**

```typescript
// Fetch all tasks for this contact once
const fetchUrl = `/api/tasks?contactId=${contactId}`;

const { data, error, isLoading, mutate } = useSWR(fetchUrl, fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 2000,
  keepPreviousData: true,
});
```

#### 2. Add Client-Side Filtering Function

```typescript
// Client-side filtering function
const getFilteredTasks = (tasks: Task[], filters: TaskFiltersType): Task[] => {
  let filtered = [...tasks];

  // Filter by status
  if (filters.status !== 'all') {
    const now = new Date();
    filtered = filtered.filter((task) => {
      if (filters.status === 'open') {
        return !task.completed;
      } else if (filters.status === 'completed') {
        return task.completed;
      } else if (filters.status === 'overdue') {
        return !task.completed && new Date(task.dueDate) < now;
      }
      return true;
    });
  }

  // Filter by priority
  if (filters.priority !== 'all') {
    filtered = filtered.filter((task) => task.priority === filters.priority);
  }

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((task) => task.title.toLowerCase().includes(searchLower));
  }

  return filtered;
};
```

#### 3. Update Filter Change Handler

```typescript
const handleFilterChange = (newFilters: TaskFiltersType) => {
  setFilters(newFilters);
  setCurrentPage(1);
  // No API call needed - filtering is client-side
};
```

#### 4. Update Pagination Logic

```typescript
// Use fetched data
const allTasks = data?.data || [];

// Apply client-side filters
const filteredTasks = getFilteredTasks(allTasks, filters);

// Calculate pagination
const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const endIndex = startIndex + ITEMS_PER_PAGE;
const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
```

#### 5. Update Loading Indicator Logic

```typescript
{!data && isLoading ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground">Loading tasks...</p>
  </div>
) : error ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground">Failed to load tasks</p>
    <Button onClick={() => mutate()} variant="outline" className="mt-4">
      Try again
    </Button>
  </div>
) : (
  <>
    <TaskFilters onFilterChange={handleFilterChange} />

    {/* Only show loading indicator when refreshing, not on initial load */}
    {isLoading && data && <LoadingIndicator />}

    <TaskList
      tasks={paginatedTasks}
      onToggleComplete={handleToggleComplete}
    />
  </>
)}
```

## Expected Behavior

### Before Fix

- User clicks "Completed" tab
- Screen shows "Loading tasks..."
- API call is made with `?contactId=xxx&status=completed`
- After ~500ms, filtered tasks appear
- Result: Blinking/flash on every tab switch

### After Fix

- User clicks "Completed" tab
- Tasks are filtered instantly in browser
- No API call is made
- Previous data remains visible during transition
- Only shows "Updating tasks..." indicator when data is being refreshed
- Result: Smooth, non-disruptive tab switching

## Benefits

1. **No Blinking**: Tab switches are instant with no visual disruption
2. **Better UX**: Users see previous data during transitions
3. **Fewer API Calls**: Only fetches data once per contact, not per tab switch
4. **Consistent Pattern**: Matches the fix applied to Tasks and Deals pages
5. **Improved Performance**: Client-side filtering is faster than API calls

## Testing Checklist

- [ ] Switch between Open, Completed, and Overdue tabs - should be instant, no blinking
- [ ] Apply priority filters - should work instantly
- [ ] Search tasks - should filter instantly
- [ ] Add new task - should refresh data and show "Updating..." indicator
- [ ] Toggle task completion - should update list without blinking
- [ ] Delete task - should update list without blinking
- [ ] Pagination - should work correctly with filtered results
- [ ] Refresh contact - should show "Updating..." indicator

## Implementation Order

1. Update SWR fetch URL to fetch all tasks for contact
2. Add `getFilteredTasks()` function for client-side filtering
3. Update filter change handler to remove API dependency
4. Update pagination logic to use filtered tasks
5. Update loading indicator logic
6. Test all scenarios

## Notes

- The `LoadingIndicator` component already exists in `components/tasks/loading-indicator.tsx`
- The `TaskFilters`, `TaskList`, and `TaskPagination` components don't need changes
- This fix follows the exact same pattern as the Tasks and Deals pages fixes
