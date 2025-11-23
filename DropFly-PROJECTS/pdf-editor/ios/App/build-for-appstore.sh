#!/bin/bash
set -e

echo "🔧 Setting up code signing for App Store..."

# Import certificate to keychain
echo "Importing certificate..."
security unlock-keychain -p "" github-actions-build.keychain-db 2>/dev/null || true

# Verify provisioning profile is installed
echo "Verifying provisioning profile..."
PP_PATH="$HOME/Library/MobileDevice/Provisioning Profiles"
if [ -d "$PP_PATH" ]; then
  echo "Installed provisioning profiles:"
  ls -la "$PP_PATH"
else
  echo "⚠️ Warning: No provisioning profiles directory found"
fi

echo "🏗️ Building iOS app..."
xcodebuild clean archive \
  -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/App.xcarchive \
  -allowProvisioningUpdates \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  CODE_SIGN_STYLE=Manual \
  DEVELOPMENT_TEAM=G46B7YC46C \
  PROVISIONING_PROFILE_SPECIFIER="PDF Doc Sign App Store"

echo "📦 Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportOptionsPlist exportOptions.plist \
  -exportPath build \
  -allowProvisioningUpdates

echo "✅ Build complete!"
ls -lh build/*.ipa
