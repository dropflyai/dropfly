# SoulSync Mobile App

Voice-first dating app that prioritizes emotional compatibility before physical attraction.

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
soulsync-mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (welcome, sign-up, sign-in)
│   ├── (onboarding)/      # 7-step onboarding flow
│   ├── (main)/            # Main app tabs (discover, connections, inbox, profile)
│   ├── (connectivity)/    # Connectivity round modal
│   └── _layout.tsx        # Root layout with auth protection
├── components/
│   ├── ui/                # Base components (Button, Input, Text, Card, etc.)
│   ├── voice/             # VoiceRecorder, VoicePlayer
│   └── connectivity/      # Round components (to be built)
├── lib/
│   ├── supabase.ts        # Supabase client & helpers
│   ├── store.ts           # Zustand stores
│   ├── api.ts             # API utilities
│   └── utils.ts           # Utility functions
├── constants/
│   └── theme.ts           # Design system (colors, spacing, etc.)
├── types/
│   └── index.ts           # TypeScript types
└── supabase/
    └── schema.sql         # Database schema (run in Supabase SQL editor)
```

## Tech Stack

- **Framework**: React Native + Expo (SDK 54)
- **Routing**: Expo Router v6 (file-based)
- **State**: Zustand with persist middleware
- **Backend**: Supabase (Auth, Database, Storage)
- **Voice**: expo-av
- **Forms**: react-hook-form + zod

## Key Features

### Auth Flow
- Email/password signup
- Apple Sign-In
- Age verification (18+)
- Protected routes

### Onboarding (7 steps)
1. Basics (name, birthdate, gender)
2. Location (LA only for MVP)
3. Relationship goal
4. Core values (select 5)
5. Attachment style quiz
6. Love languages (select up to 3)
7. Voice intro recording
8. Photo upload (min 2)

### Connectivity System
- Voice rounds (8-hour timer)
- Video round (24-hour timer)
- Lifeline system (2 per connection, +12 hours each)
- AI-adaptive progression
- Photo reveal after completion

## Supabase Setup

1. Create a Supabase project
2. Update `.env` with your keys:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```
3. Run `supabase/schema.sql` in the SQL editor
4. Create storage buckets: `voice-notes`, `photos` (both public)

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=https://bqvhcnalegkfwrmzofaf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-key (for Whisper transcription)
```

## Development Guidelines

- Always test voice recording on physical devices
- Use Zustand stores for state management
- Follow the existing component patterns in `components/ui/`
- Keep screens in their respective route groups

## MVP Checklist

### Phase 1: Foundation ✅
- [x] Expo project setup
- [x] Supabase client configuration
- [x] Auth screens (sign-up, sign-in, Apple)
- [x] Onboarding flow (all 7 steps)
- [x] Voice recording component
- [x] Basic profile creation

### Phase 2: Matching (In Progress)
- [x] Discovery feed (browse voice intros)
- [ ] Send connection request with voice note
- [ ] Women's approval inbox
- [ ] Basic matching algorithm
- [ ] Match creation logic

### Phase 3: Connectivity
- [x] Connectivity round system (basic)
- [x] Timer implementation + lifelines
- [x] Prompt delivery system
- [ ] AI-adaptive round logic
- [ ] Video round implementation

### Phase 4: Reveal + Polish
- [ ] Photo reveal flow
- [ ] Compatibility score display
- [ ] Real Life Ready messaging
- [ ] Push notifications

### Phase 5: Launch
- [ ] Content moderation
- [ ] App Store submission
- [ ] TestFlight beta
- [ ] LA launch

## Commands

```bash
# Development
npm start           # Start Expo
npm run ios         # iOS simulator
npm run android     # Android emulator

# Production
npx expo build:ios
npx expo build:android
```

## Notes

- MVP targets Los Angeles only
- Women-approve model (men send requests, women approve)
- Voice-first, photos revealed last
- 8-hour timers for voice rounds, 24-hour for video
- 2 lifelines per Connectivity (+12 hours each)
