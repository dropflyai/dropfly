#!/bin/bash
set -e

echo "🔧 Setting up code signing for App Store..."

# Import certificate to keychain
echo "Importing certificate..."
security unlock-keychain -p "" github-actions-build.keychain-db 2>/dev/null || true

# Install provisioning profile
echo "Installing provisioning profile..."
PP_PATH="$HOME/Library/MobileDevice/Provisioning Profiles"
mkdir -p "$PP_PATH"

# Find the UUID from the profile
PP_UUID=$(security cms -D -i profile.mobileprovision | plutil -extract UUID raw -)
echo "Profile UUID: $PP_UUID"

# Copy with UUID name
cp profile.mobileprovision "$PP_PATH/$PP_UUID.mobileprovision"

# Verify installation
ls -la "$PP_PATH"

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
