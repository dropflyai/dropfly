-- 🗑️ FORCE DELETE STUCK TEST USERS
-- Run this in Supabase SQL Editor if you can't delete users via UI

-- First, find the stuck user IDs
-- Run this to see all users:
-- SELECT id, email FROM auth.users;

-- Option 1: Delete specific users by email pattern (test users)
DELETE FROM auth.users
WHERE email LIKE 'test%@%';

-- Option 2: Delete ALL auth users (⚠️ USE WITH CAUTION)
-- Uncomment the line below if you want to delete ALL users:
-- DELETE FROM auth.users;

-- Verify deletion
SELECT COUNT(*) as remaining_users FROM auth.users;
