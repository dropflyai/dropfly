# DropFly Coding Standards

## General Principles

- **Consistency**: Follow established patterns across all projects
- **Clarity**: Write code that tells a story
- **Maintainability**: Code should be easy to modify and extend
- **Performance**: Optimize for both development and runtime efficiency

## Naming Conventions

### Variables & Functions
- **camelCase** for variables and functions
- **PascalCase** for classes and components
- **SCREAMING_SNAKE_CASE** for constants
- **kebab-case** for file names and URLs

### Files & Directories
- Component files: `ComponentName.js/tsx`
- Utility files: `utility-name.js`
- Config files: `config-name.js`
- Test files: `ComponentName.test.js`

## Code Organization

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── services/      # API and external services
├── config/        # Configuration files
├── assets/        # Static assets
└── types/         # TypeScript type definitions
```

### Import Order
1. External libraries
2. Internal utilities and services
3. Components
4. Types (if TypeScript)
5. Relative imports

## Documentation Requirements

- All public functions must have JSDoc comments
- Complex algorithms require inline comments
- README.md for each major module
- API documentation for all endpoints

## Testing Standards

- Minimum 80% test coverage
- Unit tests for all utilities
- Integration tests for complex workflows
- E2E tests for critical user paths

## Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Use HTTPS for all external requests
- Follow OWASP security guidelines

## Performance Guidelines

- Lazy load components when possible
- Optimize images and assets
- Use appropriate caching strategies
- Monitor bundle sizes

## Git Workflow

- Feature branches from `main`
- Descriptive commit messages
- Pull request reviews required
- Squash and merge for clean history