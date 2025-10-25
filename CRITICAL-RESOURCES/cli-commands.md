# CLI COMMANDS REFERENCE
> 💻 CRITICAL: Save all working commands immediately

## Project Setup Commands
```bash
# Initial setup
npm install
npm run dev

# Environment setup
cp .env.example .env.local
```

## Development Commands
```bash
# Start development servers
npm run dev           # Default Next.js dev
PORT=3011 npm run dev # HomeFly on port 3011
PORT=3020 npm run dev # Apartment on port 3020

# Build commands
npm run build
npm run start

# Type checking & Linting
npm run type-check
npm run lint
npm run lint:fix
```

## Git Commands
```bash
# Status and changes
git status
git diff
git log --oneline -10

# Committing
git add .
git commit -m "message"
git push origin main

# Branching
git checkout -b feature/name
git merge main
```

## Database Commands
```bash
# Supabase
supabase start
supabase stop
supabase db reset
supabase migration new [name]
supabase migration up

# Prisma (if used)
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

## Deployment Commands
```bash
# Vercel
vercel
vercel --prod
vercel env pull

# Build checks before deploy
npm run build && npm run type-check && npm run lint
```

## Debugging Commands
```bash
# Port checking
lsof -i :3000
kill -9 [PID]

# Process monitoring
ps aux | grep node
top

# Network testing
curl -I http://localhost:3000
ping [domain]
```

## Package Management
```bash
# Install packages
npm install [package]
npm install -D [dev-package]

# Update packages
npm update
npm outdated
npm audit fix

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Testing Commands
```bash
# Run tests
npm test
npm run test:watch
npm run test:coverage

# E2E tests
npm run test:e2e
npm run cypress:open
```

## File Operations
```bash
# Search files
find . -name "*.tsx" | grep -v node_modules
grep -r "pattern" --exclude-dir=node_modules

# File watching
watch -n 2 'ls -la'
tail -f [logfile]
```

## System Commands
```bash
# Memory and disk
df -h
du -sh *
free -h

# Environment variables
printenv | grep NODE
export NODE_ENV=development
```

---
Last Updated: [Auto-update when modified]