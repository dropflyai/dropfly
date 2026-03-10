# Pattern: Platform Migration

Platform migration is one of the highest-risk operations in community
management. It disrupts habits, breaks workflows, risks data loss, and
inevitably causes member churn. This pattern codifies the approach to
executing migrations with minimum disruption and maximum member retention.

---

## CONTEXT

Use this pattern when:
- Current platform fundamentally cannot serve community needs
- Platform is shutting down or degrading beyond tolerance
- Cost has become prohibitive with no negotiation path
- Community has outgrown platform capabilities
- Strategic alignment requires platform change

Do NOT use when:
- "Grass is greener" on another platform
- A new platform has exciting features (but current works fine)
- Staff prefers a different platform (member experience matters more)
- Minor feature gaps (use integrations or workarounds)
- Cost savings are marginal (migration cost often exceeds savings)

---

## FORCES

| Force | Tension |
|-------|---------|
| Disruption vs. Improvement | Any migration disrupts; benefit must exceed cost |
| Speed vs. Thoroughness | Pressure to migrate fast vs. need for careful execution |
| Data vs. Fresh Start | Desire to preserve history vs. opportunity to clean up |
| Communication vs. Anxiety | Need to inform vs. risk of panic and preemptive exodus |
| Old Platform vs. New | Running two platforms is expensive but necessary temporarily |

---

## SOLUTION

### Pre-Decision: Migration Assessment (2–4 weeks)

Before committing to migrate, rigorously evaluate:

**1. Current Platform Audit:**
```
├── What works well? (preserve these capabilities)
├── What does not work? (migration must fix these)
├── What is tolerable but imperfect? (not sufficient reason alone)
├── Current member satisfaction with platform (survey)
└── Platform's roadmap (will current issues be fixed?)
```

**2. Target Platform Evaluation:**
```
├── Feature comparison matrix (weighted scoring)
├── Data migration feasibility
├── Integration compatibility
├── Cost projection (3-year, including migration cost)
├── Member experience comparison
└── Vendor stability and support quality
```

**3. Migration Cost-Benefit Analysis:**
```
Migration Costs:
├── Staff time (planning, execution, support): [hours x rate]
├── Member churn (expected 10–30% loss): [members x LTV]
├── Productivity loss during transition: [weeks x value]
├── New platform setup and customization: [hours + cost]
├── Parallel operation period: [duration x dual cost]
└── Total migration cost: [sum]

Migration Benefits:
├── Improved member experience: [estimated value]
├── New capabilities enabled: [estimated value]
├── Cost savings (if applicable): [annual savings]
├── Performance improvements: [estimated value]
└── Total migration benefit: [sum]

Decision: Benefit / Cost > 2x? Proceed.
```

### Phase 1: Planning (4–6 weeks)

**1.1 Migration Team:**
- Migration lead (owns the project)
- Technical lead (platform configuration, data migration)
- Communication lead (member communication)
- Moderator liaison (moderator team preparation)
- 3–5 community champions (beta testers, member advocates)

**1.2 Data Migration Plan:**

| Data Type | Migrate? | Method | Priority |
|-----------|----------|--------|----------|
| Member accounts | Yes | API export/import or manual re-registration | Critical |
| Message history | Conditional | API export (if available and valuable) | Medium |
| Files/attachments | Selective | Manual transfer of important assets | Medium |
| Roles/permissions | Yes | Recreate structure, assign manually | High |
| Integrations | Yes | Reconfigure on new platform | High |
| Custom bots | Rebuild | Rewrite for new platform | Medium |
| Analytics history | Export | CSV/API export for continuity | Medium |

**1.3 New Platform Architecture:**
- Design channel/space structure (opportunity to improve)
- Configure roles and permissions
- Set up moderation tools
- Configure onboarding flow
- Set up analytics tracking
- Test integrations and automations

**1.4 Communication Plan:**

| Timing | Message | Channel | Audience |
|--------|---------|---------|----------|
| 4 weeks before | "We are moving to [platform]. Here is why." | Email + community | All members |
| 3 weeks before | "Here is what the new platform looks like" | Community | All members |
| 2 weeks before | "Detailed migration guide and timeline" | Email + community | All members |
| 1 week before | "Final countdown, here is exactly what to do" | Email + community | All members |
| Migration day | "We are live! Welcome to the new home" | Email + both platforms | All members |
| Week 1 after | "Need help? Here is support" | Email + new platform | All members |
| Week 2 after | "Old platform going read-only" | Email + both platforms | All members |
| Month 1 after | "Here is how the migration went" | New platform | All members |

### Phase 2: Beta Testing (2–3 weeks)

**2.1 Beta Group:**
- Invite 10–20 trusted community members
- Include diverse representation (roles, activity levels, tech comfort)
- Provide explicit feedback channels
- Run through complete member journey on new platform

**2.2 Beta Testing Checklist:**
- [ ] New member registration works smoothly
- [ ] All channels/spaces accessible and correctly configured
- [ ] Moderation tools functional
- [ ] Onboarding flow complete and welcoming
- [ ] Notifications configured correctly
- [ ] Mobile experience acceptable
- [ ] Search works adequately
- [ ] Key integrations functional
- [ ] Analytics tracking verified

**2.3 Beta Feedback:**
- Collect structured feedback from all beta testers
- Prioritize critical issues (must fix before launch)
- Document nice-to-haves (fix after launch)
- Get explicit "go/no-go" recommendation from beta group

### Phase 3: Execution (2–4 weeks)

**3.1 Pre-Migration (Day -7 to Day 0):**
```
Day -7: Final "migration is happening" communication
Day -3: Execute data migration (if applicable)
Day -2: Verify data migration completeness
Day -1: Final platform configuration check
Day -1: Moderator team briefing on new platform
Day 0:  Migration day
```

**3.2 Migration Day:**
```
Hour 0:  Announce migration is live
         Post welcome content on new platform
         Activate onboarding flow on new platform
Hour 1:  Monitor for issues, respond to questions
Hour 2:  Post first community discussion on new platform
Hour 4:  Status update in old platform directing to new
Hour 8:  End-of-day summary and encouragement
Hour 24: First day recap, highlight early activity
```

**3.3 Parallel Operation (Week 1–2):**
- Both platforms active simultaneously
- New content posted only on new platform
- Old platform receives redirect notices
- Support available on both platforms
- Daily migration progress reports

**3.4 Old Platform Sunset (Week 2–4):**
- Week 2: Old platform set to read-only
- Week 3: Final reminder to migrate, last chance to export personal data
- Week 4: Old platform archived (not deleted — preserved for reference)

### Phase 4: Stabilization (Month 2–3)

- Monitor engagement metrics daily (compare to pre-migration baseline)
- Provide extra support for members struggling with new platform
- Iterate on configuration based on actual usage
- Address issues reported by members promptly
- Run post-migration satisfaction survey at Week 4
- Declare migration complete when metrics stabilize

---

## METRICS

### Migration Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Member migration rate | >70% of active members | New platform registrations / old platform active |
| Engagement recovery | >80% of pre-migration within 60 days | DAU/MAU comparison |
| Member satisfaction | NPS within 10 points of pre-migration | Post-migration survey |
| Response time | Back to pre-migration SLA within 30 days | Platform analytics |
| Data completeness | 100% of critical data migrated | Data audit |
| Issue resolution | 0 critical issues within 7 days | Issue tracker |

### Expected Member Loss

| Migration Quality | Expected Loss | Recovery Period |
|------------------|---------------|----------------|
| Excellent execution | 10–15% | 2–3 months |
| Good execution | 15–25% | 3–4 months |
| Mediocre execution | 25–40% | 4–6 months |
| Poor execution | 40%+ | May not recover |

---

## RISK MANAGEMENT

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Higher than expected churn | High | High | Excellent communication, easy transition |
| Data migration failures | Medium | High | Thorough testing, backup of all data |
| New platform issues | Medium | Medium | Beta testing, vendor support on standby |
| Moderator confusion | Medium | Medium | Pre-migration training, documentation |
| Member resistance | High | Medium | Involve members in decision, address concerns |
| Engagement drop | Very High | Medium | Extra content and events during transition |
| Cost overrun | Medium | Low | 20% budget contingency |

### Rollback Plan

Define rollback criteria and process before migration:
- **Rollback trigger:** Critical platform issue unresolvable within 48 hours
- **Rollback process:** Reactivate old platform, communicate, migrate back
- **Rollback deadline:** Cannot roll back after old platform archived
- **Prevention:** Thorough beta testing reduces rollback probability to <5%

---

## ANTI-PATTERNS

| Anti-Pattern | What Happens | Prevention |
|-------------|-------------|------------|
| Surprise migration | Members learn about migration on migration day | 4-week minimum notice |
| No parallel period | Old platform shut down on day 1 | 2-week minimum overlap |
| Data abandonment | History lost because migration seemed hard | Export everything |
| One-email communication | Single email notification for major change | Multi-touch communication plan |
| No beta testing | First experience for members is live | Always beta test |
| Ignoring concerns | Members express worry and are dismissed | Address every concern |

---

## POST-MIGRATION RETROSPECTIVE

Within 30 days of declaring migration complete, conduct a retrospective:

1. **What went well?** (preserve for future migrations)
2. **What went poorly?** (learn and document)
3. **What was surprising?** (update assumptions)
4. **Member feedback summary** (qualitative themes)
5. **Metric comparison** (pre vs. post vs. target)
6. **Recommendations** for future migrations

---

**Platform migration is surgery on a living community. Like surgery, it
requires thorough diagnosis, careful planning, skilled execution, and
patient recovery. Rush any phase and the community suffers. The single
most important factor in migration success is communication: early, clear,
empathetic, and continuous. Members can forgive a bumpy migration if they
feel informed and valued throughout.**
