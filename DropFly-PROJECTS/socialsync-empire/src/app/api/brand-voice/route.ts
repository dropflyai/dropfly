import { NextResponse } from 'next/server';
import { getBrandVoice } from '@/lib/brand-voice';
import fs from 'fs';
import path from 'path';

// GET - Fetch current brand voice configuration
export async function GET() {
  try {
    const brandVoice = getBrandVoice();
    return NextResponse.json(brandVoice);
  } catch (error) {
    console.error('Error fetching brand voice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand voice configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update brand voice configuration
export async function PUT(request: Request) {
  try {
    const updatedConfig = await request.json();

    // Add version and timestamp
    updatedConfig.lastUpdated = new Date().toISOString().split('T')[0];
    updatedConfig.version = parseFloat(updatedConfig.version || '1.0') + 0.1;
    updatedConfig.version = updatedConfig.version.toFixed(1);

    // Write to config file
    const configPath = path.join(process.cwd(), 'config', 'brand-voice.json');
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Brand voice updated successfully',
      version: updatedConfig.version,
    });
  } catch (error) {
    console.error('Error updating brand voice:', error);
    return NextResponse.json(
      { error: 'Failed to update brand voice configuration' },
      { status: 500 }
    );
  }
}
