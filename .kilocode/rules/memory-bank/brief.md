# CRM Contact Manager - Project Overview

## Description

A lightweight, multi-user Customer Relationship Management (CRM) system designed for team collaboration in managing and tracking customer contacts, activities, tasks, and deals with real-time analytics capabilities.

## Main Objectives

- Centralize contact management for sales and support teams
- Provide instant visual insights into contact database composition
- Enable efficient contact filtering, searching, and bulk operations
- Track all interactions and activities with contacts
- Manage tasks and follow-ups with due dates and priorities
- Track sales pipeline with deal stages and values
- Establish a scalable foundation for future CRM feature expansion

## Key Features

### Dashboard

- Tabbed interface for Contacts, Companies, Deals, Tasks, and Activities analytics (5 tabs)
- Real-time analytics displaying total contacts, leads, and customers
- Visual charts showing status distribution and contact growth trends
- Quick access to recently added contacts
- Recent activities overview showing latest interactions
- Upcoming tasks widget showing tasks due today and next 5 tasks
- Quick task completion from dashboard
- Sales pipeline metrics with total value, won/lost values, and win rate
- Pipeline visualization by stage
- Recent deals overview

### Contact Management

- Comprehensive contact list with filtering and search capabilities
- Individual contact profiles with full CRUD operations
- Bulk selection and deletion with confirmation safeguards
- Status tracking (Lead/Customer)
- Activity history for each contact
- Tasks tab showing all tasks associated with contact
- Deals tab showing all deals associated with contact
- Create tasks and deals directly from contact profile

### Activity Management

- Track interactions: calls, emails, meetings, and notes
- Activity list with filtering by type and date range
- Individual activity profiles with full CRUD operations
- Activities linked to contacts with cascade deletion
- Activity pagination for large datasets

### Task Management

- Create and manage tasks with title, description, due date, and priority
- Task list with filtering by status (Open, Completed, Overdue)
- Task list with filtering by priority (Low, Medium, High)
- Search tasks by title
- Mark tasks as complete with checkbox (auto-updates completedAt)
- Visual indicators for priority (color-coded badges) and overdue status
- Task profiles with full CRUD operations
- Tasks linked to contacts with cascade deletion
- Task pagination for large datasets

### Deal Management

- Create and manage deals with name, value, stage, expected close date
- Kanban board visualization with drag-and-drop stage updates
- Deal stages: Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
- Deal list with filtering by stage, status, value range, date range, and search
- Deal profiles with full CRUD operations
- Deals linked to contacts with cascade deletion
- Deals linked to companies with cascade deletion (sets companyId to null)
- Pipeline metrics and visualization
- Visual indicators for deal value and stage

### Company Management

- Create and manage companies with name, industry, website, phone, address, employee count, and revenue
- Company list with filtering by industry and search
- Company profiles with full CRUD operations
- Company profile tabs: Information, Contacts, Deals, Activities, Tasks
- Companies linked to contacts (contacts can be assigned to companies)
- Companies linked to deals (deals can be assigned to companies)
- Cascade deletion: deleting a company sets companyId to null on related contacts and deals (not cascade delete)
- Company analytics showing top companies by deal value and companies by industry

### Data Structure

- Core contact fields: name, email, phone, status, jobTitle, companyId
- Activity fields: type, subject, description, contact reference
- Task fields: title, description, due date, priority, completed status, contact reference
- Deal fields: name, value, stage, expected/actual close date, status, probability, contact reference, companyId
- Company fields: name, industry, website, phone, address, employeeCount, revenue
- Automatic timestamps for audit trails
- Email uniqueness validation
- Phone number uniqueness validation
- Contact-Activity relationship with referential integrity
- Contact-Task relationship with referential integrity
- Contact-Deal relationship with referential integrity

## Technology Stack

- **Frontend:** Next.js (React framework)
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Data Fetching:** SWR for client-side data management
- **Drag & Drop:** @hello-pangea/dnd for Kanban board
- **Architecture:** Full-stack web application

## Current Phase

MVP + Enhanced Features + Authentication (Phases 1-4) - Complete contact, activity, task, deal, and company management with full authentication, authorization, and role-based access control (RBAC). Phase 5 (Social Login & Enhanced Security) planned for future releases.

## Significance

This CRM system addresses the need for small to medium-sized teams to efficiently manage customer relationships and sales pipeline without the complexity and cost of enterprise solutions. Its modular architecture allows for incremental feature additions while maintaining simplicity and usability.
