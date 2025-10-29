-- ⚠️ CLEAR ALL USER DATA FOR FRESH TESTING
-- Run this in Supabase SQL Editor to clear all user data

-- 1. Clear token transactions
DELETE FROM token_transactions;

-- 2. Clear posts
DELETE FROM posts;

-- 3. Clear content
DELETE FROM content;

-- 4. Clear profiles
DELETE FROM profiles;

-- 5. Clear usage tracking
DELETE FROM usage_tracking;

-- ✅ All user data cleared!
-- Note: To delete auth users, go to Authentication > Users in Supabase dashboard
-- and manually delete each user, OR use the admin API

SELECT 'Database cleared successfully!' as message;
