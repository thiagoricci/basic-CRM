# Product Requirements Document (PRD)

## CRM MVP - Contact Management System

### 1. Executive Summary

**Product Name:** CRM Contact Manager  
**Version:** MVP 1.0  
**Target Launch:** [Date TBD]  
**Product Owner:** [Your Name]

This document outlines the requirements for the Minimum Viable Product (MVP) of a web-based Customer Relationship Management system focused on contact management with basic analytics capabilities.

---

### 2. Product Overview

#### 2.1 Vision

Build a lightweight, multi-user CRM system that enables teams to manage and track their contacts efficiently with real-time analytics and an intuitive interface.

#### 2.2 Goals

- Enable teams to store and manage contact information in a centralized location
- Provide quick visual insights into contact database composition
- Create an intuitive user experience for viewing and filtering contacts
- Establish a foundation for future CRM feature expansion

#### 2.3 Out of Scope for MVP

- User authentication and authorization
- User role management
- Contact assignment/ownership
- Activity logging and history
- Email integration
- Custom fields
- Import/export functionality
- Advanced filtering and search
- Tags and categories beyond status

---

### 3. User Personas

**Primary User:** Sales/Support Team Member

- Needs quick access to contact information
- Wants to understand the composition of the contact database
- Requires ability to filter and find specific contacts
- Works collaboratively with team members on shared contact database

---

### 4. Technical Stack

- **Frontend Framework:** Next.js (React)
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **Deployment:** [TBD]

---

### 5. Functional Requirements

#### 5.1 Dashboard Page

**Purpose:** Provide at-a-glance analytics about the contact database

##### 5.1.1 Analytics Cards

- **Total Contacts:** Display total number of contacts in database
- **Total Leads:** Display count of contacts with "Lead" status
- **Total Customers:** Display count of contacts with "Customer" status
- **Conversion Rate:** Display percentage of Leads vs Customers (Customers / Total × 100)

##### 5.1.2 Visual Analytics

- **Status Distribution Chart:** Pie or donut chart showing breakdown of Leads vs Customers
- **Contact Growth Chart:** Line chart showing total contacts added over time (by week or month)

##### 5.1.3 Recent Activity

- Display list of 5 most recently added contacts with name and status

##### 5.1.4 Quick Actions

- Button to "Add New Contact" (navigates to contact creation flow)
- Button to "View All Contacts" (navigates to Contacts page)

---

#### 5.2 Contacts List Page

**Purpose:** Display, filter, and manage all contacts in the system

##### 5.2.1 Contact List Table

Display contacts in a table format with the following columns:

- Checkbox (for selection)
- Name (First Name + Last Name)
- Email
- Phone Number
- Status (Lead/Customer)
- Date Added

##### 5.2.2 Selection Functionality

- Individual checkbox per contact row
- "Select All" checkbox in table header
- Selected count indicator (e.g., "3 contacts selected")
- Deselect all button when contacts are selected

##### 5.2.3 Filter Options

- **Status Filter:** Dropdown to filter by:
  - All Contacts (default)
  - Leads Only
  - Customers Only
- **Search Bar:** Text input to search by name or email (client-side filtering acceptable for MVP)

##### 5.2.4 Bulk Actions

- Delete selected contacts button (visible when one or more contacts selected)
- Confirmation dialog before deletion

##### 5.2.5 Table Interactions

- Clicking on a contact row navigates to Contact Profile page
- Hover state on rows for better UX
- Pagination (if more than 50 contacts, implement simple pagination)

##### 5.2.6 Add Contact Button

- Prominent "Add Contact" button at top of page
- Opens contact creation modal or navigates to creation page

---

#### 5.3 Contact Profile Page

**Purpose:** View and edit detailed information for a specific contact

##### 5.3.1 Contact Information Display

Display the following fields:

- First Name
- Last Name
- Email Address
- Phone Number
- Status (Lead or Customer)
- Date Added (read-only)
- Last Updated (read-only)

##### 5.3.2 Edit Mode

- "Edit" button to enable editing of contact information
- Inline form validation
- "Save" and "Cancel" buttons in edit mode
- Success message on save
- Error handling for save failures

##### 5.3.3 Actions

- "Delete Contact" button with confirmation dialog
- "Back to Contacts" navigation button

##### 5.3.4 Layout

- Clean, card-based layout using shadcn/ui Card component
- Responsive design for mobile and desktop viewing

---

#### 5.4 Add/Create Contact Flow

##### 5.4.1 Contact Form

Required fields:

- First Name (text, required, max 50 characters)
- Last Name (text, required, max 50 characters)
- Email (email format, required, unique validation)
- Phone Number (text, optional, phone format validation)
- Status (dropdown/radio, required, options: Lead or Customer, default: Lead)

##### 5.4.2 Form Validation

- Real-time validation on blur
- Email format validation
- Email uniqueness check (cannot add duplicate emails)
- Phone number format validation (10-20 characters)
- Phone number uniqueness check (cannot add duplicate phone numbers)
- Display clear error messages below fields

##### 5.4.3 Form Actions

- "Save Contact" button
- "Cancel" button
- Success message and redirect to Contact Profile or Contacts List after save
- Error handling for database failures

---

### 6. Data Model

#### 6.1 Contact Entity

```sql
Table: contacts
- id: UUID (primary key)
- first_name: VARCHAR(50) NOT NULL
- last_name: VARCHAR(50) NOT NULL
- email: VARCHAR(255) NOT NULL UNIQUE
- phone_number: VARCHAR(20) NULL UNIQUE
- status: ENUM('lead', 'customer') NOT NULL DEFAULT 'lead'
- created_at: TIMESTAMP NOT NULL DEFAULT NOW()
- updated_at: TIMESTAMP NOT NULL DEFAULT NOW()
```

#### 6.2 Indexes

- Index on email (for uniqueness and lookups)
- Index on phone_number (for uniqueness and lookups)
- Index on status (for filtering)
- Index on created_at (for sorting and analytics)

---

### 7. User Interface Requirements

#### 7.1 Design System

- Use shadcn/ui components throughout
- Consistent spacing and typography using Tailwind CSS
- Responsive design (mobile-first approach)

#### 7.2 Navigation

- Side navigation bar or top navigation with:
  - Dashboard link
  - Contacts link
  - Logo/Brand name
- Breadcrumbs on Contact Profile page

#### 7.3 Color Scheme

- Status indicators:
  - Lead: Blue/Info color
  - Customer: Green/Success color
- Use shadcn/ui default theme colors

#### 7.4 Components to Use (shadcn/ui)

- Button
- Card
- Table
- Dialog (for confirmations)
- Form / Input
- Select / Dropdown
- Checkbox
- Label
- Badge (for status display)
- Chart components (Recharts via shadcn)

---

### 8. Non-Functional Requirements

#### 8.1 Performance

- Page load time under 2 seconds
- Form submissions complete within 1 second
- Dashboard analytics load within 3 seconds

#### 8.2 Usability

- Intuitive navigation requiring no training
- Clear error messages and validation feedback
- Responsive design working on mobile, tablet, and desktop

#### 8.3 Scalability

- Database schema designed to handle 10,000+ contacts
- Pagination implemented to handle large datasets

#### 8.4 Data Integrity

- Email uniqueness enforced at database level
- Data validation on both client and server side
- Automatic timestamps for audit trail

---

### 9. User Stories

#### Dashboard

- As a user, I want to see the total number of contacts so I can understand the size of my database
- As a user, I want to see how many leads vs customers I have so I can understand my pipeline
- As a user, I want to see visual charts so I can quickly understand contact distribution
- As a user, I want to see recently added contacts so I can track new entries

#### Contacts List

- As a user, I want to see all my contacts in a list so I can browse them
- As a user, I want to filter contacts by status so I can focus on leads or customers
- As a user, I want to search for contacts by name or email so I can find specific people
- As a user, I want to select multiple contacts so I can perform bulk actions
- As a user, I want to delete contacts so I can remove outdated information
- As a user, I want to click on a contact to view their details

#### Contact Profile

- As a user, I want to view all details of a contact so I can reference their information
- As a user, I want to edit contact information so I can keep it up to date
- As a user, I want to delete a contact so I can remove them from the system
- As a user, I want to see when a contact was added and last updated for audit purposes

#### Add Contact

- As a user, I want to add a new contact so I can grow my database
- As a user, I want to receive validation errors so I don't enter incorrect data
- As a user, I want to prevent duplicate emails so I maintain data integrity

---

### 10. Success Metrics

#### 10.1 User Engagement

- Average time spent on Dashboard
- Number of contacts added per user per week
- Filter and search usage frequency

#### 10.2 System Performance

- Page load times
- API response times
- Error rates

#### 10.3 Data Quality

- Percentage of contacts with complete information
- Duplicate prevention effectiveness

---

### 11. Constraints and Assumptions

#### 11.1 Constraints

- No authentication in MVP (to be added in future phase)
- Single database shared by all users
- No user-specific data separation or permissions
- Limited to basic contact fields

#### 11.2 Assumptions

- Users will have modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Users will access from desktop or tablet primarily
- Database will be hosted and accessible
- All users trust each other (since no auth/permissions)

---

### 12. Future Enhancements (Post-MVP)

- User authentication and authorization
- Role-based access control
- Contact ownership and assignment
- Activity history and notes
- Custom fields
- Advanced search and filtering
- Import/export functionality
- Email integration
- Task and reminder system
- Reports and advanced analytics
- API for integrations

---

### 13. Risks and Mitigations

| Risk                                           | Impact | Likelihood | Mitigation                                          |
| ---------------------------------------------- | ------ | ---------- | --------------------------------------------------- |
| No authentication could lead to data conflicts | High   | Medium     | Clear team communication; implement auth in Phase 2 |
| Database performance with large datasets       | Medium | Low        | Implement pagination and indexes from start         |
| Duplicate data entry without validation        | Medium | Medium     | Strict email uniqueness validation                  |
| Users accidentally deleting contacts           | Medium | Medium     | Implement confirmation dialogs                      |

---

### 14. Acceptance Criteria

#### Dashboard

- [ ] All 4 analytics cards display correct numbers
- [ ] Charts render correctly and update when data changes
- [ ] Recent contacts list shows latest 5 entries
- [ ] Quick action buttons navigate correctly

#### Contacts List

- [ ] All contacts display in table format
- [ ] Selection checkboxes work individually and collectively
- [ ] Filters correctly show/hide contacts
- [ ] Search finds contacts by name and email
- [ ] Bulk delete removes selected contacts after confirmation
- [ ] Clicking contact navigates to profile
- [ ] Pagination works if more than 50 contacts

#### Contact Profile

- [ ] All contact fields display correctly
- [ ] Edit mode enables field editing
- [ ] Save updates contact in database
- [ ] Delete removes contact after confirmation
- [ ] Back button returns to contacts list
- [ ] Timestamps display correctly

#### Add Contact

- [ ] Form validates all required fields
- [ ] Email uniqueness is enforced
- [ ] Phone number format is validated
- [ ] Success message displays after save
- [ ] User is redirected after successful creation
- [ ] Errors are displayed clearly

---

### 15. Development Phases

#### Phase 1: Database & API Setup (Week 1)

- Set up PostgreSQL database
- Create contact table with schema
- Build API endpoints (CRUD operations)
- Test database operations

#### Phase 2: Core UI Components (Week 2)

- Set up Next.js project with shadcn/ui
- Create layout and navigation
- Build reusable components
- Implement routing structure

#### Phase 3: Dashboard Development (Week 2-3)

- Implement analytics calculations
- Build analytics cards
- Create charts
- Connect to API

#### Phase 4: Contacts List Development (Week 3-4)

- Build contact table
- Implement filtering and search
- Add selection functionality
- Implement bulk actions

#### Phase 5: Contact Profile & Creation (Week 4-5)

- Build contact profile page
- Implement edit functionality
- Create add contact form
- Add validation

#### Phase 6: Testing & Polish (Week 5-6)

- End-to-end testing
- Bug fixes
- UI/UX refinements
- Performance optimization

---

### 16. Appendix

#### 16.1 Glossary

- **Lead:** A potential customer who has not yet made a purchase
- **Customer:** A contact who has made a purchase or completed conversion
- **Contact:** An individual person stored in the CRM system
- **Bulk Action:** An operation performed on multiple selected items simultaneously

#### 16.2 References

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Document Version:** 1.0  
**Last Updated:** December 29, 2025  
**Status:** Draft for Review
