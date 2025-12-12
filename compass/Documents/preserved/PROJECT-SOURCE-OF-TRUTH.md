Kind Home - Single Source of Truth
Created: 06:46:39 Dec 11, 2025 Last Updated: 19:07:26 Dec 11, 2025

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
Phase: 1 ✅ Complete | Phase 2: Partially Complete (Track A: ~75%, Track B: ~50%)

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

Additional Features Implemented:
- MedicationScanner: Camera-based medication scanning component (Fixed playback stability issues & infinite dependency loop) with mode logic (Caregiver vs Elder)
- Theme System: Warm/Dark mode with ThemeToggle component (restored to Elder and Caregiver layouts)
- Voice Coach: Full voice agent integration (useVoiceAgent hook, geminiService)
- Memory Vault: Complete localStorage-based memory capture system
- Video Pages: Stub pages for both Elder and Caregiver modes
- People Pages: Stub pages for both Elder and Caregiver modes
- Settings Page: Stub page for Caregiver mode

Next Steps:

⏳ Track A (Elder): 
- 2A.4 Meds View (Read-Only): Simple list of today's medications (NOT YET IMPLEMENTED)

⏳ Track B (Caregiver):
- 2B.3 Meds Manager (CRUD): Add/Edit/Delete medications and schedules (NOT YET IMPLEMENTED)
- 2B.4 Safety Stream: Activity feed of check-ins and completed tasks (NOT YET IMPLEMENTED)



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

⏳ 2B.3 Meds Manager (CRUD): Add/Edit/Delete medications and schedules (NOT YET IMPLEMENTED).

⏳ 2B.4 Safety Stream: Activity feed of check-ins and completed tasks (NOT YET IMPLEMENTED).

🧭 NAVIGATION & PAGES (ACTUAL ROUTES)
Elder Routes (`/elder`):
- `/elder` or `/elder/today` → TodayPage (Today Dashboard with meds timeline, check-in widget)
- `/elder/people` → ElderPeoplePage (stub)
- `/elder/memory-vault` → MemoryVaultPage (complete implementation)
- `/elder/scanner` → ElderScannerPage (Medication scanner; lockMode MEDICATION)
- `/elder/video` → ElderVideoPage (stub)
- `/elder/coach` → CoachPage (full Voice Coach implementation)

Caregiver Routes (`/caregiver`):
- `/caregiver` → ElderSelector (auto-redirects if 1 elder)
- `/caregiver/dashboard?elder={id}` → DashboardPage → DashboardOverview
- `/caregiver/scanner` → CaregiverScannerPage (Medication/Identify scanner)
- `/caregiver/people` → CaregiverPeoplePage (stub)
- `/caregiver/video` → CaregiverVideoPage (stub)
- `/caregiver/settings` → SettingsPage (stub)

Root Route:
- `/` → ElderLayout → TodayPage



Phase 3: Connection & Memory
3.1 People & Social: Large family cards (Elder) vs Contact Manager (Caregiver).

3.2 Memory Vault: Voice search (Elder) vs Note Organizer (Caregiver).

3.3 Video Bridge: WebRTC integration (LiveKit) - Auto-answer logic.



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
│   │   ├── VideoPage.tsx         ← Stub
│   │   └── MemoryPage.tsx        ← Stub (MemoryVaultPage is in pages/)
│   └── caregiver/                ← Admin UI (CareBridge)
│       ├── dashboard/            ← DashboardOverview.tsx, useElderDashboard.ts
│       ├── elders/               ← ElderSelector.tsx, useLinkedElders.ts
│       ├── DashboardPage.tsx     ← Main dashboard page (reads elder query param)
│       ├── PeoplePage.tsx        ← Stub
│       ├── VideoPage.tsx         ← Stub
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
│   └── video.ts                  ← Video utilities
├── types/
│   └── schema.ts                 ← Database schema types (Profile, FamilyLink, Medication, MedEvent)
├── types.ts                      ← Application types (MedicationData, CameraState, ScannerState, AgentState, MemoryRecord, etc.)
├── globals.css                   ← 24 tokens, theme system (@tailwind directives)
└── App.tsx                       ← Router configuration
📋 DOCUMENT MANAGEMENT
No orphan documents: Store in Documents/.

Timestamps: All docs require **Created:** and **Last Updated:**.

Workflow: Check existing docs -> Create/Edit -> Update Timestamp.

🔧 KEY IMPLEMENTATION NOTES
- Voice Coach: Full implementation with Gemini AI, real-time transcription, agent responses, feedback system
- Memory Vault: Currently uses localStorage (not yet connected to Supabase memory_notes table)
- Medication Scanner: Camera-based scanning with OCR/AI analysis (Gemini integration)
- State Management: Uses React Context for theme, custom hooks for data fetching (no TanStack Query/Zustand)
- Routing: React Router v7 with nested routes, query params for elder selection
- Theme System: CSS variables in globals.css (data-theme attribute), ThemeProvider context

17:48:37 Dec 11, 2025