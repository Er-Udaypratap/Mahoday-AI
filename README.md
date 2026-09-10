# Mahoday - Test Build (Frontend-only, React + TypeScript)

A standalone duplicate of Mahoday for local testing. No backend, no
Supabase, no login/signup.

## What's different from the real Mahoday app
- **Language:** React + TypeScript (instead of JSX)
- **No auth:** anyone opening the app can use it directly
- **No backend:** calls the Gemini API directly from the browser
- **No Supabase:** chat history is stored only in this browser's
  `localStorage` (per-device, not synced anywhere)
- **College data:** embedded directly in `src/lib/collegeData.ts`

## ⚠️ Security note
The Gemini API key lives in `src/lib/gemini.ts` and is visible to anyone
who opens browser dev tools on the deployed site. This is fine for a
private/local test, but **do not share this build publicly** or anyone
could copy your key and use your quota. The real Mahoday app (with the
FastAPI backend) keeps the key server-side and is the version to actually
launch for students.

## Run locally
```bash
npm install
npm run dev
```

## Deploy (if you want to test on your phone via a URL)
Push to GitHub, connect on Vercel (Framework: Vite, auto-detected). Same
as the main app, just a separate project/repo so it doesn't collide with
the real Mahoday deployment.
