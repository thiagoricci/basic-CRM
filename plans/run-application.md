# CRM Contact Manager - Application Setup Plan

## Overview

This plan outlines the steps to set up and run the CRM Contact Manager application on macOS.

## Prerequisites Check

- macOS operating system
- Node.js 18+ (verify with `node --version`)
- npm package manager (verify with `npm --version`)

---

## Step 1: Install PostgreSQL on macOS

### Option A: Using Homebrew (Recommended)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Verify PostgreSQL is running
postgres --version
```

### Option B: Using PostgreSQL Installer

1. Download PostgreSQL installer from https://www.postgresql.org/download/macosx/
2. Run the installer with default settings
3. PostgreSQL will be installed and started automatically

### Option C: Using Postgres.app (GUI Application)

1. Download Postgres.app from https://postgresapp.com/
2. Move to Applications folder
3. Open Postgres.app and click "Initialize"
4. PostgreSQL will run in the background

---

## Step 2: Configure Database Credentials

After installing PostgreSQL, you need to configure the database connection:

### Create Database User (if needed)

```bash
# Connect to PostgreSQL
psql postgres

# Create a new user (replace with your preferred username)
CREATE USER crm_user WITH PASSWORD 'your_secure_password';

# Grant necessary privileges
ALTER USER crm_user CREATEDB;

# Exit psql
\q
```

### Update .env.local File

Edit the `.env.local` file in the project root:

```env
# Database connection
DATABASE_URL="postgresql://crm_user:your_secure_password@localhost:5432/crm_db"
```

Replace:

- `crm_user` with your PostgreSQL username (or `postgres` for default)
- `your_secure_password` with your PostgreSQL password
- Keep `localhost:5432` as is (default PostgreSQL port)

---

## Step 3: Create the Database

```bash
# Create the crm_db database
createdb crm_db

# Verify database was created
psql -l
```

---

## Step 4: Install Node.js Dependencies

```bash
# Navigate to project directory (if not already there)
cd /Users/thiagoricci/Downloads/Projects/CRM/basic-CRM

# Install all npm dependencies
npm install
```

This will install all packages listed in `package.json`, including:

- Next.js and React
- shadcn/ui components
- Prisma client
- Recharts for charts
- React Hook Form and Zod for validation
- Framer Motion for animations

---

## Step 5: Generate Prisma Client

```bash
# Generate Prisma client based on schema
npx prisma generate
```

This creates the Prisma client that allows the application to interact with the database.

---

## Step 6: Run Database Migrations

```bash
# Apply the database schema
npx prisma migrate dev --name init
```

This will:

- Create the `contacts` table with all required columns
- Set up indexes on email, status, and createdAt
- Create the `_prisma_migrations` table for tracking migrations

Expected output:

```
The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251230171200_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

---

## Step 7: Start the Development Server

```bash
# Start Next.js development server
npm run dev
```

The server will start on `http://localhost:3000`

Expected output:

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

---

## Step 8: Verify Application Functionality

Open your browser and navigate to `http://localhost:3000`

### Test Checklist:

#### Dashboard Page

- [ ] Page loads without errors
- [ ] Analytics cards display (Total Contacts: 0, Leads: 0, Customers: 0)
- [ ] Status distribution chart renders
- [ ] Growth chart renders
- [ ] "Add New Contact" and "View All Contacts" buttons work

#### Contacts List Page

- [ ] Navigate to Contacts page
- [ ] Empty state displays correctly
- [ ] "Add Contact" button is visible
- [ ] Filter dropdown works (All, Leads, Customers)
- [ ] Search bar is functional

#### Add Contact Flow

- [ ] Click "Add Contact" button
- [ ] Form displays with all fields
- [ ] Validation works for required fields
- [ ] Email format validation works
- [ ] Phone number validation works
- [ ] Contact is created successfully
- [ ] Redirects to contact profile

#### Contact Profile Page

- [ ] Contact details display correctly
- [ ] Edit mode works
- [ ] Save updates contact
- [ ] Delete button shows confirmation
- [ ] Delete removes contact successfully

---

## Troubleshooting

### PostgreSQL Connection Issues

**Error: "Connection refused"**

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql@16
```

**Error: "password authentication failed"**

- Verify username and password in `.env.local`
- Reset PostgreSQL password if needed:
  ```bash
  psql postgres
  ALTER USER your_username WITH PASSWORD 'new_password';
  ```

### Prisma Migration Issues

**Error: "Database crm_db does not exist"**

```bash
# Create the database
createdb crm_db
```

**Error: "Migration failed"**

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Port Already in Use

**Error: "Port 3000 is already in use"**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Dependency Issues

**Error: "Module not found"**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Database Management Commands

### Connect to Database

```bash
psql -d crm_db
```

### View All Contacts

```sql
SELECT * FROM contacts;
```

### Clear All Contacts

```sql
DELETE FROM contacts;
```

### Drop Database (Start Fresh)

```bash
# Stop PostgreSQL
brew services stop postgresql@16

# Drop database
dropdb crm_db

# Recreate database
createdb crm_db

# Restart PostgreSQL
brew services start postgresql@16

# Run migrations again
npx prisma migrate dev --name init
```

---

## Next Steps After Setup

Once the application is running successfully:

1. **Add Sample Data**: Create a few test contacts to verify all features
2. **Test Analytics**: Verify charts update correctly with data
3. **Test Bulk Operations**: Select multiple contacts and delete them
4. **Test Search**: Use the search bar to find contacts
5. **Test Filters**: Filter by status (Lead/Customer)

---

## Production Deployment Considerations

For future production deployment:

1. **Environment Variables**: Use secure environment variable management
2. **Database**: Use a managed PostgreSQL service (Supabase, Neon, AWS RDS)
3. **Build**: Run `npm run build` to create optimized production build
4. **Start**: Run `npm start` to serve production build
5. **SSL/TLS**: Enable HTTPS for secure connections
6. **Authentication**: Implement authentication (Phase 2)

---

## Summary

The setup process involves:

1. ✅ Install PostgreSQL on macOS
2. ✅ Configure database credentials in `.env.local`
3. ✅ Create the `crm_db` database
4. ✅ Install npm dependencies
5. ✅ Generate Prisma client
6. ✅ Run database migrations
7. ✅ Start development server
8. ✅ Test all features

Once complete, the CRM Contact Manager will be fully functional and ready for use!
