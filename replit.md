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
- **Local Storage**: Browser localStorage for temporary data and user preferences
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