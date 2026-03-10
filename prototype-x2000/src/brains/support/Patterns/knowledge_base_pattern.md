# Pattern: Knowledge Base Build or Overhaul

## Context

This pattern applies when an organization needs to build a new knowledge base from
scratch, overhaul an existing one that is outdated or underperforming, or significantly
expand KB coverage to improve self-service deflection. It applies regardless of whether
the KB is customer-facing, internal (agent-facing), or both.

---

## Problem

The knowledge base is not serving its purpose: deflection rate is low (<30%), search
success rate is poor (<50%), article helpfulness is below target (<60%), agents do not
trust the KB, customers cannot find answers, and ticket volume remains high for issues
that should be self-serviceable.

---

## Solution: The KB Transformation Framework

A systematic, data-driven approach to building or rebuilding a knowledge base that
actually deflects tickets and helps customers.

```
PHASE 1: AUDIT (what exists and what is missing)
PHASE 2: ARCHITECTURE (organize for findability)
PHASE 3: CONTENT SPRINT (create high-impact articles first)
PHASE 4: OPTIMIZE (improve search, readability, visuals)
PHASE 5: GOVERN (maintain freshness and accuracy)
```

---

## Implementation

### Phase 1: Audit (Week 1-2)

```
CONTENT INVENTORY:
  List all existing articles with:
    - Title
    - Category
    - Last updated date
    - Views (last 90 days)
    - Helpfulness rating
    - Freshness status (current / outdated / unknown)

TICKET ANALYSIS:
  Pull top 50 ticket categories by volume
  For each: Does a KB article exist?
    - YES, current → Green
    - YES, outdated → Yellow (needs update)
    - NO → Red (gap; needs creation)

SEARCH ANALYSIS:
  Pull top 50 search queries
  For each: Does search return a relevant result?
    - YES, clicked → Green
    - YES, not clicked → Yellow (relevance or title issue)
    - NO results → Red (gap)

GAP MATRIX:
  Combine ticket analysis + search analysis
  Prioritize by: volume * gap status
  Output: Ranked list of articles to create or update

AUDIT METRICS:
  Total articles:              [N]
  Articles current (<90 days): [N] ([%])
  Articles outdated:           [N] ([%])
  KB coverage (top 50 topics): [%]
  Zero-result search rate:     [%]
  Average helpfulness:         [%]
```

### Phase 2: Architecture (Week 2-3)

```
INFORMATION ARCHITECTURE DESIGN:

  Step 1: Define top-level categories (5-8 max)
    Based on customer goals, NOT product structure
    Example: Getting Started, Using [Product], Account & Billing,
             Integrations, Troubleshooting, API & Developers

  Step 2: Define sections within each category (3-8 per category)
    Group related articles that customers would browse together

  Step 3: Define article types and templates
    How-To, Troubleshooting, Conceptual, Reference, FAQ

  Step 4: Define metadata schema
    Category, subcategory, tags, product version, last verified date,
    applies to (plan/platform), related articles

  Step 5: Define URL structure
    /help/[category]/[section]/[article-slug]
    SEO-friendly, human-readable
```

### Phase 3: Content Sprint (Week 3-8)

```
SPRINT STRUCTURE:

  Week 3-4: TOP 20 ARTICLES (highest volume gaps)
    - 2 writers, 10 articles each
    - Focus on accuracy and completeness
    - Screenshots for every UI step
    - Peer review before publish

  Week 4-5: NEXT 20 ARTICLES (medium volume gaps)
    - Same sprint structure
    - Include troubleshooting guides for top error messages

  Week 5-6: ARTICLE UPDATES (outdated existing articles)
    - Update top 20 outdated articles
    - Verify steps against current product
    - Update screenshots
    - Refresh metadata

  Week 6-8: REMAINING GAPS + POLISH
    - Fill remaining gaps from audit
    - Cross-link all articles
    - Add "related articles" to every page
    - Review and improve lowest-rated existing articles

WRITING STANDARDS (per article):
  - Flesch-Kincaid grade level < 8
  - Action-oriented title
  - Clear prerequisites
  - Numbered steps for procedural content
  - Expected result after each major step
  - Troubleshooting section
  - Screenshots annotated with highlights/arrows
  - Tested by someone other than the author
```

### Phase 4: Optimize (Week 8-10)

```
SEARCH OPTIMIZATION:
  - Implement semantic search (if available)
  - Add synonym mappings for common misspellings and variations
  - Configure autocomplete with popular queries
  - Test top 20 queries and verify relevant results appear

READABILITY OPTIMIZATION:
  - Run all articles through readability scorer
  - Rewrite articles above grade 8 reading level
  - Add visual elements (diagrams, screenshots) to text-heavy articles
  - Break long articles into series

NAVIGATION OPTIMIZATION:
  - Implement breadcrumb navigation
  - Add "Was this helpful?" to every article
  - Add "Contact support" escape hatch to every article
  - Test mobile readability (most KB traffic is mobile)
  - Implement in-product contextual help links

ANALYTICS SETUP:
  - Configure article view tracking
  - Configure search query tracking
  - Configure helpfulness rating tracking
  - Set up dashboards for ongoing monitoring
  - Configure automated freshness alerts
```

### Phase 5: Govern (Ongoing)

```
MONTHLY GOVERNANCE:

  Week 1: Review top 20 articles by views (still current?)
  Week 2: Review zero-result searches (create missing content)
  Week 3: Review lowest-rated articles (improve or remove)
  Week 4: Review aging articles (>90 days without update)

KCS INTEGRATION:
  - Train all agents on KCS methodology
  - Agents create/update articles during ticket resolution
  - KB Manager reviews agent-contributed articles weekly
  - Measure KCS participation rate (target: >80% of agents/month)

PRODUCT RELEASE PROCESS:
  - KB team notified 2 weeks before every product release
  - Articles created/updated before release goes live
  - Release notes published simultaneously
  - Post-release: Monitor for new ticket patterns not covered

FRESHNESS SCORING:
  - Automated scoring (age, product changes, usage, helpfulness)
  - Monthly freshness report to KB Manager
  - Red articles addressed within 1 week
  - Target: >70% of articles Green at all times
```

---

## Metrics

| Metric | Baseline (Pre-Project) | Target (3-month) | Target (6-month) |
|--------|----------------------|-------------------|-------------------|
| Total articles | [N] | +50-100% | +100-200% |
| KB coverage (top 50) | [%] | >80% | >90% |
| Deflection rate | [%] | +10-15pp | +20-25pp |
| Search success rate | [%] | >60% | >70% |
| Zero-result rate | [%] | <15% | <10% |
| Avg helpfulness | [%] | >60% | >70% |
| Freshness (% Green) | [%] | >60% | >70% |
| Contact rate | [tickets/user] | -15% | -25% |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| **Write everything then launch** | 3-month project before customers see any value |
| **Organize by product architecture** | Customers think in goals, not features |
| **No search optimization** | If search fails, KB fails (80% of KB visits start with search) |
| **Write once, never update** | Outdated articles erode all trust in the KB |
| **Assign KB to one person** | Creates bottleneck; KCS makes everyone a contributor |
| **No analytics** | Cannot improve what you cannot measure |
| **Marketing language in KB** | Customers want help, not sales pitch |

---

## Resource Requirements

```
TEAM:
  KB Manager:     1 (full-time for duration; ongoing part-time after)
  Content Writers: 1-2 (during sprint phases)
  SMEs:           Access to product experts for accuracy review
  Designer:       Part-time (screenshots, diagrams, help center styling)

TOOLS:
  KB Platform:    Zendesk Guide, Intercom Articles, Document360, or similar
  Analytics:      Built-in + supplementary (GA, Looker)
  Screenshot:     CleanShot, Snagit, or similar
  Readability:    Hemingway App, readable.com
  Search:         Platform search + Algolia or similar (if advanced)

TIMELINE:
  MVP (top 20 articles):  4 weeks
  Full build:             8-10 weeks
  Ongoing governance:     ~10 hours/week (KB Manager)
```

---

**This pattern is authoritative for knowledge base projects within the Support Brain.**
