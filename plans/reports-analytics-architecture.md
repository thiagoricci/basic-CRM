# Reports & Analytics - Architecture Design

## Overview

This document outlines the technical architecture for the Reports & Analytics feature, including page structure, component hierarchy, data flow, API design, and state management strategy.

## Page Structure

### Route Hierarchy

```
/reports
├── / (main reports page with tabs)
├── /sales-performance
├── /pipeline-analytics
├── /activity-metrics
├── /task-analytics
├── /conversion-funnel
└── /top-performers
```

### Main Reports Page (`/reports`)

**Purpose:** Provide a tabbed interface similar to dashboard but with advanced analytics and export capabilities.

**Layout:**

- Page header with title and global date range filter
- Tabbed interface for different report categories
- Each tab contains multiple report widgets
- Export buttons for individual widgets and entire tab

**Tabs:**

1. Sales Performance
2. Pipeline Analytics
3. Activity Metrics
4. Task Analytics
5. Conversion Funnel
6. Top Performers

### Sub-pages

Each sub-page provides a deep-dive into a specific analytics category with additional visualizations and filters.

## Component Hierarchy

```
ReportsPage (app/reports/page.tsx)
├── ReportsHeader
│   ├── Title
│   └── DateRangeFilter
├── ReportsTabs
│   ├── SalesPerformanceTab
│   │   ├── RevenueTrendChart
│   │   ├── DealsWonLostChart
│   │   ├── AverageDealSizeCard
│   │   ├── WinRateCard
│   │   └── ExportButton
│   ├── PipelineAnalyticsTab
│   │   ├── PipelineFunnelChart
│   │   ├── PipelineValueByStageChart
│   │   ├── AverageTimeInStageChart
│   │   ├── PipelineVelocityCard
│   │   └── ExportButton
│   ├── ActivityMetricsTab
│   │   ├── ActivityTypeDistributionChart
│   │   ├── ActivityOverTimeChart
│   │   ├── ActivityHeatmap
│   │   ├── TopContactsByActivity
│   │   ├── TopCompaniesByActivity
│   │   └── ExportButton
│   ├── TaskAnalyticsTab
│   │   ├── TaskCompletionRateCard
│   │   ├── OverdueTasksTrendChart
│   │   ├── TasksCompletedOverTimeChart
│   │   ├── AverageTimeToCompleteCard
│   │   └── ExportButton
│   ├── ConversionFunnelTab
│   │   ├── FullConversionFunnelChart
│   │   ├── ConversionRatesTable
│   │   ├── DropOffVisualization
│   │   └── ExportButton
│   └── TopPerformersTab
│       ├── TopCompaniesByDealValue
│       ├── TopContactsByActivity
│       ├── BiggestDealsWonThisMonth
│       ├── TopContactsByDealValue
│       └── ExportButton
└── PrintLayout (hidden, for printing)
```

## Data Flow

### Client-Side Data Fetching

**Strategy:** Use SWR for efficient data fetching with caching and revalidation, similar to dashboard.

**Configuration:**

```typescript
const { data, error, isLoading, mutate } = useSWR<ReportsData>(
  `/api/reports?startDate=${startDate}&endDate=${endDate}`,
  fetcher,
  {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 60000, // 1 minute for reports (less frequent than dashboard)
    dedupingInterval: 5000,
  }
);
```

### Data Flow Diagram

```
User selects date range
    ↓
ReportsPage updates state
    ↓
SWR fetches from /api/reports with date range params
    ↓
API aggregates data from database
    ↓
API returns aggregated analytics
    ↓
Components receive data via props
    ↓
Charts render with data
    ↓
User clicks export
    ↓
Client generates CSV from data
    ↓
CSV downloads to user's device
```

## API Endpoint Design

### Main Reports Endpoint

**Route:** `GET /api/reports`

**Query Parameters:**

- `startDate` (optional): ISO date string, default: 30 days ago
- `endDate` (optional): ISO date string, default: today
- `groupBy` (optional): 'day' | 'week' | 'month', default: 'day'

**Response Format:**

```typescript
{
  data: {
    // Sales Performance
    revenueOverTime: {
      date: string;
      revenue: number;
    }
    [];
    dealsWonLost: {
      status: 'won' | 'lost';
      count: number;
      value: number;
    }
    [];
    averageDealSize: number;
    winRate: number;

    // Pipeline Analytics
    dealsByStage: {
      stage: string;
      count: number;
      value: number;
    }
    [];
    averageTimeInStage: {
      stage: string;
      days: number;
    }
    [];
    pipelineVelocity: number; // days to move through all stages

    // Activity Metrics
    activitiesByType: {
      type: string;
      count: number;
    }
    [];
    activitiesOverTime: {
      date: string;
      count: number;
    }
    [];
    activityHeatmap: {
      day: string;
      hour: number;
      count: number;
    }
    [];
    topContactsByActivity: {
      contactId: string;
      name: string;
      count: number;
    }
    [];
    topCompaniesByActivity: {
      companyId: string;
      name: string;
      count: number;
    }
    [];

    // Task Analytics
    taskCompletionRate: number;
    overdueTasksTrend: {
      date: string;
      count: number;
    }
    [];
    tasksCompletedOverTime: {
      date: string;
      count: number;
    }
    [];
    averageTimeToComplete: number; // in days

    // Conversion Funnel
    conversionFunnel: {
      stage: string;
      count: number;
      conversionRate: number;
      dropOffRate: number;
    }
    [];

    // Top Performers
    topCompaniesByDealValue: {
      companyId: string;
      name: string;
      totalValue: number;
    }
    [];
    topContactsByActivity: {
      contactId: string;
      name: string;
      count: number;
    }
    [];
    biggestDealsWonThisMonth: {
      dealId: string;
      name: string;
      value: number;
      contactName: string;
    }
    [];
    topContactsByDealValue: {
      contactId: string;
      name: string;
      totalValue: number;
    }
    [];
  }
  error: string | null;
}
```

### CSV Export Endpoints

**Route:** `GET /api/reports/export/{reportType}`

**Query Parameters:**

- `startDate`: ISO date string
- `endDate`: ISO date string

**Report Types:**

- `sales-performance`
- `pipeline-analytics`
- `activity-metrics`
- `task-analytics`
- `conversion-funnel`
- `top-performers`

**Response:** CSV file download

## State Management

### Global State

**Date Range State:** Managed in ReportsPage component and passed to children.

```typescript
interface DateRange {
  startDate: Date;
  endDate: Date;
  preset?: 'today' | 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'custom';
}
```

### Local State

Each component manages its own local state for:

- Chart interactions (hover, click)
- Loading states
- Error states
- Export dialogs

### State Flow

```
ReportsPage (dateRange state)
    ↓
DateRangeFilter (updates dateRange)
    ↓
SWR (fetches with dateRange)
    ↓
ReportTabs (receives data)
    ↓
Individual Components (receive data via props)
```

## Component Design

### ReportsHeader

**Purpose:** Display page title and global date range filter.

**Props:**

```typescript
interface ReportsHeaderProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  isExporting: boolean;
  onExportAll: () => void;
}
```

**Features:**

- Title and description
- Date range preset buttons (Today, This Week, This Month, This Quarter, Custom)
- Custom date range picker
- Export all reports button

### DateRangeFilter

**Purpose:** Allow users to select date ranges for reports.

**Props:**

```typescript
interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}
```

**Features:**

- Preset buttons for common ranges
- Custom date range picker (using shadcn/ui Calendar)
- Display current selected range

### RevenueTrendChart

**Purpose:** Display revenue over time with monthly/quarterly aggregation.

**Props:**

```typescript
interface RevenueTrendChartProps {
  data: { date: string; revenue: number }[];
  groupBy: 'month' | 'quarter';
  onGroupByChange: (groupBy: 'month' | 'quarter') => void;
}
```

**Features:**

- Line chart showing revenue trend
- Toggle between monthly and quarterly view
- Tooltip with detailed revenue information
- Export button

### ConversionFunnel

**Purpose:** Visualize full conversion funnel from lead to won.

**Props:**

```typescript
interface ConversionFunnelProps {
  data: {
    stage: string;
    count: number;
    conversionRate: number;
    dropOffRate: number;
  }[];
}
```

**Features:**

- Funnel chart visualization
- Conversion rates at each stage
- Drop-off percentages
- Export button

### ActivityHeatmap

**Purpose:** Display activity patterns in calendar-style heatmap.

**Props:**

```typescript
interface ActivityHeatmapProps {
  data: { day: string; hour: number; count: number }[];
  period: 'week' | 'month';
}
```

**Features:**

- Calendar grid with activity intensity
- Color-coded cells based on activity count
- Hover tooltips with activity details
- Export button

### ExportButton

**Purpose:** Export report data to CSV.

**Props:**

```typescript
interface ExportButtonProps {
  data: any[];
  filename: string;
  disabled?: boolean;
}
```

**Features:**

- Download CSV file
- Show loading state during export
- Error handling

## Database Schema Changes

### DealStageHistory Model

**Purpose:** Track stage transitions for pipeline velocity analysis.

```prisma
model DealStageHistory {
  id        String   @id @default(uuid())
  dealId    String
  deal      Deal     @relation(fields: [dealId], references: [id], onDelete: Cascade)
  fromStage String?
  toStage   String
  changedAt DateTime @default(now())

  @@index([dealId])
  @@index([changedAt])
  @@index([toStage])
}
```

### Deal Model Update

```prisma
model Deal {
  // ... existing fields ...
  stageHistory DealStageHistory[]
}
```

## Performance Considerations

### Database Optimization

**Indexes:**

- Add composite indexes for date range queries
- Index on `DealStageHistory.changedAt` for time-based queries
- Index on `Activity.createdAt` for activity aggregation

**Query Optimization:**

- Use Prisma's `groupBy` for aggregations
- Limit data transfer by selecting only necessary fields
- Use database-level calculations where possible

### Frontend Optimization

**Code Splitting:**

- Lazy load chart components using `React.lazy()`
- Dynamic imports for heavy libraries

**Caching:**

- SWR caching with 1-minute revalidation
- Deduplicate requests within 5-second window

**Rendering:**

- Use React.memo for expensive components
- Virtualize large lists (if needed)

## Security Considerations

### Data Access

**Current State:** No authentication in MVP, all users have full access.

**Future State:** Implement role-based access control for reports.

### Input Validation

- Validate date range parameters
- Sanitize CSV export data
- Prevent SQL injection (handled by Prisma)

## Accessibility

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Focus management for modals and dialogs

### Screen Reader Support

- ARIA labels for charts
- Alt text for visual elements
- Proper heading hierarchy

### Color Contrast

- Meet WCAG AA standards for color contrast
- Provide color-blind friendly palettes

## Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Layout Adaptations

**Mobile:**

- Stacked cards
- Simplified charts
- Collapsible sections

**Tablet:**

- 2-column grid
- Medium-sized charts

**Desktop:**

- Multi-column grid
- Full-sized charts
- Side-by-side comparisons

## Print Support

### Print Styles

```css
@media print {
  .no-print {
    display: none;
  }
  .print-break {
    page-break-before: always;
  }
  .chart-container {
    page-break-inside: avoid;
  }
}
```

### Print Layout

- Remove navigation and buttons
- Optimize chart colors for black and white printing
- Add page breaks between sections
- Include report metadata (date range, generated at)

## Error Handling

### API Errors

- Display user-friendly error messages
- Provide retry functionality
- Log errors for debugging

### Client-Side Errors

- Graceful degradation for missing data
- Fallback UI for chart rendering errors
- Error boundaries for component crashes

## Testing Strategy

### Unit Tests

- Test individual components
- Test data transformation functions
- Test CSV export functionality

### Integration Tests

- Test API endpoints
- Test data flow from API to components
- Test date range filtering

### E2E Tests

- Test complete user flows
- Test export functionality
- Test print functionality

## Deployment Considerations

### Environment Variables

```env
# Reports configuration
REPORTS_CACHE_DURATION=60
REPORTS_MAX_DATE_RANGE_DAYS=365
```

### Monitoring

- Track report generation performance
- Monitor API response times
- Log export operations

## Future Enhancements

### Phase 2 Features

1. Custom report builder
2. Scheduled reports (email delivery)
3. Report templates
4. Advanced filtering (by user, by company)
5. Comparison reports (period-over-period)

### Phase 3 Features

1. Predictive analytics
2. AI-powered insights
3. Real-time collaboration on reports
4. Report sharing and permissions
5. Integration with external BI tools

## Conclusion

This architecture provides a solid foundation for the Reports & Analytics feature, building on the existing dashboard infrastructure while adding advanced analytics capabilities. The design prioritizes performance, maintainability, and user experience, with clear paths for future enhancements.
