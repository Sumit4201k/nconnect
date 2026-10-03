# Deploy to Vercel

This is a static frontend. Vercel serves the four files inside `dist`; no API keys, environment variables, database, or server functions are needed.

## Deploy from your computer

Open PowerShell in this project folder:

```powershell
cd C:\Users\hp\Documents\vscodee\nconnect-demo
npx vercel@latest
```

Sign in and select your Vercel account/project when prompted. Keep the current folder as the project root. This creates a preview deployment. To deploy to production when ready:

```powershell
npx vercel@latest --prod
```

## Deploy through Git

Push this project to your own repository, then import the repository in Vercel. If it is nested in a larger repository, set **Root Directory** to the folder containing `vercel.json`.

The included configuration sets:

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | Empty; no dependencies |
| Environment Variables | None |

The build command checks JavaScript syntax. The HTML, CSS, and JavaScript in `dist` are already the final deployable source. Do not use `npm start` as the Vercel build command: that starts the local preview server instead of finishing a build.

## ZIP package

Extract `nconnect-demo-vercel.zip` to a folder, then run the CLI from that folder or upload its contents to your Git repository. The ZIP is a portable project package, not a claim that Vercel's dashboard accepts ZIP uploads.

## After deployment

- Open the deployment URL and scroll into the workflow to start the sequence.
- Check the habit interactions and color remix.
- Share links automatically use the deployed origin rather than localhost.
- External NConnect, OpenDots, and Stitch links retain their existing destinations.

This remains a frontend concept; deployment does not activate AI services. Google Fonts are optional and have local system-font fallbacks.

Reference: https://vercel.com/docs/project-configuration/vercel-json
