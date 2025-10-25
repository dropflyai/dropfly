import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'edge';
export const maxDuration = 45;

const FormDataSchema = z.object({
  sku: z.string().min(1),
  imageFile: z.instanceof(File),
  pet_type: z.enum(['dog', 'cat', 'corgi', 'kitten', 'puppy', 'small pet']),
});

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const sku = formData.get('sku') as string;
    const imageFile = formData.get('imageFile') as File;
    const pet_type = formData.get('pet_type') as string;

    const validated = FormDataSchema.parse({
      sku,
      imageFile,
      pet_type,
    });

    const prompt = `Cozy modern living room, adorable ${validated.pet_type} playing excitedly, product showcase in foreground, warm afternoon sunlight, cinematic camera orbit, pet-friendly ambient music`;

    const higgsFormData = new FormData();
    higgsFormData.append('mode', 'image_to_video');
    higgsFormData.append('image', validated.imageFile);
    higgsFormData.append('prompt', prompt);
    higgsFormData.append('preset', 'product_placement');
    higgsFormData.append('duration', '10');
    higgsFormData.append('aspect_ratio', '9:16');
    higgsFormData.append('enable_audio', 'true');
    higgsFormData.append('camera_movement', 'orbit_right');

    const higgsResponse = await fetch('https://api.higgsfield.ai/v1/wan25', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HIGGS_API_KEY}`,
      },
      body: higgsFormData,
    });

    if (!higgsResponse.ok) {
      const errorText = await higgsResponse.text();
      throw new Error(`Higgsfield API error: ${errorText}`);
    }

    const higgsData = await higgsResponse.json();

    if (!higgsData.job_id) {
      throw new Error('No job_id returned from Higgsfield');
    }

    let videoUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const statusResponse = await fetch(`https://api.higgsfield.ai/v1/jobs/${higgsData.job_id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.HIGGS_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();

      if (statusData.status === 'completed' && statusData.output_url) {
        videoUrl = statusData.output_url;
        break;
      }

      if (statusData.status === 'failed') {
        throw new Error(`Higgsfield job failed: ${statusData.error || 'Unknown error'}`);
      }

      attempts++;
    }

    if (!videoUrl) {
      return NextResponse.json(
        {
          jobId: higgsData.job_id,
          status: 'processing',
          message: 'Video generation in progress. Check back later.',
          checkUrl: `/api/higgs-ugc/status/${higgsData.job_id}`,
        },
        { status: 202 }
      );
    }

    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download video from Higgsfield');
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const videoBytes = new Uint8Array(videoBuffer);

    const timestamp = Date.now();
    const r2Key = `ugc/${validated.sku}-${validated.pet_type}-${timestamp}.mp4`;

    await r2Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: r2Key,
      Body: videoBytes,
      ContentType: 'video/mp4',
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${r2Key}`;

    const { data: product } = await supabase
      .from('products')
      .select('ugc_videos')
      .eq('sku', validated.sku)
      .single();

    const existingVideos = product?.ugc_videos || [];
    const updatedVideos = [
      ...existingVideos,
      {
        url: publicUrl,
        pet_type: validated.pet_type,
        created_at: new Date().toISOString(),
        job_id: higgsData.job_id,
        preset: 'product_placement',
        has_audio: true,
      },
    ];

    const { error: updateError } = await supabase
      .from('products')
      .update({ ugc_videos: updatedVideos })
      .eq('sku', validated.sku);

    if (updateError) {
      throw new Error(`Failed to update product: ${updateError.message}`);
    }

    return NextResponse.json(
      {
        jobId: higgsData.job_id,
        url: publicUrl,
        status: 'completed',
        hasAudio: true,
        preset: 'product_placement',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Higgs UGC error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Video generation failed' },
      { status: 500 }
    );
  }
}
