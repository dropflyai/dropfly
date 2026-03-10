# Mobile Release Checklist

## Template Instructions

Copy and complete this checklist before every production release. Every
item must be checked or explicitly marked N/A with justification. An
unchecked item blocks the release.

---

## Release: [App Name] v[X.Y.Z]

**Release Date**: [YYYY-MM-DD]
**Release Manager**: [Name]
**Build Numbers**: iOS [X] / Android [X]

---

## 1. Code Quality

- [ ] All CI checks pass (lint, type checks, static analysis)
- [ ] No compiler warnings in release build
- [ ] All unit tests pass (iOS: ___/___  Android: ___/___)
- [ ] All integration tests pass
- [ ] All UI/E2E tests pass
- [ ] Code review completed for all changes in this release
- [ ] No TODO/FIXME/HACK comments in new code
- [ ] No hardcoded API keys, secrets, or credentials

---

## 2. Functionality

- [ ] All features in this release verified on real devices
- [ ] All user stories acceptance criteria met
- [ ] Deep links tested (all new and existing routes)
- [ ] Push notifications tested (all types)
- [ ] Background/foreground transitions tested
- [ ] Process death and state restoration tested
- [ ] Offline behavior tested
- [ ] Login/logout flow tested
- [ ] In-app purchases tested (sandbox environment)

---

## 3. Platform Testing

### iOS
- [ ] Tested on oldest supported iOS version (iOS ___)
- [ ] Tested on latest iOS version (iOS ___)
- [ ] Tested on smallest supported device (iPhone ___)
- [ ] Tested on largest supported device (iPhone ___)
- [ ] Tested on iPad (if supported)
- [ ] Dynamic Type tested (default + largest accessibility size)
- [ ] Dark mode tested
- [ ] VoiceOver tested on critical flows

### Android
- [ ] Tested on oldest supported API level (API ___)
- [ ] Tested on latest API level (API ___)
- [ ] Tested on low-end device (_____)
- [ ] Tested on high-end device (_____)
- [ ] Tested on tablet (if supported)
- [ ] Font scaling tested (default + largest)
- [ ] Dark mode tested
- [ ] TalkBack tested on critical flows
- [ ] Configuration change (rotation) tested
- [ ] "Don't Keep Activities" tested

---

## 4. Performance

- [ ] Cold start time within budget: ___ms (target: <1000ms)
- [ ] No visible jank during scrolling (profiled on low-end device)
- [ ] Memory usage within budget: ___MB (target: <200MB)
- [ ] App download size within budget: ___MB (target: <50MB)
- [ ] No memory leaks detected (profiler verification)
- [ ] Battery usage acceptable (no background drain issues)

---

## 5. Security

- [ ] No sensitive data in logs (release build verified)
- [ ] Certificate pinning configured (if applicable)
- [ ] API tokens stored in Keychain/Keystore (not UserDefaults/SharedPrefs)
- [ ] No debug flags enabled in release build
- [ ] ProGuard/R8 obfuscation enabled (Android)
- [ ] App Transport Security configured correctly (iOS)
- [ ] Third-party SDK security advisories checked

---

## 6. Analytics and Monitoring

- [ ] All new analytics events verified in staging
- [ ] Event properties match documentation
- [ ] Crash reporting verified (test crash → appears in dashboard)
- [ ] Feature flags configured for new features
- [ ] Monitoring dashboards updated for new metrics
- [ ] Alerting configured for critical metrics

---

## 7. App Store Metadata

### iOS (App Store Connect)
- [ ] App version and build number updated
- [ ] "What's New" release notes written
- [ ] Screenshots updated (if UI changed)
- [ ] Keywords updated (if applicable)
- [ ] Privacy policy URL current
- [ ] App Privacy (nutrition labels) accurate
- [ ] Content rating accurate
- [ ] Review notes for App Review team (if needed)

### Android (Play Console)
- [ ] Version code and version name updated
- [ ] Release notes written (all supported languages)
- [ ] Screenshots updated (if UI changed)
- [ ] Content rating questionnaire current
- [ ] Data safety section accurate
- [ ] Target API level meets Play Store requirements

---

## 8. Distribution

- [ ] Code signing certificates valid (not expiring within 30 days)
- [ ] Provisioning profiles valid (iOS)
- [ ] Staged rollout percentage defined: ___%
- [ ] Rollback plan documented
- [ ] Hotfix branch identified (if needed)
- [ ] On-call engineer identified for release monitoring

---

## 9. Communication

- [ ] Engineering team notified of release
- [ ] QA team signed off
- [ ] Product team signed off
- [ ] Customer support notified of changes
- [ ] Known issues documented

---

## 10. Post-Release Monitoring

### First 24 Hours
- [ ] Crash-free rate above 99%
- [ ] No new P0/P1 crashes
- [ ] ANR rate stable (Android)
- [ ] Ratings not declining
- [ ] No spike in support tickets
- [ ] Feature flag metrics as expected

### First 72 Hours
- [ ] Staged rollout progressing on schedule
- [ ] Key metrics trending as expected
- [ ] No regression in engagement metrics

---

## Sign-Off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | [ ] |
| QA | | | [ ] |
| Product | | | [ ] |
| Release Manager | | | [ ] |

---

**No unchecked items. No exceptions. Every release is a promise to users.**
