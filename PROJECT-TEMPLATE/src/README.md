# Source Code

This directory contains your project's source code.

## Suggested Structure

For **Web Applications** (Next.js/React):
```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utility functions
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
└── styles/           # CSS/styling files
```

For **Backend APIs** (Node.js/Python):
```
src/
├── api/              # API routes/endpoints
├── services/         # Business logic
├── models/           # Data models
├── middleware/       # API middleware
├── utils/            # Utility functions
└── config/           # Configuration files
```

For **iOS/Mobile Apps**:
```
src/
├── screens/          # Screen components
├── components/       # Reusable components
├── navigation/       # Navigation logic
├── services/         # API/data services
├── hooks/            # Custom hooks
└── utils/            # Utility functions
```

## Getting Started

1. Choose appropriate structure for your project type
2. Create subdirectories as needed
3. Follow consistent naming conventions
4. Add README.md files to major directories
5. Document complex logic with comments

## Code Quality

- Write tests alongside your code
- Use TypeScript/type hints when possible
- Follow established code style (ESLint/Prettier)
- Keep functions small and focused
- Document public APIs
