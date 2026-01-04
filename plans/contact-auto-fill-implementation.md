# Contact Auto-Fill Feature Implementation Plan

## Overview

When creating a Deal, Task, or Activity, selecting a contact should automatically populate related fields:

- **Company**: Auto-fill with the contact's company
- **Assigned To**: Auto-fill with the contact's assigned user (userId)

Additionally, prevent mismatched assignments:

- Cannot assign a deal to a different company than the contact's company
- Cannot assign a deal/task/activity to a different user than the contact's user

## Current State Analysis

### Data Relationships

- **Contact** has: `companyId` (optional), `userId` (optional)
- **Deal** has: `contactId` (required), `companyId` (optional), `userId` (optional)
- **Task** has: `contactId` (required), `userId` (optional)
- **Activity** has: `contactId` (required), `userId` (optional)

### Current Form Behavior

- **DealForm**: Contact, Company, and UserSelector are independent
- **TaskForm**: Contact and UserSelector are independent
- **ActivityForm**: Contact and UserSelector are independent
- **ContactSelector**: Only returns `contactId`, doesn't expose full contact object

## Implementation Strategy

### Phase 1: Update ContactSelector Component

**File**: `components/contacts/contact-selector.tsx`

**Changes**:

1. Add `onContactSelect` callback prop to expose selected contact object
2. Pass full contact object when user selects a contact
3. Maintain backward compatibility (callback is optional)

```typescript
interface ContactSelectorProps {
  value?: string;
  onChange: (contactId: string) => void;
  onContactSelect?: (contact: Contact) => void; // NEW
  disabled?: boolean;
  error?: string;
}
```

### Phase 2: Update DealForm

**File**: `components/deals/deal-form.tsx`

**Changes**:

1. Add state to track selected contact object
2. Add `onContactSelect` handler to ContactSelector
3. Auto-fill `companyId` and `userId` when contact is selected
4. Disable CompanySelector and UserSelector when contact has company/user
5. Allow manual override but validate on submit

**Validation Rules**:

- If contact has `companyId`, deal's `companyId` must match
- If contact has `userId`, deal's `userId` must match
- If contact doesn't have `companyId`, deal can have any company (or none)
- If contact doesn't have `userId`, deal can have any user (or none)

### Phase 3: Update TaskForm

**File**: `components/tasks/task-form.tsx`

**Changes**:

1. Add state to track selected contact object
2. Add `onContactSelect` handler to ContactSelector
3. Auto-fill `userId` when contact is selected
4. Disable UserSelector when contact has userId
5. Allow manual override but validate on submit

**Validation Rules**:

- If contact has `userId`, task's `userId` must match
- If contact doesn't have `userId`, task can have any user (or none)

### Phase 4: Update ActivityForm

**File**: `components/activities/activity-form.tsx`

**Changes**:

1. Add state to track selected contact object
2. Add `onContactSelect` handler to ContactSelector
3. Auto-fill `userId` when contact is selected
4. Disable UserSelector when contact has userId
5. Allow manual override but validate on submit

**Validation Rules**:

- If contact has `userId`, activity's `userId` must match
- If contact doesn't have `userId`, activity can have any user (or none)

### Phase 5: Backend Validation (API Routes)

**Files**:

- `app/api/deals/route.ts` (POST)
- `app/api/deals/[id]/route.ts` (PUT)
- `app/api/tasks/route.ts` (POST)
- `app/api/tasks/[id]/route.ts` (PUT)
- `app/api/activities/route.ts` (POST)
- `app/api/activities/[id]/route.ts` (PUT)

**Validation Logic**:

1. Fetch contact record to get companyId and userId
2. Validate that deal/task/activity assignments match contact's assignments
3. Return 400 error if mismatch detected

**Example Validation**:

```typescript
// For deals
const contact = await prisma.contact.findUnique({
  where: { id: body.contactId },
  select: { companyId: true, userId: true },
});

if (contact.companyId && body.companyId && contact.companyId !== body.companyId) {
  return NextResponse.json(
    { data: null, error: "Company must match the contact's company" },
    { status: 400 }
  );
}

if (contact.userId && body.userId && contact.userId !== body.userId) {
  return NextResponse.json(
    { data: null, error: "Assigned user must match the contact's assigned user" },
    { status: 400 }
  );
}
```

## User Experience Flow

### Deal Creation Flow

1. User opens "New Deal" form
2. User selects a contact from dropdown
3. **Auto-fill**: Company field populates with contact's company (if any)
4. **Auto-fill**: "Assigned To" field populates with contact's user (if any)
5. Company and UserSelector fields become disabled (grayed out)
6. User can still modify other deal fields
7. On submit, backend validates company/user match contact

### Task Creation Flow

1. User opens "New Task" form
2. User selects a contact from dropdown
3. **Auto-fill**: "Assigned To" field populates with contact's user (if any)
4. UserSelector field becomes disabled (grayed out)
5. User can still modify other task fields
6. On submit, backend validates user matches contact

### Activity Creation Flow

1. User opens "New Activity" form
2. User selects a contact from dropdown
3. **Auto-fill**: "Assigned To" field populates with contact's user (if any)
4. UserSelector field becomes disabled (grayed out)
5. User can still modify other activity fields
6. On submit, backend validates user matches contact

## Edge Cases to Handle

1. **Contact without company**: Deal can have any company (or none)
2. **Contact without user**: Deal/Task/Activity can have any user (or none)
3. **Editing existing record**: Preserve current company/user if they match contact
4. **Contact assignment changes**: When contact's company/user changes, existing records should be validated
5. **Admin override**: Admins might need ability to override (future enhancement)

## Testing Checklist

- [ ] ContactSelector properly calls `onContactSelect` callback
- [ ] DealForm auto-fills company when contact has company
- [ ] DealForm auto-fills user when contact has user
- [ ] DealForm disables CompanySelector when contact has company
- [ ] DealForm disables UserSelector when contact has user
- [ ] TaskForm auto-fills user when contact has user
- [ ] TaskForm disables UserSelector when contact has user
- [ ] ActivityForm auto-fills user when contact has user
- [ ] ActivityForm disables UserSelector when contact has user
- [ ] Backend validation rejects mismatched company in deals
- [ ] Backend validation rejects mismatched user in deals
- [ ] Backend validation rejects mismatched user in tasks
- [ ] Backend validation rejects mismatched user in activities
- [ ] Forms work correctly when contact has no company
- [ ] Forms work correctly when contact has no user
- [ ] Editing existing records preserves valid assignments
- [ ] Error messages are clear and helpful

## Files to Modify

1. `components/contacts/contact-selector.tsx` - Add onContactSelect callback
2. `components/deals/deal-form.tsx` - Auto-fill company and user
3. `components/tasks/task-form.tsx` - Auto-fill user
4. `components/activities/activity-form.tsx` - Auto-fill user
5. `app/api/deals/route.ts` - Add validation
6. `app/api/deals/[id]/route.ts` - Add validation
7. `app/api/tasks/route.ts` - Add validation
8. `app/api/tasks/[id]/route.ts` - Add validation
9. `app/api/activities/route.ts` - Add validation
10. `app/api/activities/[id]/route.ts` - Add validation

## Success Criteria

- ✅ Selecting a contact automatically fills related company and user fields
- ✅ Related fields are disabled to prevent manual changes
- ✅ Backend validation prevents mismatched assignments
- ✅ Clear error messages when validation fails
- ✅ Forms work correctly for contacts with and without company/user assignments
- ✅ Existing records can be edited without breaking
- ✅ User experience is intuitive and clear
