# Qadha Tracker

An app for making up missed prayers — and for keeping the daily ones on track.

Its one job is qadha: know how many prayers you owe, chip away at them, and see
the backlog shrink. Prayer logging, sunnah checklists, habits and missions
support that goal rather than compete with it.

## Your data stays on your device

There is no account, no sign-in, and no server holding your prayer history.
Everything is stored in the browser's local storage on the device you use.

That has one consequence worth stating plainly: **if you clear the app's data,
lose the device, or uninstall, the data is gone unless you exported a backup.**

- **Settings → Export data** writes a single `.json` file containing everything
  the app stores. Keep it somewhere safe (your own cloud drive, for example).
- **Settings → Import data** restores such a file, replacing what is currently
  on the device.
- **Settings → Erase all data** wipes every trace of your data from the device.

Backups from older versions of the app are still restorable.

## Running it locally

Requires Node.js.

```sh
npm install
npm run dev      # start the dev server
npm test         # run the test suite
npm run lint     # lint
npm run build    # production build into dist/
```

## How it is built

- **Vite + React + TypeScript** — the app itself
- **Tailwind CSS + shadcn/ui** — styling and components
- **Framer Motion** — transitions
- **Recharts** — the insights charts
- **Vitest** — tests

Everything users see is translated into English, Swedish, Turkish and Arabic
(`src/lib/i18n.ts`).

### Where things live

| Path | What it holds |
| --- | --- |
| `src/pages/` | One file per screen |
| `src/hooks/` | The tracking logic (prayers, qadha, habits, missions, achievements) |
| `src/lib/backup.ts` | Export/import/erase — the only safety net for user data |
| `src/lib/qadhaEstimate.ts` | The "help me estimate my backlog" calculation |
| `src/lib/i18n.ts` | All translated strings |
| `src/components/insights/` | Charts |

### Adding a new stored value

`src/lib/backup.ts` keeps the list of every storage key the app owns. A key
that is missing from `APP_STORAGE_KEYS` will not be included in backups, so add
it there at the same time you introduce it — `src/lib/backup.test.ts` covers the
round trip.
