# Changelog

Notable changes to Typing Garden are documented in this file.

The project follows [Semantic Versioning](https://semver.org/).

## Unreleased

## 1.0.0 - 2026-08-10

### Added

- GPL-3.0-only licensing and public project metadata
- English and Simplified Chinese documentation
- Privacy, security, contribution, release, and asset provenance documents
- GitHub Actions CI and dependency update configuration
- Developer ID release script using a macOS Keychain notarization profile

### Changed

- Replaced company-linked package identity with the public GitHub identity
- Restricted Electron permissions, popups, and renderer navigation
- Added a restrictive Content Security Policy
- Standardized architecture-specific DMG filenames
- Updated application and build dependencies to security-patched versions
- Updated pinned GitHub Actions revisions
- Made the notarization script compatible with current Electron Builder identity parsing

### Removed

- Third-party promotional content from the child-facing interface
- Mac App Store targets from the GitHub release configuration
