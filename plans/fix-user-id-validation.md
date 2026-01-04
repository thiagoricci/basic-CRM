# Fix User ID Validation - CUID Format Mismatch

## Problem

**Issue:** "Invalid user ID" error when creating contacts, activities, tasks, or deals with user assignment

**Root Cause:**

- Prisma schema generates User IDs using `@default(cuid())` (CUID format: `"cl1234567890abcdef"`)
- Validation schema uses `z.string().uuid()` which expects UUID format (`"550e8400-e29b-41d4-a716-446655440000"`)
- When UserSelector sends a CUID-formatted user ID, validation fails

## Solution

Change all userId validations from `z.string().uuid()` to `z.string().cuid()` to match Prisma's CUID format.

## Files to Modify

### 1. `lib/validations.ts` - Update 4 schemas

#### contactSchema (Line 54-57)

```typescript
// BEFORE:
userId: z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().uuid('Invalid user ID').optional().nullable()
),

// AFTER:
userId: z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().cuid('Invalid user ID').optional().nullable()
),
```

#### activitySchema (Line 75-78)

```typescript
// BEFORE:
userId: z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().uuid('Invalid user ID').optional().nullable()
),

// AFTER:
userId: z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().cuid('Invalid user ID').optional().nullable()
),
```

#### taskSchema (Line 100-103)

```typescript
// BEFORE:
userId: z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().uuid('Invalid user ID').optional().nullable()
),

// AFTER:
userId: z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().cuid('Invalid user ID').optional().nullable()
),
```

#### dealSchema (Line 181-184)

```typescript
// BEFORE:
userId: z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().uuid('Invalid user ID').optional().nullable()
),

// AFTER:
userId: z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().cuid('Invalid user ID').optional().nullable()
),
```

## Testing Steps

1. Create a contact with user assignment
2. Create an activity with user assignment
3. Create a task with user assignment
4. Create a deal with user assignment
5. Verify all forms accept CUID-formatted user IDs
6. Verify validation still rejects invalid formats

## Technical Context

- **CUID Format:** Collision-resistant IDs optimized for horizontal scaling (e.g., `"clh1q9q2k0000356h9g7k8r8j"`)
- **UUID Format:** Standard universally unique identifier (e.g., `"550e8400-e29b-41d4-a716-446655440000"`)
- **Prisma Default:** CUID is the default ID format for Prisma models
- **Zod Validation:** Zod provides both `.uuid()` and `.cuid()` validators

## Impact

This fix will resolve the validation error for all forms that include user assignment:

- Contact creation/editing
- Activity creation/editing
- Task creation/editing
- Deal creation/editing

## Notes

- Company IDs use UUID format (`@default(uuid())`), so companyId validation should remain `.uuid()`
- Contact IDs use UUID format, so contactId validation should remain `.uuid()`
- Only User IDs use CUID format and need this change
