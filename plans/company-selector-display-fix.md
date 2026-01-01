# Fix CompanySelector Display Issue

## Problem

When editing a Deal, selecting a company from the CompanySelector doesn't display the company name in the selector field. The database updates correctly, but the visual display remains empty.

## Root Cause

The `CompanySelector` component receives a company ID as the `value` prop, but the `SelectValue` component doesn't automatically display the company name associated with that ID. The Radix UI `SelectValue` needs to know what text to display for the selected value.

## Solution

Update `components/companies/company-selector.tsx` to:

1. Find the selected company from the companies array using the value (company ID)
2. Display the selected company's name in the `SelectValue` placeholder when a company is selected
3. Fall back to the default placeholder when no company is selected

## Changes Required

### File: `components/companies/company-selector.tsx`

**Line 29-53:** Add logic to find and display selected company name

```typescript
// Find selected company to display its name
const selectedCompany = companies.find((company) => company.id === value);

// Update SelectTrigger to use selected company name
<SelectTrigger>
  <SelectValue placeholder={selectedCompany ? selectedCompany.name : placeholder} />
</SelectTrigger>
```

## Implementation Steps

1. Add `selectedCompany` variable to find the company matching the value prop
2. Update `SelectValue` placeholder to display `selectedCompany.name` when available
3. Test the fix by:
   - Editing an existing deal with a company assigned
   - Verifying the company name displays in the selector
   - Changing to a different company and verifying the display updates
   - Creating a new deal and selecting a company
   - Verifying database updates still work correctly

## Testing Checklist

- [ ] Edit an existing deal with a company assigned - company name displays
- [ ] Change company selection - display updates immediately
- [ ] Create new deal and select company - name displays
- [ ] Clear company selection - placeholder shows
- [ ] Database updates correctly after save
- [ ] No console errors
