# Jade

A Next.js application built with TypeScript, shadcn/ui, and Biome for code quality.

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality (Biome)
npm run check        # Run both linting and formatting checks
npm run check:fix    # Run both linting and formatting with auto-fix
npm run lint         # Run Biome linter only
npm run lint:fix     # Run Biome linter with auto-fix
npm run format       # Format code with Biome
npm run format:check # Check formatting without changes

# Type Checking
npm run type-check   # Run TypeScript type checking
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pre-commit Hooks

This project uses Husky and lint-staged to automatically run code quality checks before commits. Files are automatically formatted and linted when you commit changes.