# Critical Implementation Patterns & Standards

## 🚨 MANDATORY: REDUNDANCY PREVENTION PROTOCOL

### Before Writing ANY Code - Check ALL Logs

**🔴 STOP - Check these files FIRST to prevent redundant work:**

1. **CHECK `.troubleshoot/`** → Has this exact problem been solved before?
2. **CHECK `.progress/`** → Has this task already been completed?
3. **CHECK `.logs/`** → What was tried in previous sessions?
4. **CHECK `.research/`** → Has this information already been gathered?
5. **CHECK `IMPLEMENTATION-PATTERNS.md`** → Is there an existing pattern?
6. **CHECK `SESSION-MEMORY.md`** → What's the current state and blockers?

**⚠️ NEVER repeat work that's already been done - always check logs first**

### Log Check Template
```markdown
## Pre-Implementation Check: [TASK_NAME]

### Redundancy Check Results:
- [ ] `.troubleshoot/` checked → [Found: issue-XXX.md with similar solution / Nothing found]
- [ ] `.progress/` checked → [Found: already completed on YYYY-MM-DD / Not done]
- [ ] `.logs/` checked → [Found: attempted in session YYYY-MM-DD / No previous attempts]
- [ ] `.research/` checked → [Found: research-XXX.md with needed info / Need to research]
- [ ] `IMPLEMENTATION-PATTERNS.md` checked → [Found: pattern on line XXX / No existing pattern]
- [ ] `SESSION-MEMORY.md` checked → [Current state: XXX / No conflicts]

### Decision:
- [x] Safe to proceed - no redundancy found
- [ ] STOP - work already completed (reference: [file])
- [ ] STOP - solution already exists (reference: [file])
- [ ] MODIFY approach based on previous findings
```

## API DESIGN STANDARDS

### RESTful API Conventions
```
GET    /api/v1/users          # List with pagination
GET    /api/v1/users/{id}     # Single resource
POST   /api/v1/users          # Create
PUT    /api/v1/users/{id}     # Full update
PATCH  /api/v1/users/{id}     # Partial update
DELETE /api/v1/users/{id}     # Delete

# Filtering, Sorting, Pagination
GET /api/v1/users?status=active&sort=-created_at&page=2&limit=20
```

### GraphQL Schema Design
```graphql
type User {
  id: ID!
  email: String!
  profile: UserProfile!
  posts: PostConnection!
}

type Query {
  user(id: ID!): User
  users(filter: UserFilter, pagination: PaginationInput): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
}
```

### API Versioning Strategy
- URL versioning: `/api/v1/`, `/api/v2/`
- Header versioning: `Accept: application/vnd.api+json;version=1`
- GraphQL: Schema evolution with @deprecated directive
- Sunset headers for deprecation notices

## ERROR HANDLING PATTERNS

### Standardized Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly error message",
    "details": {
      "field": "email",
      "reason": "Invalid format"
    },
    "trace_id": "abc123",
    "documentation_url": "https://docs.api.com/errors/VALIDATION_ERROR"
  }
}
```

### Error Recovery Strategies
- **Exponential Backoff**: 1s, 2s, 4s, 8s, 16s, 32s
- **Circuit Breaker States**: Closed → Open → Half-Open
- **Retry Budgets**: Max 3 retries with jitter
- **Graceful Degradation**: Fallback to cached data
- **Dead Letter Queues**: Failed message handling

## DATABASE PATTERNS

### Migration Strategy
```sql
-- Migration: 001_create_users_table.up.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: 001_create_users_table.down.sql
DROP TABLE users;
```

### Database Connection Pooling
```javascript
// Optimal pool configuration
{
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
}
```

### Query Optimization Checklist
- [ ] Proper indexing on WHERE, JOIN, ORDER BY columns
- [ ] EXPLAIN ANALYZE for slow queries
- [ ] Avoid N+1 queries with eager loading
- [ ] Use database views for complex queries
- [ ] Implement query result caching
- [ ] Partition large tables by date/region

## STATE MANAGEMENT PATTERNS

### Frontend State Architecture
```typescript
// Global State (Redux/Zustand)
- User authentication
- Application settings
- Cached API responses

// Server State (React Query/SWR)
- API data fetching
- Optimistic updates
- Background refetching

// Local State (useState/useReducer)
- Form inputs
- UI toggles
- Component-specific data

// URL State (React Router)
- Navigation
- Filters and sorting
- Pagination
```

### WebSocket/Real-time Patterns
```javascript
// Connection management
- Automatic reconnection with exponential backoff
- Heartbeat/ping-pong for connection health
- Message queuing during disconnection
- Presence system for user status
- Room-based subscriptions for scalability
```

## LOGGING STANDARDS

### Structured Logging Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "payment-service",
  "trace_id": "abc123",
  "span_id": "def456",
  "user_id": "user_789",
  "message": "Payment processing failed",
  "error": {
    "type": "PaymentGatewayError",
    "message": "Insufficient funds",
    "stack_trace": "..."
  },
  "metadata": {
    "amount": 99.99,
    "currency": "USD",
    "payment_method": "card"
  }
}
```

### Log Levels & When to Use
- **FATAL**: System is unusable, immediate attention required
- **ERROR**: Error events but application continues
- **WARN**: Potentially harmful situations
- **INFO**: Informational messages (default production level)
- **DEBUG**: Debug-level messages (development only)
- **TRACE**: Finest-grained information (verbose debugging)

## TESTING STRATEGIES

### Testing Pyramid
```
         /\        E2E Tests (5%)
        /  \       - Critical user journeys
       /    \      - Cross-browser testing
      /      \     
     /________\    Integration Tests (15%)
    /          \   - API contract tests
   /            \  - Database integration
  /              \ 
 /________________\ Unit Tests (80%)
                    - Business logic
                    - Pure functions
                    - Component rendering
```

### Test Data Management
```javascript
// Test Fixtures
factories/
  ├── user.factory.js
  ├── product.factory.js
  └── order.factory.js

// Seed Data
seeds/
  ├── development.seed.js
  ├── test.seed.js
  └── staging.seed.js

// Test Databases
- Isolated test database per test suite
- Transaction rollback after each test
- In-memory databases for speed
```

## RELEASE MANAGEMENT

### Semantic Versioning
```
MAJOR.MINOR.PATCH

1.0.0 → 2.0.0 (Breaking change)
1.0.0 → 1.1.0 (New feature, backwards compatible)
1.0.0 → 1.0.1 (Bug fix)

Pre-release: 2.0.0-alpha.1, 2.0.0-beta.1, 2.0.0-rc.1
```

### Feature Flags Configuration
```json
{
  "features": {
    "new_checkout_flow": {
      "enabled": false,
      "rollout_percentage": 0,
      "whitelist_users": ["user_123", "user_456"],
      "blacklist_users": [],
      "environments": ["staging", "production"]
    }
  }
}
```

### Deployment Strategies
- **Blue-Green**: Zero-downtime deployment with instant rollback
- **Canary**: Gradual rollout (1% → 5% → 25% → 50% → 100%)
- **Rolling**: Sequential update of instances
- **Shadow**: Deploy alongside production for testing

## PERFORMANCE OPTIMIZATION

### Frontend Performance Checklist
- [ ] Code splitting and lazy loading
- [ ] Image optimization (WebP, AVIF, responsive images)
- [ ] Critical CSS inlining
- [ ] Resource hints (preconnect, prefetch, preload)
- [ ] Service Worker for offline support
- [ ] Bundle size analysis and tree shaking
- [ ] Virtual scrolling for large lists
- [ ] Debounce/throttle expensive operations
- [ ] Web Workers for CPU-intensive tasks

### Backend Performance Checklist
- [ ] Database query optimization
- [ ] Redis caching strategy
- [ ] CDN for static assets
- [ ] Compression (gzip, brotli)
- [ ] Connection pooling
- [ ] Async/await over callbacks
- [ ] Stream processing for large data
- [ ] Rate limiting and throttling
- [ ] Horizontal scaling readiness

## SECURITY IMPLEMENTATION

### Authentication Flow
```
1. User submits credentials
2. Server validates credentials
3. Generate JWT with short expiry (15 min)
4. Generate refresh token with long expiry (7 days)
5. Store refresh token in httpOnly cookie
6. Return access token in response body
7. Client stores access token in memory (not localStorage)
8. Client includes token in Authorization header
9. Auto-refresh before expiry using refresh token
```

### Input Validation & Sanitization
```javascript
// Validation schema example (Zod/Joi)
const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  age: z.number().int().min(13).max(120),
  bio: z.string().max(500).transform(sanitizeHtml)
});
```

## COST OPTIMIZATION

### Cloud Cost Management
- **Right-sizing**: Monitor and adjust instance types
- **Reserved Instances**: 1-3 year commitments for savings
- **Spot Instances**: For fault-tolerant workloads
- **Auto-scaling**: Scale down during low traffic
- **Storage Tiering**: S3 Intelligent-Tiering
- **CDN Caching**: Reduce origin bandwidth
- **Database Optimization**: Proper indexing reduces compute
- **Serverless**: Pay-per-execution for variable workloads
- **Cost Alerts**: Budget thresholds and anomaly detection

### Resource Optimization
```yaml
# Kubernetes resource limits
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## INCIDENT RESPONSE

### Incident Severity Levels
- **SEV1**: Complete outage, data loss risk (15 min response)
- **SEV2**: Major feature broken, significant degradation (30 min response)
- **SEV3**: Minor feature broken, workaround available (2 hour response)
- **SEV4**: Cosmetic issue, minimal impact (next business day)

### Incident Response Checklist
1. **Detect**: Alert triggered or reported
2. **Assess**: Determine severity and impact
3. **Communicate**: Notify stakeholders and status page
4. **Mitigate**: Stop the bleeding (rollback, scale, redirect)
5. **Investigate**: Root cause analysis
6. **Resolve**: Implement permanent fix
7. **Document**: Blameless postmortem
8. **Improve**: Action items to prevent recurrence

## DOCUMENTATION STANDARDS

### Code Documentation
```javascript
/**
 * Process payment for an order
 * @param {string} orderId - Unique order identifier
 * @param {PaymentMethod} method - Payment method details
 * @returns {Promise<PaymentResult>} Payment confirmation
 * @throws {PaymentError} If payment fails
 * @example
 * const result = await processPayment('order_123', {
 *   type: 'card',
 *   token: 'tok_visa'
 * });
 */
```

### API Documentation (OpenAPI)
```yaml
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

## ACCESSIBILITY STANDARDS

### WCAG 2.1 AA Checklist
- [ ] Keyboard navigation for all interactive elements
- [ ] Focus indicators visible
- [ ] ARIA labels for screen readers
- [ ] Color contrast ratio ≥4.5:1 for normal text
- [ ] Color contrast ratio ≥3:1 for large text
- [ ] Alt text for images
- [ ] Semantic HTML structure
- [ ] Skip navigation links
- [ ] Form validation with clear error messages
- [ ] Responsive text sizing (rem/em units)

## MOBILE DEVELOPMENT

### React Native Performance
- [ ] Use FlatList for long lists
- [ ] Implement InteractionManager for heavy operations
- [ ] Optimize images with FastImage
- [ ] Minimize bridge calls
- [ ] Use Hermes engine on Android
- [ ] Enable ProGuard for production builds
- [ ] Implement code push for OTA updates
- [ ] Monitor with Flipper during development

### Progressive Web App Requirements
- [ ] Service Worker for offline functionality
- [ ] Web App Manifest for installability
- [ ] HTTPS required
- [ ] Responsive viewport meta tag
- [ ] App shell architecture
- [ ] Push notifications support
- [ ] Background sync for offline actions
- [ ] Add to Home Screen prompt

## DATA PRIVACY & COMPLIANCE

### GDPR Implementation
```javascript
// Consent management
{
  necessary: true,          // Cannot be disabled
  analytics: false,         // User choice
  marketing: false,         // User choice
  preferences: true,        // User choice
  consent_date: "2024-01-15T10:00:00Z",
  consent_version: "1.2.0"
}

// Data export format
{
  user_data: {...},
  activity_logs: [...],
  uploaded_files: [...],
  generated_on: "2024-01-15T10:00:00Z",
  format_version: "1.0.0"
}
```

### Data Retention Policy
- User accounts: 3 years after last activity
- Transaction logs: 7 years (financial compliance)
- Session data: 30 days
- Error logs: 90 days
- Analytics data: 2 years
- Backup retention: 90 days
- Deleted data: 30-day soft delete period

## CRITICAL SUCCESS FACTORS

### Must-Have Before Launch
1. **SSL/TLS certificate** installed and configured
2. **Backup strategy** tested and automated
3. **Monitoring** for uptime, errors, performance
4. **Rate limiting** on all public endpoints
5. **DDOS protection** via CloudFlare or similar
6. **Legal documents** (Terms, Privacy, Cookies)
7. **Error tracking** (Sentry or similar)
8. **Analytics** (Google Analytics, Mixpanel)
9. **Customer support** channel established
10. **Incident response** plan documented

### Red Flags to Avoid
- ❌ Storing passwords in plain text
- ❌ Exposing API keys in frontend code
- ❌ Missing CORS configuration
- ❌ No rate limiting on authentication
- ❌ Direct database access from frontend
- ❌ Unvalidated user input
- ❌ Missing database backups
- ❌ No error handling in production
- ❌ Synchronous long-running operations
- ❌ Hardcoded configuration values