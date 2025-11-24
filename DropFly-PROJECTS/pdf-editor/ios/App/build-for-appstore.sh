#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════"
echo "🔧 iOS App Store Build Diagnostics"
echo "════════════════════════════════════════════════════════"

# 1. Check Keychain
echo ""
echo "1️⃣ Checking Keychain..."
security list-keychains
echo "Unlocking keychain..."
security unlock-keychain -p "" github-actions-build.keychain-db 2>/dev/null || true

echo ""
echo "2️⃣ Checking Certificates..."
security find-identity -v -p codesigning

# 2. Check Provisioning Profiles
echo ""
echo "3️⃣ Checking Provisioning Profiles..."
PP_PATH="$HOME/Library/MobileDevice/Provisioning Profiles"
if [ -d "$PP_PATH" ]; then
  echo "✅ Provisioning profiles directory exists"
  ls -la "$PP_PATH"

  # Examine each profile
  for profile in "$PP_PATH"/*.mobileprovision; do
    if [ -f "$profile" ]; then
      echo ""
      echo "📄 Profile: $(basename "$profile")"
      security cms -D -i "$profile" | plutil -p - | grep -A 5 "Name\|UUID\|TeamIdentifier\|application-identifier" || true
    fi
  done
else
  echo "❌ No provisioning profiles directory found!"
  exit 1
fi

# 3. Check Xcode Project Settings
echo ""
echo "4️⃣ Checking Xcode Project Settings..."
grep -A 10 "PRODUCT_BUNDLE_IDENTIFIER\|CODE_SIGN_IDENTITY\|DEVELOPMENT_TEAM\|PROVISIONING_PROFILE_SPECIFIER" App.xcodeproj/project.pbxproj | head -40

# 4. Build
echo ""
echo "════════════════════════════════════════════════════════"
echo "🏗️ Starting Xcode Build..."
echo "════════════════════════════════════════════════════════"

xcodebuild clean archive \
  -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/App.xcarchive \
  -allowProvisioningUpdates \
  -destination 'generic/platform=iOS' \
  | tee build.log

# 5. Export
echo ""
echo "════════════════════════════════════════════════════════"
echo "📦 Exporting IPA..."
echo "════════════════════════════════════════════════════════"

echo "Export options:"
cat exportOptions.plist

xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportOptionsPlist exportOptions.plist \
  -exportPath build \
  -allowProvisioningUpdates \
  | tee -a build.log

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ Build Complete!"
echo "════════════════════════════════════════════════════════"
ls -lh build/*.ipa
