# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Dokploy templates repository that provides a web interface for browsing and managing Docker Compose templates (blueprints). The repository contains:
- **Frontend**: Next.js 15 application with TypeScript
- **Blueprints**: Docker Compose templates with configuration files
- **Metadata**: Centralized `meta.json` file with template information
- **Build scripts**: Node.js utilities for processing metadata

## Repository Structure

```
othcloud-templates/
├── app/                          # Next.js app directory (App Router)
│   ├── layout.tsx               # Root layout with theme provider
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── src/                          # Source code
│   ├── components/              # React components (Navigation, Search, TemplateGrid, etc.)
│   ├── store/                   # Zustand state management
│   └── lib/                     # Utilities
├── public/                       # Static files
│   ├── blueprints/              # Copy of all blueprint folders
│   ├── meta.json                # Copy of metadata (served publicly)
│   └── logo.svg                 # Logo files
├── blueprints/                   # Docker Compose templates (source)
│   └── {template-id}/           # Each blueprint folder (e.g., ackee, adminer)
│       ├── docker-compose.yml   # Required: Docker Compose configuration
│       ├── template.toml        # Required: Template configuration
│       └── logo.{png,svg}       # Required: Template logo
├── build-scripts/
│   └── process-meta.js          # Production metadata processor
├── package.json                 # Dependencies and scripts
├── next.config.js               # Next.js configuration
├── nixpacks.toml                # Nixpacks build configuration
├── server.js                    # Custom Next.js server
├── meta.json                    # Central metadata for all templates
└── dedupe-and-sort-meta.js      # Utility to clean and sort meta.json
```

## Development Commands

### Frontend (Next.js)

```bash
# Install dependencies (from root directory)
npm install --legacy-peer-deps

# Run development server (starts on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Metadata Processing

```bash
# Clean and sort meta.json (removes duplicates, sorts alphabetically)
node dedupe-and-sort-meta.js

# Create backup before processing
node dedupe-and-sort-meta.js --backup

# Production metadata processor (CI/CD)
node build-scripts/process-meta.js

# Verbose output
node build-scripts/process-meta.js --verbose

# Custom input/output
node build-scripts/process-meta.js --input meta.json --output dist/meta.json
```

## Key Architecture Patterns

### State Management (Zustand)

The app uses Zustand for state management with persistence middleware (app/src/store/index.ts:37-70). Only the `view` preference persists to localStorage. State includes:
- `templates`: All available templates
- `filteredTemplates`: Search/filter results
- `selectedTags`: Active filter tags
- `searchQuery`: Current search text
- `view`: Display mode ("grid" | "rows")

### Template Data Flow

1. **Build time**: `blueprints/*` and `meta.json` are copied to `public/` directory
2. **Runtime**: App fetches `/meta.json` from public folder to populate template list
3. **User selection**: Fetches individual `/blueprints/{id}/docker-compose.yml` and `template.toml` files dynamically
4. **Display**: Shows templates in TemplateDialog with syntax-highlighted code editors

### Deployment

This project is configured for **Nixpacks** deployment:

**Dokploy/Railway/Render Settings:**
- **Build Command**: Automatically detected (npm install --legacy-peer-deps && npm run build)
- **Start Command**: npm start
- **Port**: 3000
- **Node Version**: 20 (specified in nixpacks.toml)

No build path configuration needed - Nixpacks will detect the project from the root directory.

### Client Components

All interactive components use `"use client"` directive for Next.js App Router:
- TemplateGrid, Navigation, Search, TemplateDialog
- SelectedTags, ModeToggle
- Zustand store (app/src/store/index.ts:1)

### Blueprint Structure Requirements

Each blueprint folder MUST contain (validated in .github/workflows/validate.yml:19-50):
- `docker-compose.yml`: Docker Compose configuration
- `template.toml`: Template configuration with structure:
  ```toml
  [variables]
  # Variables with ${password:16} syntax for auto-generation

  [config]
  [[config.domains]]  # Array of domain configurations
  serviceName = "service-name"
  port = 3000
  host = "${domain}"

  [config.env]  # Environment variables
  ```
- Logo file (referenced in meta.json)

### Meta.json Schema

Each template entry requires (validated in .github/workflows/validate.yml:88-116):
- `id`: Unique identifier (must match blueprint folder name)
- `name`: Display name
- `version`: Template version
- `description`: Template description
- `logo`: Relative path to logo file
- `links`: Object with `github`, `website`, `docs` URLs
- `tags`: Non-empty array of category tags

The meta.json file is sorted alphabetically by ID and deduplicated.

## Adding New Templates

1. Create new folder in `blueprints/{template-id}/`
2. Add required files:
   - `docker-compose.yml`
   - `template.toml`
   - Logo file (PNG or SVG)
3. Add entry to `meta.json` with all required fields
4. Run `node dedupe-and-sort-meta.js` to validate and sort
5. Validation workflow will run on PR to check structure

## CI/CD Workflows

- **validate.yml**: Validates blueprint folder structure, meta.json schema, and file existence
- **build-preview.yml**: Builds preview deployments
- **cloudflare-pages-production.yml**: Production deployment to Cloudflare Pages

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS 4, shadcn/ui patterns
- **Code Editor**: CodeMirror 6 with YAML/JSON/TOML syntax highlighting
- **State**: Zustand with persistence (localStorage)
- **Build**: Next.js App Router with standalone output
- **Static Files**: Blueprints and meta.json served from public/ directory
