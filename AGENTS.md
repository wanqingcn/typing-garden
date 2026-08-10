# Typing Garden Contributor Guide

## Project Intent

Typing Garden is an offline typing practice app for children on macOS. The
current implementation uses Vite, React, TypeScript, and Electron. The first
public release prioritizes a reliable local practice experience over online
accounts, analytics, rankings, or cloud features.

## Product Principles

- Open the app directly into the practice experience.
- Keep the keyboard, next-key guidance, and progress feedback easy to scan.
- Support key drills, English words, Chinese Pinyin, and short typing games.
- Keep profiles and progress on the current Mac.
- Do not add ads, tracking, telemetry, remote analytics, or account login.
- Do not copy course text, artwork, audio, or other assets from commercial apps.

## Test-Driven Development

Core behavior changes must follow this sequence:

1. Add a failing test in `src/domain/*.test.ts` or
   `src/components/*.test.tsx`.
2. Run `npm test` and confirm the new test fails for the expected reason.
3. Add the smallest implementation that satisfies the test.
4. Run `npm test` again and confirm the full suite passes.
5. Run `npm run build` for build, packaging, or type changes.

## Code Style

- Keep TypeScript strict mode enabled.
- Put business logic in `src/domain`.
- Keep course data in `src/data/lessons.ts`.
- Use React components for state wiring and presentation.
- Prefer clear single-file components over premature abstractions.
- Keep controls keyboard accessible with stable click and focus areas.
- Do not add remote fonts or runtime image dependencies.

## Architecture

- `src/domain/typing.ts`: typing sessions, statistics, completion, and unlocks.
- `src/domain/profiles.ts`: local multi-profile state.
- `src/domain/types.ts`: shared domain types.
- `src/data/lessons.ts`: English and Pinyin lessons.
- `src/App.tsx`: application state and UI composition.
- `src/styles.css`: application styling.
- `electron/main.cjs`: hardened Electron window and navigation policy.

## Privacy And Security

- Store progress only in local `localStorage`.
- Never commit credentials, certificates, signing profiles, or private keys.
- Deny Electron renderer permissions and untrusted navigation by default.
- Treat profile names as local user data and never include them in screenshots.
- Run Gitleaks before preparing a public release.

## macOS Packaging

Use these commands for local verification:

```bash
npm ci
npm test
npm run build
npm run build:mac
```

Unsigned development packages are written to `release/`. Maintainers must use
the Keychain-based signing and notarization process in
`docs/RELEASING.md` for public releases.

## Public Release Boundary

Creating a public repository, pushing branches or tags, publishing a release,
and using a Developer ID are separate write operations. Show the exact target
and changes, then obtain maintainer confirmation before performing them.
