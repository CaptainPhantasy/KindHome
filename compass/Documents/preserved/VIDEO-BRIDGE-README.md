# Video Bridge Feature - User Guide & Setup Instructions

**Created:** 00:47:31 Dec 12, 2025  
**Last Updated:** 00:54:04 Dec 12, 2025

## Overview

The Video Bridge feature enables secure video calling between caregivers and elders using LiveKit WebRTC technology. This document provides complete setup instructions, usage guidelines, and troubleshooting information for both caregiver and elder interfaces.

---

## Table of Contents

1. [Prerequisites & Requirements](#prerequisites--requirements)
2. [Environment Setup](#environment-setup)
3. [Caregiver Usage](#caregiver-usage)
4. [Elder Usage](#elder-usage)
5. [Room Naming Convention](#room-naming-convention)
6. [Development Mode Testing](#development-mode-testing)
7. [Troubleshooting](#troubleshooting)
8. [Technical Architecture](#technical-architecture)

---

## Prerequisites & Requirements

### System Requirements

- **Browser:** Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- **Permissions:** Camera and microphone access must be granted
- **Network:** Stable internet connection (minimum 1 Mbps upload/download for video)
- **LiveKit Account:** Active LiveKit cloud instance or self-hosted server

### User Requirements

- **Production Mode:**
  - **Caregiver:** Must be authenticated and have a linked elder via `family_links` table
  - **Elder:** Must be authenticated with a valid Supabase user account
- **Development Mode (Testing):**
  - **Both:** Authentication is optional - dev mode allows testing without Supabase Auth
  - See [Development Mode Testing](#development-mode-testing) section below
- **Both:** Must have camera and microphone hardware/permissions enabled

---

## Environment Setup

### 1. LiveKit Server Setup

#### Option A: LiveKit Cloud (Recommended)

1. Sign up at [livekit.io](https://livekit.io)
2. Create a new project
3. Copy your **Server URL** (e.g., `wss://your-project.livekit.cloud`)
4. Generate **API Key** and **API Secret** from the dashboard

#### Option B: Self-Hosted LiveKit

1. Follow [LiveKit deployment guide](https://docs.livekit.io/deployment/)
2. Note your server WebSocket URL
3. Generate API credentials from your LiveKit instance

### 2. Client-Side Environment Variables

Add to your `.env` file in the project root:

```bash
# LiveKit Server URL (WebSocket)
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
```

**Important:** The `VITE_` prefix is required for Vite to expose this variable to the client-side code.

### 3. Supabase Edge Function Secrets

Configure secrets in your Supabase Dashboard:

1. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
2. Add the following secrets:

```
LIVEKIT_API_KEY=your-api-key-here
LIVEKIT_API_SECRET=your-api-secret-here
```

**Important:** These secrets do NOT use the `VITE_` prefix as they are server-side only.

### 4. Deploy Edge Function

The `mint-token` Edge Function should already be deployed. If not:

```bash
cd supabase/functions/mint-token
supabase functions deploy mint-token
```

---

## Caregiver Usage

### Starting a Video Call

1. **Navigate to Caregiver Dashboard**
   - Go to `/caregiver` or `/caregiver/dashboard?elder={elderId}`
   - Ensure you have selected an elder to call

2. **Access Video Page**
   - Navigate to `/caregiver/video?elder={elderId}`
   - Or click the "Video" option in the caregiver navigation

3. **Automatic Connection**
   - The page automatically:
     - Fetches a LiveKit access token from the Edge Function
     - Connects to the room: `video-{elderId}`
     - Displays the standard VideoConference interface

### VideoConference Interface

The caregiver interface uses LiveKit's standard `VideoConference` component, which includes:

- **Video Grid:** Automatic layout of all participants
- **Controls:** Mute/unmute, camera on/off, screen share, chat
- **Participant List:** See all connected participants
- **Settings:** Audio/video device selection

### Ending a Call

- Click the "Leave" or "End Call" button in the VideoConference controls
- The page will disconnect and return you to the caregiver dashboard

---

## Elder Usage

### Receiving a Video Call (Auto-Answer)

The elder video page features **automatic call answering**:

1. **Navigate to Video Page**
   - Elder navigates to `/elder/video`
   - Or taps the "Video" option in the bottom navigation

2. **Automatic Connection**
   - Page automatically:
     - Fetches LiveKit access token
     - Connects to room: `video-{currentUserId}`
     - Waits for incoming calls

3. **Auto-Answer Behavior**
   - When a caregiver joins the room, the call is **automatically answered**
   - No user interaction required - the elder is already connected and ready
   - Video feed appears automatically when caregiver connects

### Elder-Friendly Interface

The elder interface features large, touch-friendly controls:

#### Video Display
- **Local Video:** Shows elder's own video feed (labeled "You")
- **Remote Video:** Shows caregiver's video feed (labeled "Caller")
- **Waiting State:** Displays "Waiting for caller..." when no one is connected

#### Control Buttons (Bottom Bar)

All buttons are **96px × 96px** (h-24 w-24) for easy tapping:

1. **Microphone Toggle** (Left)
   - **Green (Primary):** Microphone ON
   - **Red (Destructive):** Microphone OFF
   - Tap to mute/unmute

2. **Video Toggle** (Center)
   - **Green (Primary):** Camera ON
   - **Gray (Muted):** Camera OFF
   - Tap to turn camera on/off

3. **End Call** (Right)
   - **Red (Destructive):** Always visible
   - Tap to disconnect and return to Today page

### Ending a Call

- Tap the red "End Call" button (rightmost button)
- Automatically disconnects and navigates to `/elder/today`

---

## Room Naming Convention

The Video Bridge uses a consistent room naming pattern:

### Caregiver → Elder Calls
- **Room Name:** `video-{elderId}`
- **Example:** `video-123e4567-e89b-12d3-a456-426614174000`
- **Where:** `elderId` comes from the URL query parameter

### Elder Room
- **Room Name:** `video-{currentUserId}`
- **Example:** `video-987fcdeb-51a2-43d7-b890-123456789abc`
- **Where:** `currentUserId` is the authenticated elder's Supabase user ID

### How It Works

1. **Caregiver initiates call:**
   - Caregiver connects to `video-{elderId}` (elder's user ID)
   - This is the elder's personal video room

2. **Elder receives call:**
   - Elder is already connected to `video-{currentUserId}` (same as elderId)
   - When caregiver joins, both are in the same room
   - Auto-answer triggers automatically

---

## Development Mode Testing

The Video Bridge includes a **Development Mode** that allows testing video calls without Supabase authentication. This is useful for:
- Testing video functionality locally
- Debugging connection issues
- Demonstrating features without user accounts
- Cross-browser testing

### How Development Mode Works

**Elder Side:**
- If no authenticated user is found, the system automatically uses a dev identity
- Dev ID is stored in `localStorage` (`kind_home_dev_elder_id`) for persistence
- A prominent "DEV MODE: Using Test Identity" badge appears at the top of the screen
- Room name: `video-{devId}` (e.g., `video-dev-elder-abc123`)

**Caregiver Side:**
- If no authenticated user is found, uses `'Dev Caregiver'` as participant name
- Room name comes from URL parameter: `?elder={elderId}`

### Testing Workflow

#### Step 1: Elder Side (Browser 1)

1. **Open elder video page** (no authentication required):
   ```
   http://localhost:5173/elder/video
   ```

2. **Check console** for dev ID:
   ```
   DEV MODE: Using test identity dev-elder-xyz789
   ```

3. **Note the room name** - it will be `video-dev-elder-xyz789` (or similar)

4. **Verify DEV MODE badge** appears at top-left of screen

#### Step 2: Caregiver Side (Browser 2)

1. **Open caregiver video page** with elder's dev ID:
   ```
   http://localhost:5173/caregiver/video?elder=dev-elder-xyz789
   ```

2. **Check console** for dev mode confirmation:
   ```
   DEV MODE: Using test caregiver identity
   ```

3. **Both should connect** - video/audio streams will work normally

### Custom Dev IDs

You can specify a custom dev ID using the URL parameter:

**Elder:**
```
/elder/video?publicId=test-elder-01
```
→ Uses `test-elder-01` as the dev ID (saved to localStorage)

**Caregiver:**
```
/caregiver/video?elder=test-elder-01
```
→ Connects to `video-test-elder-01` room

### Dev ID Persistence

- Dev IDs are saved to `localStorage` and persist across page reloads
- To reset: Clear browser localStorage or use a different `?publicId=` parameter
- Each browser/incognito window gets its own dev ID

### Production vs Development

| Feature | Production Mode | Development Mode |
|---------|----------------|------------------|
| Authentication | Required | Optional |
| User ID Source | Supabase Auth | Generated/LocalStorage |
| Elder Room Name | `video-{userId}` | `video-{devId}` |
| Caregiver Identity | User email/ID | `'Dev Caregiver'` |
| Visual Indicator | None | DEV MODE badge |

**Important:** Development mode is automatically detected - no configuration needed. If a user is authenticated, production mode is used automatically.

---

## Troubleshooting

### Common Issues

#### "Video service not configured"
**Cause:** `VITE_LIVEKIT_URL` environment variable is missing or incorrect.

**Solution:**
1. Check `.env` file has `VITE_LIVEKIT_URL=wss://your-server.livekit.cloud`
2. Restart development server: `npm run dev`
3. Verify the URL is correct (must start with `wss://`)

#### "Failed to initialize video" / "Token fetch failed"
**Cause:** Edge Function secrets not configured or incorrect.

**Solution:**
1. Verify Supabase Dashboard → Edge Functions → Secrets:
   - `LIVEKIT_API_KEY` is set
   - `LIVEKIT_API_SECRET` is set
2. Ensure Edge Function is deployed: `supabase functions deploy mint-token`
3. Check browser console for detailed error messages

#### "No elder selected" (Caregiver)
**Cause:** Missing `elder` query parameter in URL.

**Solution:**
- Navigate to `/caregiver/video?elder={elderId}`
- Or select an elder from the dashboard first

#### Camera/Microphone Not Working
**Cause:** Browser permissions denied or hardware unavailable.

**Solution:**
1. Check browser permissions:
   - Chrome: Settings → Privacy → Site Settings → Camera/Microphone
   - Firefox: Preferences → Privacy → Permissions
   - Safari: Preferences → Websites → Camera/Microphone
2. Ensure no other application is using the camera/microphone
3. Try refreshing the page and granting permissions again

#### "Please sign in to use video calling" (Elder)
**Cause:** This error no longer appears - dev mode automatically activates if not authenticated.

**Solution:**
- If you see this error, check browser console for details
- Dev mode should activate automatically when not authenticated
- Verify `VITE_LIVEKIT_URL` is configured correctly

#### Video Not Appearing
**Cause:** Camera permissions or track subscription issues.

**Solution:**
1. Grant camera permissions when prompted
2. Check browser console for errors
3. Verify camera hardware is working in other applications
4. Try toggling video off and on using the control button

#### Connection Timeout
**Cause:** Network issues or LiveKit server unreachable.

**Solution:**
1. Check internet connection
2. Verify LiveKit server URL is correct and accessible
3. Check firewall/proxy settings
4. Try from a different network

---

## Technical Architecture

### Components

#### Frontend
- **Caregiver Video Page:** `src/features/caregiver/VideoPage.tsx`
  - Uses `LiveKitRoom` + `VideoConference` components
  - Reads `elderId` from URL query parameter

- **Elder Video Page:** `src/features/elder/VideoPage.tsx`
  - Uses `LiveKitRoom` + custom `ElderVideoControlsWithRoom` component
  - Auto-connects and listens for incoming participants

- **Video Utilities:** `src/lib/video.ts`
  - `getToken(room, username)` function
  - Calls Supabase Edge Function `mint-token`

#### Backend
- **Edge Function:** `supabase/functions/mint-token/index.ts`
  - Generates LiveKit JWT access tokens
  - Uses `livekit-server-sdk` from esm.sh
  - Requires `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` secrets

### Flow Diagram

```
Caregiver                    Edge Function              Elder
   |                              |                      |
   |-- Navigate to /video ------->|                      |
   |                              |                      |
   |-- Request Token ------------>|                      |
   |                              |-- Generate JWT ----->|
   |<-- Return Token -------------|                      |
   |                              |                      |
   |-- Connect to LiveKit -------|----------------------|
   |   Room: video-{elderId}      |                      |
   |                              |                      |
   |                              |<-- Connect ----------|
   |                              |   Room: video-{userId}|
   |                              |                      |
   |<-- Video/Audio Stream <-----|---- Video/Audio ---->|
   |                              |                      |
```

### Auto-Answer Implementation

The elder video page implements auto-answer through:

1. **Automatic Connection:** Page connects immediately on load
2. **Event Listeners:** Uses `RoomEvent.ParticipantConnected` to detect joiners
3. **No User Action:** Call is answered automatically when caregiver joins

```typescript
// Auto-answer: Listen for participants joining (incoming calls)
useEffect(() => {
  if (!room) return;

  const handleParticipantConnected = () => {
    console.log('Participant joined - call answered automatically');
  };

  room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
  return () => {
    room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
  };
}, [room]);
```

### Security

- **Token-Based Authentication:** All connections require valid JWT tokens
- **Server-Side Token Generation:** Tokens are minted server-side, never exposed to client
- **Room-Based Isolation:** Each elder has their own room (`video-{userId}`)
- **Permission Grants:** Tokens include specific permissions (join, publish, subscribe)

---

## Best Practices

### For Caregivers

1. **Test Connection First:** Verify video/audio works before important calls
2. **Check Elder Status:** Ensure elder is on the video page before calling
3. **Stable Network:** Use WiFi when possible for better quality
4. **Privacy:** Be mindful of background and surroundings

### For Elders

1. **Stay on Video Page:** Keep `/elder/video` open to receive calls
2. **Large Buttons:** All controls are designed for easy tapping
3. **Auto-Answer:** No need to "answer" - calls connect automatically
4. **End Call Button:** Large red button to disconnect when done

### For Developers

1. **Environment Variables:** Always use `VITE_` prefix for client-side vars
2. **Secrets:** Never commit LiveKit credentials to version control
3. **Error Handling:** Implement proper error states for all failure modes
4. **Testing:** Test with multiple participants and network conditions

---

## Support & Resources

- **LiveKit Documentation:** https://docs.livekit.io
- **LiveKit React Components:** https://docs.livekit.io/client-sdk-react/
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Project Source of Truth:** `Documents/preserved/PROJECT-SOURCE-OF-TRUTH.md`

---

**Last Updated:** 01:05:23 Dec 12, 2025
