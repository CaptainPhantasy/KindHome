Kind Home - Single Source of Truth
Created: 06:46:39 Dec 11, 2025 Last Updated: 02:40:46 Dec 12, 2025

⚠️ CRITICAL: READ THIS FIRST
All agents MUST read this entire document before making any changes.

🎯 VISION & GOAL (Day Zero)
"Kind Home" - A dual-interface application helping adults (70-85+) maintain independence and giving caregivers peace of mind.

Core Philosophy:

Elder Mode (Tablet): "One Screen, One Task" - Huge touch targets (80px min), warm contrast, simple navigation.

Caregiver Mode (Desktop/Mobile): "Dense & Informative" - Multi-tenant admin dashboard to manage meds, scenes, and view health trends.

Key Features:

The Bridge: family_links table connects Caregivers to Elders (Multi-tenancy).

Kind Home Coach: AI assistant for daily planning (Voice Coach with Gemini integration).

Kind Scenes: Shared home automation control.

Memory Vault: Semantic search for lost items (localStorage-based implementation).

📍 CURRENT STATUS
Phase: 1 ✅ Complete | Phase 2: Partially Complete (Track A: ~75%, Track B: ~90%)

Completed:

✅ Phase 1: Foundation
- Theme system: 24 canonical tokens, warm/dark modes
- Tech Stack Stabilization: Tailwind v3.4 (Strict), TypeScript
- Database: profiles, family_links, medications, med_events schemas + RLS
- Layouts: ElderLayout (Bottom Nav) & CaregiverLayout (Sidebar)
- Routing: React Router v7 structure

✅ Phase 2 Track A (Elder UI):
- 2A.1 Today Dashboard: BigActionCard components, "Morning Pill" prompt, medications timeline
- 2A.2 Check-in Widget: "I'm OK" button (Sage Green)
- 2A.3 Coach Teaser: "Ask Kind Home" AI interface stub (in TodayPage)
- Coach Page: Full Voice Coach implementation with Gemini AI (`/elder/coach`)
- Memory Vault Page: Complete implementation with MemoryInputWidget and MemoryList (`/elder/memory-vault`)

✅ Phase 2 Track B (Caregiver UI):
- 2B.1 Elder Selector: "Who are you caring for?" screen with auto-redirect logic (uses family_links)
- 2B.2 Dashboard Overview: High-level status of linked Elder (Adherence/Mood)
- 2B.3 Medications Manager (CRUD): Complete CRUD interface for managing medications (`/caregiver/medications`)
- 2B.4 Safety Stream: Activity feed component displaying medication events and check-ins (embedded in DashboardOverview)

Additional Features Implemented:
- MedicationScanner: Camera-based medication scanning component (Fixed playback stability issues & infinite dependency loop) with mode logic (Caregiver vs Elder)
- Theme System: Warm/Dark mode with ThemeToggle component (restored to Elder and Caregiver layouts)
- Voice Coach: Full voice agent integration (useVoiceAgent hook, geminiService)
- Memory Vault: Complete localStorage-based memory capture system
- Video Bridge (Phase 3.3): LiveKit integration with Supabase Edge Function for token minting. Caregiver page uses standard VideoConference component. Elder page has custom elder-friendly UI with huge touch targets (h-24 w-24 buttons, size-48 icons). Room naming: `video-{elderId}` for caregiver calls, `video-{currentUserId}` for elder rooms.
- People Pages: Stub pages for both Elder and Caregiver modes
- Settings Page: Stub page for Caregiver mode
- Code Splitting: All routes use React.lazy() for code splitting - Elder routes only load Elder chunks, Caregiver routes only load Caregiver chunks
- RootGatekeeper: Authentication and role-based routing component at `/` that redirects based on user role (elder → `/elder`, caregiver → `/caregiver`)

Next Steps:

⏳ Track A (Elder): 
- 2A.4 Meds View (Read-Only): Simple list of today's medications (NOT YET IMPLEMENTED)

⏳ Track B (Caregiver):
- All core features complete! Ready for Phase 3.



🗺️ MASTER PLAN ROADMAP
Phase 1: Foundation (✅ Complete)
1.1 Theme & Config: Warm mode palette, Tailwind v3 setup, ESLint rules.

1.2 Architecture: Layouts, Routing, Supabase Client.

1.3 Database: Core schema (profiles, family_links) and RLS policies.

Phase 2: The Core Loops (Parallel Work Allowed) - IN PROGRESS
🛤️ Track A: Elder UI (The Tablet)
**2A.1 Today Dashboard** ✅ [COMPLETE]: BigActionCard components, "Morning Pill" prompt, medications timeline, CheckInWidget.

**2A.2 Check-in Widget** ✅ [COMPLETE]: "I'm OK" button (Sage Green).

**2A.3 Coach Teaser** ✅ [COMPLETE]: "Ask Kind Home" AI interface stub (component exists, used in TodayPage).

**Coach Page** ✅ [COMPLETE]: Full Voice Coach implementation at `/elder/coach` with VoiceCoachWidget, useVoiceAgent hook, and Gemini AI integration.

**Memory Vault Page** ✅ [COMPLETE]: Full implementation at `/elder/memory-vault` with MemoryInputWidget, MemoryList, localStorage persistence.

⏳ 2A.4 Meds View (Read-Only): Simple list of today's medications (NOT YET IMPLEMENTED - no dedicated route/page).

🛤️ Track B: Caregiver UI (The Admin)
**2B.1 Elder Selector** ✅ [COMPLETE]: "Who are you caring for?" screen with auto-redirect logic for single elder (uses family_links via useLinkedElders hook).

**2B.2 Dashboard Overview** ✅ [COMPLETE]: High-level status of linked Elder (Adherence/Mood) via DashboardOverview component and useElderDashboard hook.

**2B.3 Medications Manager (CRUD)** ✅ [COMPLETE]: Full CRUD interface at `/caregiver/medications?elder={id}`. Features: Add/Edit/Delete medications with name, dosage, frequency (cron schedule), and purpose fields. Uses TintedCard for medication list display. Frequency options include common schedules (once daily, twice daily, etc.) with automatic cron conversion.

**2B.4 Safety Stream** ✅ [COMPLETE]: Activity feed component (`SafetyStream.tsx`) displaying chronological medication events (taken/skipped/missed) with medication names joined from medications table. Embedded in DashboardOverview. Shows events from last 7 days. Ready for check-in integration when check-in system is implemented.

🧭 NAVIGATION & PAGES (ACTUAL ROUTES)
Elder Routes (`/elder`):
- `/elder` or `/elder/today` → TodayPage (Today Dashboard with meds timeline, check-in widget)
- `/elder/people` → ElderPeoplePage (stub)
- `/elder/memory-vault` → MemoryVaultPage (complete implementation)
- `/elder/scanner` → ElderScannerPage (Medication scanner; lockMode MEDICATION)
- `/elder/video` → ElderVideoPage (LiveKit integration with custom elder-friendly UI)
- `/elder/coach` → CoachPage (full Voice Coach implementation)

Caregiver Routes (`/caregiver`):
- `/caregiver` → ElderSelector (auto-redirects if 1 elder)
- `/caregiver/dashboard?elder={id}` → DashboardPage → DashboardOverview (includes SafetyStream)
- `/caregiver/medications?elder={id}` → MedicationsPage (CRUD interface for medications)
- `/caregiver/scanner` → CaregiverScannerPage (Medication/Identify scanner)
- `/caregiver/people` → CaregiverPeoplePage (stub)
- `/caregiver/video?elder={id}` → CaregiverVideoPage (LiveKit integration with VideoConference component)
- `/caregiver/settings` → SettingsPage (stub)

Root Route:
- `/` → RootGatekeeper (authentication & role-based routing: elder → `/elder`, caregiver → `/caregiver`, unauthenticated → login page)



Phase 3: Connection & Memory
3.1 People & Social: Large family cards (Elder) vs Contact Manager (Caregiver).

3.2 Memory Vault: Voice search (Elder) vs Note Organizer (Caregiver).

**3.3 Video Bridge** ✅ [COMPLETE]: WebRTC integration (LiveKit) with Supabase Edge Function (`mint-token`) for JWT token generation. Caregiver video page (`/caregiver/video?elder={id}`) uses standard VideoConference component. Elder video page (`/elder/video`) has custom elder-friendly layout with huge touch targets. Room naming convention: `video-{elderId}` for caregiver calls, `video-{currentUserId}` for elder rooms. Auto-answer logic implemented: Elder video page automatically connects when loaded and listens for incoming participants via LiveKit room events (RoomEvent.ParticipantConnected). **Development Mode:** Both video pages support testing without authentication - elder page uses dev IDs (from URL param `?publicId=` or localStorage), caregiver uses `'Dev Caregiver'` identity. Dev mode automatically activates when no authenticated user is found.



Phase 4: Home Automation
4.1 Hub Integration: home_hubs table and Edge Functions.

4.2 Scene Cards: "Good Morning" triggers.

4.3 Shared Control: Caregiver settings panel for scene configuration.



💾 DATABASE SCHEMA (Reference)
Agents must build against this existing structure:

profiles: Users (Elder/Caregiver role).

family_links: Many-to-Many bridge. Connects caregiver_id to elder_id.

medications: Name, dosage, schedule_cron, linked to elder_id.

med_events: History of taken/skipped meds.

home_hubs: Connection to Home Assistant/Bridge.

home_scenes: UI buttons for automation payloads.

memory_notes: pgvector-enabled notes.



🎨 THEME SYSTEM (24 Tokens)
Radius: lg: 0.9rem, md: 0.75rem, sm: 0.5rem

Token	Warm Mode	Dark Mode	Usage Rule
background	#FCE8B8	#111827	bg-background
foreground	#5D5347	#E5E7EB	text-foreground
card	#FDEFCB	#161F2A	bg-card
primary	#A17A74	#D3A49D	bg-primary
secondary	#C5D4AB	#9FB88A	bg-secondary
accent	#F4BF90	#F4BF90	bg-accent

Export to Sheets

Theme Rules (Critical)
Token-Only: Never use bg-white or text-black.

Pairings: Solid backgrounds (bg-primary) MUST use paired text (text-primary-foreground).

Elder Mode: [data-mode="elder"] enforces 20px+ text and 80px+ targets.

🏗️ TECH STACK
Frontend: Vite + React Router v7 + Shadcn/UI + Tailwind CSS v3.4 (Strict)

State: React Context (ThemeProvider) + Custom Hooks (useLinkedElders, useElderDashboard, useVoiceAgent, useCameraStream, useMedicationScanner, useMemoryTidier)

AI/ML: Google Gemini AI (@google/genai) via geminiService

Database: Supabase (Auth, Postgres, Vector, Edge Functions)

Video: LiveKit React Components (@livekit/components-react, livekit-client)

Language: TypeScript (Strict Mode, no any)

Note: TanStack Query and Zustand are NOT currently installed or used. State management is via React Context and custom hooks.

🚫 FORBIDDEN PATTERNS
STRICT BAN: Using Tailwind v4 syntax (@import "tailwindcss") - MUST use @tailwind base;

Raw hex colors in components (#ffffff, #000000)

Raw Tailwind colors (bg-white, text-black)

Modifying config files (vite.config.ts, tailwind.config.js) to fix code errors

Using any types in TypeScript



📁 PROJECT STRUCTURE (ACTUAL)
src/
├── features/
│   ├── elder/                    ← Tablet UI (Elder Mode)
│   │   ├── components/           ← BigActionCard, CheckInWidget, CoachTeaser
│   │   ├── TodayPage.tsx         ← Today Dashboard (meds timeline, check-in)
│   │   ├── PeoplePage.tsx        ← Stub
│   │   ├── VideoPage.tsx         ← LiveKit integration (elder-friendly custom UI)
│   │   └── MemoryPage.tsx        ← Stub (MemoryVaultPage is in pages/)
│   └── caregiver/                ← Admin UI (CareBridge)
│       ├── dashboard/            ← DashboardOverview.tsx, SafetyStream.tsx, useElderDashboard.ts
│       ├── elders/               ← ElderSelector.tsx, useLinkedElders.ts
│       ├── DashboardPage.tsx     ← Main dashboard page (reads elder query param)
│       ├── MedicationsPage.tsx    ← Medications CRUD interface
│       ├── PeoplePage.tsx        ← Stub
│       ├── VideoPage.tsx         ← LiveKit integration (VideoConference component)
│       └── SettingsPage.tsx      ← Stub
├── pages/                        ← Top-level pages
│   ├── CoachPage.tsx             ← Voice Coach page (uses VoiceCoachWidget)
│   └── MemoryVaultPage.tsx       ← Memory Vault page (complete implementation)
├── layouts/
│   ├── ElderLayout.tsx           ← Bottom nav (Today, People, Vault, Video, Coach)
│   └── CaregiverLayout.tsx       ← Sidebar navigation
├── components/
│   ├── ui/                       ← Shadcn primitives (button, elder-button, animated-theme-toggler)
│   ├── theme/                    ← TintedCard, SolidCard
│   ├── MedicationScanner.tsx     ← Camera-based medication scanning
│   ├── MemoryInputWidget.tsx     ← Memory capture input
│   ├── MemoryList.tsx            ← Memory list display
│   ├── VoiceCoachWidget.tsx      ← Full voice coach interface
│   └── ThemeToggle.tsx           ← Theme switcher
├── hooks/                        ← Custom React hooks
│   ├── useCameraStream.ts        ← Camera access management
│   ├── useMedicationScanner.ts   ← Medication scanning logic
│   ├── useMemoryTidier.ts        ← Memory processing
│   └── useVoiceAgent.ts          ← Voice coach agent logic
├── services/
│   └── geminiService.ts          ← Google Gemini AI integration
├── contexts/
│   └── ThemeProvider.tsx         ← Theme context (warm/dark)
├── lib/
│   ├── supabase.ts               ← Supabase client config
│   ├── utils.ts                  ← Utility functions
│   └── video.ts                  ← Video utilities (getToken function for LiveKit)
├── types/
│   └── schema.ts                 ← Database schema types (Profile, FamilyLink, Medication, MedEvent)
├── types.ts                      ← Application types (MedicationData, CameraState, ScannerState, AgentState, MemoryRecord, etc.)
├── globals.css                   ← 24 tokens, theme system (@tailwind directives)
└── App.tsx                       ← Router configuration with code splitting (React.lazy + Suspense)
📋 DOCUMENT MANAGEMENT
No orphan documents: Store in Documents/.

Timestamps: All docs require **Created:** and **Last Updated:**.

Workflow: Check existing docs -> Create/Edit -> Update Timestamp.

🔧 KEY IMPLEMENTATION NOTES
- Voice Coach: Full implementation with Gemini AI, real-time transcription, agent responses, feedback system
- Memory Vault: Currently uses localStorage (not yet connected to Supabase memory_notes table)
- Medication Scanner: Camera-based scanning with OCR/AI analysis (Gemini integration)
- Video Bridge: LiveKit integration with Supabase Edge Function (`supabase/functions/mint-token/index.ts`) for token generation. Uses `@livekit/components-react` and `livekit-client`. Environment variables: `VITE_LIVEKIT_URL` (client), `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` (Edge Function). LiveKit styles imported in `src/index.css`.
- State Management: Uses React Context for theme, custom hooks for data fetching (no TanStack Query/Zustand)
- Routing: React Router v7 with nested routes, query params for elder selection. **Code Splitting:** All routes use `React.lazy()` with `Suspense` boundaries. Elder routes only load Elder chunks, Caregiver routes only load Caregiver chunks. Loading fallback uses centered Loader2 spinner.
- Authentication & Routing: RootGatekeeper component at `/` handles authentication state and role-based routing. Unauthenticated users see login page with Google OAuth and email/password options. Missing session errors are handled gracefully (treated as "not authenticated" rather than fatal errors). Authenticated users are redirected based on profile role (elder → `/elder`, caregiver → `/caregiver`). Supports both OAuth (Google) and email/password authentication with sign-up flow.
- Medications Manager: Full CRUD interface with form validation. Frequency options convert to cron expressions. Purpose field included in form (note: not yet in database schema - may need schema update for production).
- Safety Stream: Queries med_events table joined with medications to display medication names. Chronological feed showing last 7 days. Ready for check-in integration when check-in system is implemented.
- Theme System: CSS variables in globals.css (data-theme attribute), ThemeProvider context
- Visual Design Enhancements: 
  - **Shadow System**: Created theme-aware shadow utilities (`shadow-realistic` and `shadow-card-depth`) that adapt to light/dark mode:
    - Light mode: Dark shadows (rgba(0, 0, 0, 0.4)) for depth
    - Dark mode: Light shadows (rgba(255, 255, 255, 0.15)) for contrast
    - **GLOBAL CONSISTENCY**: All shadows use the SAME opacity values globally (40% in light, 15% in dark)
  - **Button Consistency**: ALL buttons globally have:
    - `shadow-realistic` class (theme-aware shadows)
    - `active:scale-95` press state (consistent depression effect)
    - `transition-all` (consistent transitions, not transition-colors/transform/opacity)
    - Updated all button variants (default, destructive, outline, secondary, ghost, link) in `button.tsx`
    - Fixed ALL raw `<button>` elements: MedicationScanner (12 buttons), MemoryInputWidget (5 buttons), VoiceCoachWidget (6 buttons), CheckInWidget (1 button), ThemeToggle (1 button), RootGatekeeper (2 buttons), ElderLayout nav (6 links), CaregiverLayout nav (7 links), VideoPage buttons (3 buttons), caregiver pages (4 buttons), MemoryList (1 button), CoachTeaser (2 buttons), MedicationsPage (2 buttons), BigActionCard (3 medication buttons on Today page - fixed shadow from shadow-card-depth to shadow-realistic)
  - **Card Consistency**: ALL cards globally have:
    - `shadow-card-depth` class (theme-aware shadows)
    - `translateZ(15px)` for consistent 15px visual depth
    - Applied to: SolidCard, TintedCard, MemoryList cards, MemoryInputWidget containers, VoiceCoachWidget modal, MedicationScanner cards, MemoryVaultPage, ElderLayout nav, VideoPage cards, CoachTeaser container
    - **NOTE**: BigActionCard is a BUTTON component, not a card - uses `shadow-realistic` not `shadow-card-depth`
  - **Dark Mode Fix**: Fixed coach onboarding modal dark mode - replaced hardcoded bg-white/bg-warm-white with theme tokens (bg-card, bg-background)
- Authentication Improvements: 
  - Fixed "Auth session missing!" error handling - missing sessions treated as normal "not authenticated" state
  - Added development mode bypass - when running on localhost, shows role selector and skips authentication entirely
  - Added email/password login and sign-up options (production mode only)

02:40:46 Dec 12, 2025