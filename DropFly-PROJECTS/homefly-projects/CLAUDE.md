# HomeFly Project Suite

## Overview
HomeFly is a comprehensive property management ecosystem consisting of TWO COMPLETELY SEPARATE applications built on the same technical framework but serving different markets.

## Project Structure

### 1. Apartment Management System
**Location**: `./apartment-management/`
**Purpose**: Luxury apartment leasing and tenant management
**Target Market**: Property managers, leasing agents, apartment residents
**Key Features**: AI verification, lease generation, rent collection, maintenance
**Port**: 3020
**Domain**: apartment-management.vercel.app

### 2. HOA Management System  
**Location**: `./hoa-management/`
**Purpose**: HOA community social networking and governance
**Target Market**: HOA communities, homeowners, renters
**Key Features**: Social feed, voting, governance, community engagement
**Port**: 3025
**Domain**: hoa-management.vercel.app

## CRITICAL SYSTEM ISOLATION RULES

### 🚨 ABSOLUTE SEPARATION REQUIREMENTS
1. **NO CROSS-NAVIGATION**: Admin buttons in one system NEVER link to the other
2. **NO SHARED COMPONENTS**: Each system has its own isolated component library
3. **NO SHARED DATA**: Completely separate databases and data schemas
4. **NO SHARED ROUTES**: Independent routing systems with no cross-references
5. **NO SHARED AUTHENTICATION**: Separate user systems and login flows

### Development Workflow
- **Work on ONE system at a time**
- **Never make changes that affect both systems**
- **Test isolation after every change**
- **Deploy systems independently**
- **Maintain separate documentation**

## Quick Start Commands

### Apartment Management System
```bash
cd apartment-management
npm install
PORT=3020 npm run dev
# Access at: http://localhost:3020
```

### HOA Management System  
```bash
cd hoa-management
npm install
PORT=3025 npm run dev
# Access at: http://localhost:3025
```

## Shared Technical Framework
While the systems are completely isolated in functionality, they share:
- **Next.js 14**: React framework
- **Supabase**: Database and authentication
- **Tailwind CSS**: Styling framework
- **TypeScript**: Type safety
- **Stripe**: Payment processing
- **Vercel**: Deployment platform

## Project Management
- **Each system has its own CLAUDE.md** with specific instructions
- **Changes are tracked separately** for each system
- **Testing is done in isolation** for each system
- **Deployments are independent** with separate domains

## Success Criteria
✅ **Complete Isolation**: No cross-contamination between systems
✅ **Independent Operation**: Each system works without the other
✅ **Separate Deployments**: Different domains and environments
✅ **Clear Branding**: Distinct visual identity for each system
✅ **Isolated Navigation**: No accidental cross-system routing

## Migration Status
- 🔄 **In Progress**: Separating mixed codebase into isolated systems
- ⏳ **Pending**: Remove cross-system dependencies
- ⏳ **Pending**: Set up independent deployments
- ⏳ **Pending**: Test complete isolation