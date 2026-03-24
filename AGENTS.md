⚠️ Mandatory: AI agents must read this file before writing or modifying any code.

# AGENTS.md

This file complements the workspace-level Ansiversa-workspace/AGENTS.md (source of truth). Read workspace first.

MANDATORY: After completing each task, update this repo’s AGENTS.md Task Log (newest-first) before marking the task done.

## Scope
- Mini-app repository for 'meeting-minutes-ai' within Ansiversa.
- Follow the parent-app contract from workspace AGENTS; do not invent architecture.

## Phase Status
- Freeze phase active: no new features unless explicitly approved.
- Allowed: verification, bug fixes, cleanup, behavior locking, and documentation/process hardening.

## Architecture & Workflow Reminders
- Prefer consistency over speed; match existing naming, spacing, and patterns.
- Keep Astro/Alpine patterns aligned with ecosystem standards (one global store pattern per app, actions via astro:actions, SSR-first behavior).
- Do not refactor or change established patterns without explicit approval.
- If unclear, stop and ask Karthikeyan/Astra before proceeding.

## Where To Look First
- Start with src/, src/actions/, src/stores/, and local docs/ if present.
- Review this repo's existing AGENTS.md Task Log history before making changes.

## Task Log (Recent)
- Keep newest first; include date and short summary.
- 2026-03-24 Validation results: `npm install` ✅, `npm run typecheck` ⚠️ blocked (cannot install `@astrojs/check` due registry policy), `npm run build` ✅.
- 2026-03-24 Action items workflow implemented (add/remove/edit task, owner, due date) with copy-actions output.
- 2026-03-24 Live structured preview implemented with executive-ready minutes formatting.
- 2026-03-24 Local draft persistence added via localStorage (`meeting-minutes-ai:v1:draft`).
- 2026-03-24 V1 scope implemented for Meeting Minutes AI (/app public workspace, section toggles, reset confirmation, copy actions).
- 2026-03-24 Meeting Minutes AI V1 implementation started.
- 2026-02-09 Added repo-level AGENTS.md enforcement contract (workspace reference + mandatory task-log update rule).
- 2026-02-09 Initialized repo AGENTS baseline for single-repo Codex/AI safety.
