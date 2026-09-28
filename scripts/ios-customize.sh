#!/usr/bin/env bash
# Runs after `npx cap add ios` / `npx cap sync ios` on the Mac build machine.
# Sets the app icon + launch screen and makes the app full-screen with no status bar.
set -euo pipefail

APP_DIR="ios/App/App"
ASSETS="$APP_DIR/Assets.xcassets"
PLIST="$APP_DIR/Info.plist"

# App icon: overwrite every PNG in the icon set with our 1024x1024 icon (Capacitor 7 ships a single 1024 slot)
if [ -d "$ASSETS/AppIcon.appiconset" ]; then
  for f in "$ASSETS"/AppIcon.appiconset/*.png; do cp resources/ios/icon-1024.png "$f"; done
  echo "icon set"
fi

# Launch screen: replace the default splash images with ours
if [ -d "$ASSETS/Splash.imageset" ]; then
  for f in "$ASSETS"/Splash.imageset/*.png; do cp resources/ios/splash-2732.png "$f"; done
  echo "splash set"
fi

# Full screen, no status bar
PB=/usr/libexec/PlistBuddy
setkey () { $PB -c "Set :$1 $3" "$PLIST" 2>/dev/null || $PB -c "Add :$1 $2 $3" "$PLIST"; }
setkey UIStatusBarHidden bool true
setkey UIViewControllerBasedStatusBarAppearance bool false
setkey UIRequiresFullScreen bool true
setkey CFBundleDisplayName string "Neon Pong"
echo "Info.plist updated"
