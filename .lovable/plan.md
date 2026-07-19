## Overview

Fix data-correctness bugs first (hooks writing only to localStorage, status string mismatch, wrong day direction), then redesign Home on top of the corrected data. Scope is large enough to lay out before touching code.

## Bug fixes (in order)

### 1. Unify prayer status vocabulary (Bug 2) — foundation

Pick `'ontime'` (already in DB + MCP) as canonical. Migrate the UI off `'on-time'`.

- Add `src/types/prayer.ts` exporting `PrayerStatus = 'pending' | 'jamaah' | 'ontime' | 'late' | 'missed'` and re-export from `src/types/index.ts` (replacing the current hyphenated union).
- Rewrite every occurrence of the string `'on-time'` in the codebase to `'ontime'`:
  - `src/hooks/usePrayerTracking.ts` (writes + reads)
  - `src/components/DailyPrayerCard.tsx` (button state + toast)
  - `src/pages/Home.tsx` (`prayerCellState`)
  - `src/components/insights/*` (Punctuality, Balance, Weekly, Heatmap)
  - `src/hooks/useAchievements.ts`, `src/hooks/useMissions.ts`, `src/hooks/useInsightsData.ts`
  - `src/lib/cloudSync.ts` normalizer already emits `'ontime'` — leave.
- One-shot localStorage migration on app boot (in `main.tsx` or a tiny `migrateStatuses.ts`): walk `prayer-history` and rewrite `'on-time'` → `'ontime'` so existing users don't lose data.

### 2. Make hooks Supabase-authoritative when signed in (Bug 1) — core refactor

Approach: keep the hook APIs identical (same return shape) so callers don't change. Internally, branch on `useAuth().user`.

- `src/hooks/usePrayerTracking.ts`
  - Signed out: current localStorage behavior.
  - Signed in: initial load = `select * from prayer_logs where user_id=me` → build the same `PrayerHistory` shape in memory. Writes = `upsert` to `prayer_logs` on `(user_id,date,prayer)`. Sunnah items stay in localStorage for now (not in schema); note this in a comment.
  - Realtime: `supabase.channel('prayer_logs:me').on('postgres_changes', { event:'*', schema:'public', table:'prayer_logs', filter:`user_id=eq.${uid}` }, ...)` → merge row into state. Teardown on unmount / user change.
  - Also listen to `visibilitychange` → refetch when tab regains focus (belt + suspenders).
  - Missed-prayer sweeper: when signed in, mutate via Supabase; qadha increments go through `qadha_counts` + `qadha_events` (already the MCP shape).
- `src/hooks/useHabitsTracking.ts`
  - Signed out: unchanged.
  - Signed in: mirror completions to `habit_logs` (`habit_id` in the schema is a uuid FK to `habits`; our app uses string ids like `morning-adhkar`). Two options:
    - (a) add a `slug text` column to `habits` and store our string ids there,
    - (b) keep local ids and add a small `public.habit_slugs` mapping.
  - Chosen: **add `slug text unique per user` to `habits`** via a migration; on first write, upsert the habits row for that slug, then insert/upsert `habit_logs`. This keeps the MCP `list_habits`/`log_habit` tools working (they already operate on the `habits` table).
  - Realtime on `habit_logs` filtered by user.
- `src/hooks/useQadhaPrayers.ts`
  - Signed in: read/write `qadha_counts`; every delta also inserts a `qadha_events` row (matches MCP `adjust_qadha`).
  - Realtime on `qadha_counts`.
- Enable realtime for the three tables via migration (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`).

Data-loss guardrail: `cloudSync.ts` already handles first-run legacy migration. Extend it to also migrate `habits-tracking` local history into `habit_logs` (currently missing).

### 3. Home 5-day window direction (Bug 3) + dead dep (Bug 4)

- Build `days` as today back to 4 days ago, ordered oldest → newest (today rightmost).
- Update label to `home.last5days` (i18n key already exists).
- Remove unused `missions` from the `useMemo` deps in `prayerData`.

### 4. OAuth consent trust hardening (Bug 5)

`src/pages/OAuthConsent.tsx`:
- Truncate client name to 60 chars with `line-clamp-2 break-words`.
- Under the name, render `details.client?.redirect_uris?.[0]` (or `client.client_uri` / `client.origin` — whichever `getAuthorizationDetails` returns) in a monospace muted label with the origin highlighted. Fall back to "unverified client — no redirect URI on file" if absent.
- Add a subtle warning row: "Anyone can register a client with this name. Verify the URL below matches what you expect."

## Home redesign

New file `src/components/home/SummaryCard.tsx`: shared shell — title row (icon + label + right-aligned metric), body slot, consistent `rounded-2xl` + border + padding. All four sections use it.

Layout (top → bottom):

1. **Today** (new, prioritized): a single card at the top listing what needs attention right now — remaining fard prayers today, remaining active-level habits today, active missions due today. Small chips, tap to route.
2. **Prayers (last 5 days)**: 5×5 heatmap in `SummaryCard`, corrected direction, canonical `'ontime'` matching. Rightmost column = today, subtly highlighted.
3. **Habits (last 5 days)**: same shell, same 5-column grid, weekday label above each column, `done/total` cell coloring by ratio.
4. **Qadha**: `SummaryCard` with a horizontal row of 5 mini-bars (one per prayer type). Bar length = `remaining / max(remaining)` normalized, label under each bar shows count. Total remaining as the card's right-aligned metric.
5. **Missions**: `SummaryCard` listing active missions, each with the same progress bar primitive used elsewhere (extracted into `SummaryCard`'s `<Progress/>` slot).

Information density: "Today" section is visually heaviest (bigger type, accent color); history cards are compact, muted, equal weight to each other.

## Technical section

Migration needed:

```sql
alter table public.habits add column if not exists slug text;
create unique index if not exists habits_user_slug_idx on public.habits(user_id, slug) where slug is not null;
alter publication supabase_realtime add table public.prayer_logs;
alter publication supabase_realtime add table public.habit_logs;
alter publication supabase_realtime add table public.qadha_counts;
```

Files created:
- `src/types/prayer.ts`
- `src/lib/migrateLocalStatuses.ts`
- `src/hooks/useSupabasePrayerLogs.ts` (internal helper used by `usePrayerTracking`)
- `src/hooks/useSupabaseHabitLogs.ts`
- `src/hooks/useSupabaseQadha.ts`
- `src/components/home/SummaryCard.tsx`
- `src/components/home/TodayCard.tsx`

Files edited:
- `src/hooks/usePrayerTracking.ts`, `useHabitsTracking.ts`, `useQadhaPrayers.ts` — signed-in branch + realtime.
- `src/lib/cloudSync.ts` — also migrate local habits history.
- `src/pages/Home.tsx` — new layout, fixed day direction, removed dead dep.
- `src/pages/OAuthConsent.tsx` — clamp + show verified URL.
- `src/types/index.ts` — re-export from `types/prayer.ts`, drop `'on-time'`.
- All UI files still using `'on-time'` string literal.

Out of scope for this turn (call out but don't build): syncing sunnah checklist items and nafilah/timebound events to Supabase (no tables for them yet).

## Order of execution

1. Migration (schema + realtime publication).
2. Status unification + localStorage migrator.
3. Supabase-backed hook internals + realtime.
4. `cloudSync.ts` habit backfill.
5. Home page bugs 3–4 + redesign.
6. OAuth consent hardening.
