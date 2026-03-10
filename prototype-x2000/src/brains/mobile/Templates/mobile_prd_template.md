# Mobile Product Requirements Document (PRD)

## Template Instructions

Copy this template when defining requirements for a mobile feature or
application. This template extends a standard PRD with mobile-specific
requirements that are frequently overlooked, leading to incomplete
implementations and post-launch issues.

---

## Feature: [Feature Name]

**Date**: [YYYY-MM-DD]
**Author**: [Name]
**Status**: [Draft | In Review | Approved | In Development]

---

## 1. Overview

### Problem Statement
[What problem does this feature solve? Who experiences this problem?
How do they currently work around it?]

### Proposed Solution
[High-level description of the feature. What will the user be able to do?]

### Success Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| [Primary metric] | [Baseline] | [Goal] | [How measured] |
| [Secondary metric] | [Baseline] | [Goal] | [How measured] |
| [Guardrail metric] | [Baseline] | [Must not decrease] | [How measured] |

---

## 2. User Stories

```
As a [user type],
I want to [action],
So that [benefit].

Acceptance criteria:
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

---

## 3. Mobile-Specific Requirements

### Platform Behavior

| Requirement | iOS Behavior | Android Behavior |
|-------------|-------------|-----------------|
| Navigation | [iOS-specific] | [Android-specific] |
| Gestures | [iOS-specific] | [Android-specific] |
| System integration | [iOS-specific] | [Android-specific] |

### Connectivity States

| State | Expected Behavior |
|-------|------------------|
| Online (WiFi) | [Full functionality] |
| Online (Cellular) | [Any restrictions? Large downloads?] |
| Offline (cached data available) | [What works? What is disabled?] |
| Offline (no cached data) | [What does the user see?] |
| Transitioning (online → offline) | [How are in-progress operations handled?] |
| Transitioning (offline → online) | [How is queued data synced?] |

### Lifecycle States

| State | Expected Behavior |
|-------|------------------|
| App in foreground | [Normal operation] |
| App in background | [What continues? What pauses?] |
| App terminated (process death) | [What state is preserved?] |
| App returns from background | [What refreshes? What resumes?] |
| Device locked/unlocked | [Any security implications?] |

### Permission Requirements

| Permission | When Requested | If Denied | Rationale Shown |
|-----------|---------------|-----------|----------------|
| [e.g., Camera] | [Trigger moment] | [Degraded behavior] | [Explanation text] |
| [e.g., Location] | [Trigger moment] | [Degraded behavior] | [Explanation text] |
| [e.g., Notifications] | [Trigger moment] | [Degraded behavior] | [Explanation text] |

---

## 4. UI/UX Requirements

### Screen Specifications
[Wireframes, mockups, or design links for each screen]

### Loading States
| Screen/Component | Loading State | Empty State | Error State |
|-----------------|--------------|-------------|-------------|
| [Screen name] | [Skeleton/spinner/etc.] | [Empty message + CTA] | [Error + retry] |

### Accessibility Requirements
- [ ] VoiceOver/TalkBack labels defined for all interactive elements
- [ ] Dynamic Type / font scaling supported
- [ ] Minimum touch targets: 44x44pt (iOS) / 48x48dp (Android)
- [ ] Color contrast ratio: >=4.5:1 (normal text) / >=3:1 (large text)
- [ ] No color-only information encoding
- [ ] Reduce Motion support for animations

### Haptic Feedback
| Action | Haptic Type | Platform |
|--------|-----------|----------|
| [e.g., Task completed] | [Success] | [Both / iOS only] |

---

## 5. Data Requirements

### Data Model
[Define new or modified data entities]

### API Requirements
| Endpoint | Method | Request | Response | Caching |
|----------|--------|---------|----------|---------|
| [Path] | [GET/POST/etc.] | [Params] | [Shape] | [Strategy] |

### Local Storage
| Data | Storage Type | Encryption | Sync |
|------|-------------|-----------|------|
| [What data] | [DB/KV/File] | [Yes/No] | [Strategy] |

---

## 6. Analytics Requirements

### Events to Track
| Event | Properties | Trigger |
|-------|-----------|---------|
| [event_name] | [property: type] | [When fired] |

### Experiments
| Experiment | Variants | Primary Metric | Duration |
|-----------|---------|---------------|----------|
| [Name] | [Control, Test A, Test B] | [Metric] | [Weeks] |

---

## 7. Push Notification Requirements

| Notification | Trigger | Content | Channel (Android) | Deep Link |
|-------------|---------|---------|-------------------|-----------|
| [Type] | [Event] | [Title + body] | [Channel name] | [Target screen] |

---

## 8. Performance Requirements

| Metric | Requirement |
|--------|-------------|
| Screen load time | < [X]ms |
| Scroll frame rate | >= 60fps |
| Memory increase | < [X]MB |
| Network requests | <= [X] per screen load |
| Offline capability | [Specify] |

---

## 9. Security Requirements

- [ ] OWASP MASVS level: [L1 / L2 / R]
- [ ] Sensitive data handling: [Specify]
- [ ] Authentication required: [Yes/No]
- [ ] Biometric authentication: [Yes/No]
- [ ] Certificate pinning: [Yes/No]

---

## 10. Release Plan

- [ ] Feature flag name: [flag_name]
- [ ] Rollout strategy: [Percentage stages]
- [ ] Rollback criteria: [What triggers rollback]
- [ ] Monitoring dashboards: [Links]

---

## 11. Out of Scope

[Explicitly list what is NOT included in this feature to prevent scope creep]

---

## 12. Open Questions

| Question | Owner | Due Date | Decision |
|----------|-------|----------|----------|
| [Question] | [Who] | [When] | [Pending/Resolved] |

---

**This PRD is the contract between product and engineering for [Feature Name].**
