# Next.js Luxury Template

**Enterprise-grade Next.js starter with premium design system**

## Features

- ⚡ Next.js 15+ with App Router
- 🎨 Luxury design system with dark theme
- 🏗️ TypeScript for type safety
- 💄 Tailwind CSS with custom design tokens
- 🔄 Framer Motion animations
- 📱 Responsive design
- 🧪 Jest + Testing Library
- 📊 Bundle analyzer
- 🔒 Security headers

## Quick Start

```bash
# Clone template
cp -r /path/to/templates/nextjs-luxury-template ./new-project
cd new-project

# Install dependencies
npm install

# Start development
npm run dev
```

## Design System

### Colors
- **Primary**: Gold gradient (#f4c900 → #b68600)
- **Background**: Deep black (#000, #111, #222)
- **Text**: White (#fff)
- **Accent**: Luxury gold (#f4c900)

### Typography
- **Primary**: Serif fonts for luxury feel
- **Weights**: 400 (regular), 600 (semibold), 700 (bold)

### Components
- Rounded corners (20-30px)
- Subtle shadows and gradients
- Hover animations
- Focus states with gold accents

## Architecture

```
src/
├── app/                 # Next.js 13+ app directory
├── components/
│   ├── ui/             # Base UI components
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── lib/                # Utilities and configurations
├── styles/             # Global styles and themes
└── types/              # TypeScript definitions
```

## Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint
- `npm run test` - Jest tests
- `npm run analyze` - Bundle analysis

## Deployment

Optimized for Vercel deployment with zero configuration.