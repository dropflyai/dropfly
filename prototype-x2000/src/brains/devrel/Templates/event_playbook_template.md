# Developer Event Playbook Template

## Overview

This template provides a complete execution playbook for developer events:
conference talks, hackathons, workshops, and meetups. Use this template when
planning any developer-facing event. The playbook covers planning, logistics,
promotion, execution, and post-event follow-up with checklists for each phase.

**Source:** Derived from Google DevRel event operations, MLH hackathon best
practices, and DevRelCon event planning guides.

---

## Template

```markdown
# Event Playbook: [Event Name]

**Event Type:** Conference Talk | Hackathon | Workshop | Meetup | Webinar
**Date:** [Date]
**Location:** [Venue / Virtual Platform]
**Expected Attendance:** [Number]
**Budget:** $[Amount]
**Event Lead:** [Name]

---

## 1. Event Objectives

### Primary Objective
[What is the single most important outcome of this event?]

Examples:
- "150 developers complete the quickstart tutorial during the workshop"
- "30 hackathon teams build working integrations"
- "200 conference attendees scan the QR code to visit documentation"

### Secondary Objectives
- [ ] [Secondary objective 1]
- [ ] [Secondary objective 2]

### Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| Attendance | [N] | Registration platform |
| Engagement | [N] | [Active participants, questions asked, etc.] |
| Post-event activation | [N]% | Product analytics (7-day window) |
| Satisfaction | [Score] | Post-event survey (NPS) |
| Content generated | [N] | Blog posts, social mentions, projects |

---

## 2. Planning Phase (T-8 to T-4 Weeks)

### Logistics

- [ ] Venue confirmed and contract signed (in-person)
- [ ] Virtual platform selected and tested (virtual)
- [ ] A/V equipment confirmed (projector, microphone, streaming)
- [ ] Internet connectivity tested (bandwidth sufficient for live demos)
- [ ] Catering arranged (in-person): $[X]/person, dietary restrictions accommodated
- [ ] Swag ordered: [Items] x [Quantity] — delivery confirmed by [date]
- [ ] Recording equipment arranged (camera, screen capture)

### Content Preparation

- [ ] Talk/workshop content finalized and reviewed
- [ ] All demos tested on venue equipment (resolution, projector, network)
- [ ] Backup demo video recorded (in case live demo fails)
- [ ] Handout materials prepared (if applicable)
- [ ] Code repository created with starter templates (workshops/hackathons)
- [ ] Pre-configured development environments ready (Gitpod/Codespaces)

### Promotional Plan

| Channel | Content | Date | Owner |
|---------|---------|------|-------|
| Email newsletter | Event announcement | T-4 weeks | [Name] |
| Social media (Twitter/X) | Announcement thread | T-4 weeks | [Name] |
| Social media (LinkedIn) | Event post | T-3 weeks | [Name] |
| Discord/Slack community | Announcement + discussion | T-3 weeks | [Name] |
| Partner channels | Cross-promotion | T-3 weeks | [Name] |
| Email reminder | "1 week to go" | T-1 week | [Name] |
| Social media | Day-of promotion | T-0 | [Name] |

---

## 3. Pre-Event (T-1 Week)

### Final Checks

- [ ] Run-through of all content (practice talk/workshop end to end)
- [ ] All code samples tested on clean environment
- [ ] Speaker/presenter equipment check (laptop, adapters, backup device)
- [ ] Registration list exported and reviewed
- [ ] Name badges printed (in-person)
- [ ] Signage and wayfinding prepared (in-person)
- [ ] Virtual platform tested with all speakers/facilitators
- [ ] Emergency contact information compiled for all team members

### Pre-Event Communication

- [ ] Send attendee preparation email:
  - What to bring (laptop, charger)
  - What to install in advance (SDKs, tools, IDE)
  - Agenda and schedule
  - WiFi information (in-person)
  - Virtual platform access link (virtual)
- [ ] Send speaker/facilitator briefing:
  - Run of show with exact timing
  - Technical setup instructions
  - Emergency procedures and contacts

---

## 4. Event Day Execution

### Run of Show

| Time | Activity | Owner | Notes |
|------|----------|-------|-------|
| [Start - 60 min] | Setup: A/V check, signage, registration | [Name] | |
| [Start - 30 min] | Team briefing (roles, escalation) | Event Lead | |
| [Start - 15 min] | Doors open / virtual room opens | [Name] | |
| [Start] | Welcome and introductions | [Name] | 5 minutes max |
| [Start + 5 min] | [Main content begins] | [Speaker] | |
| [Midpoint] | Break / checkpoint | [Name] | |
| [Resume] | [Content continues] | [Speaker] | |
| [End - 15 min] | Q&A / wrap-up | [Name] | |
| [End - 5 min] | Call to action + survey link | [Name] | |
| [End] | Networking / social | All | |

### Team Roles

| Role | Person | Responsibility |
|------|--------|---------------|
| Event Lead | [Name] | Overall coordination, go/no-go decisions |
| Speaker/Facilitator | [Name] | Delivers content |
| Technical Support | [Name] | Helps attendees with setup issues |
| Community/Chat Monitor | [Name] | Monitors chat, relays questions |
| A/V Operator | [Name] | Manages recording, streaming |
| Social Media | [Name] | Live-tweets, posts updates |

### Emergency Procedures

- **Demo failure:** Switch to pre-recorded backup video
- **Internet outage:** Use mobile hotspot, have offline-capable materials
- **Speaker illness:** Designated backup speaker identified: [Name]
- **Low attendance:** Adjust format for intimate discussion rather than presentation
- **Technical issues for attendees:** Dedicated support channel with < 5 min response

---

## 5. Post-Event (T+1 to T+14)

### Immediate (Within 24 Hours)

- [ ] Send thank-you email to all attendees with:
  - Recording link (once processed)
  - Slide deck / materials
  - Survey link
  - Documentation and next-steps links
  - Community invite link
- [ ] Post event highlights on social media
- [ ] Upload recording to YouTube (if applicable)
- [ ] Respond to any open questions from the event chat

### Follow-Up (Within 1 Week)

- [ ] Publish blog post recap (highlights, photos, key takeaways)
- [ ] Analyze survey results and compile feedback
- [ ] Track post-event activation (signups, first API calls)
- [ ] Send personalized follow-ups to high-engagement attendees
- [ ] Publish social media content: quote cards, demo clips, highlights

### Retrospective (Within 2 Weeks)

- [ ] Compile event metrics (see Success Metrics above)
- [ ] Conduct team retrospective:
  - What worked well?
  - What did not work?
  - What should we change for next time?
- [ ] Update this playbook template with improvements
- [ ] Log lessons learned in Memory/
- [ ] Decide: Should we repeat this event? At what cadence?

---

## 6. Budget Tracker

| Item | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| Venue | $[X] | $[X] | |
| Catering | $[X] | $[X] | $[Y]/person x [N] people |
| A/V and streaming | $[X] | $[X] | |
| Swag | $[X] | $[X] | |
| Speaker travel | $[X] | $[X] | |
| Marketing and promotion | $[X] | $[X] | |
| Platform/tools | $[X] | $[X] | |
| Prizes (hackathon) | $[X] | $[X] | |
| Contingency (10%) | $[X] | $[X] | |
| **Total** | **$[X]** | **$[X]** | |

### ROI Calculation

```
Total Event Cost: $[X]
Post-Event Activations: [N]
Cost Per Activation: $[X] / [N] = $[Y]

Benchmark: < $200/activation for hackathons, < $100/activation for workshops,
           < $50/activation for webinars
```
```

---

## Usage Notes

1. **Adapt to event type** — Not all sections apply to all event types. Webinars
   do not need catering budgets; meetups do not need elaborate run-of-show.
2. **Start early** — Begin planning 8 weeks before the event. Rushed events
   produce rushed outcomes.
3. **Record everything** — Every event should be recorded and published. The
   recording often reaches 10x the live audience.
4. **Survey immediately** — Send the survey link during the event (in the chat,
   on the last slide). Response rates drop 50% after 24 hours.
5. **Measure activation** — The event's value is measured by post-event developer
   activation, not attendance.

---

**This template implements the standards in `04_community/community_building.md`.**
**Reference `Patterns/api_launch_pattern.md` for launch-specific events.**
