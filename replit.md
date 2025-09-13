# Neil McArdle Portfolio & eBook Creator

## Overview
This is a Next.js-based portfolio website and eBook creation tool featuring:
- Personal portfolio with digital business card design
- Interactive eBook maker tool with AI chat functionality (currently disabled)
- Modern UI built with React, Tailwind CSS, and Radix UI components
- Rich text editing capabilities using TipTap and React Quill
- EPUB export functionality

## Recent Changes (September 13, 2025)
- **Project Import**: Successfully imported from GitHub and configured for Replit environment
- **Security Fix**: Disabled insecure AI API endpoint that was attempting to connect to localhost:11434
- **Configuration**: Updated Next.js config for Replit with proper host settings and cache control
- **Development Setup**: Configured workflow to run on port 5000 with proper binding
- **Dependencies**: Installed all required Node.js packages

## Project Architecture
- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Text Editing**: TipTap and React Quill for rich text editing
- **File Processing**: JSZip for EPUB generation
- **Icons**: Lucide React icons

## Key Features
1. **Portfolio Page** (`/`): Digital business card with contact information and project links
2. **eBook Maker** (`/make-ebook`): Tool for creating and editing eBooks with chapters
3. **AI Chat** (disabled): Previously connected to local Ollama instance - needs secure implementation
4. **EPUB Export**: Generate downloadable EPUB files

## Configuration Notes
- Server runs on port 5000 for Replit compatibility
- Cache-Control headers disabled for development
- Cross-origin requests configured for Replit environment
- TypeScript build errors ignored for faster development

## Security Considerations
- AI functionality disabled due to insecure localhost connection
- Firebase authentication components are disabled but present in codebase
- No environment variables or secrets currently configured

## Current Status
- ✅ Development server running successfully
- ✅ Main portfolio page functional
- ✅ eBook maker tool accessible and working
- ⚠️ AI chat functionality disabled for security
- ⚠️ Firebase authentication not configured