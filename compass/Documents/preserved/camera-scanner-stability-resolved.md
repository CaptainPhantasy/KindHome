# Medication Scanner Camera Stability Issues (Resolved)
**Created:** 17:52:39 Dec 11, 2025
**Last Updated:** 18:22:10 Dec 11, 2025

## Summary
Two critical stability issues were identified and resolved in the `MedicationScanner` and `useCameraStream` hook:
1.  **Playback Interruption:** Repeated `AbortError` logs during stream playback.
2.  **Infinite Dependency Loop:** The camera stream was rapidly creating and destroying instances due to unstable references.

## Issue 1: Playback Interruption (AbortError)

### Details
- **Error:** `Video play interrupted AbortError`.
- **Cause:** The `videoEl.play()` method was being called while the component was unmounting or the source was changing, leading to a race condition.
- **Resolution:**
    - Added a check `if (!videoEl.paused) return;` to prevent redundant play calls.
    - Wrapped playback logic in a `try/catch` block that explicitly ignores `AbortError` and "interrupted" messages.

## Issue 2: Infinite Dependency Loop (Stream Thrashing)

### Details
- **Symptom:** Logs showed "Stream Created" firing dozens of times per second.
- **Cause:**
    1.  `stopCamera` depended on `activeStream`.
    2.  `MedicationScanner`'s effect depended on `[startCamera, stopCamera]`.
    3.  `startCamera` updated `activeStream` -> recreated `stopCamera` -> re-ran effect -> called `startCamera` -> LOOP.
- **Resolution:**
    - Refactored `useCameraStream.ts` to use a `useRef` (`activeStreamRef`) to hold the stream instance.
    - Removed `activeStream` from the `stopCamera` dependency array.
    - This stabilized the `stopCamera` function reference, breaking the infinite loop.

## Verification
- Validated with a debug harness (`/debug/loop`) that flooded logs before the fix.
- Post-fix verification confirmed zero flood and stable stream creation (single event).

18:22:10 Dec 11, 2025
