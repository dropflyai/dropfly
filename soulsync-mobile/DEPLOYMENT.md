# SoulSync Deployment Guide

## Prerequisites

1. **Expo Account**: Create at [expo.dev](https://expo.dev)
2. **Apple Developer Account**: Required for TestFlight/App Store
3. **EAS CLI**: Install with `npm install -g eas-cli`

## Initial Setup

### 1. Configure EAS Project

```bash
# Login to Expo
eas login

# Initialize EAS project (first time only)
eas init

# This will create/update the project ID in app.json
```

### 2. Update Configuration

Edit `app.json` and replace:
- `"projectId": "your-eas-project-id"` with your actual EAS project ID
- `"owner": "soulsync"` with your Expo username

Edit `eas.json` and replace:
- `"appleId"` with your Apple ID email
- `"ascAppId"` with your App Store Connect app ID
- `"appleTeamId"` with your Apple Developer Team ID

### 3. Configure Secrets

Add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `EXPO_TOKEN` | Your Expo access token (from expo.dev settings) |
| `EXPO_APPLE_ID` | Your Apple ID email |
| `EXPO_APPLE_PASSWORD` | App-specific password for your Apple ID |

To create an app-specific password:
1. Go to appleid.apple.com
2. Sign in → Security → App-Specific Passwords
3. Generate a new password for "EAS Submit"

### 4. Add Environment Variables

Create secrets in EAS for production:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-key"
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value "your-key"
```

## Build Commands

### Development Build (with dev client)
```bash
eas build --profile development --platform ios
```

### Preview Build (internal testing)
```bash
eas build --profile preview --platform ios
```

### Production Build (App Store)
```bash
eas build --profile production --platform ios
```

### Submit to TestFlight
```bash
eas submit --platform ios --profile production
```

## Automated Deployments

The GitHub Actions workflows handle:

1. **preview-build.yml**: Runs on every PR
   - TypeScript check
   - Preview build for testing

2. **testflight-deploy.yml**: Runs on main branch push
   - Builds and submits to TestFlight automatically
   - Can also be triggered manually

## Required Assets

Before building, ensure these files exist:

```
assets/
├── images/
│   ├── icon.png           (1024x1024, app icon)
│   ├── splash-icon.png    (any size, splash screen)
│   ├── adaptive-icon.png  (1024x1024, Android adaptive icon)
│   ├── favicon.png        (48x48, web favicon)
│   └── notification-icon.png (96x96, notification icon)
└── sounds/
    └── notification.wav   (notification sound, optional)
```

## First TestFlight Release Checklist

- [ ] App icon (1024x1024 PNG, no alpha)
- [ ] Screenshots for App Store (6.7", 6.5", 5.5" iPhones)
- [ ] App description
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire completed
- [ ] App review notes (explain test account if needed)

## Troubleshooting

### Build fails with "Missing credentials"
```bash
eas credentials
# Follow prompts to set up iOS distribution certificate
```

### Submit fails with "Invalid bundle identifier"
Ensure `bundleIdentifier` in app.json matches App Store Connect exactly.

### OTA updates not working
Check that `runtimeVersion` in app.json matches between builds.

## Production Checklist

Before going live:

- [ ] Remove all console.log statements
- [ ] Enable error reporting (Sentry, etc.)
- [ ] Test deep links
- [ ] Test push notifications
- [ ] Load test Supabase (Edge Functions, RLS)
- [ ] Review and enable storage RLS policies
- [ ] Set up database backups
- [ ] Configure rate limiting
