# Neil McArdle Personal Website

## Overview

This is Neil McArdle's personal portfolio and creative workspace built with Next.js 14 and React. The site showcases Neil's work as a designer and developer, featuring his creative projects, a design agency (Better Things), and interactive tools like makeEbook (an eBook creation platform) and Vector Paint. The site serves both as a personal portfolio and a platform for launching creative digital tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router for modern React development
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens
- **State Management**: React hooks and context for local state management
- **Rich Text Editing**: Multiple rich text solutions including TipTap and custom editors

### Backend Architecture
- **Authentication**: Supabase Auth for user management and authentication
- **Database**: PostgreSQL via Supabase with Drizzle ORM for type-safe database operations
- **File Storage**: Supabase Storage for user-generated content and assets
- **API Layer**: Next.js API routes for server-side functionality

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Supabase
- **ORM**: Drizzle ORM with TypeScript for database schema management
- **Cloud Storage**: makeEbook uses PostgreSQL for persistent eBook storage with 10-second autosave
- **Migration System**: Automatic one-time migration from localStorage to cloud on first authenticated login
- **File Storage**: Supabase Storage for images, documents, and generated eBooks

### Authentication and Authorization
- **Provider**: Supabase Auth with email/password authentication
- **Session Management**: Server-side session handling with Supabase SSR
- **Protected Routes**: Custom ProtectedRoute component for authentication gating
- **User Context**: React Context for global authentication state management

## External Dependencies

### Core Services
- **Supabase**: Backend-as-a-Service providing authentication, database, and storage
- **Vercel**: Deployment platform for Next.js applications
- **Stripe**: Payment processing for future premium features (integrated but not active)

### UI and Design Libraries
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Shadcn/ui**: Pre-built component library based on Radix UI

### Rich Text and Content Creation
- **TipTap**: Modern rich text editor for content creation
- **TinyMCE**: Alternative rich text editor (configured but may not be actively used)
- **Draft.js**: Rich text editor framework (legacy, may be phased out)

### Development and Build Tools
- **TypeScript**: Type safety throughout the application
- **ESLint**: Code linting and formatting
- **Drizzle Kit**: Database migration and schema management tools
- **Next.js**: React framework with built-in optimization and deployment features

### Additional Integrations
- **Google Fonts**: Inter and Playfair Display fonts for typography
- **Social Media Embeds**: Custom Twitter/X post embedding functionality
- **EPUB Export**: Custom eBook generation and export functionality

## makeEbook Feature Implementation

### Cloud Storage System (October 2025)
The makeEbook tool has been upgraded with a production-ready cloud storage system to replace localStorage and prevent data loss:

**Key Features:**
- **Cloud Persistence**: All books automatically saved to PostgreSQL database via Supabase
- **10-Second Autosave**: Debounced autosave with visible status indicator (Saved/Saving/Unsaved)
- **Authentication-Gated**: Cloud operations only execute when user is authenticated (prevents 401 errors)
- **Automatic Migration**: One-time migration from localStorage to cloud on first authenticated login
  - Reads both legacy storage keys (`makeebook_library` and `ebookLibrary`)
  - Deduplicates books by title, author, and content
  - Only marks migration complete on 100% success (allows retry on failures)
  - Clears localStorage after successful migration

**Database Schema:**
The `ebooks` table includes:
- Basic metadata: title, author, blurb, cover_url, publisher, pub_date, isbn, language, genre
- Content: chapters (JSON array), tags (JSON array)
- Academic features: endnotes, endnote_references (JSON arrays)
- Tracking: created_at, updated_at timestamps
- Foreign key relationship to users table

**API Routes:**
- `GET /api/books` - Fetch all books for authenticated user
- `POST /api/books` - Create new book
- `PUT /api/books/[id]` - Update existing book
- `DELETE /api/books/[id]` - Delete book

**Known Limitations:**
- Foreign key constraint requires user record to exist in local database (auth callback issue)
- Migration retry after partial failure may create duplicate cloud books (idempotency improvement planned)