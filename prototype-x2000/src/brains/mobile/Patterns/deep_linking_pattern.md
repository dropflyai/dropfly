# Pattern: Deep Linking

## Context

This pattern applies when the application must handle incoming URLs from
external sources: push notifications, web links, emails, QR codes, other
apps, or marketing campaigns. Deep linking is the mechanism that connects
the external world to specific screens within the app.

---

## Problem

Mobile apps are walled gardens. Without deep linking, users who tap a link
to "myapp.com/task/123" either land on the website (losing app context) or
see the app's home screen (losing navigation context). Deep linking bridges
this gap by routing external URLs to specific in-app screens.

---

## Solution

Implement Universal Links (iOS) and App Links (Android) for HTTP URLs,
plus custom URL schemes for app-to-app communication. Handle all link
types through a centralized routing system.

```
┌─────────────────────────────────────────────────────────┐
│              DEEP LINKING ARCHITECTURE                    │
│                                                          │
│  External URL Sources                                    │
│  ├── Web browser (Universal Links / App Links)          │
│  ├── Push notification (tap action)                     │
│  ├── Email (marketing, transactional)                   │
│  ├── QR code scan                                       │
│  ├── Other apps (custom scheme)                         │
│  └── System (Spotlight, Siri, Shortcuts)                │
│                                                          │
│       ▼                                                  │
│  ┌──────────────────────────────────────┐               │
│  │        URL Router / Handler          │               │
│  │                                      │               │
│  │  Parse URL → Extract route + params  │               │
│  │  Check auth state (logged in?)       │               │
│  │  Navigate to target screen           │               │
│  │  Pass parameters                     │               │
│  └──────────────────────────────────────┘               │
│       │                                                  │
│       ├── App running → Navigate directly               │
│       ├── App in background → Restore + navigate        │
│       └── App not running → Launch + navigate           │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation

### iOS: Universal Links

```
Configuration steps:
1. Add Associated Domains entitlement: applinks:myapp.com
2. Host apple-app-site-association (AASA) file at:
   https://myapp.com/.well-known/apple-app-site-association
```

```json
// apple-app-site-association (hosted on your web server)
{
  "applinks": {
    "details": [
      {
        "appIDs": ["TEAMID.com.company.myapp"],
        "components": [
          { "/": "/task/*", "comment": "Task detail" },
          { "/": "/profile/*", "comment": "User profile" },
          { "/": "/invite/*", "comment": "Invitation links" }
        ]
      }
    ]
  }
}
```

```swift
// SwiftUI handling
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    DeepLinkRouter.shared.handle(url)
                }
        }
    }
}

// Centralized router
class DeepLinkRouter: ObservableObject {
    static let shared = DeepLinkRouter()

    @Published var pendingDeepLink: DeepLink?

    func handle(_ url: URL) {
        guard let deepLink = parse(url) else { return }

        if AuthManager.shared.isAuthenticated {
            navigate(to: deepLink)
        } else {
            pendingDeepLink = deepLink
            // Navigate after auth completes
        }
    }

    private func parse(_ url: URL) -> DeepLink? {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else {
            return nil
        }

        let pathComponents = components.path.split(separator: "/").map(String.init)

        switch pathComponents.first {
        case "task":
            guard let taskId = pathComponents[safe: 1] else { return nil }
            return .taskDetail(id: taskId)
        case "profile":
            guard let userId = pathComponents[safe: 1] else { return nil }
            return .profile(userId: userId)
        case "invite":
            guard let code = components.queryItems?.first(where: { $0.name == "code" })?.value else { return nil }
            return .invite(code: code)
        default:
            return nil
        }
    }
}

enum DeepLink: Hashable {
    case taskDetail(id: String)
    case profile(userId: String)
    case invite(code: String)
    case settings
}
```

### Android: App Links

```xml
<!-- AndroidManifest.xml -->
<activity android:name=".MainActivity">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="myapp.com"
            android:pathPrefix="/task" />
        <data
            android:scheme="https"
            android:host="myapp.com"
            android:pathPrefix="/profile" />
    </intent-filter>
</activity>
```

```json
// /.well-known/assetlinks.json (hosted on your web server)
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.company.myapp",
    "sha256_cert_fingerprints": [
      "AA:BB:CC:DD:..."
    ]
  }
}]
```

### React Native / Expo Router

```typescript
// app.json
{
  "expo": {
    "scheme": "myapp",
    "plugins": [
      ["expo-router", {
        "origin": "https://myapp.com"
      }]
    ]
  }
}

// Expo Router handles deep links automatically via file structure:
// https://myapp.com/task/123 → app/task/[id].tsx
// myapp://settings → app/settings.tsx

// Custom handling for complex cases
import { useURL } from 'expo-linking';
import { router } from 'expo-router';

function DeepLinkHandler() {
  const url = useURL();

  useEffect(() => {
    if (url) {
      const parsed = parseDeepLink(url);
      if (parsed) {
        router.push(parsed.path);
      }
    }
  }, [url]);

  return null;
}
```

---

## Testing Deep Links

### iOS
```bash
# Test from terminal
xcrun simctl openurl booted "https://myapp.com/task/123"
xcrun simctl openurl booted "myapp://settings"
```

### Android
```bash
# Test from terminal
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://myapp.com/task/123" com.company.myapp
```

### Expo
```bash
# Test with Expo CLI
npx uri-scheme open "myapp://task/123" --ios
npx uri-scheme open "myapp://task/123" --android
```

---

## Deferred Deep Links

For users who do not have the app installed:

```
User taps link → App not installed
│
├── Universal Link → Opens in Safari
│   └── Smart App Banner → App Store → Install → Open app
│       └── Original deep link context is LOST (unless deferred)
│
├── Deferred deep linking (via attribution service)
│   1. User taps link
│   2. Attribution service records link + device fingerprint
│   3. User installs from App Store
│   4. On first launch, app queries attribution service
│   5. Service returns original deep link
│   6. App navigates to intended screen
│
│   Services: Branch.io, Firebase Dynamic Links, Adjust
```

---

## Trade-offs

### Gains
- Seamless user experience from external sources into specific content
- Marketing attribution and campaign tracking
- Notification-to-content navigation
- Cross-app integration

### Costs
- Server-side configuration (AASA, assetlinks.json)
- Domain verification complexity
- Testing across all entry points
- Edge cases: logged-out users, deleted content, version mismatches

---

## Known Pitfalls

1. **Auth-gated deep links**: If the deep link targets a screen that
   requires authentication, save the intended destination and redirect
   after login completes. Do not drop the deep link.
2. **Invalid or expired content**: The linked task may have been deleted.
   Handle gracefully with an appropriate error screen.
3. **AASA caching**: Apple aggressively caches the AASA file. Changes may
   take 24-48 hours to propagate. Test with a fresh install.
4. **Missing URL handling**: If no screen matches the URL, navigate to the
   home screen rather than crashing or showing a blank screen.
5. **Custom scheme conflicts**: Choose a unique custom scheme. Common words
   (e.g., "app://") may conflict with other apps.

---

**Every URL is a door into your app. Handle every door, even the broken ones.**
