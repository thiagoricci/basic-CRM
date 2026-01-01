# Dashboard 500 Error Fix Plan

## Problem Analysis

### Error Details

- **Error**: 500 Internal Server Error on `/api/dashboard` endpoint
- **Location**: `app/api/dashboard/route.ts`
- **Symptoms**: Dashboard fails to load, Fast Refresh keeps rebuilding

### Root Cause

The dashboard API route is attempting to query the `Deal` model (lines 76-120 in [`app/api/dashboard/route.ts`](app/api/dashboard/route.ts:76)), but the `deals` table does not exist in the database.

**Evidence:**

1. Prisma schema defines the `Deal` model ([`prisma/schema.prisma`](prisma/schema.prisma:66-86))
2. Dashboard API queries Deal data:
   - Pipeline value aggregation (line 76-79)
   - Deals by stage grouping (line 81-86)
   - Won deals value (line 88-91)
   - Lost deals value (line 93-96)
   - Won/lost deal counts (line 98-100)
   - Recent deals (line 102-120)
3. Only one migration exists: `20251231005657_add_tasks` (for Task model)
4. No migration exists for the Deal model

### Why This Happened

The Deal feature was implemented (based on files in `app/deals/` and `components/deals/`), but the database migration was never created or applied. The Prisma schema was updated, but the database schema is out of sync.

## Solution

### Step 1: Create Migration for Deal Model

```bash
npx prisma migrate dev --name add_deals
```

This will:

- Generate a migration file in `prisma/migrations/`
- Create SQL to add the `deals` table with all required columns
- Add indexes for performance (contactId, stage, status, expectedCloseDate, actualCloseDate)
- Add foreign key constraint to contacts table with CASCADE delete

### Step 2: Verify Migration SQL

The migration should create a table with this structure:

```sql
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'lead',
    "expectedCloseDate" TIMESTAMP(3) NOT NULL,
    "actualCloseDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "probability" INTEGER DEFAULT 0,
    "description" TEXT,
    "contactId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "deals_contactId_idx" ON "deals"("contactId");
CREATE INDEX "deals_stage_idx" ON "deals"("stage");
CREATE INDEX "deals_status_idx" ON "deals"("status");
CREATE INDEX "deals_expectedCloseDate_idx" ON "deals"("expectedCloseDate");
CREATE INDEX "deals_actualCloseDate_idx" ON "deals"("actualCloseDate");

ALTER TABLE "deals" ADD CONSTRAINT "deals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Step 3: Regenerate Prisma Client

```bash
npx prisma generate
```

This ensures the Prisma client is synchronized with the updated database schema.

### Step 4: Test the Fix

1. Restart the development server (if running)
2. Navigate to the dashboard at `http://localhost:3000`
3. Verify dashboard loads without 500 errors
4. Check browser console for any remaining errors
5. Test all dashboard components:
   - Analytics cards (total contacts, leads, customers, conversion rate)
   - Status chart
   - Growth chart
   - Recent contacts
   - Recent activities
   - Upcoming tasks
   - Pipeline metrics (NEW - requires Deal table)
   - Pipeline chart (NEW - requires Deal table)
   - Recent deals (NEW - requires Deal table)

## Expected Outcome

After completing these steps:

1. ✅ Dashboard API endpoint returns 200 status
2. ✅ Dashboard page loads successfully
3. ✅ All dashboard components render without errors
4. ✅ Deal-related metrics display correctly (initially 0 values)
5. ✅ No 500 Internal Server Errors in console

## Additional Considerations

### Data Integrity

- The Deal model has a required `contactId` field
- Deleting a contact will cascade delete all associated deals (via `onDelete: Cascade`)
- This is consistent with Activity and Task models

### Performance

- Multiple indexes are defined on the Deal table for optimal query performance
- Dashboard queries use aggregation and grouping, which benefit from indexes on `stage` and `status`

### Future Enhancements

- Consider adding deal validation rules (e.g., value must be positive)
- Consider adding deal stage workflow constraints
- Consider adding deal probability calculation based on stage

## Files Affected

### Database

- `prisma/schema.prisma` - Already contains Deal model
- `prisma/migrations/` - Will add new migration file

### API

- `app/api/dashboard/route.ts` - No changes needed (already queries Deal model)
- `app/api/deals/route.ts` - Already exists
- `app/api/deals/[id]/route.ts` - Already exists

### Frontend

- `app/page.tsx` - No changes needed (already displays Deal components)
- `components/dashboard/pipeline-metrics.tsx` - Already exists
- `components/dashboard/pipeline-chart.tsx` - Already exists
- `components/dashboard/recent-deals.tsx` - Already exists

## Rollback Plan

If issues occur after migration:

```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back [migration-name]

# Or reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Success Criteria

- [ ] Migration created successfully
- [ ] Migration applied without errors
- [ ] Prisma client regenerated
- [ ] Dashboard loads without 500 errors
- [ ] All dashboard components render correctly
- [ ] Deal-related metrics display (even if 0)
- [ ] No console errors in browser
