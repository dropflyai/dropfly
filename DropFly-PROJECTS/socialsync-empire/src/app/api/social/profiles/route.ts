import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAyrshareClient } from '@/lib/ayrshare/client';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // 2. Get Ayrshare profiles
      const ayrshare = getAyrshareClient();
      const profiles = await ayrshare.getProfiles();

      // 3. Return connected platforms
      return NextResponse.json({
        success: true,
        profiles: profiles,
      });
    } catch (ayrshareError: any) {
      console.error('[Profiles] Ayrshare API Error:', ayrshareError);

      // If Ayrshare fails, return empty for now
      // In production, this means no accounts are connected yet
      return NextResponse.json({
        success: true,
        profiles: [],
        note: 'No accounts connected to Ayrshare yet'
      });
    }

  } catch (error: any) {
    console.error('[Profiles] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}
