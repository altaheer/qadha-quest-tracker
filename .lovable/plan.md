# Migrate to Lovable Cloud + add MCP server

The app is fully local-first today (localStorage + JSON backups). To make MCP genuinely useful, user data must live server-side so an authenticated AI assistant can read and update it.

## Phase 1 — Enable Cloud + Auth

- Enable Lovable Cloud.
- Add email/password + Google sign-in.
- Add a lightweight auth gate: on first launch, user signs in; existing localStorage data is offered as a one-time import into their Cloud account.
- All existing UI keeps working — data hooks just switch source from localStorage to Cloud (with an offline cache).

## Phase 2 — Schema

One row per user per day per domain. Tables (all with RLS scoped to `auth.uid()`):

- `profiles` — display name, locale, day-reset cutoff, showArabic, autoMarkMissed prefs.
- `prayer_logs` — `(user_id, date, prayer)` → status (`done_jamaah|done_ontime|done_late|missed|none`), timestamp.
- `qadha_counts` — `(user_id, prayer)` → remaining count.
- `qadha_events` — log of increments/decrements for burndown chart.
- `habits` — user-defined habit templates.
- `habit_logs` — `(user_id, habit_id, date)` → completed count / level.
- `nafilah_logs` — `(user_id, date, type)` → count.
- `time_bound_habits` + `time_bound_logs` — Ramadan/etc.
- `missions` — active challenges with allowed misses, progress.
- `achievements` — unlocked achievements per user.

Each table gets `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated` and RLS policies `user_id = auth.uid()`.

## Phase 3 — Client refactor

Rewrite the existing hooks to read/write Cloud instead of localStorage, keeping the same public API so page components don't change:
- `usePrayerTracking`, `useQadhaPrayers`, `useHabitsTracking`, `useNafilahTracking`, `useTimeBoundHabits`, `useMissions`, `useAchievements`, `useUserPrefs`.

Use TanStack Query (already in the project) for caching + optimistic updates so the UI stays snappy.

Keep JSON export/import in Settings (now exports from Cloud).

## Phase 4 — MCP server

Install `@lovable.dev/mcp-js` + `zod`, add `mcpPlugin()` to vite config, and expose tools under `src/lib/mcp/tools/`, each authenticated via Supabase OAuth so tool calls run as the connected user with RLS enforcement:

- `log_prayer` — mark a prayer done/missed for a date.
- `get_prayer_day` — today's/any day's prayer statuses.
- `get_prayer_streak` — current streak, per prayer.
- `get_qadha_summary` — remaining qadha per prayer + burndown estimate.
- `adjust_qadha` — increment/decrement qadha count.
- `log_habit` — record a habit completion.
- `list_habits` — list user's habits with today's status.
- `get_mission_status` — active missions, progress, misses used.
- `get_insights_summary` — this-week points, top prayer punctuality, active streaks.

Plus the OAuth consent page at `/.lovable/oauth/consent` and Supabase OAuth server configured.

## Phase 5 — Deploy + validate

- Deploy the `mcp` edge function.
- Extract and validate the MCP manifest so Lovable's Agent Integrations panel lists the tools.
- Add a small "Connect an AI assistant" card in Settings/More explaining how to connect ChatGPT/Claude/Cursor.

## Notes / trade-offs

- **Offline**: today the app works fully offline. After migration, initial load requires network; TanStack Query + localStorage cache keeps it usable offline for reads, but writes will queue and sync on reconnect (basic implementation, not full CRDT).
- **Existing users**: on first sign-in we detect localStorage data and offer a one-click import so nothing is lost.
- **Scope**: this is a multi-turn build. I'll do Phase 1 + 2 (Cloud, auth, schema) in the first pass so you can review before I refactor every hook.

Confirm and I'll start with enabling Cloud, adding auth, and creating the schema.