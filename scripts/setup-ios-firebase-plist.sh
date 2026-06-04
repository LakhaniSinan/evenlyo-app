#!/usr/bin/env bash
# Copies a Firebase iOS config into the app and validates bundle / GOOGLE_APP_ID.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${ROOT}/ios/Evenlyo/GoogleService-Info.plist"

if [[ $# -lt 1 ]]; then
  echo "Usage: ./scripts/setup-ios-firebase-plist.sh /path/to/GoogleService-Info.plist"
  exit 1
fi

SRC="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
if [[ ! -f "$SRC" ]]; then
  echo "File not found: $SRC"
  exit 1
fi

BUNDLE_ID="$(plutil -extract BUNDLE_ID raw "$SRC" 2>/dev/null || true)"
APP_ID="$(plutil -extract GOOGLE_APP_ID raw "$SRC" 2>/dev/null || true)"

if [[ "$BUNDLE_ID" != "com.evenlyoapp" ]]; then
  echo "Error: BUNDLE_ID must be com.evenlyoapp (got: ${BUNDLE_ID:-missing})"
  exit 1
fi

if [[ ! "$APP_ID" =~ ^1:[0-9]+:ios:[a-zA-Z0-9]+$ ]]; then
  echo "Error: GOOGLE_APP_ID must look like 1:800391339545:ios:xxxxxxxx"
  exit 1
fi

cp "$SRC" "$DEST"
echo "Installed: $DEST"
echo ""
echo "Next in Xcode:"
echo "  1. Open ios/Evenlyo.xcworkspace"
echo "  2. Drag GoogleService-Info.plist into the Evenlyo group (if not already listed)"
echo "  3. Target membership: Evenlyo — Copy items if needed"
echo "  4. Clean build (Cmd+Shift+K) and run again"
