import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/brand-packages/[id]/upload - Upload brand asset (logo, product photo, avatar, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify brand package belongs to user
    const { data: brandPackage, error: packageError } = await supabase
      .from('brand_packages')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (packageError || !brandPackage) {
      return NextResponse.json({ error: 'Brand package not found' }, { status: 404 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assetType = formData.get('asset_type') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!assetType) {
      return NextResponse.json({ error: 'Asset type is required' }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Please upload an image (JPG, PNG, GIF, WebP, or SVG)'
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 10MB'
      }, { status: 400 });
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${params.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({
        error: 'Failed to upload file',
        details: uploadError.message
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(fileName);

    // Save asset record to database
    const { data: asset, error: dbError } = await supabase
      .from('brand_assets')
      .insert({
        brand_package_id: params.id,
        user_id: user.id,
        asset_type: assetType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        title: title || file.name,
        description: description || null
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to delete uploaded file since DB save failed
      await supabase.storage.from('brand-assets').remove([fileName]);
      return NextResponse.json({
        error: 'Failed to save asset record',
        details: dbError.message
      }, { status: 500 });
    }

    // If this is a logo, update the brand package
    if (assetType === 'logo' || assetType === 'logo_dark') {
      const updateField = assetType === 'logo' ? 'logo_url' : 'logo_dark_url';
      await supabase
        .from('brand_packages')
        .update({ [updateField]: publicUrl })
        .eq('id', params.id)
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      success: true,
      asset,
      url: publicUrl
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/brand-packages/[id]/upload:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/brand-packages/[id]/upload - Delete a specific asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('asset_id');

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    // Get asset info
    const { data: asset, error: assetError } = await supabase
      .from('brand_assets')
      .select('file_url, file_name')
      .eq('id', assetId)
      .eq('brand_package_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Extract file path from URL
    const urlParts = asset.file_url.split('/brand-assets/');
    const filePath = urlParts[1];

    // Delete from storage
    if (filePath) {
      await supabase.storage.from('brand-assets').remove([filePath]);
    }

    // Delete database record
    const { error: deleteError } = await supabase
      .from('brand_assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting asset:', deleteError);
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully'
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/brand-packages/[id]/upload:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
