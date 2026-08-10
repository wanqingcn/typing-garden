# Typing Garden

<p align="center">
  <img src="assets/icons/typing-garden-icon.png" alt="Typing Garden app icon" width="128" />
</p>

<p align="center">
  An offline typing practice app for children on macOS.
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="https://github.com/wanqingcn/typing-garden/releases">Downloads</a> |
  <a href="PRIVACY.md">Privacy</a>
</p>

[![CI](https://github.com/wanqingcn/typing-garden/actions/workflows/ci.yml/badge.svg)](https://github.com/wanqingcn/typing-garden/actions/workflows/ci.yml)
[![License: GPL v3](https://img.shields.io/badge/license-GPL--3.0--only-2f6f62.svg)](LICENSE)
[![macOS 12+](https://img.shields.io/badge/macOS-12%2B-4f6072.svg)](https://github.com/wanqingcn/typing-garden/releases)

![Typing Garden lesson screen](docs/assets/typing-garden-overview.png)

Typing Garden helps children build keyboard confidence through short,
progressive lessons. It includes key drills, English words and sentences,
Chinese Pinyin practice, visible finger guidance, progress tracking, and two
typing games. The app runs locally without accounts, ads, telemetry, or cloud
storage.

## Download

Open the [latest release](https://github.com/wanqingcn/typing-garden/releases/latest)
and choose the package for your Mac:

| Mac | Package |
| --- | --- |
| Apple Silicon, including M1, M2, M3, and later | `Typing-Garden-<version>-arm64.dmg` |
| Intel | `Typing-Garden-<version>-x64.dmg` |

Typing Garden requires macOS 12 or later.

## Install

1. Download the correct DMG from GitHub Releases.
2. Open the DMG and drag Typing Garden into Applications.
3. Open Typing Garden from Applications.

Official release packages are signed with a Developer ID and notarized by
Apple. Do not download builds from third-party mirrors unless you can verify
their checksum and source.

## Features

| Area | Included |
| --- | --- |
| Lessons | 32 progressive key, word, sentence, Pinyin, number, Shift, and symbol lessons |
| Guidance | Color keyboard, next-key highlight, and finger guidance |
| Feedback | WPM, accuracy, mistakes, progress, stars, and missed-key review |
| Games | Key Rain and Word Plane |
| Profiles | Multiple local child profiles with separate progress |
| Accessibility | Physical keyboard support, clickable virtual keys, and keyboard-accessible controls |
| Audio | Optional local typewriter sound and system speech for game words |

## Privacy

- No account or sign-in.
- No ads, tracking, telemetry, or remote analytics.
- No cloud upload or online leaderboard.
- Profile names and progress stay in local application storage.
- No automatic update checks or background network service.

Profiles can be deleted inside the app. To remove all local data, quit the app
and delete `~/Library/Application Support/Typing Garden/`. See
[PRIVACY.md](PRIVACY.md) for the complete policy.

## Development

Requirements:

- macOS, Linux, or Windows for web development
- macOS for app packaging
- Node.js 22 and npm

```bash
git clone https://github.com/wanqingcn/typing-garden.git
cd typing-garden
npm ci
npm test
npm run dev
```

Create the web build:

```bash
npm run build
```

Create unsigned Apple Silicon and Intel development packages on macOS:

```bash
npm run build:mac
```

Maintainers should follow [docs/RELEASING.md](docs/RELEASING.md) for signed and
notarized releases.

## Project Structure

- `src/domain/`: tested typing, profile, sound, and game logic
- `src/data/`: lessons and vocabulary
- `src/App.tsx`: application state and UI
- `electron/main.cjs`: macOS application window and security policy
- `scripts/`: local build and release scripts

## Contributing

Bug reports and focused pull requests are welcome. Read
[CONTRIBUTING.md](CONTRIBUTING.md) before starting. Security issues should be
reported through the private process in [SECURITY.md](SECURITY.md).

## License

Copyright (C) 2026 wanqingcn.

Typing Garden is free software licensed under
[GNU GPL version 3 only](LICENSE). Distributed versions and modifications must
follow the GPL source and notice requirements. Third-party components retain
their original licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
