import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/brand-packages/[id] - Get specific brand package with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch brand package with all related data
    const { data: brandPackage, error } = await supabase
      .from('brand_packages')
      .select(`
        *,
        brand_assets (*),
        brand_guidelines (*),
        brand_avatars (*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching brand package:', error);
      return NextResponse.json({ error: 'Brand package not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      brandPackage
    });

  } catch (error: any) {
    console.error('Error in GET /api/brand-packages/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/brand-packages/[id] - Update brand package
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      is_default,
      status
    } = body;

    // If setting as default, unset other defaults first
    if (is_default) {
      await supabase
        .from('brand_packages')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
        .neq('id', params.id);
    }

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (mission_statement !== undefined) updateData.mission_statement = mission_statement;
    if (brand_voice !== undefined) updateData.brand_voice = brand_voice;
    if (brand_personality !== undefined) updateData.brand_personality = brand_personality;
    if (target_audience !== undefined) updateData.target_audience = target_audience;
    if (key_values !== undefined) updateData.key_values = key_values;
    if (primary_color !== undefined) updateData.primary_color = primary_color;
    if (secondary_color !== undefined) updateData.secondary_color = secondary_color;
    if (accent_color !== undefined) updateData.accent_color = accent_color;
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (logo_dark_url !== undefined) updateData.logo_dark_url = logo_dark_url;
    if (website_url !== undefined) updateData.website_url = website_url;
    if (social_handles !== undefined) updateData.social_handles = social_handles;
    if (industry !== undefined) updateData.industry = industry;
    if (established_year !== undefined) updateData.established_year = established_year;
    if (description !== undefined) updateData.description = description;
    if (is_default !== undefined) updateData.is_default = is_default;
    if (status !== undefined) updateData.status = status;

    // Update brand package
    const { data: brandPackage, error } = await supabase
      .from('brand_packages')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand package:', error);
      return NextResponse.json({ error: 'Failed to update brand package' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      brandPackage
    });

  } catch (error: any) {
    console.error('Error in PATCH /api/brand-packages/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/brand-packages/[id] - Delete brand package
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

    // Delete brand package (CASCADE will delete related assets, guidelines, avatars)
    const { error } = await supabase
      .from('brand_packages')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting brand package:', error);
      return NextResponse.json({ error: 'Failed to delete brand package' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Brand package deleted successfully'
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/brand-packages/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
