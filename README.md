# CRM Contact Manager

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**A lightweight, multi-user Customer Relationship Management (CRM) system designed for team collaboration in managing and tracking customer contacts, activities, tasks, deals, and companies with real-time analytics capabilities.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 📊 Dashboard

- **Multi-tab Analytics**: Contacts, Activities, Tasks, Deals, and Companies analytics
- **Real-time Statistics**: Total contacts, leads, customers, conversion rates
- **Visual Charts**: Status distribution, contact growth trends, pipeline visualization
- **Quick Access**: Recent contacts, activities, tasks, deals, and companies
- **Upcoming Tasks**: View tasks due today and next 5 tasks with quick completion
- **Sales Pipeline**: Total value, won/lost values, win rate, and stage distribution
- **Company Analytics**: Top companies by deal value and companies by industry

### 👥 Contact Management

- **Comprehensive List**: View all contacts with filtering and search
- **Full CRUD Operations**: Create, read, update, and delete contacts
- **Bulk Operations**: Select and delete multiple contacts with confirmation
- **Status Tracking**: Lead and Customer status with visual indicators
- **Contact Profiles**: Detailed view with activity history, tasks, and deals
- **Quick Actions**: Create tasks and deals directly from contact profile
- **Validation**: Email and phone number uniqueness with format validation

### 📝 Activity Management

- **Activity Types**: Track calls, emails, meetings, and notes
- **Filtering**: Filter by type and date range
- **Activity Profiles**: Full CRUD operations for each activity
- **Contact Linking**: All activities linked to contacts with cascade deletion
- **Pagination**: Handle large datasets efficiently
- **Recent Activities**: View latest interactions on dashboard

### ✅ Task Management

- **Task Creation**: Create tasks with title, description, due date, and priority
- **Priority Levels**: Low, Medium, High with color-coded badges
- **Status Filtering**: Open, Completed, Overdue tasks
- **Quick Completion**: Toggle tasks as complete with checkbox
- **Visual Indicators**: Priority badges and overdue status indicators
- **Task Profiles**: Full CRUD operations
- **Contact Linking**: Tasks linked to contacts with cascade deletion
- **Upcoming Tasks**: View tasks due today and next 5 tasks on dashboard

### 💼 Deal Management

- **Deal Creation**: Create deals with name, value, stage, expected close date
- **Kanban Board**: Visual drag-and-drop pipeline with stage updates
- **Deal Stages**: Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
- **Status Tracking**: Open, Won, Lost with automatic status updates
- **Probability Tracking**: Track deal probability percentages
- **Comprehensive Filtering**: By stage, status, value range, date range, and search
- **Deal Profiles**: Full CRUD operations
- **Contact & Company Linking**: Deals linked to contacts and companies
- **Pipeline Metrics**: Total value, won/lost values, win rate
- **Recent Deals**: View latest deals on dashboard

### 🏢 Company Management

- **Company Creation**: Create companies with detailed information
- **Company Fields**: Name, industry, website, phone, address, employee count, revenue
- **Company Profiles**: Full CRUD operations with tabbed interface
- **Profile Tabs**: Information, Contacts, Deals, Activities, Tasks
- **Filtering**: Filter by industry and search by name
- **Contact & Deal Linking**: Assign contacts and deals to companies
- **Cascade Deletion**: Deleting a company sets companyId to null on related records
- **Company Analytics**: Top companies by deal value and companies by industry
- **Recent Companies**: View latest companies on dashboard

### 📈 Reports & Analytics

- **Sales Performance**: Revenue trend charts and deals won/lost analysis
- **Conversion Funnel**: Visual funnel with conversion rates table
- **Pipeline Analytics**: Deals by stage and average time in stage
- **Activity Metrics**: Activity type distribution, activity over time, activity heatmap
- **Task Analytics**: Task completion rates and overdue tasks trend
- **Top Performers**: Top companies by deal value and biggest deals won this month
- **Date Range Filtering**: Presets (Today, This Week, This Month, This Quarter, Custom)
- **CSV Export**: Export all report data to CSV
- **Print Optimization**: Optimized print styles for report printing
- **Real-time Updates**: 60-second auto-refresh for latest data

### 🎨 Design & UX

- **Intentional Minimalism**: Bespoke, non-generic design philosophy
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Modern UI**: Built with shadcn/ui components
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Dark Mode Ready**: Theme support for future implementation

---

## 🚀 Demo

### Screenshots

#### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

#### Contact Management

![Contacts](docs/screenshots/contacts.png)

#### Deal Kanban Board

![Deals](docs/screenshots/deals.png)

#### Reports & Analytics

![Reports](docs/screenshots/reports.png)

---

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.0+](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Styling**: [Tailwind CSS 3.4+](https://tailwindcss.com/)
- **Charts**: [Recharts 2.10+](https://recharts.org/)
- **Forms**: [React Hook Form 7.48+](https://react-hook-form.com/) + [Zod 3.22+](https://zod.dev/)
- **Drag & Drop**: [@hello-pangea/dnd 16.6+](https://github.com/hello-pangea/dnd)
- **Data Fetching**: [SWR 2.3+](https://swr.vercel.app/)
- **Date Handling**: [date-fns 4.1+](https://date-fns.org/)
- **Icons**: [Lucide React 0.300+](https://lucide.dev/)

### Backend

- **Runtime**: Node.js 18+
- **API Routes**: Next.js API Routes (App Router)
- **Database**: [PostgreSQL 14+](https://www.postgresql.org/)
- **ORM**: [Prisma 5.0+](https://www.prisma.io/)

### Development Tools

- **Package Manager**: npm or pnpm
- **Code Quality**: ESLint, Prettier
- **Type Checking**: TypeScript
- **Version Control**: Git

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ installed and running ([Download](https://www.postgresql.org/download/))
- **npm** or **pnpm** package manager

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/basic-crm.git
cd basic-crm
```

#### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

#### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"

# Optional: Add in future phases
# NEXTAUTH_SECRET="your-secret-key"
# NEXTAUTH_URL="http://localhost:3000"
```

**Note**: Replace `user`, `password`, and `crm_db` with your actual database credentials.

#### 4. Set Up the Database

```bash
# Create database
createdb crm_db

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

#### 5. Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

#### 6. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
basic-CRM/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with navigation
│   ├── page.tsx                   # Dashboard page (home)
│   ├── contacts/                  # Contact management pages
│   │   ├── page.tsx              # Contacts list
│   │   ├── new/page.tsx          # New contact form
│   │   └── [id]/page.tsx         # Contact profile
│   ├── activities/                # Activity management pages
│   │   ├── page.tsx              # Activities list
│   │   └── [id]/page.tsx         # Activity profile
│   ├── tasks/                     # Task management pages
│   │   ├── page.tsx              # Tasks list
│   │   ├── new/page.tsx          # New task form
│   │   └── [id]/page.tsx         # Task profile
│   ├── deals/                     # Deal management pages
│   │   ├── page.tsx              # Deals list
│   │   ├── new/page.tsx          # New deal form
│   │   └── [id]/page.tsx         # Deal profile
│   ├── companies/                 # Company management pages
│   │   ├── page.tsx              # Companies list
│   │   ├── new/page.tsx          # New company form
│   │   └── [id]/page.tsx         # Company profile
│   ├── reports/                   # Reports & Analytics pages
│   │   ├── page.tsx              # Reports dashboard
│   │   └── globals.css           # Print styles
│   ├── docs/                      # API documentation pages
│   │   ├── page.tsx              # Documentation index
│   │   ├── contacts/page.tsx     # Contacts API docs
│   │   ├── activities/page.tsx   # Activities API docs
│   │   ├── tasks/page.tsx        # Tasks API docs
│   │   ├── deals/page.tsx        # Deals API docs
│   │   ├── companies/page.tsx     # Companies API docs
│   │   ├── dashboard/page.tsx    # Dashboard API docs
│   │   ├── integration/page.tsx  # Integration guide
│   │   ├── security/page.tsx     # Security best practices
│   │   └── webhooks/page.tsx     # Webhook documentation
│   └── api/                       # API routes
│       ├── dashboard/route.ts    # Dashboard analytics
│       ├── contacts/             # Contacts CRUD endpoints
│       ├── activities/           # Activities CRUD endpoints
│       ├── tasks/                # Tasks CRUD endpoints
│       ├── deals/                # Deals CRUD endpoints
│       ├── companies/            # Companies CRUD endpoints
│       └── reports/              # Reports & Analytics endpoints
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard-specific components
│   ├── contacts/                 # Contact-specific components
│   ├── activities/               # Activity-specific components
│   ├── tasks/                    # Task-specific components
│   ├── deals/                    # Deal-specific components
│   ├── companies/                # Company-specific components
│   ├── reports/                  # Reports-specific components
│   └── layout/                   # Layout components (navigation)
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client instance
│   ├── validations.ts            # Zod validation schemas
│   ├── utils.ts                  # Utility functions
│   └── csv-export.ts             # CSV export utility
├── types/                        # TypeScript interfaces
│   ├── contact.ts                # Contact types
│   ├── activity.ts              # Activity types
│   ├── task.ts                   # Task types
│   ├── deal.ts                   # Deal types
│   ├── company.ts                # Company types
│   └── reports.ts                # Reports types
├── prisma/                       # Prisma ORM
│   └── schema.prisma            # Database schema
├── docs/                         # Additional documentation
│   └── API_DOCUMENTATION.md     # Comprehensive API docs
├── public/                       # Static assets
├── .env.local                   # Environment variables (not in git)
├── .gitignore                   # Git ignore rules
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── next.config.js               # Next.js configuration
├── postcss.config.js            # PostCSS configuration
└── README.md                    # This file
```

---

## 🎯 Design Philosophy

This CRM follows an **"intentional minimalism"** approach:

- **Anti-Generic**: Rejects standard "bootstrapped" layouts and template-like designs
- **Unique**: Strives for bespoke layouts with distinctive typography and visual hierarchy
- **Purpose-Driven**: Every element serves a clear function; unnecessary elements are removed
- **Sophisticated**: Reduction to essentials creates elegance and clarity

The interface feels **bespoke and memorable**, not like a generic AI-generated application.

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Contacts

- `GET /api/contacts` - List all contacts (with filtering and search)
- `GET /api/contacts/[id]` - Get single contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact

#### Activities

- `GET /api/activities` - List all activities (with filtering and pagination)
- `GET /api/activities/[id]` - Get single activity by ID
- `POST /api/activities` - Create new activity
- `PUT /api/activities/[id]` - Update activity
- `DELETE /api/activities/[id]` - Delete activity

#### Tasks

- `GET /api/tasks` - List all tasks (with filtering and pagination)
- `GET /api/tasks/[id]` - Get single task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task
- `PATCH /api/tasks/[id]` - Toggle task completion
- `DELETE /api/tasks/[id]` - Delete task

#### Deals

- `GET /api/deals` - List all deals (with filtering and search)
- `GET /api/deals/[id]` - Get single deal by ID
- `POST /api/deals` - Create new deal
- `PUT /api/deals/[id]` - Update deal
- `PATCH /api/deals/[id]` - Update deal stage
- `DELETE /api/deals/[id]` - Delete deal

#### Companies

- `GET /api/companies` - List all companies (with filtering and search)
- `GET /api/companies/[id]` - Get single company by ID
- `POST /api/companies` - Create new company
- `PUT /api/companies/[id]` - Update company
- `DELETE /api/companies/[id]` - Delete company

#### Dashboard

- `GET /api/dashboard` - Get dashboard analytics

#### Reports

- `GET /api/reports` - Get comprehensive reports and analytics

### Response Format

All API responses follow this format:

```typescript
{
  data: T | null,      // Response data or null on error
  error: string | null  // Error message or null on success
}
```

### Status Codes

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input or validation error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

For detailed API documentation with examples, visit [http://localhost:3000/docs](http://localhost:3000/docs).

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Building
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Run Prettier (if configured)

# Database
npx prisma generate  # Regenerate Prisma client
npx prisma migrate dev --name <migration-name>  # Create and run migration
npx prisma migrate deploy                    # Deploy migrations to production
npx prisma studio                           # Open Prisma Studio (GUI)
npx prisma db push                          # Push schema changes to database
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_deal_stage_history

# Run migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Prisma Studio

Open Prisma Studio to view and edit your database:

```bash
npx prisma studio
```

This will open a GUI at [http://localhost:5555](http://localhost:5555).

### Code Style

This project uses:

- **Prettier** for code formatting
- **ESLint** for linting
- **2-space indentation**
- **Single quotes for strings**
- **Semicolons required**

---

## 🗄 Database Schema

### Core Tables

#### Contacts

```sql
- id (UUID, primary key)
- first_name (VARCHAR 50, required)
- last_name (VARCHAR 50, required)
- email (VARCHAR 255, required, unique)
- phone_number (VARCHAR 20, unique, nullable)
- status (ENUM: lead, customer, default: lead)
- job_title (VARCHAR 100, nullable)
- company_id (UUID, foreign key, nullable)
- created_at (TIMESTAMP, default: NOW())
- updated_at (TIMESTAMP, default: NOW())
```

#### Activities

```sql
- id (UUID, primary key)
- type (ENUM: call, email, meeting, note, required)
- subject (VARCHAR 255, required)
- description (TEXT, nullable)
- contact_id (UUID, foreign key, required, cascade delete)
- created_at (TIMESTAMP, default: NOW())
- updated_at (TIMESTAMP, default: NOW())
```

#### Tasks

```sql
- id (UUID, primary key)
- title (VARCHAR 255, required)
- description (TEXT, nullable)
- due_date (TIMESTAMP, required)
- priority (ENUM: low, medium, high, default: medium)
- completed (BOOLEAN, default: false)
- completed_at (TIMESTAMP, nullable)
- contact_id (UUID, foreign key, required, cascade delete)
- created_at (TIMESTAMP, default: NOW())
- updated_at (TIMESTAMP, default: NOW())
```

#### Deals

```sql
- id (UUID, primary key)
- name (VARCHAR 255, required)
- value (NUMERIC, required)
- stage (ENUM: lead, qualified, proposal, negotiation, closed_won, closed_lost, default: lead)
- expected_close_date (TIMESTAMP, required)
- actual_close_date (TIMESTAMP, nullable)
- status (ENUM: open, won, lost, default: open)
- probability (INTEGER, default: 0)
- description (TEXT, nullable)
- contact_id (UUID, foreign key, required, cascade delete)
- company_id (UUID, foreign key, nullable, set null on delete)
- created_at (TIMESTAMP, default: NOW())
- updated_at (TIMESTAMP, default: NOW())
```

#### Companies

```sql
- id (UUID, primary key)
- name (VARCHAR 255, required, unique)
- industry (VARCHAR 100, nullable)
- website (VARCHAR 255, nullable)
- phone (VARCHAR 20, nullable)
- address (VARCHAR 500, nullable)
- employee_count (INTEGER, nullable)
- revenue (NUMERIC, nullable)
- created_at (TIMESTAMP, default: NOW())
- updated_at (TIMESTAMP, default: NOW())
```

#### DealStageHistory

```sql
- id (UUID, primary key)
- deal_id (UUID, foreign key, required, cascade delete)
- from_stage (VARCHAR 20, required)
- to_stage (VARCHAR 20, required)
- changed_at (TIMESTAMP, default: NOW())
```

### Indexes

All tables have appropriate indexes on frequently queried columns:

- Contacts: email, phone_number, status, created_at, company_id
- Activities: contact_id, created_at, type
- Tasks: contact_id, due_date, completed, priority
- Deals: contact_id, company_id, stage, status, expected_close_date, actual_close_date
- Companies: name, industry

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
__tests__/
├── api/                    # API route tests
│   ├── contacts.test.ts
│   ├── activities.test.ts
│   ├── tasks.test.ts
│   ├── deals.test.ts
│   └── companies.test.ts
├── components/             # Component tests
│   ├── contacts/
│   ├── activities/
│   ├── tasks/
│   ├── deals/
│   └── companies/
└── utils/                  # Utility function tests
```

---

## 🚀 Deployment

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# DATABASE_URL=your-production-database-url
```

#### Docker

```bash
# Build Docker image
docker build -t basic-crm .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  basic-crm
```

#### Manual Deployment

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Set environment variables** on your server

3. **Start the production server**:
   ```bash
   npm run start
   ```

### Environment Variables

| Variable          | Description                        | Required | Default |
| ----------------- | ---------------------------------- | -------- | ------- |
| `DATABASE_URL`    | PostgreSQL connection string       | Yes      | -       |
| `NEXTAUTH_SECRET` | Secret for authentication (future) | No       | -       |
| `NEXTAUTH_URL`    | Application URL (future)           | No       | -       |

### Database Setup for Production

```bash
# Create production database
createdb crm_production

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit your changes**:
   ```bash
   git commit -m 'feat: add some feature'
   ```
5. **Push to the branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:

```bash
feat: add bulk delete for contacts
fix: resolve email validation bug
docs: update API documentation
```

### Code Review Process

1. All pull requests must pass CI checks
2. At least one approval is required
3. Changes must not break existing functionality
4. Code must follow project style guidelines

### Development Guidelines

- Follow the "intentional minimalism" design philosophy
- Use shadcn/ui components when available
- Write TypeScript with proper typing
- Add tests for new features
- Update documentation for API changes
- Ensure accessibility (WCAG AA compliance)

---

## 📖 Documentation

### Internal Documentation

- **Architecture**: [`.kilocode/rules/memory-bank/architecture.md`](.kilocode/rules/memory-bank/architecture.md)
- **Product Brief**: [`.kilocode/rules/memory-bank/brief.md`](.kilocode/rules/memory-bank/brief.md)
- **Technical Stack**: [`.kilocode/rules/memory-bank/tech.md`](.kilocode/rules/memory-bank/tech.md)
- **Tasks & Workflows**: [`.kilocode/rules/memory-bank/tasks.md`](.kilocode/rules/memory-bank/tasks.md)
- **API Documentation**: [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)

### External Documentation

Visit [http://localhost:3000/docs](http://localhost:3000/docs) for interactive API documentation.

---

## 🔮 Roadmap

### Phase 2: Authentication & Authorization (Planned)

- User authentication with JWT
- Role-based access control
- Contact ownership and assignment
- Activity logging for audit trails

### Phase 3: Enhanced Features (Planned)

- Email integration (SendGrid, Mailgun)
- Calendar integration
- Custom fields
- Import/export functionality
- Advanced search and filtering
- Tags and categories
- Mobile app (React Native)

### Phase 4: Integrations (Planned)

- CRM platform integrations (Salesforce, HubSpot)
- Analytics tools (Google Analytics, Mixpanel)
- Payment processing
- Document management
- Video conferencing integration

---

## ❓ FAQ

### Q: Is authentication required?

A: No, the MVP version is designed for small teams without authentication. Authentication will be added in Phase 2.

### Q: Can I use a different database?

A: The current implementation uses PostgreSQL. While Prisma supports multiple databases, the project is optimized for PostgreSQL. You would need to modify the Prisma schema and potentially some queries.

### Q: How do I add custom fields?

A: Custom fields are planned for Phase 3. For now, you can modify the Prisma schema and add fields directly to the database.

### Q: Is the system production-ready?

A: The MVP is suitable for small teams (up to 50 users) and moderate data volumes (up to 10,000 contacts). For larger deployments, additional optimizations and scaling strategies would be needed.

### Q: Can I self-host this?

A: Yes! The application can be self-hosted on any server that supports Node.js and PostgreSQL. See the [Deployment](#-deployment) section for details.

### Q: How do I backup my data?

A: You can use PostgreSQL's built-in backup tools:

```bash
pg_dump crm_db > backup.sql
```

### Q: Is there a mobile app?

A: Not yet. A mobile app is planned for Phase 3.

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error

```
Error: Can't reach database server
```

**Solution**: Ensure PostgreSQL is running and the `DATABASE_URL` in `.env.local` is correct.

#### Prisma Client Not Generated

```
Error: @prisma/client did not initialize yet
```

**Solution**: Run `npx prisma generate`

#### Migration Failed

```
Error: Migration failed
```

**Solution**: Check the migration file and ensure your database schema is compatible. You may need to reset the database with `npx prisma migrate reset` (WARNING: deletes all data).

#### Build Errors

```
Error: Build failed
```

**Solution**: Clear the Next.js cache:

```bash
rm -rf .next
npm run build
```

### Getting Help

- **Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/basic-crm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/basic-crm/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[shadcn/ui](https://ui.shadcn.com/)** for beautiful, accessible UI components
- **[Next.js](https://nextjs.org/)** for the amazing React framework
- **[Prisma](https://www.prisma.io/)** for the excellent ORM
- **[Radix UI](https://www.radix-ui.com/)** for accessible UI primitives
- **[Recharts](https://recharts.org/)** for powerful charting library
- **[Lucide](https://lucide.dev/)** for beautiful icons

---

## 📞 Contact & Support

- **GitHub**: [https://github.com/yourusername/basic-crm](https://github.com/yourusername/basic-crm)
- **Issues**: [https://github.com/yourusername/basic-crm/issues](https://github.com/yourusername/basic-crm/issues)
- **Discussions**: [https://github.com/yourusername/basic-crm/discussions](https://github.com/yourusername/basic-crm/discussions)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐️

---

<div align="center">

**Built with ❤️ by the CRM Contact Manager team**

[Back to Top](#-crm-contact-manager)

</div>
