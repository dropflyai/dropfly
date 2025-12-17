# PERFORMANCE
**Mandatory Performance Standards for Engineering Work**

---

## Purpose

Performance is a feature, not an afterthought.

This document defines performance budgets, measurement requirements, and severity-based performance enforcement.

Poor performance results in:
- user abandonment
- poor SEO rankings
- increased infrastructure costs
- customer dissatisfaction

---

## Performance Budgets (WEB_SAAS)

### Load Time Targets

**Initial Page Load (Time to Interactive):**
- **Excellent:** < 2 seconds
- **Good:** 2-4 seconds
- **Acceptable:** 4-6 seconds
- **Poor:** > 6 seconds

**First Contentful Paint (FCP):**
- **Excellent:** < 1 second
- **Good:** 1-2 seconds
- **Acceptable:** 2-3 seconds
- **Poor:** > 3 seconds

**Largest Contentful Paint (LCP):**
- **Excellent:** < 2.5 seconds
- **Good:** 2.5-4 seconds
- **Acceptable:** 4-5 seconds
- **Poor:** > 5 seconds

### API Latency Targets

**Backend Response Time (p95):**
- **Excellent:** < 100ms
- **Good:** 100-300ms
- **Acceptable:** 300-500ms
- **Poor:** > 500ms

**Database Query Time (p95):**
- **Excellent:** < 50ms
- **Good:** 50-200ms
- **Acceptable:** 200-500ms
- **Poor:** > 500ms

### Bundle Size Targets

**JavaScript Bundle (gzipped):**
- **Excellent:** < 100kb
- **Good:** 100-300kb
- **Acceptable:** 300-500kb
- **Poor:** > 500kb

**CSS Bundle (gzipped):**
- **Excellent:** < 50kb
- **Good:** 50-100kb
- **Acceptable:** 100-200kb
- **Poor:** > 200kb

---

## Measurement Methods

### Lighthouse (Automated)
- Run Lighthouse in CI/CD for production builds
- Target score: **90+ for Performance**
- Check: Performance, Accessibility, Best Practices, SEO
- Use throttled mode (simulated slow 4G + slow CPU)

### Chrome DevTools (Manual)
- Use Performance tab to profile runtime performance
- Check for long tasks (> 50ms blocks main thread)
- Analyze network waterfall for blocking resources
- Measure CLS (Cumulative Layout Shift) — target < 0.1

### Real User Monitoring (RUM)
- Track Core Web Vitals in production (if available)
- Monitor p95 metrics, not just averages
- Alert on regressions (> 20% degradation)

---

## Caching Rules

### Browser Caching
- **Static assets** (JS, CSS, images): cache for 1 year, use content hashing for cache busting
- **HTML documents**: cache for short duration or no-cache with ETag
- Set `Cache-Control` headers appropriately

### API Caching
- Cache GET requests where data is stable
- Use ETag/If-None-Match for conditional requests
- Implement stale-while-revalidate where applicable
- Invalidate cache on data mutations

### CDN Usage
- Serve static assets via CDN
- Use edge caching for API responses when possible
- Implement regional caching for global users

---

## DOM & Render Rules (Pages Like signals.html)

### DOM Optimization
- **Minimize DOM depth** — avoid deeply nested structures
- **Limit DOM size** — target < 1,500 nodes per page
- **Avoid layout thrashing** — batch DOM reads/writes
- **Use DocumentFragment** for bulk insertions

### Rendering Best Practices
- **Defer non-critical JavaScript** — use `defer` or `async` attributes
- **Lazy load images** — use `loading="lazy"` for below-the-fold images
- **Avoid render-blocking CSS** — inline critical CSS, defer non-critical
- **Minimize reflows/repaints** — avoid forced synchronous layout

### signals.html Specific Rules
- **Render signals progressively** — don't block on full dataset load
- **Virtualize long lists** — render only visible items (if > 100 items)
- **Debounce API calls** — avoid excessive polling or rapid requests
- **Cache API responses** — don't re-fetch unchanged data

---

## Performance Severity Mapping (P0-P3)

### P0 CRITICAL
- Complete page failure to load (infinite spinner, crash)
- API timeout causing core functionality to fail
- Performance regression > 5x slower (e.g., 2s → 10s load time)
- Out of memory errors causing crashes

**Response:** Immediate L3 HOTFIX required.

### P1 HIGH
- Load time > 10 seconds (previously < 3s)
- Lighthouse Performance score < 50 (previously > 80)
- API latency > 2s (previously < 500ms)
- Blocking main thread > 5 seconds

**Response:** Fix within 24-48 hours; L1 BUILD or L3 HOTFIX depending on user impact.

### P2 MEDIUM
- Load time 5-10 seconds
- Lighthouse Performance score 50-70
- API latency 500ms-1s
- Bundle size increased by > 50%

**Response:** Fix in next release cycle; L1 BUILD.

### P3 LOW
- Load time 4-5 seconds (acceptable but not great)
- Lighthouse Performance score 70-90
- Minor performance optimizations (e.g., image compression)
- Incremental bundle size increases (< 20%)

**Response:** Optimize when convenient; L1 BUILD or defer.

---

## Minimum Performance Bar (Process Level)

### L0 EXPLORE
- **Optional:** performance measurement (prototypes may skip)
- **No performance budgets enforced**
- **Required:** if prototype becomes production, re-evaluate under L1

### L1 BUILD
- **Required:** Lighthouse run (target score > 70)
- **Required:** Check for obvious performance issues (massive bundles, blocking resources)
- **Required:** API latency within acceptable range (< 1s for p95)
- **Optional:** Advanced optimization (defer if not blocking)

### L2 SHIP
- **Required:** Lighthouse score > 90
- **Required:** Core Web Vitals meet "Good" thresholds (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Required:** Bundle size within budget (< 500kb JS, < 200kb CSS gzipped)
- **Required:** API latency p95 < 500ms
- **Required:** Performance tested on slow networks/devices (throttled mode)

### L3 HOTFIX
- **Required:** Hotfix does not introduce new performance regressions
- **Optional:** Full performance audit (defer to post-incident if time-critical)
- **Mandatory:** Post-incident performance review if hotfix affects load time or API latency

---

## Performance Optimization Checklist

### Code-Level
- [ ] Remove unused JavaScript (tree-shaking, dead code elimination)
- [ ] Minimize and compress assets (gzip/brotli)
- [ ] Code-split large bundles (lazy load routes/components)
- [ ] Use modern JavaScript (avoid polyfills for modern browsers)

### Network-Level
- [ ] Reduce HTTP requests (bundle CSS/JS, use sprites for icons)
- [ ] Use HTTP/2 or HTTP/3
- [ ] Enable compression (gzip/brotli)
- [ ] Implement resource hints (`preload`, `prefetch`, `preconnect`)

### Rendering-Level
- [ ] Defer non-critical CSS/JS
- [ ] Optimize images (WebP, AVIF, responsive images)
- [ ] Lazy load below-the-fold content
- [ ] Avoid render-blocking resources in `<head>`

---

## Performance Failure Response

If a performance regression is discovered:
1. **Assess severity** (P0-P3)
2. **Identify root cause** (profile with DevTools, check bundle sizes, test API latency)
3. **Create fix** (optimize code, reduce bundle, cache API, etc.)
4. **Verify fix** (re-run Lighthouse, check Core Web Vitals)
5. **Log regression** in `Engineering/Solutions/Regressions.md` to prevent recurrence

---

**Performance standards are mandatory and enforced.**
