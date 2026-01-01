# Refactor CompanySelector to Match ContactSelector Pattern

## Goal

Refactor `CompanySelector` to use the same UX pattern as `ContactSelector` with:

- Popover + Command components for better UX
- Built-in search/filter functionality
- Better visual display with icons
- Loading states
- Error handling

## Current Implementation

- Uses `Select` component with basic search input inside SelectContent
- Limited filtering capabilities
- No loading/error states
- Basic visual design

## Target Implementation (ContactSelector Pattern)

- Uses `Popover` + `Command` components
- Search input integrated with Command
- Rich visual display with icons and checkmarks
- Loading spinner with text
- Error messages
- Better accessibility and UX

## Changes Required

### File: `components/companies/company-selector.tsx`

**Replace entire component with new implementation:**

1. **Imports Update**
   - Add: `Check`, `Building2`, `Loader2`, `ChevronDown` from `lucide-react`
   - Add: `Command`, `CommandEmpty`, `CommandGroup`, `CommandInput`, `CommandItem`, `CommandList` from `@/components/ui/command`
   - Add: `Popover`, `PopoverContent`, `PopoverTrigger` from `@/components/ui/popover`
   - Add: `cn` from `@/lib/utils`

2. **Component Props**
   - Keep: `value`, `onChange`, `companies`, `loading`, `placeholder`
   - Add: `disabled`, `error` props for consistency

3. **State Management**
   - Add: `open` state for popover
   - Add: `searchQuery` state for filtering
   - Keep: existing companies/loading props (or fetch internally like ContactSelector)

4. **Search/Filter Logic**
   - Filter companies by name based on searchQuery
   - Reset search query after selection

5. **Visual Design**
   - Use Button as PopoverTrigger with icon and text
   - Display selected company name with Building2 icon
   - Show "Select a company..." placeholder with icon
   - ChevronDown icon for dropdown indicator

6. **Command List**
   - Show loading spinner when loading
   - Show error message if fetch fails
   - Show "No companies found" if no results
   - Display companies with icon, name, and checkmark for selected

7. **Accessibility**
   - `role="combobox"` on trigger button
   - `aria-expanded` attribute
   - Proper keyboard navigation via Command

## Implementation Steps

1. Update imports to include all necessary components
2. Refactor component to use Popover + Command pattern
3. Implement search/filter functionality
4. Add loading and error states
5. Update visual design to match ContactSelector
6. Test all functionality (search, select, display)

## Benefits

- Consistent UX across Contact and Company selectors
- Better search/filter experience
- More professional visual design
- Improved accessibility
- Better error handling
- Loading states for better UX
