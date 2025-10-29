# 🚪 LOGOUT & DATABASE CLEAR GUIDE

## ✅ LOGOUT BUTTON ADDED

**Location:** Sidebar (bottom section, above user profile)
**Color:** Red text
**Icon:** LogOut icon
**Action:** Signs out via Supabase and redirects to /login

**To Use:**
1. Look at the left sidebar (desktop) or bottom nav (mobile)
2. Click the red "Log Out" button
3. You'll be signed out and redirected to login

---

## 🗑️ CLEAR DATABASE FOR FRESH TESTING

### Option 1: SQL Script (Recommended)

**File Created:** `clear-database.sql`

**Steps:**
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `clear-database.sql`
5. Click "Run" to execute
6. All user data will be cleared ✅

**What Gets Cleared:**
- ✅ Token transactions
- ✅ Posts
- ✅ Content  
- ✅ Profiles
- ✅ Usage tracking

**What Doesn't Get Cleared (Need Manual Delete):**
- ⚠️ Auth users (see Option 2)

---

### Option 2: Delete Auth Users Manually

**In Supabase Dashboard:**
1. Go to "Authentication" → "Users"
2. Click on each user
3. Click "Delete User"
4. Confirm deletion
5. Repeat for all test accounts

---

## 🧪 FRESH ONBOARDING TEST STEPS

1. **Clear database** (Option 1 above)
2. **Delete auth users** (Option 2 above)
3. **Click "Log Out"** in the sidebar
4. **Sign up with a NEW email** (e.g., test2@test.com)
5. **You should now see:**
   - ✅ "Welcome, [Name]!" (NOT "Welcome back")
   - ✅ "STEP 1" banner to connect social accounts
   - ✅ Token balance: 300 tokens
   - ✅ Daily usage: 0/15 tokens
   - ❌ NO "300 of 300 videos" card
   - ❌ NO stats section (Views, Engagement, etc.)

---

## 🔥 QUICK TEST COMMANDS

### Test Logout:
1. Click "Log Out" button in sidebar
2. Should redirect to /login
3. Try accessing /home → Should redirect to /login

### Test Fresh Onboarding:
1. Clear DB + delete users
2. Sign up with fresh email
3. Check home page for new user experience

---

## ⚠️ IMPORTANT NOTES

- **Logout works immediately** (no restart needed)
- **Database clear is permanent** (can't undo)
- **Auth users must be deleted separately** (can't do via SQL for security)
- **Dev server auto-reloads** (changes take effect immediately)

---

## 🎯 WHAT TO TEST AFTER CLEARING

1. ✅ Onboarding experience (first-time user flow)
2. ✅ Token balance initialization (300 tokens)
3. ✅ Daily limit initialization (15 tokens/day for free)
4. ✅ No fake stats or video credits
5. ✅ Social account connection prompt

