# Phone Number Uniqueness Implementation Plan

## Overview

Implement unique constraint on phone numbers to ensure only one contact can have a specific phone number, similar to the existing email uniqueness constraint.

## Current State Analysis

### Database Schema (prisma/schema.prisma)

- `email` field has `@unique` constraint
- `phoneNumber` field is optional (`String?`) with no uniqueness constraint
- Indexes exist on email, status, and createdAt

### Validation (lib/validations.ts)

- Email has format validation
- Phone number is optional with no format validation
- No uniqueness checks for phone numbers

### API Routes

- POST `/api/contacts` validates email uniqueness
- PUT `/api/contacts/[id]` validates email uniqueness (excluding current contact)
- No phone number uniqueness validation

## Implementation Steps

### Step 1: Update Prisma Schema

**File:** `prisma/schema.prisma`

**Changes:**

```prisma
model Contact {
  id          String   @id @default(uuid())
  firstName   String
  lastName    String
  email       String   @unique
  phoneNumber String?   @unique  // Add @unique constraint
  status      String   @default("lead")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@index([phoneNumber])  // Add index for performance
}
```

**Rationale:**

- Adding `@unique` ensures database-level constraint
- Index on phoneNumber improves query performance for uniqueness checks
- Optional field (`String?`) allows contacts without phone numbers

### Step 2: Create Database Migration

**Command:**

```bash
npx prisma migrate dev --name add_phone_number_unique_constraint
```

**Expected Migration:**

```sql
-- AddIndex
CREATE UNIQUE INDEX "Contact_phoneNumber_key" ON "Contact"("phoneNumber");
```

**Important Notes:**

- Migration will fail if existing contacts have duplicate phone numbers
- Need to handle existing duplicates before running migration
- Consider data cleanup strategy if duplicates exist

### Step 3: Update Validation Schema

**File:** `lib/validations.ts`

**Changes:**

```typescript
export const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['lead', 'customer'], {
    required_error: 'Status is required',
  }),
});
```

**Rationale:**

- Add format validation for phone numbers
- Min/max length ensures reasonable phone number formats
- Optional allows empty phone numbers
- Accept empty string to handle form submissions

### Step 4: Update POST API Route

**File:** `app/api/contacts/route.ts`

**Changes:**

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = contactSchema.parse(body);

    // Check for duplicate email
    const existingEmail = await prisma.contact.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json({ data: null, error: 'Email already exists' }, { status: 400 });
    }

    // Check for duplicate phone number (if provided)
    if (validatedData.phoneNumber) {
      const existingPhone = await prisma.contact.findUnique({
        where: { phoneNumber: validatedData.phoneNumber },
      });

      if (existingPhone) {
        return NextResponse.json(
          { data: null, error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber || null,
        status: validatedData.status,
      },
    });

    // Revalidate cache
    revalidateTag('dashboard');
    revalidatePath('/contacts');

    return NextResponse.json({ data: contact, error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating contact:', error);
      return NextResponse.json({ data: null, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data: null, error: 'Failed to create contact' }, { status: 500 });
  }
}
```

**Rationale:**

- Check phone number uniqueness only when phone number is provided
- Return clear error message for duplicate phone numbers
- Maintain existing email uniqueness check
- Follow existing error handling pattern

### Step 5: Update PUT API Route

**File:** `app/api/contacts/[id]/route.ts`

**Changes:**

```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = contactSchema.parse(body);

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: params.id },
    });

    if (!existingContact) {
      return NextResponse.json({ data: null, error: 'Contact not found' }, { status: 404 });
    }

    // Check for duplicate email (excluding current contact)
    if (validatedData.email !== existingContact.email) {
      const duplicateEmail = await prisma.contact.findUnique({
        where: { email: validatedData.email },
      });

      if (duplicateEmail) {
        return NextResponse.json({ data: null, error: 'Email already exists' }, { status: 400 });
      }
    }

    // Check for duplicate phone number (excluding current contact)
    if (validatedData.phoneNumber && validatedData.phoneNumber !== existingContact.phoneNumber) {
      const duplicatePhone = await prisma.contact.findUnique({
        where: { phoneNumber: validatedData.phoneNumber },
      });

      if (duplicatePhone) {
        return NextResponse.json(
          { data: null, error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    // Update contact
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber || null,
        status: validatedData.status,
      },
    });

    // Revalidate cache
    revalidateTag('dashboard');
    revalidatePath('/contacts');
    revalidatePath(`/contacts/${params.id}`);

    return NextResponse.json({ data: contact, error: null });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating contact:', error);
      return NextResponse.json({ data: null, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data: null, error: 'Failed to update contact' }, { status: 500 });
  }
}
```

**Rationale:**

- Check phone number uniqueness only when phone number is provided and changed
- Exclude current contact from uniqueness check
- Allow updating contact without changing phone number
- Maintain existing email uniqueness logic

### Step 6: Handle Existing Duplicates (If Any)

**Scenario:** If database already has contacts with duplicate phone numbers

**Solution Options:**

**Option A: Data Cleanup Script**

```typescript
// scripts/cleanup-duplicate-phones.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicatePhones() {
  const contacts = await prisma.contact.findMany({
    where: { phoneNumber: { not: null } },
    orderBy: { createdAt: 'asc' },
  });

  const phoneMap = new Map<string, string[]>();

  // Group contacts by phone number
  for (const contact of contacts) {
    if (contact.phoneNumber) {
      const existing = phoneMap.get(contact.phoneNumber) || [];
      existing.push(contact.id);
      phoneMap.set(contact.phoneNumber, existing);
    }
  }

  // Find duplicates
  for (const [phone, ids] of phoneMap.entries()) {
    if (ids.length > 1) {
      console.log(`Duplicate phone ${phone}: ${ids.length} contacts`);
      // Keep the first one, clear phone from others
      for (let i = 1; i < ids.length; i++) {
        await prisma.contact.update({
          where: { id: ids[i] },
          data: { phoneNumber: null },
        });
      }
    }
  }
}

cleanupDuplicatePhones();
```

**Option B: Manual Review**

- Export contacts with duplicate phone numbers
- Review and manually resolve conflicts
- Run migration after cleanup

### Step 7: Testing Strategy

**Test Case 1: Create Contact with Unique Phone**

- Create contact with phone number "555-1234"
- Expected: Success

**Test Case 2: Create Contact with Duplicate Phone**

- Create contact with phone number "555-1234" (already exists)
- Expected: Error "Phone number already exists"

**Test Case 3: Create Contact without Phone**

- Create contact without phone number
- Expected: Success

**Test Case 4: Update Contact with New Unique Phone**

- Update contact to have phone number "555-5678"
- Expected: Success

**Test Case 5: Update Contact with Duplicate Phone**

- Update contact to have phone number "555-1234" (used by another contact)
- Expected: Error "Phone number already exists"

**Test Case 6: Update Contact without Changing Phone**

- Update contact without changing phone number
- Expected: Success

**Test Case 7: Update Contact to Remove Phone**

- Update contact to remove phone number
- Expected: Success

**Test Case 8: Phone Number Format Validation**

- Create contact with phone number "123" (too short)
- Expected: Error "Phone number must be at least 10 characters"

### Step 8: Documentation Updates

**Files to Update:**

1. **`.kilocode/rules/memory-bank/architecture.md`**
   - Update database schema section
   - Add phone number to unique constraints
   - Update index documentation

2. **`.kilocode/rules/memory-bank/tech.md`**
   - Update validation pattern example
   - Document phone number validation rules

3. **`.kilocode/rules/PRD.md`**
   - Add phone number uniqueness to data model
   - Update functional requirements

4. **`.kilocode/rules/memory-bank/context.md`**
   - Add to recent changes
   - Update next steps if needed

## Edge Cases & Considerations

### 1. Empty/Null Phone Numbers

- Multiple contacts can have `null` phone numbers (unique constraint doesn't apply to null)
- This is desired behavior - allows contacts without phone numbers

### 2. Phone Number Format Variations

- Different formats: "555-1234", "(555) 123-4567", "555.123.4567"
- Current validation only checks length
- Future enhancement: Normalize phone numbers before storage

### 3. International Phone Numbers

- Current length constraints (10-20 chars) may not accommodate all formats
- Consider country code validation in future phases

### 4. Case Sensitivity

- Phone numbers are case-insensitive (they're strings of digits/symbols)
- No special handling needed

### 5. Whitespace

- Leading/trailing whitespace could cause "555-1234" and " 555-1234 " to be different
- Future enhancement: Trim whitespace before validation

## Performance Impact

### Database Operations

- Additional uniqueness check on POST: +1 query
- Additional uniqueness check on PUT: +1 query (conditional)
- Index on phoneNumber improves query performance

### Migration Impact

- Adding unique constraint on existing data may be slow for large datasets
- Consider running migration during maintenance window if dataset is large

## Rollback Plan

If issues arise after deployment:

1. **Revert API Changes**
   - Remove phone number uniqueness validation from POST/PUT routes
   - Keep database constraint in place

2. **Database Rollback**

   ```bash
   npx prisma migrate resolve --rolled-back [migration-name]
   ```

3. **Full Rollback**
   - Revert all code changes
   - Drop unique constraint from database
   - Re-run previous migration

## Success Criteria

- [ ] Prisma schema updated with unique constraint
- [ ] Migration created and applied successfully
- [ ] POST route validates phone number uniqueness
- [ ] PUT route validates phone number uniqueness (excluding current contact)
- [ ] Validation schema includes phone number format validation
- [ ] All test cases pass
- [ ] Documentation updated
- [ ] No existing data conflicts (or resolved)

## Implementation Order

1. Update Prisma schema
2. Run migration (handle any duplicates)
3. Update validation schema
4. Update POST API route
5. Update PUT API route
6. Test all scenarios
7. Update documentation

## Notes for Implementation

- Follow existing code patterns and conventions
- Maintain consistent error messages
- Use Prisma's built-in uniqueness checking
- Ensure proper error handling and logging
- Test with both valid and invalid data
- Consider adding client-side validation for better UX
