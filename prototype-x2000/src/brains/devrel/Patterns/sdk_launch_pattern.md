# SDK Launch Pattern

## Pattern Summary

A comprehensive playbook for launching a new SDK or a major version of an existing SDK. The launch encompasses documentation, code samples, migration guides, content, community enablement, and marketing. A successful SDK launch maximizes adoption velocity while minimizing developer friction. This pattern covers the full lifecycle from 8 weeks before launch to 4 weeks after.

---

## 1. Prerequisites

Before starting this pattern, confirm the following:

- [ ] SDK code is feature-complete and passing all tests
- [ ] API endpoints consumed by the SDK are stable and documented
- [ ] OpenAPI spec (or equivalent) is up to date
- [ ] Target languages and version support matrix is defined
- [ ] Versioning strategy is decided (SemVer recommended)
- [ ] Package registry accounts are set up (npm, PyPI, crates.io, Maven)
- [ ] CI/CD pipeline for SDK is operational
- [ ] Internal stakeholders (engineering, product, marketing) are aligned on launch date

---

## 2. Team Requirements

| Role | Responsibility | Time Commitment |
|------|---------------|----------------|
| SDK Engineer | Code quality, testing, release | 80% for 8 weeks |
| Technical Writer | Documentation, migration guide, changelog | 60% for 6 weeks |
| Developer Advocate | Content, tutorials, community | 60% for 8 weeks |
| Community Manager | Community preparation, launch support | 40% for 4 weeks |
| DevRel Lead | Coordination, go-to-market, metrics | 30% for 8 weeks |

---

## 3. Timeline

### Phase 1: Preparation (Weeks 1-4)

**Week 1: Foundation**
- [ ] Finalize SDK API surface (public methods, types, error types)
- [ ] Write SDK design document (architecture decisions, patterns used)
- [ ] Create documentation outline (README, quickstart, API reference, migration guide)
- [ ] Set up analytics instrumentation (SDK version tracking via User-Agent)
- [ ] Create launch tracking document (this checklist)

**Week 2: Documentation**
- [ ] Write README.md (installation, quickstart, contributing)
- [ ] Write quickstart tutorial (under 5 minutes, copy-paste)
- [ ] Generate API reference from type definitions/docstrings
- [ ] Write migration guide (if upgrading from previous version)
- [ ] Create code examples for top 10 use cases

**Week 3: Content**
- [ ] Draft launch blog post (technical, not marketing)
- [ ] Record quickstart video (3-5 minutes)
- [ ] Create social media content plan (10-15 posts over 2 weeks)
- [ ] Write changelog with categorized changes
- [ ] Prepare developer email announcement

**Week 4: Testing**
- [ ] Beta release to 5-10 trusted community members
- [ ] Collect beta feedback (DX, documentation, bugs)
- [ ] Run internal fresh-eyes test (team member tries SDK from scratch)
- [ ] Measure internal TTFS and fix any friction > 5 minutes
- [ ] Fix all critical and high-priority issues from beta
- [ ] Final documentation review (technical accuracy + editorial)

### Phase 2: Launch (Weeks 5-6)

**Week 5: Soft Launch**
- [ ] Publish SDK to package registries (npm, PyPI, etc.)
- [ ] Publish documentation to docs site
- [ ] Deploy updated API reference
- [ ] Announce in community channels (Discord/Slack) -- soft launch
- [ ] Monitor for early issues (check package downloads, error reports)
- [ ] Address any blocking issues immediately

**Week 6: Public Launch**
- [ ] Publish launch blog post
- [ ] Send developer email announcement
- [ ] Execute social media content plan
- [ ] Post on Hacker News / Reddit (if content warrants)
- [ ] Cross-post to Dev.to / Hashnode
- [ ] Host launch livestream or office hours
- [ ] Update all quickstarts to use new SDK
- [ ] Monitor community channels for questions (increased staffing)
- [ ] Track launch metrics (downloads, signups, TTFS)

### Phase 3: Post-Launch (Weeks 7-10)

**Week 7-8: Stabilization**
- [ ] Address all bugs reported during launch week
- [ ] Patch release if needed (PATCH version bump)
- [ ] Respond to all community questions within 4 hours
- [ ] Publish FAQ based on common questions
- [ ] Update documentation based on real-world feedback
- [ ] Collect developer testimonials for case studies

**Week 9-10: Amplification**
- [ ] Publish advanced tutorial series (3-5 posts/videos)
- [ ] Write integration guides for popular frameworks
- [ ] Submit conference talks about SDK design decisions
- [ ] Run a mini-hackathon or coding challenge using the new SDK
- [ ] Publish launch retrospective internally (lessons learned)
- [ ] Compile launch metrics report for stakeholders

---

## 4. Documentation Deliverables

| Document | Audience | Length | Due |
|----------|---------|--------|-----|
| README.md | All developers | 100-200 lines | Week 2 |
| Quickstart | New developers | 50-100 lines | Week 2 |
| API Reference | Active developers | Auto-generated | Week 2 |
| Migration Guide | Existing users | 200-500 lines | Week 2 |
| Changelog | All developers | Per release | Week 3 |
| Code Examples (10) | Active developers | 20-50 lines each | Week 2 |
| Advanced Tutorials (5) | Experienced developers | 800-1500 words each | Weeks 9-10 |

---

## 5. Content Deliverables

| Content | Channel | Format | Due |
|---------|---------|--------|-----|
| Launch blog post | Blog | 1000-2000 words | Week 6 |
| Quickstart video | YouTube | 3-5 minutes | Week 3 |
| Social media thread | Twitter/X | 8-10 tweets | Week 6 |
| Email announcement | Email list | 300-500 words | Week 6 |
| Community announcement | Discord/Slack | 200-300 words | Week 5 |
| Hacker News post | HN | Blog post link | Week 6 |
| Dev.to cross-post | Dev.to | Blog repost | Week 6 |
| Advanced tutorials (5) | Blog + YouTube | Blog + 10 min videos | Weeks 9-10 |

---

## 6. Launch Day Checklist

```
MORNING (before announcement):
  □ SDK published on all package registries
  □ Documentation deployed and verified
  □ All links in blog post tested
  □ Social media posts scheduled
  □ Community moderators briefed and ready
  □ Support team briefed on new SDK

LAUNCH (9 AM Pacific):
  □ Blog post published
  □ Email announcement sent
  □ Social media thread posted
  □ Community announcement posted
  □ Team available in community channels

AFTERNOON:
  □ Monitor package downloads and error reports
  □ Respond to community questions (< 1 hour SLA)
  □ Track social media mentions and engagement
  □ Fix any critical issues immediately

END OF DAY:
  □ Compile day-1 metrics (downloads, page views, signups)
  □ Address open community questions
  □ Plan day-2 content (follow-up social posts, tips)
```

---

## 7. Success Metrics

### Launch Metrics (Week 1)

| Metric | Target | Measurement |
|--------|--------|-------------|
| SDK downloads (Day 1) | 500+ | Package registry stats |
| SDK downloads (Week 1) | 2,000+ | Package registry stats |
| Blog post views | 5,000+ | Google Analytics |
| Social media impressions | 50,000+ | Platform analytics |
| Community questions | Track volume | Community platform |
| Critical bugs reported | 0 | Issue tracker |

### Adoption Metrics (Month 1)

| Metric | Target | Measurement |
|--------|--------|-------------|
| SDK adoption rate | > 30% of new API calls via new SDK | API logs (User-Agent) |
| Migration rate (if upgrade) | > 50% of active users within 30 days | API logs (User-Agent) |
| TTFS for new developers | < 5 minutes | Event tracking |
| Developer NPS (post-launch survey) | > 40 | In-product survey |
| GitHub stars (new) | 100+ | GitHub API |

---

## 8. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking bug discovered on launch day | High | Beta testing, staged rollout (soft launch first) |
| Documentation has errors | Medium | Fresh-eyes test, beta reviewer feedback |
| Package registry outage | High | Publish to all registries 24 hours before announcement |
| Community overwhelm (too many questions) | Medium | Staff community channels, prepare FAQ |
| Low adoption | Medium | Follow-up content, outreach to key developers |
| Competitor launches same week | Low | Monitor competitive landscape, adjust timing if needed |

---

## 9. Post-Launch Retrospective

After Week 10, conduct a retrospective covering:

1. **What went well?** (Celebrate successes)
2. **What could be improved?** (Identify friction points)
3. **What surprised us?** (Unexpected developer behavior or feedback)
4. **Metric review** (Did we hit targets? Why or why not?)
5. **Process improvements** (What would we do differently next time?)
6. **Update this pattern** with lessons learned

---

*See `03_developer_experience/tooling.md` for SDK design principles and `05_content/technical_content.md` for content strategy.*
