# Content Audit Template — Systematic Evaluation of All Content Assets

## How to Use This Template

This template guides the execution of a comprehensive content audit.
Work through each section in order. The audit produces a scored
inventory of all content assets with specific action recommendations
for every page. Expected timeline: 2–4 weeks for sites with 100–500
pages. For larger sites, allocate additional time or use sampling.

---

## Section 1: Audit Scope and Setup

### Audit Parameters

**Audit Date:** _______________
**Audit Lead:** _______________
**Site(s) Audited:** _______________

**Scope Definition:**
[ ] Full site audit (all published URLs)
[ ] Blog/content hub only
[ ] Landing pages only
[ ] Documentation only
[ ] Specific section: _______________

**Content Types Included:**
[ ] Blog posts
[ ] Landing pages
[ ] Product pages
[ ] Documentation/help articles
[ ] Case studies
[ ] Resource/download pages
[ ] About/company pages
[ ] Category/tag pages
[ ] Other: _______________

**Date Range:**
[ ] All published content (no date restriction)
[ ] Content published after: _______________
[ ] Content published between: _______________ and _______________

### Tool Setup Checklist

Before beginning the audit, confirm access to:
- [ ] Google Analytics 4 (12 months of data minimum)
- [ ] Google Search Console (12 months of data minimum)
- [ ] SEO tool (Ahrefs / SEMrush / Moz) with site connected
- [ ] Crawl tool (Screaming Frog / Sitebulb) configured
- [ ] CMS admin access (for publish dates, authors, metadata)
- [ ] Spreadsheet or database for audit data (Google Sheets / Airtable)

### Crawl Execution

**Crawl tool used:** _______________
**Crawl date:** _______________
**Total URLs discovered:** _______________
**URLs after filtering (removing non-content pages):** _______________

**URL Filtering Rules:**
Remove from audit scope:
- Redirects (3xx status codes)
- Error pages (4xx, 5xx status codes)
- Parameter URLs (unless they serve unique content)
- Pagination pages (/page/2, /page/3)
- Media/attachment URLs
- Utility pages (login, sitemap, robots.txt)

---

## Section 2: Data Collection

### Automated Data Collection

Export the following data for every URL in scope:

**From Crawl Tool:**
| Data Point | Column Name | Source |
|-----------|------------|--------|
| Page URL | url | Crawl export |
| Page title | title | Crawl export |
| Meta description | meta_description | Crawl export |
| H1 tag | h1 | Crawl export |
| Word count | word_count | Crawl export |
| HTTP status | status_code | Crawl export |
| Canonical URL | canonical | Crawl export |
| Internal links in | inlinks | Crawl export |
| Internal links out | outlinks | Crawl export |

**From Google Analytics 4 (Trailing 12 Months):**
| Data Point | Column Name | Source |
|-----------|------------|--------|
| Organic sessions | organic_sessions | GA4 export |
| Total sessions | total_sessions | GA4 export |
| Engagement rate | engagement_rate | GA4 export |
| Avg. engagement time | avg_engagement_time | GA4 export |
| Conversions | conversions | GA4 export |
| Bounce rate | bounce_rate | GA4 export |

**From Google Search Console (Trailing 12 Months):**
| Data Point | Column Name | Source |
|-----------|------------|--------|
| Total impressions | impressions | GSC export |
| Total clicks | clicks | GSC export |
| Average CTR | avg_ctr | GSC export |
| Average position | avg_position | GSC export |
| Top query | top_query | GSC export |

**From SEO Tool:**
| Data Point | Column Name | Source |
|-----------|------------|--------|
| Referring domains | ref_domains | Ahrefs/SEMrush |
| Domain Rating of page | page_dr | Ahrefs |
| Organic keywords ranked | keywords_ranked | Ahrefs/SEMrush |
| Estimated organic traffic | est_traffic | Ahrefs/SEMrush |

**From CMS:**
| Data Point | Column Name | Source |
|-----------|------------|--------|
| Publish date | publish_date | CMS export |
| Last modified date | last_modified | CMS export |
| Author | author | CMS export |
| Category | category | CMS export |
| Tags | tags | CMS export |

### Manual Data Collection

For each URL, add manual classifications:

| Data Point | Column Name | Classification Options |
|-----------|------------|----------------------|
| Content type | content_type | Blog, Landing, Case Study, Doc, Resource |
| Funnel stage | funnel_stage | Awareness, Consideration, Decision, Retention |
| Topic cluster | topic_cluster | [Your defined clusters] |
| Target keyword | target_keyword | From keyword-URL map |
| Quality assessment | quality_score | 1–5 scale (see scoring rubric) |

---

## Section 3: Content Scoring

### Scoring Rubric

Score each URL across five dimensions using the 0–5 scale:

**Traffic Performance (Weight: 25%)**
```
5 = Top 10% of pages by organic traffic
4 = Top 25% of pages by organic traffic
3 = Top 50% of pages by organic traffic
2 = Top 75% of pages by organic traffic
1 = Bottom 25% of pages by organic traffic
0 = Zero organic traffic in trailing 12 months
```

**Engagement Quality (Weight: 20%)**
```
5 = Engagement rate >70%, avg. time >4 min
4 = Engagement rate >60%, avg. time >3 min
3 = Engagement rate >50%, avg. time >2 min
2 = Engagement rate >40%, avg. time >1 min
1 = Engagement rate <40%, avg. time <1 min
0 = No measurable engagement data
```

**Conversion Impact (Weight: 25%)**
```
5 = Directly attributed to revenue or pipeline
4 = Generates MQLs or qualified leads
3 = Generates email subscribers or registrations
2 = Has conversion path but low conversion rate
1 = No conversion path on the page
0 = Actively hurts conversion (confusing, off-brand)
```

**SEO Authority (Weight: 15%)**
```
5 = 50+ referring domains, ranks top 3 for target keyword
4 = 20–49 referring domains, ranks 4–10
3 = 10–19 referring domains, ranks 11–20
2 = 5–9 referring domains, ranks 21–50
1 = 1–4 referring domains, ranks 50+
0 = No referring domains, not ranking
```

**Content Quality (Weight: 15%)**
```
5 = Comprehensive, unique, accurate, well-formatted, on-brand
4 = Strong with minor improvement areas
3 = Adequate, meets minimum quality standards
2 = Thin, outdated, or partially inaccurate
1 = Poor quality, significantly outdated, off-brand
0 = Factually wrong, plagiarized, or brand-damaging
```

**Composite Score Formula:**
```
Score = (Traffic x 0.25) + (Engagement x 0.20) + (Conversion x 0.25)
      + (SEO x 0.15) + (Quality x 0.15)
```

### Score Distribution Analysis

After scoring, analyze the distribution:

| Score Range | Classification | Count | % of Total |
|-------------|---------------|-------|------------|
| 4.0 – 5.0 | Top Performer | | |
| 3.0 – 3.9 | Solid Performer | | |
| 2.0 – 2.9 | Needs Improvement | | |
| 1.0 – 1.9 | Underperformer | | |
| 0.0 – 0.9 | Candidate for Removal | | |

---

## Section 4: Gap Analysis

### Keyword Coverage Gaps

| Target Keyword | Monthly Volume | Difficulty | Existing Content | Gap Type |
|---------------|---------------|-----------|-----------------|----------|
| | | | [ ] None [ ] Thin [ ] Outdated | [ ] New [ ] Update |
| | | | [ ] None [ ] Thin [ ] Outdated | [ ] New [ ] Update |
| | | | [ ] None [ ] Thin [ ] Outdated | [ ] New [ ] Update |
| | | | [ ] None [ ] Thin [ ] Outdated | [ ] New [ ] Update |
| | | | [ ] None [ ] Thin [ ] Outdated | [ ] New [ ] Update |

### Topic Cluster Coverage

| Cluster | Pillar Page | Cluster Pages Needed | Cluster Pages Existing | Coverage % |
|---------|-----------|---------------------|----------------------|-----------|
| | [ ] Yes [ ] No | | | |
| | [ ] Yes [ ] No | | | |
| | [ ] Yes [ ] No | | | |
| | [ ] Yes [ ] No | | | |

### Funnel Stage Balance

| Funnel Stage | Current Pages | Ideal Distribution | Gap |
|-------------|--------------|-------------------|-----|
| Awareness | ___ ( ___%) | 40% | |
| Consideration | ___ ( ___%) | 25% | |
| Decision | ___ ( ___%) | 20% | |
| Retention | ___ ( ___%) | 15% | |

### Format Gap Assessment

| Format | SERP Presence | Our Coverage | Action Needed |
|--------|-------------|-------------|---------------|
| Long-form guides | [ ] High [ ] Low | [ ] Yes [ ] No | |
| Video content | [ ] High [ ] Low | [ ] Yes [ ] No | |
| Interactive tools | [ ] High [ ] Low | [ ] Yes [ ] No | |
| Infographics | [ ] High [ ] Low | [ ] Yes [ ] No | |
| Comparison pages | [ ] High [ ] Low | [ ] Yes [ ] No | |

---

## Section 5: Action Recommendations

### Triage Summary

For every URL in the audit, assign one action:

| Action | Criteria | Count | Est. Hours |
|--------|----------|-------|-----------|
| Keep | Score 4.0–5.0, no quality issues | | |
| Update | Score 2.5–3.9, sound foundation | | |
| Consolidate | Multiple thin/competing pages | | |
| Prune | Score 0–1.4, no recovery potential | | |
| Create | Gap identified, high priority | | |

### Priority Action List

**Immediate Actions (This Month)**

| URL | Current Score | Action | Specific Changes | Owner | Deadline |
|-----|-------------|--------|-----------------|-------|----------|
| | | | | | |
| | | | | | |
| | | | | | |

**Short-Term Actions (Next Quarter)**

| URL | Current Score | Action | Specific Changes | Owner | Deadline |
|-----|-------------|--------|-----------------|-------|----------|
| | | | | | |
| | | | | | |
| | | | | | |

**Medium-Term Actions (Next 6 Months)**

| URL | Current Score | Action | Specific Changes | Owner | Deadline |
|-----|-------------|--------|-----------------|-------|----------|
| | | | | | |
| | | | | | |
| | | | | | |

### Consolidation Groups

| Group Theme | URLs to Merge | Surviving URL | Redirect Plan |
|------------|-------------|-------------|--------------|
| | 1. ___  2. ___  3. ___ | | 301 redirect all to surviving |
| | 1. ___  2. ___  3. ___ | | 301 redirect all to surviving |

### New Content Recommendations

| Title | Keyword | Volume | Difficulty | Priority | Format | Est. Hours |
|-------|---------|--------|-----------|----------|--------|-----------|
| | | | | P1 | | |
| | | | | P1 | | |
| | | | | P2 | | |
| | | | | P2 | | |

---

## Section 6: Audit Summary and Next Steps

### Executive Summary

**Total URLs Audited:** _______________
**Average Content Score:** _______________
**Top-Performing Content:** _______________ (% of total)
**Content Requiring Action:** _______________ (% of total)
**Content Recommended for Removal:** _______________ (% of total)
**Estimated Total Effort for Remediation:** _______________ hours

### Key Findings

1. _______________
2. _______________
3. _______________
4. _______________
5. _______________

### Recommended Priority Order

1. _______________
2. _______________
3. _______________
4. _______________
5. _______________

### Next Audit Schedule

**Recommended cadence:** [ ] Quarterly [ ] Semi-annually [ ] Annually
**Next audit date:** _______________
**Scope changes for next audit:** _______________

---

**A content audit without action is just a spreadsheet. Execute the
recommendations, measure the impact, and repeat the cycle.**
