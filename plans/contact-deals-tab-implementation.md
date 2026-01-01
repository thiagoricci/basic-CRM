# Contact Deals Tab Implementation Plan

## Overview

Add a Deals tab to the contact profile view to display all deals associated with a specific contact, following the same pattern as the existing Activities and Tasks tabs.

## Current State

- Contact profile has 3 tabs: Information, Activities, and Tasks
- Activities tab shows all activities for the contact with filtering and add functionality
- Tasks tab shows all tasks for the contact with filtering, pagination, and add functionality
- Deals feature is fully implemented with API endpoints, list view, and profile pages

## Implementation Steps

### 1. Create ContactDeals Component

**File**: `components/contacts/contact-deals.tsx`

**Purpose**: Display all deals associated with a specific contact, similar to ContactTasks component

**Features**:

- Fetch all deals for the contact using SWR (client-side filtering)
- Display deals in a list view (simplified version of DealList)
- Add deal filtering (by status, stage, search)
- Add pagination for large datasets
- Add "Add Deal" button that opens a form pre-filled with the contact
- Handle deal deletion
- Handle deal creation
- Show loading and error states

**Key Implementation Details**:

- Use SWR for data fetching with `keepPreviousData: true` to prevent blinking
- Fetch URL: `/api/deals?contactId=${contactId}`
- Use DealFilters component for filtering
- Use DealList component for display (simplified, no sorting controls)
- Use DealForm component for creating new deals
- Pre-fill contactId when adding new deal from contact profile
- Implement client-side filtering (same pattern as ContactTasks)

**Component Structure**:

```typescript
interface ContactDealsProps {
  contactId: string;
  onRefresh: () => Promise<void>;
}

export function ContactDeals({ contactId, onRefresh }: ContactDealsProps) {
  // SWR fetching
  // Filter state
  // Pagination state
  // Add deal form state
  // Event handlers (add, delete, filter change)
  // Render: header, add button, filters, deal list, pagination
}
```

### 2. Update ContactProfile Component

**File**: `components/contacts/contact-profile.tsx`

**Changes**:

#### 2.1 Add Imports

```typescript
import { ContactDeals } from '@/components/contacts/contact-deals';
import { DollarSign } from 'lucide-react'; // Add to existing import
```

#### 2.2 Update TabsList

Change from 3 columns to 4 columns:

```typescript
<TabsList className="grid w-full max-w-md grid-cols-4">
  <TabsTrigger value="information" className="gap-2">
    <User className="h-4 w-4" />
    Information
  </TabsTrigger>
  <TabsTrigger value="activities" className="gap-2">
    <Activity className="h-4 w-4" />
    Activities
  </TabsTrigger>
  <TabsTrigger value="tasks" className="gap-2">
    <CheckSquare className="h-4 w-4" />
    Tasks
  </TabsTrigger>
  <TabsTrigger value="deals" className="gap-2">
    <DollarSign className="h-4 w-4" />
    Deals
  </TabsTrigger>
</TabsList>
```

#### 2.3 Add Deals Tab Content

Add after the Tasks tab content:

```typescript
<TabsContent value="deals" className="mt-6">
  <div>
    <ContactDeals
      contactId={params.id as string}
      onRefresh={async () => {
        if ((window as any).refreshContact) {
          (window as any).refreshContact();
        }
      }}
    />
  </div>
</TabsContent>
```

## Component Relationships

```
ContactProfile
├── Information Tab (existing)
├── Activities Tab (existing)
├── Tasks Tab (existing)
└── Deals Tab (new)
    └── ContactDeals (new component)
        ├── DealFilters (existing)
        ├── DealList (existing, modified)
        ├── DealForm (existing)
        └── DealPagination (existing)
```

## Data Flow

1. User navigates to contact profile
2. ContactProfile component loads with contact data
3. User clicks "Deals" tab
4. ContactDeals component fetches deals via `/api/deals?contactId=${contactId}`
5. Deals are displayed with filtering and pagination
6. User can:
   - Filter deals by status, stage, search, and value range
   - Add new deal (pre-filled with contact)
   - View deal details (click to navigate to deal profile)
   - Delete deals
7. SWR keeps data fresh with revalidation

## Technical Considerations

### Filtering Strategy

- Use client-side filtering (same as ContactTasks)
- Fetch all deals for contact once
- Filter locally to avoid API calls on every filter change
- This prevents blinking when switching tabs

### Pagination

- Implement client-side pagination
- ITEMS_PER_PAGE = 10 (same as tasks)
- Calculate total pages from filtered deals

### Loading States

- Show loading indicator only on initial fetch
- Use `keepPreviousData: true` to show previous data while refetching
- Show error state with retry button

### Deal Form Integration

- Pre-fill contactId when adding from contact profile
- Hide contact selector (since it's pre-filled)
- Or keep contact selector but default to current contact

### Deal List Simplification

- Remove sorting controls (not needed in contact deals view)
- Keep clickable rows for navigation to deal profile
- Keep all deal information display

## API Requirements

The existing deal API already supports filtering by contactId:

- `GET /api/deals?contactId={id}` - Returns all deals for a specific contact

No API changes required.

## Testing Checklist

- [ ] ContactDeals component renders correctly
- [ ] Deals are fetched and displayed for the contact
- [ ] Filtering works (status, stage, search, value range)
- [ ] Pagination works correctly
- [ ] "Add Deal" button opens form with pre-filled contact
- [ ] New deals are created and appear in list
- [ ] Deals can be deleted
- [ ] Clicking a deal navigates to deal profile
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Tab switching doesn't cause blinking (SWR with keepPreviousData)
- [ ] Contact refresh callback works after adding/deleting deals
- [ ] Responsive design works on mobile

## Files to Modify

1. **Create**: `components/contacts/contact-deals.tsx` (new file)
2. **Modify**: `components/contacts/contact-profile.tsx` (add Deals tab)

## Files to Reference (No Changes)

- `components/deals/deal-filters.tsx` - Use for filtering
- `components/deals/deal-list.tsx` - Use for display (may need minor adjustments)
- `components/deals/deal-form.tsx` - Use for creating deals
- `components/deals/deal-pagination.tsx` - Use for pagination
- `components/contacts/contact-tasks.tsx` - Reference for implementation pattern
- `types/deal.ts` - Deal types
- `lib/validations.ts` - Deal validation schema

## Success Criteria

- Users can view all deals associated with a contact
- Users can filter deals by status, stage, search, and value range
- Users can add new deals directly from the contact profile
- Users can delete deals from the contact profile
- Users can navigate to deal profiles from the deals list
- Tab switching is smooth without blinking
- All states (loading, error, empty) are handled gracefully
- Implementation follows the same pattern as ContactTasks for consistency
