# Release Guide

This process is for project maintainers. Public release credentials must stay
in the macOS Keychain and must never be committed to Git.

## Prerequisites

- A clean release commit and matching version in `package.json`
- A Developer ID Application certificate authorized for this project
- A `notarytool` credential profile stored in the macOS Keychain
- Apple Silicon and Intel test coverage, using real Macs when available

Create the Keychain profile locally. Follow the prompts and do not paste
credentials into source files, shell history, issues, or chat:

```bash
xcrun notarytool store-credentials typing-garden-notary
```

## Build And Notarize

Set only the public certificate identity and the local Keychain profile name:

```bash
export TYPING_GARDEN_DEVELOPER_ID="Developer ID Application: Your Authorized Name (TEAMID)"
export TYPING_GARDEN_NOTARY_PROFILE="typing-garden-notary"
./scripts/sign-and-notarize.sh arm64
./scripts/sign-and-notarize.sh x64
```

The script tests and builds the app, signs it with Electron Builder, notarizes
and staples the app, creates and signs the DMG, then notarizes and staples the
DMG.

## Verify

```bash
codesign --verify --deep --strict --verbose=2 "release/mac-arm64/Typing Garden.app"
spctl --assess --type execute --verbose "release/mac-arm64/Typing Garden.app"
xcrun stapler validate "release/Typing-Garden-1.0.0-arm64.dmg"
hdiutil verify "release/Typing-Garden-1.0.0-arm64.dmg"
```

Repeat the checks for the Intel package. Install each package after downloading
it through the same path users will receive it.

## Checksums

```bash
cd release
shasum -a 256 Typing-Garden-*.dmg > SHA256SUMS
```

Inspect `SHA256SUMS` before attaching it to a release.

## Publish

1. Create a signed `v<version>` tag from the verified release commit.
2. Create a draft GitHub Release.
3. Add English and Chinese release notes.
4. Attach both DMGs and `SHA256SUMS`.
5. Download the draft assets and repeat checksum and Gatekeeper checks.
6. Publish only after explicit maintainer confirmation.

The first releases are signed locally. Public CI does not receive Apple
certificate private keys or notarization credentials.
