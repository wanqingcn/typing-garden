# Contributing To Typing Garden

Thank you for helping improve Typing Garden.

## Before Starting

- Search existing issues before opening a new one.
- Keep changes focused and explain the child-facing outcome.
- Do not add accounts, ads, tracking, telemetry, or remote analytics.
- Do not submit copied lessons, artwork, audio, or proprietary materials.
- Do not include credentials, certificates, private paths, or real child data.

## Development

```bash
npm ci
npm test
npm run dev
```

Core behavior changes must follow test-driven development:

1. Add a failing test.
2. Run the relevant test and confirm the expected failure.
3. Add the smallest implementation.
4. Run the full test suite.
5. Run `npm run build` for type or build changes.

Business logic belongs in `src/domain`. React components should primarily
connect state and presentation.

## Pull Requests

Include:

- A concise problem statement
- The behavior changed
- Tests added or updated
- Screenshots for visible UI changes
- Privacy, accessibility, and packaging impact

Contributions are submitted under GPL-3.0-only. Configure Git with a public or
GitHub-provided private commit email before contributing.
