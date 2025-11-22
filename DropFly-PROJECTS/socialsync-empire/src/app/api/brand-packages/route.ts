import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/brand-packages - List user's brand packages
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch brand packages with related data
    const { data: brandPackages, error } = await supabase
      .from('brand_packages')
      .select(`
        *,
        brand_assets (
          id,
          asset_type,
          file_url,
          title
        ),
        brand_guidelines (*),
        brand_avatars (
          id,
          name,
          avatar_type,
          is_default
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching brand packages:', error);
      return NextResponse.json({ error: 'Failed to fetch brand packages' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      brandPackages: brandPackages || []
    });

  } catch (error: any) {
    console.error('Error in GET /api/brand-packages:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/brand-packages - Create new brand package
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      tagline,
      mission_statement,
      brand_voice,
      brand_personality,
      target_audience,
      key_values,
      primary_color,
      secondary_color,
      accent_color,
      logo_url,
      logo_dark_url,
      website_url,
      social_handles,
      industry,
      established_year,
      description,
      is_default
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    // If setting as default, unset other defaults first
    if (is_default) {
      await supabase
        .from('brand_packages')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);
    }

    // Create brand package
    const { data: brandPackage, error } = await supabase
      .from('brand_packages')
      .insert({
        user_id: user.id,
        name,
        tagline,
        mission_statement,
        brand_voice,
        brand_personality,
        target_audience,
        key_values,
        primary_color,
        secondary_color,
        accent_color,
        logo_url,
        logo_dark_url,
        website_url,
        social_handles,
        industry,
        established_year,
        description,
        is_default: is_default || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating brand package:', error);
      return NextResponse.json({ error: 'Failed to create brand package' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      brandPackage
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/brand-packages:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
