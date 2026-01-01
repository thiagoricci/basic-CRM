# Contact-Company-Deal Linking Implementation Plan

## Current State Analysis

### Database Schema (Already Implemented)

The database relationships are correctly set up in [`prisma/schema.prisma`](prisma/schema.prisma:1):

**Contact ↔ Company Relationship:**

- `Contact` model has `companyId` field (optional, nullable)
- `Contact.company` relation with `onDelete: SetNull` (deleting company sets contact.companyId to null)
- `Company` model has `contacts` relation (one-to-many)

**Deal ↔ Company Relationship:**

- `Deal` model has `companyId` field (optional, nullable)
- `Deal.company` relation with `onDelete: SetNull` (deleting company sets deal.companyId to null)
- `Company` model has `deals` relation (one-to-many)

### Validation Schemas (Already Implemented)

**Contact Schema** ([`lib/validations.ts`](lib/validations.ts:3)):

- `companyId` field: optional UUID validation

**Deal Schema** ([`lib/validations.ts`](lib/validations.ts:110)):

- `companyId` field: optional UUID validation

### UI Components (Partial Implementation)

**ContactForm** ([`components/contacts/contact-form.tsx`](components/contacts/contact-form.tsx:1)):

- Has `companyId` field in form state (line 48)
- Has Company dropdown UI (lines 181-200)
- **ISSUE**: Dropdown is empty - only shows "No Company" option
- **MISSING**: No logic to fetch and populate companies

**DealForm** ([`components/deals/deal-form.tsx`](components/deals/deal-form.tsx:1)):

- Has `contactId` field with Contact selector (lines 241-266)
- **MISSING**: No `companyId` field or Company selector
- **MISSING**: No logic to fetch companies

**CompanySelector** ([`components/companies/company-selector.tsx`](components/companies/company-selector.tsx:1)):

- Has search functionality
- **ISSUE**: Line 78 has `<SelectItem value="">` which causes error: "A <Select.Item /> must have a value prop that is not an empty string"
- This prevents clearing the company selection

## Implementation Plan

### Phase 1: Fix CompanySelector Component

**File**: [`components/companies/company-selector.tsx`](components/companies/company-selector.tsx:1)

**Issue**: Radix UI Select component doesn't allow empty string values for SelectItem.

**Solution**: Remove the "No Company" SelectItem and handle empty selection through the placeholder.

**Changes**:

1. Remove line 78: `<SelectItem value="">No Company</SelectItem>`
2. The placeholder will handle the "no selection" state
3. When user wants to clear selection, they can use the Select's built-in clear functionality (if available) or we can add a separate "Clear" button

### Phase 2: Update ContactForm to Fetch Companies

**File**: [`components/contacts/contact-form.tsx`](components/contacts/contact-form.tsx:1)

**Current State**: Company dropdown exists but is empty.

**Changes**:

1. Add state for companies array: `const [companies, setCompanies] = useState<any[]>([]);`
2. Add useEffect to fetch companies from `/api/companies`
3. Replace the existing Select with CompanySelector component (import from `@/components/companies/company-selector`)
4. Pass companies data to CompanySelector
5. Wire up the onChange handler to update form value

**Code Pattern** (similar to DealForm's contact selector):

```typescript
const [companies, setCompanies] = useState<any[]>([]);

useEffect(() => {
  fetch('/api/companies')
    .then((res) => res.json())
    .then((data) => {
      if (data.data) {
        setCompanies(data.data);
      }
    })
    .catch((err) => console.error('Failed to fetch companies:', err));
}, []);
```

### Phase 3: Add CompanySelector to DealForm

**File**: [`components/deals/deal-form.tsx`](components/deals/deal-form.tsx:1)

**Current State**: Only has Contact selector, no Company selector.

**Changes**:

1. Add `companyId` to form default values (line 64)
2. Add state for companies array
3. Add useEffect to fetch companies from `/api/companies`
4. Add CompanySelector component after Contact selector
5. Import CompanySelector from `@/components/companies/company-selector`

**UI Placement**:

- Place Company selector after Contact selector (around line 267)
- Use similar layout pattern as Contact selector

### Phase 4: Test Contact-Company Linking

**Test Cases**:

1. Create a new contact and assign it to a company
2. Verify the contact appears in the company's contacts list
3. Edit an existing contact and change its company assignment
4. Remove a contact's company assignment
5. Delete a company and verify contacts are unlinked (companyId becomes null)

**Verification Points**:

- Contact profile shows company name
- Company profile shows contact in contacts tab
- API endpoints correctly handle companyId updates
- Cascade delete works as expected (SetNull behavior)

### Phase 5: Test Deal-Company Linking

**Test Cases**:

1. Create a new deal and assign it to a company
2. Verify the deal appears in the company's deals list
3. Edit an existing deal and change its company assignment
4. Remove a deal's company assignment
5. Delete a company and verify deals are unlinked (companyId becomes null)

**Verification Points**:

- Deal profile shows company name
- Company profile shows deal in deals tab
- API endpoints correctly handle companyId updates
- Cascade delete works as expected (SetNull behavior)

### Phase 6: Document the Linking Workflow

**Documentation Updates**:

1. Update [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) to include companyId fields
2. Add examples of linking contacts to companies
3. Add examples of linking deals to companies
4. Document the cascade delete behavior (SetNull)

## Technical Considerations

### Data Flow

**Creating a Contact with Company:**

```
User fills form → Select company → Submit → POST /api/contacts
  → Server validates → Insert contact with companyId → Return contact
```

**Creating a Deal with Company:**

```
User fills form → Select contact → Select company → Submit → POST /api/deals
  → Server validates → Insert deal with contactId and companyId → Return deal
```

**Updating Company Assignment:**

```
User clicks edit → Change company selection → Submit → PUT /api/contacts/[id] or /api/deals/[id]
  → Server validates → Update companyId → Return updated record
```

### Cascade Delete Behavior

**When a Company is Deleted:**

- All associated contacts have their `companyId` set to `null`
- All associated deals have their `companyId` set to `null`
- Contacts and deals remain in the system, just unlinked
- This is the `SetNull` behavior defined in the schema

### API Endpoints (Already Implemented)

**Contact API**:

- `POST /api/contacts` - accepts `companyId` in request body
- `PUT /api/contacts/[id]` - accepts `companyId` in request body
- `GET /api/contacts` - returns contacts with company relation

**Deal API**:

- `POST /api/deals` - accepts `companyId` in request body
- `PUT /api/deals/[id]` - accepts `companyId` in request body
- `GET /api/deals` - returns deals with company relation

**Company API**:

- `GET /api/companies/[id]` - returns company with contacts and deals relations

## User Experience Design

### Contact Form UX

- Company selector placed after Job Title field
- Optional field (can be left unassigned)
- Search functionality for finding companies
- Clear visual indication of selected company

### Deal Form UX

- Contact selector (required)
- Company selector (optional, placed after contact)
- Search functionality for finding companies
- Clear visual indication of selected company

### Company Profile UX

- Contacts tab shows all contacts assigned to company
- Deals tab shows all deals assigned to company
- Can create new contacts/deals from company profile (pre-fills company)

## Success Criteria

- [ ] CompanySelector component works without errors
- [ ] ContactForm displays and allows selecting companies
- [ ] DealForm displays and allows selecting companies
- [ ] Creating a contact with company assignment works
- [ ] Creating a deal with company assignment works
- [ ] Updating company assignments works
- [ ] Clearing company assignments works
- [ ] Deleting a company unlinks contacts and deals (SetNull behavior)
- [ ] Company profile shows correct contacts and deals
- [ ] Contact profile shows assigned company
- [ ] Deal profile shows assigned company
- [ ] API documentation updated

## Risks and Mitigations

| Risk                                              | Impact | Likelihood | Mitigation                                                          |
| ------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------- |
| CompanySelector empty string error causes crashes | High   | Medium     | Remove empty string SelectItem, handle clearing through placeholder |
| Form validation fails on empty companyId          | Medium | Low        | companyId is optional in schema, validation allows empty string     |
| Cascade delete not working as expected            | Medium | Low        | Test thoroughly, verify SetNull behavior in Prisma schema           |
| Performance issues with large company lists       | Low    | Low        | CompanySelector has search functionality, pagination if needed      |

## Files to Modify

1. [`components/companies/company-selector.tsx`](components/companies/company-selector.tsx:1) - Fix empty string issue
2. [`components/contacts/contact-form.tsx`](components/contacts/contact-form.tsx:1) - Add company fetching
3. [`components/deals/deal-form.tsx`](components/deals/deal-form.tsx:1) - Add company selector
4. [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) - Update documentation

## Estimated Complexity

- **Low to Medium** - Most infrastructure is already in place
- Main work is UI form updates and component fixes
- No database migrations needed
- API endpoints already support companyId fields
