import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  /// Firebase aborts on launch if GOOGLE_APP_ID is missing or still a template string.
  private func configureFirebaseIfPlistIsValid() {
    guard FirebaseApp.app() == nil else { return }
    guard
      let plistPath = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
      let plist = NSDictionary(contentsOfFile: plistPath),
      let appId = plist["GOOGLE_APP_ID"] as? String
    else {
      NSLog(
        "[Evenlyo] GoogleService-Info.plist not in app bundle — Firebase and FCM disabled. Download from Firebase Console (bundle: com.evenlyoapp)."
      )
      return
    }

    let placeholderMarkers = [
      "DOWNLOAD_FROM_FIREBASE",
      "YOUR_",
      "REPLACE",
      "TODO",
      "PLACEHOLDER",
    ]
    let looksLikeIosAppId =
      appId.hasPrefix("1:") && appId.contains(":ios:")
    let hasPlaceholder = placeholderMarkers.contains {
      appId.localizedCaseInsensitiveContains($0)
    }

    guard looksLikeIosAppId, !hasPlaceholder else {
      NSLog(
        "[Evenlyo] Invalid GOOGLE_APP_ID in GoogleService-Info.plist — Firebase not configured. Replace the file from Firebase Console (project: evenlyo)."
      )
      return
    }

    FirebaseApp.configure()
  }

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    configureFirebaseIfPlistIsValid()

    UNUserNotificationCenter.current().delegate = self
    application.registerForRemoteNotifications()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Evenlyo",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    // RN Firebase attaches APNs token via FirebaseAppDelegateProxyEnabled (Info.plist).
    NSLog("[Evenlyo] APNs device token registered (%lu bytes)", deviceToken.count)
  }

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    NSLog("[Evenlyo] APNs registration failed: \(error.localizedDescription)")
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    if #available(iOS 14.0, *) {
      completionHandler([.banner, .list, .sound, .badge])
    } else {
      completionHandler([.alert, .sound, .badge])
    }
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    completionHandler()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
