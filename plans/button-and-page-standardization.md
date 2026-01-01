# Button and Page Style Standardization Plan

## Executive Summary

This document outlines the standardization of buttons and page styles across the CRM application to ensure consistency, improve user experience, and maintain the "intentional minimalism" design philosophy.

## Current Inconsistencies Identified

### 1. Add/Create Buttons on List Pages

| Page       | Current Implementation                  | Issues                               |
| ---------- | --------------------------------------- | ------------------------------------ |
| Contacts   | `<Button>Add Contact</Button>`          | No icon, different text style        |
| Tasks      | `<Button><Plus />New Task</Button>`     | Has Plus icon, different phrasing    |
| Activities | `<Button><Plus />Add Activity</Button>` | Has Plus icon, consistent with Tasks |

**Standard**: All Add/Create buttons should include a Plus icon and use "Add [Resource]" phrasing.

### 2. Edit Buttons on Profile Pages

| Page     | Current Implementation                                      | Issues                 |
| -------- | ----------------------------------------------------------- | ---------------------- |
| Contact  | `<Button variant="outline">Edit</Button>`                   | No icon, no size prop  |
| Task     | `<Button variant="outline" size="sm"><Edit />Edit</Button>` | Has icon, size="sm"    |
| Activity | `<Button variant="outline"><Edit />Edit</Button>`           | Has icon, no size prop |

**Standard**: All Edit buttons should include Edit icon, use `variant="outline"`, and no explicit size prop (default size).

### 3. Delete Buttons on Profile Pages

| Page     | Current Implementation                                          | Issues                                          |
| -------- | --------------------------------------------------------------- | ----------------------------------------------- |
| Contact  | `<Button variant="destructive">Delete</Button>`                 | No icon                                         |
| Task     | `<Button variant="outline" size="sm"><Trash2 />Delete</Button>` | Wrong variant (should be destructive), has icon |
| Activity | `<Button variant="destructive"><Trash2 />Delete</Button>`       | Has icon, correct variant                       |

**Standard**: All Delete buttons should include Trash2 icon and use `variant="destructive"`.

### 4. Form Submit/Cancel Button Layouts

| Form          | Current Implementation                      | Issues             |
| ------------- | ------------------------------------------- | ------------------ |
| Contact Form  | `justify-end`, Cancel first, Submit second  | Consistent pattern |
| Task Form     | No justify-end, Submit first, Cancel second | Inconsistent order |
| Activity Form | `justify-end`, Cancel first, Submit second  | Consistent pattern |

**Standard**: All forms should use `justify-end` with Cancel button first, Submit button second.

### 5. Delete Confirmation Dialogs

| Page     | Current Implementation          | Issues                |
| -------- | ------------------------------- | --------------------- |
| Contact  | Custom modal with motion        | Custom implementation |
| Task     | Dialog component from shadcn/ui | Different component   |
| Activity | Custom modal with motion        | Custom implementation |

**Standard**: All delete confirmation dialogs should use the shadcn/ui Dialog component for consistency.

### 6. Page Header Layouts

| Page             | Current Implementation                         | Issues                 |
| ---------------- | ---------------------------------------------- | ---------------------- |
| Contact Profile  | Title, email, Edit/Delete buttons              | No back button         |
| Task Profile     | Back link, Edit/Delete buttons with size="sm"  | Different button sizes |
| Activity Profile | Back button (icon), title, Edit/Delete buttons | Has back button        |

**Standard**: Profile pages should include a back button (icon button) and action buttons without explicit size props.

### 7. Loading States

| Page       | Current Implementation   | Issues                |
| ---------- | ------------------------ | --------------------- |
| Contacts   | Skeleton with 4 cards    | Good pattern          |
| Tasks      | Skeleton with 5 cards    | Good pattern          |
| Activities | Not implemented (inline) | Missing loading state |

**Standard**: All pages should use consistent skeleton loading patterns.

### 8. Error States

| Page       | Current Implementation    | Issues              |
| ---------- | ------------------------- | ------------------- |
| Contacts   | Text + "Try again" link   | Good pattern        |
| Tasks      | Text + "Try again" button | Good pattern        |
| Activities | Not implemented           | Missing error state |

**Standard**: All pages should display error message with a "Try again" button.

## Standardization Standards

### Button Standards

#### Add/Create Buttons (List Pages)

```tsx
<Button onClick={handleAdd}>
  <Plus className="h-4 w-4 mr-2" />
  Add [Resource]
</Button>
```

#### Edit Buttons (Profile Pages)

```tsx
<Button variant="outline" onClick={handleEdit}>
  <Edit className="h-4 w-4 mr-2" />
  Edit
</Button>
```

#### Delete Buttons (Profile Pages)

```tsx
<Button variant="destructive" onClick={handleDelete}>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</Button>
```

#### Form Submit Buttons

```tsx
<div className="flex justify-end gap-2">
  <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
    Cancel
  </Button>
  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : submitLabel}
  </Button>
</div>
```

#### Delete Confirmation Dialog

```tsx
<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete [Resource]</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <p>Are you sure you want to delete this [resource]? This action cannot be undone.</p>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### Page Header Standards

#### Profile Pages

```tsx
<div className="flex items-start justify-between">
  <div className="flex items-center gap-4">
    <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
      <ArrowLeft className="h-5 w-5" />
    </Button>
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  </div>
  <div className="flex gap-2">
    <Button variant="outline" onClick={handleEdit}>
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </Button>
    <Button variant="destructive" onClick={handleDelete}>
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </Button>
  </div>
</div>
```

#### List Pages

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">[Resource Name]</h1>
    <p className="text-muted-foreground">[Description]</p>
  </div>
  <Button onClick={handleAdd}>
    <Plus className="h-4 w-4 mr-2" />
    Add [Resource]
  </Button>
</div>
```

### Loading State Standards

```tsx
{
  isLoading && (
    <div className="container space-y-8 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
```

### Error State Standards

```tsx
{
  error && (
    <div className="container space-y-8 py-8">
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load [resource]</p>
        <Button onClick={() => mutate()} className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  );
}
```

## Implementation Plan

### Phase 1: List Pages

1. Update Contacts page Add button to include Plus icon
2. Verify Tasks and Activities pages are consistent

### Phase 2: Profile Pages - Action Buttons

1. Update Contact profile Edit button to include Edit icon
2. Update Contact profile Delete button to include Trash2 icon
3. Update Task profile Delete button to use `variant="destructive"`
4. Remove `size="sm"` from Task profile buttons
5. Verify Activity profile buttons are consistent

### Phase 3: Profile Pages - Headers

1. Add back button to Contact profile
2. Standardize Task profile back button to use icon button
3. Verify Activity profile header is consistent

### Phase 4: Forms

1. Update Task form to use `justify-end` and correct button order
2. Verify Contact and Activity forms are consistent

### Phase 5: Delete Confirmation Dialogs

1. Replace custom modal in Contact profile with Dialog component
2. Verify Task profile dialog is consistent
3. Replace custom modal in Activity profile with Dialog component

### Phase 6: Loading and Error States

1. Ensure all pages have consistent loading states
2. Ensure all pages have consistent error states with "Try again" button

## Testing Checklist

After implementation, verify:

- [ ] All Add/Create buttons have Plus icon and use "Add [Resource]" phrasing
- [ ] All Edit buttons have Edit icon, use `variant="outline"`, and default size
- [ ] All Delete buttons have Trash2 icon and use `variant="destructive"`
- [ ] All forms have submit/cancel buttons in correct order with `justify-end`
- [ ] All delete confirmation dialogs use Dialog component
- [ ] All profile pages have back button (icon button)
- [ ] All pages have consistent loading states
- [ ] All pages have consistent error states with "Try again" button
- [ ] Button spacing and alignment is consistent across all pages
- [ ] All buttons follow the "intentional minimalism" design philosophy

## Design Philosophy Alignment

These standards align with the "intentional minimalism" design philosophy by:

1. **Consistency**: Reducing cognitive load by using predictable patterns
2. **Clarity**: Icons provide immediate visual context for button actions
3. **Purpose**: Every button serves a clear, defined purpose
4. **Sophistication**: Consistent spacing, sizing, and variants create elegance
5. **Accessibility**: Using shadcn/ui components ensures accessibility out of the box
