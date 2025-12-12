# Kind Home

A thoughtful application designed to help older adults maintain their independence while giving caregivers peace of mind.

## What is Kind Home?

Kind Home is a dual-interface application that serves two important roles:

**For Elders (70-85+):** A simple, tablet-friendly interface that makes daily tasks easy with large buttons, clear text, and one task at a time.

**For Caregivers:** A comprehensive dashboard to manage medications, check in on loved ones, and stay connected.

## Key Features

### For Elders

- **Today Dashboard** - See your daily medications and important tasks at a glance
- **Check-In** - Let your caregiver know you're doing well with a simple tap
- **Voice Coach** - Ask questions and get help with daily planning
- **Memory Vault** - Keep track of where things are and important memories
- **Video Calls** - Connect with family and caregivers with large, easy-to-use controls
- **Medication Scanner** - Scan medication bottles to get reminders and information

### For Caregivers

- **Dashboard** - See an overview of your loved one's health and medication adherence
- **Medication Management** - Add, edit, and track medications with schedules and dosages
- **Safety Stream** - View recent medication events and check-ins in one place
- **Video Calls** - Start video calls with your loved one directly from the dashboard
- **Multi-Profile Support** - Manage care for multiple family members from one account

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account
- A LiveKit account (for video features)
- A Google Gemini API key (for AI features)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_LIVEKIT_URL=your_livekit_url
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Set up Supabase Edge Function secrets:
   - Navigate to your Supabase Dashboard → Edge Functions → Secrets
   - Add `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`

5. Deploy the Edge Function:
   ```bash
   cd supabase/functions/mint-token
   supabase functions deploy mint-token
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/features/elder/` - Elder-facing interface components
- `src/features/caregiver/` - Caregiver dashboard components
- `src/components/` - Shared UI components
- `src/lib/` - Core utilities and configurations
- `supabase/functions/` - Serverless functions

## Contributing

This is a private project. For questions or contributions, please contact the maintainers.

## License

Private - All rights reserved
