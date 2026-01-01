# Activities Feature Implementation Plan

## Overview

Implement a comprehensive activity tracking system for the CRM that allows users to log and manage interactions with contacts (calls, emails, meetings, notes). The feature includes database schema, API endpoints, and reusable frontend components.

## Architecture Diagram

```mermaid
graph TB
    subgraph Database
        A[Contact Table] -->|cascade delete| B[Activity Table]
    end

    subgraph API Layer
        C[GET /api/activities]
        D[POST /api/activities]
        E[DELETE /api/activities/[id]]
    end

    subgraph Frontend Components
        F[ActivityForm]
        G[ActivityList]
        H[Global Activities Page]
        I[Contact Profile Tab]
    end

    subgraph Pages
        J[/activities]
        K[/contacts/[id]]
    end

    B <--> C
    B <--> D
    B <--> E
    F --> D
    G --> C
    G --> E
    H --> F
    H --> G
    I --> F
    I --> G
    J --> H
    K --> I
```

## Database Schema

### Activity Model

```prisma
model Activity {
  id          String   @id @default(uuid())
  type        String   // 'call' | 'email' | 'meeting' | 'note'
  subject     String
  description String?
  contactId   String
  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([contactId])
  @@index([createdAt])
  @@index([type])
}
```

### Contact Model Update

Add relation to Contact model:

```prisma
model Contact {
  id          String   @id @default(uuid())
  firstName   String
  lastName    String
  email       String   @unique
  phoneNumber String?  @unique
  status      String   @default("lead")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  activities  Activity[]  // NEW: Relation to activities

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@index([phoneNumber])
}
```

## API Endpoints

### 1. GET /api/activities

**Purpose:** Fetch all activities or filter by contactId

**Query Parameters:**

- `contactId` (optional): Filter activities for a specific contact

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "call",
      "subject": "Initial consultation",
      "description": "Discussed project requirements",
      "contactId": "uuid",
      "contact": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2025-12-30T20:00:00.000Z",
      "updatedAt": "2025-12-30T20:00:00.000Z"
    }
  ],
  "error": null
}
```

**Implementation Notes:**

- If `contactId` is provided, fetch only activities for that contact
- Include contact data (firstName, lastName) for global view
- Order by `createdAt` descending (newest first)
- Use Prisma `include` to fetch related contact data

### 2. POST /api/activities

**Purpose:** Create a new activity

**Request Body:**

```json
{
  "type": "call",
  "subject": "Initial consultation",
  "description": "Discussed project requirements",
  "contactId": "uuid"
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "type": "call",
    "subject": "Initial consultation",
    "description": "Discussed project requirements",
    "contactId": "uuid",
    "createdAt": "2025-12-30T20:00:00.000Z",
    "updatedAt": "2025-12-30T20:00:00.000Z"
  },
  "error": null
}
```

**Implementation Notes:**

- Validate that contact exists before creating activity
- Validate required fields (type, subject, contactId)
- Description is optional
- Revalidate cache for activities and contact profile pages
- Return 201 status on success

### 3. DELETE /api/activities/[id]

**Purpose:** Delete a specific activity

**Response:**

```json
{
  "data": null,
  "error": null
}
```

**Implementation Notes:**

- Check if activity exists before deletion
- Revalidate cache for activities and contact profile pages
- Return 404 if activity not found
- Return 200 on successful deletion

## Frontend Components

### 1. ActivityForm Component

**Location:** `components/activities/activity-form.tsx`

**Props:**

```typescript
interface ActivityFormProps {
  contactId?: string; // Optional - if provided, pre-fill contactId
  onSubmit: (data: ActivityInput) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSuccess?: () => void;
}
```

**Features:**

- Dropdown for activity type (Call, Email, Meeting, Note)
- Text input for subject (required)
- Textarea for description (optional)
- Contact selector (if contactId not provided)
- Form validation using Zod
- Success/error handling
- "Intentional minimalism" design with Framer Motion animations

**Activity Types:**

- `call`: Phone call
- `email`: Email communication
- `meeting`: In-person or virtual meeting
- `note`: General notes or observations

### 2. ActivityList Component

**Location:** `components/activities/activity-list.tsx`

**Props:**

```typescript
interface ActivityListProps {
  contactId?: string; // Optional - filter by contact
  showContactName?: boolean; // Optional - show contact name in list
  onDelete?: (id: string) => Promise<void>;
}
```

**Features:**

- Timeline-style display of activities
- Activity type icon/badge (Call, Email, Meeting, Note)
- Subject and description display
- Timestamp display (relative time: "2 hours ago", "Yesterday", etc.)
- Contact name display (if showContactName is true)
- Delete button with confirmation dialog
- Empty state when no activities exist
- Loading state
- "Intentional minimalism" design with subtle animations

**Visual Design:**

- Vertical timeline with connecting lines
- Activity type icons on the left
- Activity details on the right
- Hover effects for better UX
- Responsive design for mobile and desktop

### 3. Global Activities Page

**Location:** `app/activities/page.tsx`

**Features:**

- Display all activities across all contacts
- Show contact names for each activity
- Filter by activity type (All, Call, Email, Meeting, Note)
- Search by subject or contact name
- ActivityForm to add new activities
- ActivityList to display activities
- Breadcrumb navigation

### 4. Contact Profile Integration

**Location:** `app/contacts/[id]/page.tsx`

**Changes:**

- Add new tab/section for "Activities"
- Display ActivityForm with pre-filled contactId
- Display ActivityList with contactId filter and showContactName={false}
- Activities are specific to this contact only

## TypeScript Types

**Location:** `types/activity.ts`

```typescript
export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string | null;
  contactId: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityInput {
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description?: string;
  contactId: string;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';
```

## Validation Schema

**Location:** `lib/validations.ts`

```typescript
export const activitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note'], {
    required_error: 'Activity type is required',
  }),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  contactId: z.string().uuid('Invalid contact ID'),
});

export type ActivityInput = z.infer<typeof activitySchema>;
```

## Navigation Updates

**Location:** `components/layout/navigation.tsx`

Add navigation link:

- "Activities" link in main navigation

## Implementation Order

### Phase 1: Database & Types

1. Update Prisma schema with Activity model and Contact relation
2. Run Prisma migration: `npx prisma migrate dev --name add_activities`
3. Generate Prisma client: `npx prisma generate`
4. Create TypeScript types in `types/activity.ts`
5. Add validation schema in `lib/validations.ts`

### Phase 2: API Endpoints

6. Create `app/api/activities/route.ts` (GET, POST)
7. Create `app/api/activities/[id]/route.ts` (DELETE)

### Phase 3: Frontend Components

8. Create `components/activities/activity-form.tsx`
9. Create `components/activities/activity-list.tsx`

### Phase 4: Pages & Integration

10. Create `app/activities/page.tsx` (global activities view)
11. Update `app/contacts/[id]/page.tsx` to include activities tab
12. Update `components/layout/navigation.tsx` to add Activities link

### Phase 5: Testing & Polish

13. Test all CRUD operations
14. Test cascade delete (contact deletion removes activities)
15. Test filtering and search functionality
16. Verify responsive design
17. Check accessibility (WCAG AA compliance)

## Design Considerations

### "Intentional Minimalism" Aesthetic

- Clean, uncluttered interface
- Purpose-driven elements
- Sophisticated typography
- Subtle animations (Framer Motion)
- Generous whitespace
- Distinctive activity type icons/badges
- Timeline visual metaphor for activities

### Color Scheme for Activity Types

- Call: Blue/Info color
- Email: Purple/Primary color
- Meeting: Orange/Warning color
- Note: Gray/Neutral color

### Performance Optimizations

- Server-side rendering for initial page loads
- Efficient database queries with proper indexes
- Pagination for large activity lists (>50 activities)
- Next.js caching for API routes
- Revalidation on data changes

### Accessibility

- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels for activity type icons
- High contrast ratios for text

## Edge Cases & Error Handling

1. **Contact not found**: When creating activity, validate contact exists
2. **Activity not found**: When deleting activity, return 404
3. **Cascade delete**: Verify that deleting a contact removes all associated activities
4. **Empty state**: Display helpful message when no activities exist
5. **Validation errors**: Clear, user-friendly error messages
6. **Network errors**: Graceful handling with retry option
7. **Concurrent updates**: Handle race conditions when multiple users edit

## Testing Strategy

### Unit Tests (Future)

- ActivityForm component tests
- ActivityList component tests
- Validation schema tests

### Integration Tests (Future)

- API endpoint tests
- Database operation tests
- Cascade delete tests

### E2E Tests (Future)

- Activity creation flow
- Activity deletion flow
- Filtering and search functionality
- Contact profile integration

## Future Enhancements

- Activity editing (update existing activities)
- Activity reminders/scheduling
- Activity templates
- Activity attachments (files, images)
- Activity comments/notes
- Activity sharing between team members
- Activity analytics (activity counts by type, trends)
- Activity export to CSV/PDF
- Activity search with advanced filters
- Activity tags/categories
- Activity priority levels
- Activity completion status

## Migration Notes

### Database Migration

```bash
# Generate migration
npx prisma migrate dev --name add_activities

# Apply to production
npx prisma migrate deploy
```

### Data Migration

No data migration needed - this is a new feature.

## Success Criteria

- [ ] Activities can be created for any contact
- [ ] Activities display in timeline format
- [ ] Activities can be deleted
- [ ] Contact deletion cascades to activities
- [ ] Global activities page shows all activities
- [ ] Contact profile shows only that contact's activities
- [ ] Filtering by activity type works
- [ ] Search functionality works
- [ ] Form validation works correctly
- [ ] Error handling is robust
- [ ] UI follows "intentional minimalism" design
- [ ] Performance meets targets (< 2s page load, < 500ms API response)
- [ ] Accessibility requirements met (WCAG AA)
- [ ] Responsive design works on mobile and desktop

## Documentation Updates

After implementation, update:

- Memory bank files (brief.md, context.md, architecture.md, tech.md)
- API documentation (`docs/API_DOCUMENTATION.md`)
- README.md with activities feature description
