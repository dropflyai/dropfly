# 🔐 GitHub Secrets Setup Guide

## Step-by-Step Instructions

### 1. Go to GitHub Secrets Page

Open this URL in your browser:
```
https://github.com/dropflyai/dropfly/settings/secrets/actions
```

---

### 2. Add Secret #1: Certificate (P12)

1. Click **"New repository secret"** button
2. **Name**: `IOS_CERTIFICATE_P12`
3. **Secret**:
   - Open the file: `/Users/rioallen/Documents/certificate-base64.txt`
   - Copy the ENTIRE contents (it's one very long line)
   - Paste into the Secret field
4. Click **"Add secret"**

✅ **Secret #1 added!**

---

### 3. Add Secret #2: P12 Password

1. Click **"New repository secret"** button again
2. **Name**: `IOS_CERTIFICATE_PASSWORD`
3. **Secret**: `Starter2025!`
4. Click **"Add secret"**

✅ **Secret #2 added!**

---

### 4. Add Secret #3: Provisioning Profile

1. Click **"New repository secret"** button again
2. **Name**: `IOS_PROVISIONING_PROFILE`
3. **Secret**:
   - Open the file: `/Users/rioallen/Documents/provisioning-profile-base64.txt`
   - Copy the ENTIRE contents (it's one very long line)
   - Paste into the Secret field
4. Click **"Add secret"**

✅ **Secret #3 added!**

---

## ✅ Verification

After adding all 3 secrets, you should see:
- `IOS_CERTIFICATE_P12` (Updated X seconds ago)
- `IOS_CERTIFICATE_PASSWORD` (Updated X seconds ago)
- `IOS_PROVISIONING_PROFILE` (Updated X seconds ago)

---

## 🚀 Next Steps

Once all secrets are added:
1. Go to: https://github.com/dropflyai/dropfly/actions
2. Click on **"Build iOS App"** workflow
3. Click **"Run workflow"** button
4. Select branch: `main`
5. Click **"Run workflow"**
6. Wait ~10-15 minutes for the build to complete
7. Download the IPA file from Artifacts

---

## 📋 Quick Reference

| Secret Name | Value Location |
|-------------|----------------|
| `IOS_CERTIFICATE_P12` | `/Users/rioallen/Documents/certificate-base64.txt` |
| `IOS_CERTIFICATE_PASSWORD` | `Starter2025!` |
| `IOS_PROVISIONING_PROFILE` | `/Users/rioallen/Documents/provisioning-profile-base64.txt` |

---

## 🆘 Troubleshooting

**Can't find the text files?**
- Open Finder
- Press Cmd+Shift+G
- Type: `/Users/rioallen/Documents/`
- Press Enter
- Look for `certificate-base64.txt` and `provisioning-profile-base64.txt`

**Secret field won't accept the text?**
- Make sure you're copying the ENTIRE content (no extra spaces at the end)
- The text should be one long line with no line breaks
- Try using Cmd+A to select all, then Cmd+C to copy

**Already added a secret with the same name?**
- You can update it by clicking on the secret name
- Click **"Update secret"**
- Paste the new value

---

Good luck! 🚀
