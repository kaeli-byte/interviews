# S01: UAT Script — Gemini Transcription + Structured Capture

**Prerequisites:**
- `NEXT_PUBLIC_GEMINI_API_KEY` environment variable is set
- Development server is running (`npm run dev`)
- Browser with DevTools available (Chrome/Edge recommended)

---

## Test Case 1: TypeScript Compilation

**Purpose:** Verify no type errors in the codebase after changes.

**Steps:**
1. Open terminal in project root
2. Run `npx tsc --noEmit`

**Expected:** Command exits with code 0 (no errors)

---

## Test Case 2: TranscriptEntry Type Definition

**Purpose:** Verify the TranscriptEntry interface is correctly defined.

**Steps:**
1. Open `lib/types.ts`
2. Verify the interface exists with:
   - `speaker: 'interviewer' | 'candidate'`
   - `text: string`
   - `timestamp: number`

**Expected:** Interface matches specification

---

## Test Case 3: Gemini Live Transcription Config

**Purpose:** Verify transcription is enabled in the WebSocket setup.

**Steps:**
1. Open `lib/geminiLiveClient.ts`
2. Locate the `connect` method
3. Find the `setup` object in the config
4. Verify `input_audio_transcription: {}` and `output_audio_transcription: {}` exist at the **top level** (not nested in generation_config)

**Expected:** Both transcription configs are present at top-level

---

## Test Case 4: Live Interview Transcription (Integration Test)

**Purpose:** Verify transcription messages arrive and are captured during a live interview.

**Preconditions:**
- Valid Gemini API key in environment
- Resume and job description text ready (can be dummy text)

**Steps:**
1. Open browser to `http://localhost:3000`
2. Open DevTools (F12) → Console tab
3. Enter any text in Resume field (e.g., "Software engineer with 5 years experience")
4. Enter any text in Job Description field (e.g., "Senior developer role")
5. Click "Start Interview" button
6. Wait for "Live" status indicator
7. Speak into microphone (if available) or wait for AI to speak
8. Observe Console for `[Gemini Transcription]` logs

**Expected Results:**
- `[Gemini Transcription] Raw message:` logs appear showing WebSocket message structure
- When AI speaks: `[Gemini Transcription] outputTranscription:` shows interviewer text
- When user speaks: `[Gemini Transcription] inputTranscription:` shows candidate text (if microphone works)
- `[InterviewScreen] Transcript entry:` logs show structured entries with speaker, text, and timestamp

**Edge Case — No Microphone:**
- If no microphone is available, only `outputTranscription` (AI speech) will appear
- This is expected behavior — transcription requires audio input

---

## Test Case 5: Relative Timestamp Calculation

**Purpose:** Verify timestamps are calculated as offsets from interview start.

**Steps:**
1. Follow Test Case 4 setup
2. In Console, observe `[InterviewScreen] Transcript entry:` logs
3. Check the `timestamp` field in the logged object

**Expected:**
- First entry has timestamp near 0 (within first few seconds)
- Subsequent entries have increasing timestamps
- Timestamps are positive integers (milliseconds)

---

## Test Case 6: React State Updates

**Purpose:** Verify transcript state is reactive and growing during interview.

**Steps:**
1. Follow Test Case 4 setup
2. Open React DevTools (browser extension)
3. Navigate to InterviewScreen component
4. Find `transcript` state in hooks section
5. Observe the array growing as transcription arrives

**Expected:**
- `transcript` state is an array of objects
- Each object has `speaker`, `text`, and `timestamp` fields
- Array length increases during interview

---

## Test Case 7: Backwards Compatibility with Debrief

**Purpose:** Verify the interview completes and transitions to debrief screen.

**Steps:**
1. Follow Test Case 4 setup
2. Let interview run for 30-60 seconds
3. Click the red stop button (square icon)
4. Observe screen transition

**Expected:**
- Interview ends without error
- Screen transitions to Debrief screen
- Debrief displays (may show loading state while generating report)

---

## Test Case 8: Empty Transcript Handling

**Purpose:** Verify behavior when no transcription arrives (edge case).

**Steps:**
1. Start interview with API key but disconnect network before speaking
2. Wait 30 seconds
3. End interview

**Expected:**
- No crash or error
- Empty transcript array
- Debrief may show error or empty state

**Note:** This is a defensive test — actual behavior will be refined in S03/S04.

---

## Test Case 9: Console Log Verification

**Purpose:** Verify diagnostic logs are correctly formatted.

**Steps:**
1. Follow Test Case 4 setup
2. Look for these specific log patterns:

| Log Prefix | Meaning |
|------------|---------|
| `[Gemini Transcription] Raw message:` | Shows full WebSocket message structure |
| `[Gemini Transcription] inputTranscription:` | Shows parsed candidate speech |
| `[Gemini Transcription] outputTranscription:` | Shows parsed interviewer speech |
| `[InterviewScreen] Transcript entry:` | Shows final structured entry with relative timestamp |

**Expected:** All log prefixes are present and correctly formatted

---

## Sign-off Checklist

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 1 | TypeScript Compilation | ☐ | |
| 2 | TranscriptEntry Type | ☐ | |
| 3 | Gemini Transcription Config | ☐ | |
| 4 | Live Interview Transcription | ☐ | |
| 5 | Relative Timestamps | ☐ | |
| 6 | React State Updates | ☐ | |
| 7 | Backwards Compatibility | ☐ | |
| 8 | Empty Transcript Handling | ☐ | |
| 9 | Console Log Verification | ☐ | |

**UAT Completed:** ________________  
**Tester:** ________________  
**Date:** ________________

---

## Notes for UAT Tester

- **API Key Required**: Without a valid `NEXT_PUBLIC_GEMINI_API_KEY`, the interview will fail to connect
- **Microphone Optional**: User transcription requires microphone access; AI transcription works without it
- **Console is Key**: The primary verification for this slice is console output, not UI (UI comes in S02)
- **Network Latency**: Timestamps may have slight delays due to WebSocket message transit time