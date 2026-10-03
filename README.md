# OpenDots in motion × NConnect

Vercel-ready: see [VERCEL.md](./VERCEL.md). The included `vercel.json` publishes `dist` as a static site.

A local, frontend-only marketing demo. OpenDots is the main hook; Stitch appears as the design step; NConnect is the open-model connection and primary conversion destination.

## Run

Requires Node.js 18 or later. No dependencies to install.

```sh
npm run dev
```

Open http://127.0.0.1:4173. To choose another port in PowerShell: `$env:PORT=4174; npm run dev`.

## What works

- A five-phase concept sequence that starts once when the workspace comes into view, with subtle pause, replay, and seek controls. Reduced-motion users start it manually.
- OpenDots coworker messages synchronized with the phases.
- A clickable workflow showing Stitch, the coding harness, and the separate NConnect/model branch.
- An interactive habit tracker, before/after view, expanded preview, and three color remixes.
- Share links that preserve the theme, a downloadable 1200×630 PNG card, and a copyable Stitch brief.
- Responsive layouts, native keyboard controls, reduced-motion support, and optional browser WebMCP playback tools.

The demonstration is intentionally a frontend concept. No agent, Stitch API, Nebius inference, or backend integration is executed. Twenty seconds is playback time, not generation time. All progress data is sample data. No secrets, sign-in, tracking, or external publishing is required.

Local share links only work on the same computer. After separately deploying the `dist` folder to a static host, links use that host automatically. This task does not deploy the site. Google Fonts are optional; system fallbacks work offline.

## Validation

```sh
npm run check
npm test
```

Source: `dist/index.html`, `dist/styles.css`, `dist/app.js`, and `dist/model.js`. The local development server is `server.mjs`.

## Scope decisions

The user explicitly authorized a frontend-only demo and asked for OpenDots to be the visible marketing hook. The existing PRD already settled the scope, so Wayfinder's planning stage needed no new map or issue tracker. Research verified the roles against primary sources; no genuine integration is represented as running.

References: [OpenDots](https://github.com/CopilotKit/OpenDots), [NConnect](https://nconnect.sh/), [Stitch](https://stitch.withgoogle.com/).

## Recording direction

The user plans to record a 20-second video of the site. There is no hero demo button or duration-focused marketing copy. Scroll into the workspace to start the visual sequence; use replay for another take. The internal sequence remains 20 seconds long.
