# App Architecture Decision Record

## Template Instructions

Copy this template when defining the architecture for a new mobile
application. Fill in every section. This document becomes the authoritative
architectural reference for the project.

---

## Project: [App Name]

**Date**: [YYYY-MM-DD]
**Author**: [Name / Mobile Brain]
**Status**: [Proposed | Accepted | Superseded]

---

## 1. Context and Requirements

### Business Context
- [ ] What problem does this app solve?
- [ ] Who is the target user?
- [ ] What is the expected user base (Year 1)?
- [ ] What is the expected app lifetime?
- [ ] What is the monetization model?

### Technical Requirements
- [ ] Target platforms: iOS / Android / Both
- [ ] Minimum OS versions: iOS __ / Android __
- [ ] Offline requirements: None / Read-only / Full offline
- [ ] Real-time requirements: None / Notifications only / Live data
- [ ] Security level: Standard / OWASP L1 / OWASP L2
- [ ] Platform API needs: [List specific APIs: HealthKit, Camera, etc.]
- [ ] Third-party SDK integration: [List SDKs]

### Team and Timeline
- [ ] Team size: __ mobile engineers
- [ ] iOS expertise: None / Junior / Mid / Senior
- [ ] Android expertise: None / Junior / Mid / Senior
- [ ] React Native expertise: None / Junior / Mid / Senior
- [ ] Timeline to MVP: __ weeks/months
- [ ] Timeline to v1.0: __ weeks/months

---

## 2. Platform Strategy

### Decision: [Native iOS | Native Android | Native Both | React Native/Expo | Flutter | KMP]

**Rationale**: [Reference `01_foundations/cross_platform_strategy.md`
decision matrix. Explain why this strategy was chosen given the constraints.]

**Trade-offs accepted**:
- [What we gain]
- [What we give up]

**Migration path if this choice proves wrong**:
- [How would we migrate to an alternative]

---

## 3. Architecture Pattern

### Decision: [MVVM | MVI | Clean Architecture | Other]

**Rationale**: [Reference `01_foundations/mobile_architecture.md` decision
matrix. Explain why this pattern was chosen.]

### Layer Definitions

**UI Layer**:
- Framework: [SwiftUI | UIKit | Compose | React Native]
- State management: [describe approach]
- Navigation: [describe approach]

**Domain Layer** (if applicable):
- Use cases: [describe scope]
- Domain models: [describe approach]

**Data Layer**:
- Local storage: [SwiftData | Core Data | Room | AsyncStorage | MMKV | etc.]
- Networking: [URLSession | Retrofit | Ktor | fetch/axios | etc.]
- Caching strategy: [describe approach]

---

## 4. Project Structure

```
[Paste the intended directory structure here]
```

---

## 5. Key Technical Decisions

### Authentication
- [ ] Method: [Email/password | OAuth | Biometric | Passkeys]
- [ ] Token storage: [Keychain | Keystore | SecureStore]
- [ ] Session duration: [__ days/weeks]

### Networking
- [ ] API style: [REST | GraphQL | gRPC]
- [ ] Pagination: [Cursor | Offset]
- [ ] Caching: [HTTP cache | Custom | React Query]

### Offline Strategy
- [ ] Approach: [None | Read cache | Full offline-first]
- [ ] Conflict resolution: [Last-write-wins | Server-wins | Manual]
- [ ] Sync mechanism: [Pull | Push | Bidirectional]

### Push Notifications
- [ ] Service: [APNs direct | FCM | Both]
- [ ] Categories: [List notification types]

### Analytics
- [ ] Provider: [Firebase | Amplitude | Mixpanel | Custom]
- [ ] Crash reporting: [Crashlytics | Sentry | Bugsnag]
- [ ] Feature flags: [LaunchDarkly | Statsig | Firebase RC]

---

## 6. Performance Budgets

| Metric | Budget |
|--------|--------|
| Cold start (p50) | __ ms |
| Cold start (p95) | __ ms |
| Frame rate | __ fps |
| App download size | __ MB |
| Memory (peak foreground) | __ MB |
| API response (p50) | __ ms |

---

## 7. Dependencies

| Dependency | Purpose | Version | License |
|-----------|---------|---------|---------|
| [Name] | [Why] | [x.y.z] | [MIT/Apache/etc.] |

---

## 8. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|-----------|
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigation plan] |

---

## 9. Review and Approval

- [ ] Architecture reviewed by Mobile Brain
- [ ] Performance budgets validated
- [ ] Security requirements mapped to OWASP MASVS level
- [ ] Accessibility requirements defined
- [ ] Approved by: [Name/Role]

---

**This document is the architectural source of truth for [App Name].**
