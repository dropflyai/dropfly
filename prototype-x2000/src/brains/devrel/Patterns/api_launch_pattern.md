# Pattern: Launching New APIs and SDKs

## What This Enables

A structured API launch pattern ensures that new APIs, SDKs, and major features
reach developers with complete documentation, working code samples, and a
coordinated communication plan. Without a pattern, launches are ad hoc: documentation
is incomplete, SDKs are untested, and the community learns about features through
changelog entries instead of guided education. This pattern codifies the launch
process used by Stripe, Twilio, and Vercel — organizations where every API launch
is a coordinated DevRel event.

---

## The Core Insight

An API launch is not a marketing event — it is an education event. The goal is not
impressions or excitement but activation: the number of developers who make their
first successful API call within 48 hours of the launch. Every artifact produced for
the launch — documentation, blog post, code samples, video — must be designed to
reduce the time between "I learned this exists" and "I made it work."

---

## Phase 1: Pre-Launch (T-8 to T-4 Weeks)

### Documentation Readiness

- [ ] API reference documentation complete (all endpoints, parameters, errors)
- [ ] Quickstart guide written and tested on clean environments
- [ ] At least one tutorial demonstrating a real use case
- [ ] Conceptual explanation of why the API exists and its design decisions
- [ ] Migration guide (if replacing or extending existing functionality)
- [ ] Error code documentation with resolution guidance

### SDK Readiness

- [ ] SDK updated for top 3 languages (Python, JavaScript, Go at minimum)
- [ ] SDK changelog updated with new methods and classes
- [ ] SDK tests passing for all new functionality
- [ ] Code samples demonstrating each major capability
- [ ] SDK version bumped and ready for publish (not yet published)

### Content Readiness

- [ ] Launch blog post drafted (lead with code, 1,500-2,500 words)
- [ ] Social media thread drafted (5-7 tweets with code screenshots)
- [ ] Demo application or interactive playground prepared
- [ ] Video walkthrough recorded (5-10 minutes, screen recording with narration)
- [ ] Changelog entry drafted

### Internal Alignment

- [ ] Engineering team has reviewed all documentation for technical accuracy
- [ ] Product team has approved messaging and positioning
- [ ] Support team has been briefed on common questions and known limitations
- [ ] Marketing team has been aligned on launch timing and channels

---

## Phase 2: Beta Validation (T-4 to T-1 Weeks)

### Private Beta

- Select 10-20 developers from community (diverse use cases, languages, skill levels)
- Provide beta access with dedicated support channel
- Collect structured feedback: What worked? What was confusing? What broke?
- Iterate on documentation and SDK based on beta feedback
- Conduct exit interviews with top 5 beta participants

### Documentation Testing

- [ ] Have 3 developers who were not involved in writing attempt the quickstart
- [ ] Measure time-to-hello-world (target: < 5 minutes)
- [ ] Fix every point where a tester got stuck or confused
- [ ] Run all code samples through CI on clean environments
- [ ] Verify all internal and external links

---

## Phase 3: Launch Day (T-0)

### Launch Sequence (Tuesday or Wednesday, 9-10 AM PT)

**Hour 0 (9:00 AM):**
1. Publish SDK updates to package registries (npm, PyPI, etc.)
2. Deploy documentation updates (API reference, quickstart, tutorials)
3. Publish changelog entry

**Hour 0.5 (9:30 AM):**
4. Publish blog post
5. Send email to developer newsletter
6. Post announcement in Discord/Slack community

**Hour 1 (10:00 AM):**
7. Publish social media thread (Twitter/X, LinkedIn, Mastodon)
8. Submit to Hacker News (only if the launch warrants it)
9. Post to relevant subreddits

**Hours 1-8 (10:00 AM - 5:00 PM):**
10. Monitor all channels for questions and issues
11. Respond to every comment, question, and bug report within 2 hours
12. Track real-time metrics: documentation page views, SDK installs, first API calls

### Launch Day Team Assignments

| Role | Responsibility | Person |
|------|---------------|--------|
| Launch Lead | Coordinates sequence, makes go/no-go calls | Head of DevRel |
| Documentation | Monitors doc feedback, makes real-time fixes | Technical Writer |
| Community | Monitors Discord/Slack/Twitter, responds to questions | Community Manager |
| Engineering | On-call for API issues, SDK bugs | Engineering Lead |
| Content | Publishes blog, social, newsletter | Developer Advocate |

---

## Phase 4: Post-Launch (T+1 to T+14)

### Day 1-3: Immediate Follow-Up

- Publish a "launch day recap" thread on social media highlighting developer
  reactions, first projects, and interesting questions
- Fix any documentation errors identified on launch day
- Respond to all outstanding community questions
- Publish an FAQ based on launch day questions

### Day 4-7: Content Amplification

- Publish a follow-up blog post: deeper technical dive or use case exploration
- Cross-post launch blog to dev.to and Hashnode (with canonical URL)
- Engage with any community-generated content (retweet, comment, amplify)
- Host an office hours session for live Q&A on the new API

### Day 8-14: Retrospective

- Compile launch metrics (see below)
- Conduct team retrospective: what worked, what did not, what to change
- Document lessons learned in Memory/
- Update the launch pattern if improvements were identified

---

## Launch Metrics

| Metric | Source | 48-Hour Target | 14-Day Target |
|--------|--------|---------------|---------------|
| Documentation page views | Analytics | 5,000+ | 20,000+ |
| Blog post views | Analytics | 2,000+ | 10,000+ |
| SDK installs (new version) | Package registries | 500+ | 5,000+ |
| First API calls | API logs | 100+ | 1,000+ |
| Community questions | Discord/Slack/GitHub | Track volume | < 50% unanswered |
| Bug reports | GitHub Issues | Track and triage all | All P0/P1 resolved |
| Social engagement | Social analytics | 50+ interactions | 200+ interactions |

---

## Failure Modes

1. **Incomplete documentation at launch** — Developers arrive, find gaps, and leave.
   Documentation must be 100% complete before launch, not "close enough."

2. **Broken code samples** — A developer copies the quickstart code and it fails.
   Trust is destroyed in 30 seconds. Test every sample on launch morning.

3. **No one monitoring channels** — Developers ask questions on launch day and get
   no response. The team is celebrating the launch instead of supporting it.

4. **Launching on Friday** — Team goes home, developers hit issues over the weekend,
   issues compound. Tuesday and Wednesday only.

5. **Hype without substance** — Launch marketing exceeds what the product delivers.
   Developers arrive with high expectations and leave disappointed.

---

## The Operator's Framework

1. Documentation and SDKs must be complete before any marketing begins
2. Beta test with real developers and iterate on their feedback
3. Launch is a team event: every role has a specific assignment
4. The 48 hours after launch matter more than launch day itself
5. Measure activation (first API calls), not awareness (page views)
6. Conduct a retrospective and update this pattern

---

**This pattern is referenced by `06_strategy/go_to_market.md`.**
**Use `Templates/event_playbook_template.md` for event-specific launches.**
