# Companies Tabs Reorganization & Contact Companies Tab Implementation Plan

## Overview

This plan covers two main tasks:

1. Move tabs to the top in companies view (similar to contacts view)
2. Add Companies tab to contacts view

## Current State Analysis

### Companies View (app/companies/[id]/page.tsx)

- CompanyProfile component is displayed ABOVE the tabs
- Tabs are shown below the profile with 5 tabs: Information, Contacts, Deals, Activities, Tasks
- Information tab content is empty (profile is shown above)
- Uses SWR for data fetching

### Contacts View (components/contacts/contact-profile.tsx)

- Tabs are at the top with 4 tabs: Information, Activities, Tasks, Deals
- Information tab content shows the contact details
- Uses SWR for data fetching
- Each tab has its own component (ContactTasks, ContactDeals, ActivityList)

### Contacts API (app/api/contacts/[id]/route.ts)

- Currently does NOT include company relationship data
- Only returns basic contact fields
- Needs to be updated to include company information

## Task 1: Move Tabs to Top in Companies View

### Files to Modify:

- `app/companies/[id]/page.tsx`

### Changes Required:

1. **Restructure the page layout**:
   - Move the tabs section to be the first content after the header
   - Remove the CompanyProfile component from above tabs
   - Move CompanyProfile component INSIDE the Information tab content

2. **Update the Information tab content**:
   - Display CompanyProfile component in the TabsContent for "information"
   - This matches the pattern used in contacts view

3. **Maintain existing functionality**:
   - Keep all tab triggers and content
   - Keep SWR data fetching
   - Keep update and delete handlers

### Expected Result:

```
Header (Company Name + Industry)
  ↓
Tabs (Information, Contacts, Deals, Activities, Tasks)
  ↓
Tab Content:
  - Information: CompanyProfile component
  - Contacts: CompanyContacts component
  - Deals: CompanyDeals component
  - Activities: CompanyActivities component
  - Tasks: CompanyTasks component
```

## Task 2: Add Companies Tab to Contacts View

### Files to Modify:

1. `components/contacts/contact-companies.tsx` - NEW FILE
2. `components/contacts/contact-profile.tsx`
3. `app/api/contacts/[id]/route.ts`
4. `types/contact.ts` (if needed)

### Step 1: Create ContactCompanies Component

**File**: `components/contacts/contact-companies.tsx`

**Purpose**: Display company information for a contact

**Features**:

- Show the company associated with the contact (if any)
- Display company details: name, industry, website, phone, address
- Allow clicking on company to navigate to company profile
- Show "No company assigned" message if contact has no company
- Match the styling of ContactTasks and ContactDeals components

**Props Interface**:

```typescript
interface ContactCompaniesProps {
  companyId: string | null | undefined;
  company?: Company | null;
  onCompanyClick?: (company: Company) => void;
}
```

**Component Structure**:

```tsx
export function ContactCompanies({ companyId, company, onCompanyClick }: ContactCompaniesProps) {
  // If no company assigned, show empty state
  // If company assigned, show company card with details
  // Card should be clickable to navigate to company profile
}
```

### Step 2: Update Contact Profile Component

**File**: `components/contacts/contact-profile.tsx`

**Changes Required**:

1. **Add Companies tab trigger**:
   - Add new TabsTrigger with value="companies"
   - Use Building2 icon (matching companies view)
   - Update grid-cols from 4 to 5

2. **Add Companies tab content**:
   - Add new TabsContent with value="companies"
   - Import and use ContactCompanies component
   - Pass company data from contact.company

3. **Update imports**:
   - Add Building2 icon from lucide-react
   - Import ContactCompanies component

### Step 3: Update Contacts API

**File**: `app/api/contacts/[id]/route.ts`

**Changes Required**:

1. **Update GET endpoint**:
   - Add `include` clause to fetch company relationship
   - Include company data in the response

```typescript
const contact = await prisma.contact.findUnique({
  where: { id: params.id },
  include: {
    company: true, // Include company data
  },
});
```

2. **No changes needed** for PUT and DELETE endpoints (they don't need company data)

### Step 4: Verify Type Definitions

**File**: `types/contact.ts`

**Check**: The Contact interface already includes `company?: Company`, so no changes needed.

## Implementation Order

1. ✅ Analyze current structure
2. ⬜ Move tabs to top in companies view
3. ⬜ Create ContactCompanies component
4. ⬜ Update Contact Profile component with Companies tab
5. ⬜ Update Contacts API to include company data
6. ⬜ Test all changes

## Testing Checklist

### Companies View:

- [ ] Tabs appear at the top (below header)
- [ ] Information tab shows CompanyProfile component
- [ ] All other tabs work correctly (Contacts, Deals, Activities, Tasks)
- [ ] Edit and delete functionality still works
- [ ] Data refreshes correctly with SWR

### Contacts View:

- [ ] Companies tab appears in tabs list (5 tabs total)
- [ ] Companies tab shows company card if company assigned
- [ ] Companies tab shows "No company assigned" if no company
- [ ] Clicking company card navigates to company profile
- [ ] Tab switching works smoothly
- [ ] Data refreshes correctly

### API:

- [ ] GET /api/contacts/[id] returns company data
- [ ] Company data is properly typed
- [ ] No breaking changes to existing functionality

## Design Considerations

### Consistency:

- Match the styling of ContactTasks and ContactDeals components
- Use same card layout and spacing
- Use consistent iconography (Building2 for companies)

### UX:

- Clear visual indication when no company is assigned
- Smooth navigation to company profile
- Loading states if needed

### Performance:

- Company data is already fetched with contact (no additional API calls)
- No impact on existing performance

## Potential Issues & Solutions

### Issue 1: Company data might not be available initially

**Solution**: Handle null/undefined company gracefully with empty state

### Issue 2: Navigation might break if company is deleted

**Solution**: Handle 404 errors gracefully when navigating to company profile

### Issue 3: Tab layout might break with 5 tabs

**Solution**: Use responsive grid (already in place with grid-cols-5)

## Success Criteria

1. Companies view has tabs at the top (like contacts view)
2. Information tab in companies view shows the company profile
3. Contacts view has a Companies tab with Building2 icon
4. Companies tab displays company information when assigned
5. Companies tab shows empty state when no company assigned
6. All existing functionality remains intact
7. No performance degradation

## Files Summary

### Files to Create:

- `components/contacts/contact-companies.tsx`

### Files to Modify:

- `app/companies/[id]/page.tsx` - Move tabs to top
- `components/contacts/contact-profile.tsx` - Add Companies tab
- `app/api/contacts/[id]/route.ts` - Include company data

### Files to Reference:

- `components/contacts/contact-tasks.tsx` - Styling reference
- `components/contacts/contact-deals.tsx` - Styling reference
- `components/companies/company-profile.tsx` - Company display reference
