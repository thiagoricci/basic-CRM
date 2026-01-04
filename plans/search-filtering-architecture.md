# Search & Filtering Feature - Architecture Plan

## Overview

This document outlines the architecture for implementing a comprehensive Search & Filtering system for the CRM application, including global search, advanced filters, saved views, and URL parameter support.

## Current State Analysis

### Already Implemented ✅

- Page-specific filters for Contacts, Companies, Deals, Tasks, and Activities
- Search functionality on each page (client-side filtering)
- Sort options in contacts table
- Debounced search input (deals)
- Active filter badges with clear buttons (activities)
- Basic filter combinations (status + priority + search in tasks)

### Missing Features ❌

1. Global Search Bar with keyboard shortcut
2. Advanced Filter Builder with AND/OR logic
3. Saved Filters/Views functionality
4. URL parameter support for shareable filter links
5. Enhanced filters (company filter for contacts, date range for tasks, etc.)
6. Full-text search optimization
7. Search history/recent searches

---

## Architecture Design

### 1. Global Search Bar

#### Component Structure

```
components/
└── search/
    ├── global-search-bar.tsx          # Main search input in header
    ├── search-results-dropdown.tsx     # Command palette dropdown
    ├── search-result-item.tsx          # Individual result component
    └── search-history.tsx              # Recent searches management
```

#### Features

- **Location**: Navigation header (desktop sidebar and mobile header)
- **Trigger**: Click search icon OR keyboard shortcut (Ctrl+K / Cmd+K)
- **UI Style**: Command palette (similar to VS Code, Linear, Raycast)
- **Search Debounce**: 300ms delay to reduce API calls
- **Results Grouping**: By type (Contacts, Companies, Deals, Tasks)
- **Keyboard Navigation**: Arrow keys to navigate, Enter to select, Esc to close
- **Quick Actions**: View profile, Edit (if applicable)
- **Search History**: Store last 10 searches in localStorage
- **Empty State**: Helpful suggestions when no results found

#### API Endpoint

**Route**: `GET /api/search?q={query}&limit={limit}`

**Query Parameters**:

- `q`: Search query string
- `limit`: Maximum results per type (default: 5)

**Response Format**:

```typescript
{
  contacts: {
    total: number,
    results: Contact[]
  },
  companies: {
    total: number,
    results: Company[]
  },
  deals: {
    total: number,
    results: Deal[]
  },
  tasks: {
    total: number,
    results: Task[]
  }
}
```

**Search Fields**:

- Contacts: firstName, lastName, email, phoneNumber
- Companies: name, industry, website
- Deals: name, description
- Tasks: title, description

**Implementation**:

```typescript
// app/api/search/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '5');

  if (!query.trim()) {
    return NextResponse.json({ contacts: [], companies: [], deals: [], tasks: [] });
  }

  const [contacts, companies, deals, tasks] = await Promise.all([
    prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { id: true, firstName: true, lastName: true, email: true, status: true },
    }),
    // ... similar for companies, deals, tasks
  ]);

  return NextResponse.json({
    contacts: { total: contacts.length, results: contacts },
    companies: { total: companies.length, results: companies },
    deals: { total: deals.length, results: deals },
    tasks: { total: tasks.length, results: tasks },
  });
}
```

---

### 2. Advanced Filter Builder

#### Component Structure

```
components/
└── filters/
    ├── advanced-filter-builder.tsx    # Main filter builder UI
    ├── filter-condition.tsx            # Individual filter condition row
    ├── filter-operator-select.tsx      # AND/OR selector
    ├── filter-field-select.tsx         # Field selector (name, email, status, etc.)
    ├── filter-comparison-select.tsx    # Comparison operator (contains, equals, etc.)
    └── filter-value-input.tsx          # Value input based on field type
```

#### Features

- **Location**: Collapsible section on each list page (Contacts, Companies, Deals, Tasks, Activities)
- **Filter Conditions**: Multiple conditions with AND/OR logic
- **Field Selection**: All searchable fields for each entity type
- **Comparison Operators**:
  - Text fields: contains, equals, starts with, ends with, is empty, is not empty
  - Number fields: equals, not equals, greater than, less than, between
  - Date fields: equals, before, after, between, is empty
  - Select fields: equals, is empty, is not empty
- **Dynamic UI**: Input type changes based on selected field (text, number, date, select)
- **Add/Remove Conditions**: Dynamically add or remove filter conditions
- **Clear All**: Reset all filters to default state
- **Apply Filters**: Trigger filter update with current conditions

#### Data Structure

```typescript
interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
}

interface AdvancedFilters {
  operator: 'AND' | 'OR';
  conditions: FilterCondition[];
}
```

#### Example Usage

```typescript
// Contacts page example
const advancedFilters: AdvancedFilters = {
  operator: 'AND',
  conditions: [
    { id: '1', field: 'status', operator: 'equals', value: 'lead' },
    { id: '2', field: 'company', operator: 'equals', value: 'company-123' },
    { id: '3', field: 'createdAt', operator: 'after', value: '2024-01-01' },
  ],
};
```

---

### 3. Saved Filters/Views

#### Component Structure

```
components/
└── saved-filters/
    ├── saved-filters-dropdown.tsx      # Dropdown to save/load filters
    ├── save-filter-dialog.tsx          # Dialog to name and save filter
    ├── saved-filter-item.tsx           # Individual saved filter item
    └── use-saved-filters.ts           # Hook for managing saved filters
```

#### Features

- **Storage**: localStorage (client-side) for MVP
- **Save Filter**: Save current filter combination with custom name
- **Load Filter**: Apply saved filter to current page
- **Delete Filter**: Remove saved filter
- **Default Filters**: Pre-configured filters (e.g., "My Hot Leads", "High-Value Deals")
- **Filter Metadata**: Store filter name, entity type, filter conditions, created date
- **Filter Icons**: Assign icons to saved filters for visual identification

#### Data Structure

```typescript
interface SavedFilter {
  id: string;
  name: string;
  entityType: 'contacts' | 'companies' | 'deals' | 'tasks' | 'activities';
  filters: any; // Filter conditions specific to entity type
  createdAt: string;
  updatedAt: string;
}
```

#### Storage Key

```typescript
const SAVED_FILTERS_KEY = 'crm_saved_filters';
```

#### Default Filters (Pre-configured)

```typescript
const DEFAULT_SAVED_FILTERS: SavedFilter[] = [
  {
    id: 'hot-leads',
    name: 'My Hot Leads',
    entityType: 'contacts',
    filters: { status: 'lead', hasActivities: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'high-value-deals',
    name: 'High-Value Deals',
    entityType: 'deals',
    filters: { minValue: 10000, stage: 'proposal' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
```

---

### 4. URL Parameter Support

#### Purpose

- Shareable filter links
- Bookmarkable filter states
- Maintain filter state across page navigation
- Browser back/forward button support

#### Implementation Strategy

##### 1. Sync Filters with URL

```typescript
// Example: Contacts page
// URL: /contacts?status=lead&company=abc123&search=john&sort=name&order=asc

const syncFiltersWithURL = (filters: ContactFilters) => {
  const params = new URLSearchParams();

  if (filters.status !== 'all') params.set('status', filters.status);
  if (filters.company) params.set('company', filters.company);
  if (filters.search) params.set('search', filters.search);
  if (filters.sortField) params.set('sort', filters.sortField);
  if (filters.sortDirection) params.set('order', filters.sortDirection);

  router.push(`/contacts?${params.toString()}`, { scroll: false });
};
```

##### 2. Parse URL Parameters

```typescript
const parseURLParams = (searchParams: URLSearchParams): ContactFilters => {
  return {
    status: (searchParams.get('status') as ContactFilters['status']) || 'all',
    company: searchParams.get('company') || undefined,
    search: searchParams.get('search') || '',
    sortField: (searchParams.get('sort') as ContactFilters['sortField']) || 'date',
    sortDirection: (searchParams.get('order') as ContactFilters['sortDirection']) || 'desc',
  };
};
```

##### 3. Advanced Filters in URL

```typescript
// For complex filters, encode as JSON
// URL: /contacts?filters={"operator":"AND","conditions":[...]}

const encodeAdvancedFilters = (filters: AdvancedFilters): string => {
  return encodeURIComponent(JSON.stringify(filters));
};

const decodeAdvancedFilters = (encoded: string): AdvancedFilters => {
  return JSON.parse(decodeURIComponent(encoded));
};
```

##### 4. URL Parameter Schema by Entity

**Contacts**:

- `status`: 'all' | 'lead' | 'customer'
- `company`: company ID
- `search`: search query
- `sort`: 'name' | 'email' | 'phone' | 'status' | 'date'
- `order`: 'asc' | 'desc'
- `filters`: encoded advanced filters (optional)

**Companies**:

- `industry`: industry name
- `search`: search query
- `sort`: 'name' | 'industry' | 'employeeCount' | 'revenue'
- `order`: 'asc' | 'desc'
- `filters`: encoded advanced filters (optional)

**Deals**:

- `stage`: stage name
- `status`: 'all' | 'open' | 'won' | 'lost'
- `search`: search query
- `minValue`: minimum deal value
- `maxValue`: maximum deal value
- `sort`: 'name' | 'value' | 'stage' | 'expectedCloseDate'
- `order`: 'asc' | 'desc'
- `filters`: encoded advanced filters (optional)

**Tasks**:

- `status`: 'all' | 'open' | 'completed' | 'overdue'
- `priority`: 'all' | 'low' | 'medium' | 'high'
- `search`: search query
- `dueDateFrom`: start date
- `dueDateTo`: end date
- `sort`: 'title' | 'dueDate' | 'priority' | 'createdAt'
- `order`: 'asc' | 'desc'
- `filters`: encoded advanced filters (optional)

**Activities**:

- `type`: activity type
- `search`: search query
- `fromDate`: start date
- `toDate`: end date
- `sort`: 'subject' | 'type' | 'createdAt'
- `order`: 'asc' | 'desc'
- `filters`: encoded advanced filters (optional)

---

### 5. Enhanced Existing Filters

#### Contacts Page

**Add**:

- Company filter dropdown (link to companies table)
- Date range filter (created after/before)
- Has activities checkbox
- Has deals checkbox
- Has tasks checkbox

#### Companies Page

**Add**:

- Employee count range filter
- Revenue range filter
- Has contacts checkbox
- Has deals checkbox
- Date range filter (created after/before)

#### Deals Page

**Already has**: Stage, status, value range, search
**Add**:

- Company filter dropdown
- Contact filter dropdown
- Date range filter (expected close date)
- Probability range filter

#### Tasks Page

**Already has**: Status, priority, search
**Add**:

- Contact filter dropdown
- Date range filter (due date)
- Company filter (via contact's company)

#### Activities Page

**Already has**: Type, search, date range
**Add**:

- Contact filter dropdown
- Company filter (via contact's company)

---

### 6. Database Indexes for Performance

#### Existing Indexes ✅

```sql
-- Contacts
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_contacts_phone_number ON contacts(phone_number);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);

-- Activities
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_type ON activities(type);

-- Tasks
CREATE INDEX idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Deals
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX idx_deals_actual_close_date ON deals(actual_close_date);

-- Companies
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);
```

#### New Indexes to Add 🔧

```sql
-- Full-text search optimization (PostgreSQL)
-- Note: Requires PostgreSQL 11+ for GIN indexes on text columns

-- Contacts
CREATE INDEX idx_contacts_full_name ON contacts (
  (first_name || ' ' || last_name) text_pattern_ops
);
CREATE INDEX idx_contacts_email_pattern ON contacts(email text_pattern_ops);

-- Companies
CREATE INDEX idx_companies_name_pattern ON companies(name text_pattern_ops);
CREATE INDEX idx_companies_website_pattern ON companies(website text_pattern_ops);

-- Deals
CREATE INDEX idx_deals_name_pattern ON deals(name text_pattern_ops);
CREATE INDEX idx_deals_description_pattern ON deals(description text_pattern_ops);

-- Tasks
CREATE INDEX idx_tasks_title_pattern ON tasks(title text_pattern_ops);
CREATE INDEX idx_tasks_description_pattern ON tasks(description text_pattern_ops);

-- Composite indexes for common filter combinations
CREATE INDEX idx_contacts_status_company ON contacts(status, company_id);
CREATE INDEX idx_deals_stage_status ON deals(stage, status);
CREATE INDEX idx_tasks_completed_priority ON tasks(completed, priority);
CREATE INDEX idx_activities_type_created ON activities(type, created_at);
```

---

### 7. Implementation Order

#### Phase 1: Global Search (High Impact)

1. Create `/api/search` endpoint
2. Build GlobalSearchBar component
3. Build SearchResultsDropdown component
4. Implement keyboard shortcut (Ctrl+K / Cmd+K)
5. Add search history functionality
6. Integrate into navigation header

#### Phase 2: URL Parameter Support (Foundation)

1. Create URL parameter sync utilities
2. Update all list pages to parse URL params on load
3. Update all list pages to update URL on filter change
4. Test browser back/forward navigation
5. Test shareable links

#### Phase 3: Enhanced Filters (User Experience)

1. Add missing filters to each page (company, date ranges, etc.)
2. Implement filter state management with URL sync
3. Add "Clear All Filters" button to all pages
4. Add active filter badges to all pages
5. Test all filter combinations

#### Phase 4: Advanced Filter Builder (Power Users)

1. Create AdvancedFilterBuilder component
2. Create filter condition components
3. Implement AND/OR logic
4. Add dynamic field/operator/value selection
5. Integrate into all list pages
6. Test complex filter combinations

#### Phase 5: Saved Filters/Views (Productivity)

1. Create SavedFiltersDropdown component
2. Implement save/load/delete functionality
3. Add localStorage management
4. Add default saved filters
5. Integrate into all list pages
6. Test saved filter persistence

#### Phase 6: Performance & Polish (Optimization)

1. Add database indexes
2. Implement search debouncing
3. Add loading states
4. Add empty states
5. Add error handling
6. Performance testing with large datasets

---

### 8. Component Diagram

```mermaid
graph TB
    subgraph "Navigation Layer"
        Navigation[Navigation Component]
        GlobalSearchBar[Global Search Bar]
    end

    subgraph "Search Components"
        SearchResults[Search Results Dropdown]
        SearchItem[Search Result Item]
        SearchHistory[Search History]
    end

    subgraph "Filter Components"
        BasicFilters[Basic Filters]
        AdvancedFilters[Advanced Filter Builder]
        FilterCondition[Filter Condition]
        SavedFilters[Saved Filters Dropdown]
    end

    subgraph "API Layer"
        SearchAPI[/api/search]
        ContactsAPI[/api/contacts]
        CompaniesAPI[/api/companies]
        DealsAPI[/api/deals]
        TasksAPI[/api/tasks]
        ActivitiesAPI[/api/activities]
    end

    subgraph "Data Layer"
        Database[(PostgreSQL)]
    end

    Navigation --> GlobalSearchBar
    GlobalSearchBar --> SearchResults
    SearchResults --> SearchItem
    GlobalSearchBar --> SearchHistory
    SearchHistory --> localStorage[(localStorage)]

    BasicFilters --> AdvancedFilters
    AdvancedFilters --> FilterCondition
    BasicFilters --> SavedFilters
    SavedFilters --> localStorage

    GlobalSearchBar --> SearchAPI
    BasicFilters --> ContactsAPI
    BasicFilters --> CompaniesAPI
    BasicFilters --> DealsAPI
    BasicFilters --> TasksAPI
    BasicFilters --> ActivitiesAPI

    SearchAPI --> Database
    ContactsAPI --> Database
    CompaniesAPI --> Database
    DealsAPI --> Database
    TasksAPI --> Database
    ActivitiesAPI --> Database
```

---

### 9. User Flow Examples

#### Example 1: Global Search

1. User presses Ctrl+K (or Cmd+K)
2. Global search bar opens
3. User types "John"
4. After 300ms debounce, search API is called
5. Results appear grouped by type:
   - Contacts: John Doe, John Smith
   - Companies: Johnson & Co.
   - Tasks: "Call John Doe"
6. User navigates with arrow keys and presses Enter on "John Doe"
7. User is navigated to John Doe's contact profile

#### Example 2: Advanced Filter + Save

1. User navigates to Contacts page
2. User opens Advanced Filter Builder
3. User adds conditions:
   - Status equals "lead"
   - Company equals "Acme Corp"
   - Created after "2024-01-01"
4. User clicks "Apply Filters"
5. Results show matching contacts
6. User clicks "Save Filter"
7. User names filter "Acme Leads 2024"
8. Filter is saved to localStorage
9. User can now apply "Acme Leads 2024" with one click

#### Example 3: Shareable Link

1. User applies filters on Deals page:
   - Stage: "proposal"
   - Min Value: $10,000
   - Status: "open"
2. URL updates to: `/deals?stage=proposal&minValue=10000&status=open`
3. User copies URL and shares with team member
4. Team member opens URL and sees same filtered results
5. Team member can modify filters or save as new view

---

### 10. Technical Considerations

#### Performance

- Debounce search input (300ms)
- Use database indexes for all filtered fields
- Limit search results per type (default: 5 for global search)
- Implement pagination for large result sets
- Consider caching frequently used filters

#### Accessibility

- Keyboard navigation for all filter controls
- ARIA labels for screen readers
- Focus management when opening/closing dropdowns
- High contrast for filter badges
- Clear error messages for invalid filter values

#### Error Handling

- Validate filter values before applying
- Show user-friendly error messages
- Graceful degradation for browser without localStorage
- Handle network errors for search API
- Show loading states during search

#### Browser Compatibility

- Use URLSearchParams for URL parameter handling
- Use localStorage for saved filters (with fallback)
- Test keyboard shortcuts on different platforms (Windows, Mac, Linux)
- Ensure responsive design for mobile devices

#### Future Enhancements

- Full-text search with PostgreSQL tsvector
- Search analytics (most searched terms)
- Collaborative saved filters (team-wide)
- Filter templates
- Export filtered results
- Filter presets based on user role
- AI-powered search suggestions
- Natural language search ("show me high-value deals from this month")

---

### 11. Testing Strategy

#### Unit Tests

- Filter condition logic
- URL parameter encoding/decoding
- Saved filters CRUD operations
- Search query building

#### Integration Tests

- Global search API endpoint
- Filter application on each page
- URL parameter sync
- Saved filter persistence

#### E2E Tests

- Global search keyboard shortcut
- Advanced filter builder workflow
- Save and load saved filters
- Shareable filter links
- Browser back/forward navigation

#### Performance Tests

- Search response time with 10,000+ records
- Filter application speed
- URL parameter update performance
- Database query optimization

---

### 12. Success Metrics

- Search response time < 500ms
- Filter application < 100ms
- URL parameter sync < 50ms
- 90%+ of users adopt global search within first week
- 50%+ of users save at least one filter
- Average search query length: 3-5 characters
- Most used filter combinations identified
- Zero critical bugs in production

---

## Summary

This architecture provides a comprehensive Search & Filtering system that enhances the CRM's usability and power. The implementation is phased to deliver high-impact features first (global search, URL parameters) while building a foundation for advanced features (filter builder, saved views).

The design prioritizes:

1. **User Experience**: Fast, intuitive, keyboard-accessible
2. **Performance**: Optimized queries, indexes, debouncing
3. **Extensibility**: Easy to add new filters, entities, or search fields
4. **Maintainability**: Clear component structure, reusable patterns
5. **Accessibility**: WCAG AA compliance, keyboard navigation

The system will significantly improve the CRM's ability to help users quickly find and filter their data, leading to increased productivity and user satisfaction.
