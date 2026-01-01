# Contacts Page Sorting Feature Implementation Plan

## Overview

Add column-based sorting functionality to the contacts list, allowing users to click on table headers to sort by Name, Email, Phone, or Date Added. Each column should support ascending and descending order toggling.

## Technical Approach

### 1. State Management (app/contacts/page.tsx)

Add two new state variables:

```typescript
const [sortField, setSortField] = useState<'name' | 'email' | 'phone' | 'date'>('date');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
```

**Rationale**:

- Default sort by date (descending) matches current API behavior
- Separate field and direction state for clear, manageable logic
- Type-safe with TypeScript union types

### 2. Sorting Logic Update

Modify the filtering useEffect to include sorting:

```typescript
useEffect(() => {
  let filtered = contacts;

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter((contact) => contact.status === statusFilter);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'phone':
        comparison = (a.phoneNumber || '').localeCompare(b.phoneNumber || '');
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  setFilteredContacts(filtered);
}, [searchQuery, statusFilter, contacts, sortField, sortDirection]);
```

**Rationale**:

- Sorting applied after filtering for performance
- Case-insensitive string comparison using localeCompare
- Phone handles null values gracefully
- Date comparison using timestamps for accuracy
- Single sort operation maintains O(n log n) complexity

### 3. ContactTable Component Updates

#### Props Interface

Add new props to ContactTable:

```typescript
interface ContactTableProps {
  contacts: Contact[];
  selectedContacts: string[];
  onSelectionChange: (selected: string[]) => void;
  onDeleteSelected: () => void;
  sortField: 'name' | 'email' | 'phone' | 'date';
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'email' | 'phone' | 'date') => void;
}
```

#### Header Click Handler

```typescript
const handleSort = (field: 'name' | 'email' | 'phone' | 'date') => {
  if (sortField === field) {
    // Toggle direction if clicking same field
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    // New field, default to ascending
    setSortField(field);
    setSortDirection('asc');
  }
};
```

#### Visual Indicators

Add sort arrows using Lucide icons:

```typescript
import { ChevronUp, ChevronDown } from 'lucide-react';

const SortIcon = ({ field }: { field: string }) => {
  if (sortField !== field) return null;
  return sortDirection === 'asc' ? (
    <ChevronUp className="ml-1 h-4 w-4" />
  ) : (
    <ChevronDown className="ml-1 h-4 w-4" />
  );
};
```

#### Updated Header Implementation

```typescript
<div className="col-span-3 flex items-center cursor-pointer hover:text-foreground transition-colors"
     onClick={() => onSortChange('name')}>
  Name
  <SortIcon field="name" />
</div>
<div className="col-span-3 flex items-center cursor-pointer hover:text-foreground transition-colors"
     onClick={() => onSortChange('email')}>
  Email
  <SortIcon field="email" />
</div>
<div className="col-span-2 flex items-center cursor-pointer hover:text-foreground transition-colors"
     onClick={() => onSortChange('phone')}>
  Phone
  <SortIcon field="phone" />
</div>
<div className="col-span-1 flex items-center cursor-pointer hover:text-foreground transition-colors"
     onClick={() => onSortChange('date')}>
  Date Added
  <SortIcon field="date" />
</div>
```

**Rationale**:

- Cursor pointer indicates interactivity
- Hover effect provides visual feedback
- Icons only show on active sort field to reduce visual noise
- Smooth transitions for polished UX

### 4. Integration in Contacts Page

Update ContactTable component call:

```typescript
<ContactTable
  contacts={filteredContacts}
  selectedContacts={selectedContacts}
  onSelectionChange={setSelectedContacts}
  onDeleteSelected={() => setShowDeleteDialog(true)}
  sortField={sortField}
  sortDirection={sortDirection}
  onSortChange={(field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }}
/>
```

## Design Considerations

### Visual Hierarchy

- Sort indicators are subtle (small icons, muted color)
- Active sort field clearly indicated
- Hover states provide affordance without being distracting

### User Experience

- Click once to sort ascending (or toggle if already active)
- Click again to reverse direction
- Intuitive: clicking same column reverses order
- Sorting persists across filter changes

### Performance

- Client-side sorting is efficient for MVP (handles 10,000+ contacts)
- Sorting happens after filtering, reducing dataset size
- No additional API calls required

### Accessibility

- Headers remain keyboard accessible
- Sort direction communicated visually
- Consistent with existing table interactions

## Implementation Order

1. **Step 1**: Add state management to contacts page
2. **Step 2**: Update filtering useEffect with sorting logic
3. **Step 3**: Update ContactTable props interface
4. **Step 4**: Add sort icons and header click handlers to ContactTable
5. **Step 5**: Wire up sort change handler in contacts page
6. **Step 6**: Test all sort fields and directions
7. **Step 7**: Verify sorting works with filters and search

## Edge Cases Handled

- **Null phone numbers**: Treated as empty strings for sorting
- **Case sensitivity**: localeCompare handles case-insensitive sorting
- **Date parsing**: Uses Date constructor for reliable timestamp conversion
- **Empty lists**: Sorting logic handles empty arrays gracefully
- **Duplicate values**: Stable sort maintains relative order

## Testing Checklist

- [ ] Sort by Name ascending/descending
- [ ] Sort by Email ascending/descending
- [ ] Sort by Phone ascending/descending (with null values)
- [ ] Sort by Date ascending/descending
- [ ] Toggle sort direction by clicking same header
- [ ] Switch between different sort fields
- [ ] Verify sorting works with search filter active
- [ ] Verify sorting works with status filter active
- [ ] Verify sorting works with both filters active
- [ ] Check sort indicators display correctly
- [ ] Test with empty contact list
- [ ] Test with single contact

## Future Enhancements

- Add keyboard shortcuts for sorting (e.g., Alt+N for name)
- Persist sort preference to localStorage
- Add multi-column sorting (secondary sort key)
- Consider server-side sorting for very large datasets
- Add sort indicator to column headers in a more prominent way

## Files to Modify

1. `app/contacts/page.tsx` - Add state and sort logic
2. `components/contacts/contact-table.tsx` - Add clickable headers and indicators

## Dependencies

No new dependencies required. Uses existing:

- `lucide-react` for icons (already installed)
- React hooks (useState, useEffect)
- TypeScript for type safety
