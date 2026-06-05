# iOS Firebase & push notifications (Evenlyo)

## Why the app crashed

`GoogleService-Info.plist` had a **placeholder** `GOOGLE_APP_ID` (`DOWNLOAD_FROM_FIREBASE_CONSOLE`). Firebase calls `abort()` when that value is invalid.

The invalid file was removed from the Xcode bundle so the app can start. **Push/FCM will not work until you add the real plist from Firebase.**

## What is already in the project (code)

| Piece | Status |
|--------|--------|
| `@react-native-firebase/messaging` + `@notifee/react-native` | Installed |
| `useFirebaseMessaging`, `useSyncFcmToken`, `helper.getFCMToken` | Implemented |
| `UIBackgroundModes` → `remote-notification` | In `Info.plist` |
| `aps-environment` (development) | In `Evenlyo.entitlements` |
| `AppDelegate` → `registerForRemoteNotifications` | Done |
| Android `google-services.json` | Present (project `evenlyo`) |

## What is missing (you must do in consoles)

### 1. Real `GoogleService-Info.plist` (required)

1. [Firebase Console](https://console.firebase.google.com/project/evenlyo/settings/general) → project **evenlyo**
2. **Your apps** → use the iOS app whose bundle matches **TestFlight / App Store**:
   - **Bundle ID:** `com.evenlyoapp` (must match Xcode `PRODUCT_BUNDLE_IDENTIFIER`)
   - Do **not** use `com.evenlyo` on iOS — that is the Android package; Apple signing uses `com.evenlyoapp`.
3. Download **GoogleService-Info.plist**
4. Install it:

```bash
chmod +x scripts/setup-ios-firebase-plist.sh
./scripts/setup-ios-firebase-plist.sh ~/Downloads/GoogleService-Info.plist
```

5. In Xcode: add `ios/Evenlyo/GoogleService-Info.plist` to the **Evenlyo** target (Copy Bundle Resources) if it is not there yet.

`GOOGLE_APP_ID` must look like: `1:800391339545:ios:xxxxxxxx` (not a placeholder string).

### 2. Apple Push Notification service (APNs) in Firebase

Firebase Console → **Project settings** → **Cloud Messaging** → **Apple app configuration**:

- Upload your **APNs Authentication Key** (.p8) from [Apple Developer → Keys](https://developer.apple.com/account/resources/authkeys/list), **or** use an APNs certificate.

Without this, FCM cannot deliver to real iPhones.

### 3. Apple Developer / Xcode capabilities

- App ID `com.evenlyoapp` → **Push Notifications** enabled
- Xcode → **Signing & Capabilities** → Push Notifications (+ Background Modes → Remote notifications)

### 4. Testing notes

- **Simulator:** FCM is limited; use a **physical device** for reliable push tests.
- **Production:** Release builds use `EvenlyoRelease.entitlements` (`aps-environment` = `production`). Debug uses `Evenlyo.entitlements` (`development`).

## Verify after setup

1. Run the app — no Firebase configuration crash.
2. Accept notification permission.
3. Check Metro logs for `🔥 FCM TOKEN:` (from `src/helper/index.js`).
4. Confirm your backend receives the token via `useSyncFcmToken`.
