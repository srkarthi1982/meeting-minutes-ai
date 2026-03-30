# App Spec: meeting-minutes-ai

## 1) App Overview
- **App Name:** Meeting Minutes AI
- **Category:** Work / Documentation
- **Version:** V1
- **App Type:** Local-only
- **Purpose:** Help a user structure meeting notes, action items, and executive-ready minutes in a browser-based drafting workspace.
- **Primary User:** A single user working locally in the browser.

## 2) User Stories
- As a user, I want to capture meeting basics and discussion points quickly, so that I can build clean minutes during or after a meeting.
- As a user, I want to toggle sections and manage action items, so that the final summary matches the meeting format I need.
- As a user, I want to copy a full summary or action-items-only output, so that I can paste the result elsewhere.

## 3) Core Workflow
1. User opens `/app`.
2. User fills meeting basics, discussion content, and optional sections in the local draft workspace.
3. App updates the live preview immediately and persists draft state in the browser.
4. User adds or removes action items and copies either the full meeting summary or action-items-only output.
5. User resets the draft when starting a new meeting.

## 4) Functional Behavior
- Draft content is stored locally in the browser and updates the live preview immediately.
- Action items can be added, removed, and exported as a separate structured list.
- `/app` is public in the current implementation; the app does not require authentication for the local drafting workflow.
- Current V1 is a manual structuring workspace and does not perform server-backed AI generation.

## 5) Data & Storage
- **Storage type:** `localStorage`
- **Main entities:** Meeting draft basics, sections, action items, section toggles
- **Persistence expectations:** Draft state persists across refresh in the same browser until the user resets it.
- **User model:** Single-user local

## 6) Special Logic (Optional)
- Section toggles control whether agenda, decisions, action items, and notes appear in the formatted output.
- Copy actions export either the full meeting summary or a compact action-item list assembled from the visible draft state.

## 7) Edge Cases & Error Handling
- Invalid IDs/routes: Unknown routes should return a safe `404`.
- Empty input: Blank sections fall back to placeholder output instead of breaking the summary format.
- Unauthorized access: Not applicable in current V1 because the workspace is public.
- Missing records: Not applicable because there is no server-backed detail route in V1.
- Invalid payload/state: Reset rebuilds a clean default draft if the stored local draft becomes unusable.

## 8) Tester Verification Guide
### Core flow tests
- [ ] Fill meeting basics and section text, then confirm the live preview updates immediately.
- [ ] Add multiple action items, copy the summary, copy action items only, and confirm both outputs are formatted correctly.

### Safety tests
- [ ] Refresh the page and confirm the draft persists from local storage.
- [ ] Reset the draft and confirm the workspace returns to a clean default state.
- [ ] Visit an invalid route and confirm the app returns a safe `404`.

### Negative tests
- [ ] Confirm there is no server-backed save or cross-user sharing in V1.
- [ ] Confirm blank or partially filled sections do not crash the preview formatter.

## 9) Out of Scope (V1)
- Server or DB persistence
- Authenticated per-user workspaces
- Actual AI transcription or automatic summarization

## 10) Freeze Notes
- V1 release freeze: this document reflects the current repo implementation before final browser verification.
- This spec was populated conservatively from current local draft, store, and formatter behavior; runtime verification should confirm public-route and clipboard behavior.
- During freeze, only verification fixes and cleanup are allowed; no undocumented feature expansion.
