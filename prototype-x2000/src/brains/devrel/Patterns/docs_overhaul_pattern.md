# Documentation Overhaul Pattern

## Pattern Summary

A comprehensive playbook for redesigning or significantly improving a documentation site. Documentation overhauls are high-impact, high-effort projects that transform developer experience when done well. This pattern covers the complete lifecycle: auditing the current state, designing the new information architecture, migrating and creating content, testing, launching, and measuring the impact. Based on the Diataxis documentation framework.

---

## 1. Prerequisites

Before starting this pattern, confirm the following:

- [ ] Executive sponsor has approved the project scope and timeline
- [ ] Current documentation site has analytics enabled (or can be enabled quickly)
- [ ] API specification (OpenAPI/Swagger) exists and is reasonably current
- [ ] Engineering team is available for technical review
- [ ] Budget for documentation platform (if changing) is approved
- [ ] At least one dedicated technical writer is assigned

---

## 2. Team Requirements

| Role | Responsibility | Time Commitment |
|------|---------------|----------------|
| Technical Writer (Lead) | Architecture, content creation, migration | 80% for 12 weeks |
| Technical Writer (Support) | Content creation, editing, testing | 60% for 8 weeks |
| Developer Advocate | Code examples, tutorials, user testing | 40% for 10 weeks |
| Frontend Engineer | Docs site implementation, search, deployment | 40% for 6 weeks |
| DevRel Lead | Stakeholder management, prioritization | 20% for 12 weeks |

---

## 3. Timeline

### Phase 1: Audit (Weeks 1-3)

**Week 1: Quantitative Audit**
- [ ] Export analytics for all documentation pages (last 6 months)
- [ ] Identify top 20 most-visited pages
- [ ] Identify pages with highest bounce rate (> 70%)
- [ ] Identify search queries with no results (content gaps)
- [ ] Count total pages by type (tutorial, guide, reference, concept)
- [ ] Identify pages not updated in > 6 months (stale content)
- [ ] Catalog all code examples and note their languages

**Week 2: Qualitative Audit**
- [ ] Conduct 5 developer friction logs (fresh-eyes tests)
- [ ] Interview 5 developers about documentation pain points
- [ ] Review last 3 months of support tickets for documentation-related issues
- [ ] Review community questions that could have been answered by docs
- [ ] Classify every existing page into Diataxis quadrant (tutorial, how-to, reference, explanation)
- [ ] Identify pages that mix Diataxis types (common root cause of confusion)

**Week 3: Audit Report**
- [ ] Compile quantitative + qualitative findings
- [ ] Identify top 10 documentation pain points
- [ ] Propose new information architecture
- [ ] Estimate effort for each improvement
- [ ] Present audit report to stakeholders
- [ ] Get approval on scope and priorities

### Phase 2: Architecture (Weeks 4-5)

**Week 4: Information Architecture Design**
- [ ] Design new site navigation (top-level categories)
- [ ] Create page-level sitemap (every page mapped to Diataxis quadrant)
- [ ] Define URL structure (clean, predictable, versionable)
- [ ] Design redirect map (old URLs → new URLs, no broken links)
- [ ] Select documentation platform (Docusaurus, Nextra, MkDocs, Mintlify)
- [ ] Define code example requirements (languages, testing strategy)

**Week 5: Content Plan**
- [ ] Categorize all existing pages: Keep, Rewrite, Merge, Delete
- [ ] Identify new content to create (fill Diataxis gaps)
- [ ] Prioritize content by traffic × impact
- [ ] Assign content to writers with deadlines
- [ ] Create templates for each Diataxis type
- [ ] Define style guide (tone, terminology, code formatting)

### Phase 3: Content Creation (Weeks 6-10)

**Week 6-7: Core Content**
- [ ] Rewrite quickstart (the single most important page)
- [ ] Create getting-started tutorial series (3-5 tutorials)
- [ ] Rewrite API reference (auto-generate from OpenAPI, enrich with examples)
- [ ] Write top 10 how-to guides (based on support ticket analysis)
- [ ] Write core concept explanations (authentication, data model, errors)

**Week 8-9: Extended Content**
- [ ] Write remaining how-to guides
- [ ] Create integration guides for popular frameworks
- [ ] Write advanced tutorials
- [ ] Create troubleshooting guide (top 20 error messages)
- [ ] Write changelog and migration documentation
- [ ] Create FAQ page from community questions

**Week 10: Code Examples**
- [ ] Write code examples for all API endpoints (minimum 3 languages)
- [ ] Set up CI testing for all code examples
- [ ] Verify all code examples compile and produce expected output
- [ ] Create a code example contribution guide

### Phase 4: Implementation (Weeks 9-11)

**Week 9-10: Site Build**
- [ ] Set up documentation platform
- [ ] Implement navigation and sidebar
- [ ] Configure search (Algolia, Meilisearch, or native)
- [ ] Implement versioning (if multi-version docs needed)
- [ ] Set up analytics (page views, search queries, scroll depth)
- [ ] Implement code example rendering (syntax highlighting, copy button, language tabs)
- [ ] Set up CI/CD (build on PR, deploy on merge)

**Week 11: Testing**
- [ ] Run all code example tests in CI
- [ ] Validate all internal links (automated link checker)
- [ ] Validate all external links
- [ ] Run spell check and style linting
- [ ] Conduct 3 fresh-eyes friction logs on the new site
- [ ] Test search for top 50 queries (verify good results)
- [ ] Test on mobile devices
- [ ] Test accessibility (WCAG 2.1 AA)
- [ ] Verify redirect map works (all old URLs redirect correctly)

### Phase 5: Launch (Week 12)

**Pre-Launch:**
- [ ] Configure redirects from old URLs to new URLs
- [ ] Prepare launch announcement (blog post, community, email)
- [ ] Brief support team on new documentation structure
- [ ] Set up monitoring for 404 errors

**Launch Day:**
- [ ] Deploy new documentation site
- [ ] Verify all redirects work
- [ ] Publish launch blog post
- [ ] Announce in community channels
- [ ] Send email to developer list
- [ ] Monitor for 404 errors and broken functionality
- [ ] Staff community channels for questions

**Post-Launch (Week 13+):**
- [ ] Monitor analytics for first 2 weeks
- [ ] Fix any issues reported by developers
- [ ] Compare metrics to pre-launch baseline
- [ ] Collect developer feedback (survey)
- [ ] Compile launch metrics report
- [ ] Plan ongoing content maintenance cadence

---

## 4. Diataxis Content Targets

| Quadrant | Current Count | Target Count | Gap |
|----------|-------------|-------------|-----|
| Tutorials | [Count] | [Target] | [New needed] |
| How-To Guides | [Count] | [Target] | [New needed] |
| Reference | [Count] | [Target] | [New needed] |
| Explanation | [Count] | [Target] | [New needed] |

**Healthy ratios:** 10% tutorials, 40% how-to guides, 30% reference, 20% explanation.

---

## 5. Content Migration Tracking

| Page | Old URL | New URL | Status | Assigned To | Due |
|------|---------|---------|--------|-------------|-----|
| Quickstart | /getting-started | /docs/quickstart | [ ] Rewrite | [Name] | W6 |
| Auth Guide | /auth | /docs/guides/authentication | [ ] Rewrite | [Name] | W7 |
| API Ref: Users | /api/users | /docs/api/users | [ ] Auto-gen | [Name] | W7 |
| [Page] | [Old] | [New] | [ ] Status | [Name] | [Week] |

---

## 6. Platform Selection

| Platform | Best For | Hosting | Search | Versioning | Cost |
|----------|---------|---------|--------|-----------|------|
| Docusaurus | React-based, large docs | Static/Vercel | Algolia | Built-in | Free |
| Nextra | Next.js ecosystem | Vercel | Algolia/Flexsearch | Manual | Free |
| MkDocs (Material) | Python ecosystem | Static/GitHub Pages | Built-in | mike plugin | Free |
| Mintlify | API-first, beautiful | Mintlify Cloud | Built-in | Built-in | $150+/mo |
| GitBook | Non-technical editors | GitBook Cloud | Built-in | Built-in | $8+/mo |
| ReadMe | API reference focus | ReadMe Cloud | Built-in | Built-in | $99+/mo |

---

## 7. Success Metrics

### Pre/Post Comparison

| Metric | Pre-Overhaul | Post-Overhaul (30 days) | Target Improvement |
|--------|-------------|------------------------|--------------------|
| TTFS (median) | [Measure] | [Measure] | -30% or more |
| Quickstart completion rate | [Measure] | [Measure] | +20pp or more |
| Doc search success rate | [Measure] | [Measure] | +15pp or more |
| Support tickets (doc-related) | [Measure] | [Measure] | -25% or more |
| Docs bounce rate | [Measure] | [Measure] | -10pp or more |
| Developer NPS (docs) | [Measure] | [Measure] | +10 or more |
| Pages with > 6 month staleness | [Count] | [Count] | -80% or more |

### Ongoing Metrics

| Metric | Cadence | Owner |
|--------|---------|-------|
| Doc page views | Weekly | Technical Writer |
| Search queries with no results | Weekly | Technical Writer |
| Code example test pass rate | Per CI run | SDK Engineer |
| Link check pass rate | Per CI run | Automated |
| Content freshness audit | Quarterly | DevRel Lead |
| Developer friction log | Monthly | Developer Advocate |

---

## 8. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Broken links from old URLs | High (SEO, bookmarks) | Comprehensive redirect map, automated testing |
| Code examples broken | High (developer trust) | CI testing for all code examples |
| Content not ready by launch | Medium | Prioritize by traffic, launch with core content |
| Search quality poor | Medium | Configure synonyms, test top 50 queries |
| Team bandwidth insufficient | High | Reduce scope to core pages, expand post-launch |
| Platform limitations discovered late | Medium | Prototype early (Week 4), evaluate before committing |

---

## 9. Implementation Checklist

- [ ] Audit completed with stakeholder sign-off
- [ ] Information architecture designed and approved
- [ ] Content plan created with assignments and deadlines
- [ ] Documentation platform selected and set up
- [ ] Quickstart rewritten and tested
- [ ] Tutorial series created
- [ ] API reference generated and enriched
- [ ] Top 20 how-to guides written
- [ ] Code examples tested in CI
- [ ] Search configured and tested
- [ ] Redirects implemented and verified
- [ ] Fresh-eyes test conducted on new site
- [ ] Launch announcement prepared
- [ ] Post-launch monitoring plan in place
- [ ] Ongoing maintenance cadence defined

---

*See `02_documentation/documentation_strategy.md` for documentation theory and `03_developer_experience/dx_design.md` for DX principles.*
