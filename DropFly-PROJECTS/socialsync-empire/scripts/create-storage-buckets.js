/**
 * Create Supabase Storage Buckets
 *
 * Creates the required storage buckets for SocialSync Empire:
 * 1. brand-assets - For logos, product photos, avatars
 * 2. campaign-videos - For generated videos
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createStorageBuckets() {
  console.log('🚀 Creating Supabase Storage Buckets...\n');

  // Initialize Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Bucket configurations
  const buckets = [
    {
      id: 'brand-assets',
      name: 'brand-assets',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
    },
    {
      id: 'campaign-videos',
      name: 'campaign-videos',
      public: true,
      fileSizeLimit: 52428800, // 50MB (Supabase free tier max)
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    }
  ];

  let created = 0;
  let exists = 0;
  let errors = 0;

  for (const bucketConfig of buckets) {
    console.log(`📦 Creating bucket: ${bucketConfig.name}`);

    try {
      // Try to create the bucket
      const { data, error } = await supabase.storage.createBucket(bucketConfig.id, {
        public: bucketConfig.public,
        fileSizeLimit: bucketConfig.fileSizeLimit,
        allowedMimeTypes: bucketConfig.allowedMimeTypes
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️  Bucket "${bucketConfig.name}" already exists`);
          exists++;
        } else {
          console.error(`   ❌ Error creating "${bucketConfig.name}":`, error.message);
          errors++;
        }
      } else {
        console.log(`   ✅ Successfully created "${bucketConfig.name}"`);
        created++;
      }

      // Verify bucket exists
      const { data: bucket } = await supabase.storage.getBucket(bucketConfig.id);
      if (bucket) {
        console.log(`   ✓ Verified bucket exists`);
        console.log(`   ✓ Public: ${bucket.public}`);
        console.log(`   ✓ File size limit: ${(bucketConfig.fileSizeLimit / 1048576).toFixed(0)}MB`);
      }

    } catch (err) {
      console.error(`   ❌ Exception:`, err.message);
      errors++;
    }

    console.log('');
  }

  // Summary
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ℹ️  Already existed: ${exists}`);
  console.log(`   ❌ Errors: ${errors}`);

  if (created + exists === buckets.length) {
    console.log('\n🎉 All storage buckets are ready!');
    return true;
  } else {
    console.log('\n⚠️  Some buckets may need manual creation in Supabase Dashboard');
    return false;
  }
}

// Run the script
createStorageBuckets()
  .then(success => {
    if (success) {
      console.log('\n✅ Storage setup complete!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Please check errors above');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
