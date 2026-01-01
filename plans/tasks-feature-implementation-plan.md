# Tasks Feature Implementation Plan

## Overview

Implement a comprehensive Tasks feature that allows users to create, manage, and track action items tied to specific contacts. Tasks differ from Activities in that they represent future actions rather than past interactions.

## Key Differences: Tasks vs Activities

| Aspect         | Activities              | Tasks                            |
| -------------- | ----------------------- | -------------------------------- |
| Purpose        | Track past interactions | Track future action items        |
| Tense          | Past ("I called John")  | Future ("I need to call John")   |
| Time Reference | Created timestamp       | Due date                         |
| Status         | Static (record)         | Dynamic (open/completed/overdue) |
| Priority       | N/A                     | Low/Medium/High                  |

## Database Schema Changes

### Add Task Model to Prisma Schema

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  dueDate     DateTime
  priority    String   @default("medium")
  completed   Boolean  @default(false)
  completedAt DateTime?
  contactId   String
  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([contactId])
  @@index([dueDate])
  @@index([completed])
  @@index([priority])
}
```

### Update Contact Model

```prisma
model Contact {
  id          String     @id @default(uuid())
  firstName   String
  lastName    String
  email       String     @unique
  phoneNumber String?    @unique
  status      String     @default("lead")
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  activities  Activity[]
  tasks       Task[]     // Add this relation

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@index([phoneNumber])
}
```

## Files to Create/Modify

### 1. Database Layer

- **`prisma/schema.prisma`** - Add Task model and update Contact model
- **`types/task.ts`** - Create TypeScript interfaces for Task

### 2. Validation Layer

- **`lib/validations.ts`** - Add task validation schema

### 3. API Layer

- **`app/api/tasks/route.ts`** - GET (list), POST (create)
- **`app/api/tasks/[id]/route.ts`** - GET (single), PUT (update), DELETE, PATCH (toggle complete)
- **`app/api/dashboard/route.ts`** - Update to fetch tasks due today

### 4. Page Routes

- **`app/tasks/page.tsx`** - Global tasks list page
- **`app/tasks/[id]/page.tsx`** - Task profile page
- **`app/tasks/new/page.tsx`** - Create new task page

### 5. Components

- **`components/tasks/task-list.tsx`** - Task list component
- **`components/tasks/task-form.tsx`** - Task form component
- **`components/tasks/task-profile.tsx`** - Task profile component
- **`components/tasks/task-filters.tsx`** - Task filters (status, priority, due date)
- **`components/tasks/task-pagination.tsx`** - Task pagination component
- **`components/tasks/task-checkbox.tsx`** - Checkbox to mark tasks complete
- **`components/dashboard/upcoming-tasks.tsx`** - Dashboard widget for tasks due today
- **`components/contacts/contact-tasks.tsx`** - Contact-specific tasks tab

### 6. Navigation

- **`components/layout/navigation.tsx`** - Add Tasks link to navigation

### 7. Contact Profile Integration

- **`app/contacts/[id]/page.tsx`** - Add Tasks tab to contact profile

## Implementation Steps

### Phase 1: Database & Types

1. **Update Prisma Schema**
   - Add Task model with fields: title, description, dueDate, priority, completed, completedAt
   - Add tasks relation to Contact model
   - Add indexes for performance (contactId, dueDate, completed, priority)
   - Run migration: `npx prisma migrate dev --name add_tasks`

2. **Create TypeScript Types**
   - Create `types/task.ts` with Task interface
   - Define TaskInput type for forms
   - Define TaskStatus and TaskPriority types

3. **Add Validation Schema**
   - Add taskSchema to `lib/validations.ts`
   - Validate: title (required, max 200), description (optional, max 1000), dueDate (required), priority (enum: low/medium/high), contactId (required UUID)

### Phase 2: API Routes

4. **Create Tasks List API (`/api/tasks`)**
   - GET: Fetch all tasks with filtering (status, priority, due date range)
   - POST: Create new task with validation
   - Include contact data in responses
   - Order by dueDate (ascending) for open tasks, completedAt (descending) for completed

5. **Create Single Task API (`/api/tasks/[id]`)**
   - GET: Fetch single task by ID
   - PUT: Update task (title, description, dueDate, priority)
   - DELETE: Delete task
   - PATCH: Toggle completed status (special endpoint for quick completion)

6. **Update Dashboard API (`/api/dashboard`)**
   - Add tasksDueToday: count of tasks due today
   - Add upcomingTasks: next 5 tasks due (sorted by dueDate)

### Phase 3: Core Components

7. **Create Task Form Component**
   - Fields: title, description, due date (date picker), priority (select), contact (selector)
   - Use React Hook Form + Zod validation
   - Reuse ContactSelector component
   - Add shadcn/ui Calendar component for date selection

8. **Create Task List Component**
   - Display tasks in card or table format
   - Show title, due date, priority badge, contact name, completion checkbox
   - Color-coded priorities (High: red, Medium: yellow, Low: blue)
   - Visual indication for overdue tasks (red highlight)
   - Support filtering and pagination

9. **Create Task Filters Component**
   - Status filter: All / Open / Completed / Overdue
   - Priority filter: All / High / Medium / Low
   - Due date range filter
   - Search by title

10. **Create Task Profile Component**
    - View mode: Display all task details
    - Edit mode: Form to update task
    - Delete button with confirmation
    - Mark complete/incomplete toggle
    - Show linked contact with link to profile

11. **Create Task Checkbox Component**
    - Checkbox to toggle task completion
    - Auto-update completedAt timestamp
    - Show completion date when checked
    - Smooth animation on toggle

12. **Create Task Pagination Component**
    - Similar to ActivityPagination
    - Configurable items per page (default 10)
    - Page navigation controls

### Phase 4: Pages

13. **Create Global Tasks Page (`/tasks`)**
    - Show all tasks across all contacts
    - Default filter: Open tasks
    - Quick filters: Due Today, Overdue, This Week
    - Add Task button
    - Use TaskList, TaskFilters, TaskPagination components

14. **Create Task Profile Page (`/tasks/[id]`)**
    - Display task details using TaskProfile
    - Edit/delete functionality
    - Link back to tasks list and contact profile

15. **Create New Task Page (`/tasks/new`)**
    - Task form with pre-filled contact if coming from contact profile
    - Redirect to task profile after creation

### Phase 5: Dashboard Integration

16. **Create Upcoming Tasks Dashboard Widget**
    - Show "X tasks due today" card
    - List next 5 upcoming tasks
    - Quick complete checkbox
    - Link to full tasks page
    - Differentiate overdue tasks (red badge)

17. **Update Dashboard Page**
    - Add UpcomingTasks component
    - Update DashboardData interface to include task stats
    - Update dashboard API to fetch task data

### Phase 6: Contact Profile Integration

18. **Create Contact Tasks Tab Component**
    - Show tasks specific to current contact
    - Same filtering and functionality as global tasks
    - Add task button pre-fills contact

19. **Update Contact Profile Page**
    - Add Tasks tab alongside existing content
    - Use Tabs component from shadcn/ui
    - Default tab: Details, second tab: Activities, third tab: Tasks

### Phase 7: Navigation

20. **Update Navigation Component**
    - Add Tasks link between Contacts and Activities
    - Add Tasks icon (CheckSquare or similar from lucide-react)

### Phase 8: Testing & Polish

21. **Test All CRUD Operations**
    - Create task with valid data
    - Create task with invalid data (validation errors)
    - Update task fields
    - Mark task complete/incomplete
    - Delete task
    - Cascade delete (contact deletion deletes tasks)

22. **Test Filtering & Search**
    - Filter by status (Open/Completed/Overdue)
    - Filter by priority (High/Medium/Low)
    - Filter by due date range
    - Search by title

23. **Test Dashboard Integration**
    - Verify tasks due today count is accurate
    - Verify upcoming tasks list is correct
    - Test quick complete from dashboard

24. **Test Contact Integration**
    - Verify tasks appear in contact profile
    - Test creating task from contact profile
    - Verify cascade deletion works

25. **UI/UX Polish**
    - Add animations with Motion
    - Ensure responsive design
    - Add loading states
    - Add error handling and user feedback
    - Verify accessibility (keyboard navigation, screen readers)

## Database Migration

```bash
# After updating schema.prisma
npx prisma migrate dev --name add_tasks
npx prisma generate
```

## API Endpoints

### GET /api/tasks

- Query params: `status` (all/open/completed/overdue), `priority` (all/high/medium/low), `startDate`, `endDate`, `search`
- Returns: Array of tasks with contact data

### POST /api/tasks

- Body: `{ title, description, dueDate, priority, contactId }`
- Returns: Created task

### GET /api/tasks/[id]

- Returns: Single task with contact data

### PUT /api/tasks/[id]

- Body: `{ title, description, dueDate, priority }`
- Returns: Updated task

### DELETE /api/tasks/[id]

- Returns: Success message

### PATCH /api/tasks/[id]/toggle-complete

- Body: `{ completed: boolean }`
- Returns: Updated task with completedAt timestamp

## Component Architecture

```
Dashboard
├── UpcomingTasks (new)
│   ├── TaskCheckbox
│   └── TaskCard (minimal)

Tasks Page (/tasks)
├── TaskFilters
├── TaskList
│   ├── TaskCard
│   │   ├── TaskCheckbox
│   │   └── PriorityBadge
│   └── TaskPagination
└── Add Task Button

Task Profile (/tasks/[id])
├── TaskProfile
│   ├── TaskDetails
│   ├── TaskForm (edit mode)
│   └── Delete Button

Contact Profile (/contacts/[id])
├── Tabs
│   ├── Details Tab
│   ├── Activities Tab
│   └── Tasks Tab (new)
│       ├── ContactTasks
│       │   ├── TaskFilters
│       │   ├── TaskList
│       │   └── Add Task Button
```

## Design Considerations

### Visual Hierarchy

- **Priority Colors**: High (red), Medium (yellow/amber), Low (blue)
- **Overdue Tasks**: Red background or border, bold text
- **Completed Tasks**: Grayed out, strikethrough title
- **Due Today**: Orange accent, highlighted

### User Experience

- **Quick Complete**: Checkbox on task cards for one-click completion
- **Smart Defaults**: Priority defaults to "medium", Due date defaults to tomorrow
- **Contextual Creation**: Creating task from contact pre-fills contact field
- **Overdue Detection**: Automatically flag tasks where dueDate < now AND completed = false

### Performance

- Indexes on frequently queried columns (dueDate, completed, priority)
- Pagination for large task lists
- Server-side filtering (not client-side)
- Efficient queries with Prisma select/include

## Success Criteria

- [ ] Users can create tasks with title, description, due date, priority, and contact
- [ ] Users can mark tasks as complete/incomplete with checkbox
- [ ] Users can filter tasks by status (Open/Completed/Overdue)
- [ ] Users can filter tasks by priority (High/Medium/Low)
- [ ] Dashboard shows count of tasks due today
- [ ] Dashboard shows next 5 upcoming tasks
- [ ] Contact profile shows tasks tab with contact-specific tasks
- [ ] Tasks can be created from contact profile (contact pre-filled)
- [ ] Overdue tasks are visually distinguished
- [ ] Deleting a contact cascades to delete all associated tasks
- [ ] All CRUD operations work correctly
- [ ] UI follows "intentional minimalism" design philosophy
- [ ] Responsive design works on mobile, tablet, and desktop

## Future Enhancements (Post-MVP)

- Task reminders/notifications
- Recurring tasks
- Task dependencies
- Task comments/notes
- Task assignment to team members
- Task templates
- Calendar view of tasks
- Drag-and-drop task reordering
- Task categories/tags
- Task time tracking
- Task export to calendar (iCal, Google Calendar)

## Notes

- Tasks are distinct from Activities: Activities = past interactions, Tasks = future actions
- Optional: When completing a task, offer to create an Activity record (e.g., "Called John about proposal")
- Task completion should update `completedAt` timestamp automatically
- Overdue status is calculated: `dueDate < now AND completed = false`
- Priority is subjective but helpful for task management
- Due date is required to ensure tasks have a timeline
