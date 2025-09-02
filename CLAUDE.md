# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YourPoint (가제명: OurSpace) - A private shared space app for couples, friends, and families to share schedules and memories. React Native (Expo) app with Supabase backend.

## Development Commands

```bash
# Start development server
npm start
# or
expo start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## Architecture

- **Platform**: React Native with Expo
- **Backend**: Supabase (auth, database, storage, push notifications)
- **Navigation**: react-navigation (planned)
- **State Management**: zustand or recoil (planned)
- **Calendar**: react-native-calendars (planned)

## Development Phases

Follow the 6-phase implementation plan in `/plan/implementation-plan.md`:

1. **Phase 1**: Basic setup and splash/onboarding screens
2. **Phase 2**: Authentication system with social login
3. **Phase 3**: Core features (shared calendar, spaces)
4. **Phase 4**: Advanced features (profiles, push notifications, anniversaries)
5. **Phase 5**: Deployment to app stores
6. **Phase 6**: Operations and feature expansion

## Key Concepts

- **Spaces**: Shared environments where users collaborate (1-N members)
- **Members/Owners**: Users can be members or owners of spaces
- **Shared Calendar**: Core feature for schedule coordination
- **Privacy**: All data is space-specific with proper access control

## Design Guidelines

- **Theme**: "Simple & Warm" - intuitive but emotionally engaging
- **Fonts**: Montserrat (UI), Merriweather (long text)
- **Border Radius**: 0.625rem (10px)
- **Support**: Light and dark modes
- **Colors**: Use CSS variables (--primary, --accent, --background, --destructive)

## File Structure (Planned)

```
screens/
  Auth/           # Login, signup screens
  Main/           # Calendar and core features  
  Space/          # Space management
  Profile/        # User profile management
services/         # API integration with Supabase
lib/             # Supabase client configuration
components/      # Reusable UI components
supabase/        # Database schemas and functions
```

## Database Tables (Planned)

- Users, Spaces, SpaceMembers, Events, Anniversaries

Refer to `/plan/` directory for detailed specifications and current phase requirements.