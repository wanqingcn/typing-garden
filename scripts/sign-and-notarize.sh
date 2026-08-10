#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

: "${TYPING_GARDEN_DEVELOPER_ID:?Set TYPING_GARDEN_DEVELOPER_ID to your Developer ID Application identity}"
: "${TYPING_GARDEN_NOTARY_PROFILE:?Set TYPING_GARDEN_NOTARY_PROFILE to a notarytool Keychain profile}"

IDENTITY="$TYPING_GARDEN_DEVELOPER_ID"
NOTARY_PROFILE="$TYPING_GARDEN_NOTARY_PROFILE"

cd "$PROJECT_ROOT"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "This release script requires macOS."
  exit 1
fi

ARCH="${1:-$(uname -m)}"
case "$ARCH" in
  arm64)
    APP_DIR="mac-arm64"
    ;;
  x64)
    APP_DIR="mac"
    ;;
  *)
    echo "Unsupported architecture: $ARCH (expected arm64 or x64)"
    exit 1
    ;;
esac

VERSION="$(node -p "require('./package.json').version")"
APP_PATH="release/${APP_DIR}/Typing Garden.app"
DMG_PATH="release/Typing-Garden-${VERSION}-${ARCH}.dmg"
TEMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/typing-garden-notary.XXXXXX")"
APP_ZIP="$TEMP_ROOT/Typing-Garden-${VERSION}-${ARCH}.zip"
DMG_STAGING="$TEMP_ROOT/dmg"

cleanup() {
  rm -rf "$TEMP_ROOT"
}
trap cleanup EXIT

echo "Typing Garden v${VERSION} ${ARCH}: Developer ID signing and notarization"

npm test
npm run build

npx electron-builder --dir --mac "--${ARCH}" --config.mac.identity="$IDENTITY"

if [ ! -d "$APP_PATH" ]; then
  echo "App not found: $APP_PATH"
  exit 1
fi

codesign --verify --deep --strict --verbose=2 "$APP_PATH"
ditto -c -k --keepParent "$APP_PATH" "$APP_ZIP"
xcrun notarytool submit "$APP_ZIP" --keychain-profile "$NOTARY_PROFILE" --wait
xcrun stapler staple "$APP_PATH"
xcrun stapler validate "$APP_PATH"
spctl --assess --type execute --verbose "$APP_PATH"

mkdir -p "$DMG_STAGING"
cp -R "$APP_PATH" "$DMG_STAGING/"
ln -s /Applications "$DMG_STAGING/Applications"
hdiutil create -volname "Typing Garden ${VERSION}" \
  -srcfolder "$DMG_STAGING" \
  -ov -format UDZO "$DMG_PATH"
rm -rf "$DMG_STAGING"

codesign --force --sign "$IDENTITY" --timestamp "$DMG_PATH"
codesign --verify --verbose=2 "$DMG_PATH"

xcrun notarytool submit "$DMG_PATH" --keychain-profile "$NOTARY_PROFILE" --wait
xcrun stapler staple "$DMG_PATH"
xcrun stapler validate "$DMG_PATH"
spctl --assess --type open --context context:primary-signature --verbose "$DMG_PATH"

echo "Release ready: $DMG_PATH"
