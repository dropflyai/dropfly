import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
  const outputPath = path.join(tempDir, `cropped_${Date.now()}.mp4`);

  try {
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const aspectRatioData = formData.get('aspectRatio') as string;

    if (!videoFile) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
    }

    if (!aspectRatioData) {
      return NextResponse.json({ error: 'Aspect ratio data is required' }, { status: 400 });
    }

    const aspectRatio = JSON.parse(aspectRatioData);
    const { width, height, x = 0, y = 0 } = aspectRatio;

    // Save uploaded file
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(inputPath, buffer);

    // Get input video dimensions first
    const probeCommand = `ffprobe -v quiet -show_entries stream=width,height -select_streams v:0 -of csv=s=x:p=0 "${inputPath}"`;
    let inputWidth = 1920;
    let inputHeight = 1080;

    try {
      const { stdout: probeOutput } = await execAsync(probeCommand);
      const [w, h] = probeOutput.trim().split('x').map(Number);
      if (w && h) {
        inputWidth = w;
        inputHeight = h;
      }
    } catch (e) {
      console.log('Could not get input dimensions, using defaults');
    }

    // Calculate crop parameters
    const targetAspectRatio = width / height;
    const inputAspectRatio = inputWidth / inputHeight;

    let cropWidth, cropHeight, cropX, cropY;

    if (inputAspectRatio > targetAspectRatio) {
      // Input is wider than target, crop width
      cropHeight = inputHeight;
      cropWidth = Math.round(inputHeight * targetAspectRatio);
      cropX = Math.round(((inputWidth - cropWidth) / 2) + (x / 100 * (inputWidth - cropWidth)));
      cropY = Math.round(y / 100 * (inputHeight - cropHeight));
    } else {
      // Input is taller than target, crop height
      cropWidth = inputWidth;
      cropHeight = Math.round(inputWidth / targetAspectRatio);
      cropX = Math.round(x / 100 * (inputWidth - cropWidth));
      cropY = Math.round(((inputHeight - cropHeight) / 2) + (y / 100 * (inputHeight - cropHeight)));
    }

    // Ensure crop parameters are within bounds
    cropX = Math.max(0, Math.min(cropX, inputWidth - cropWidth));
    cropY = Math.max(0, Math.min(cropY, inputHeight - cropHeight));

    // Build FFmpeg command for cropping and scaling
    const command = `ffmpeg -i "${inputPath}" -vf "crop=${cropWidth}:${cropHeight}:${cropX}:${cropY},scale=${width}:${height}" -c:a copy -y "${outputPath}"`;

    console.log('Executing crop command:', command);
    console.log('Crop parameters:', { cropWidth, cropHeight, cropX, cropY, targetWidth: width, targetHeight: height });

    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 100 // 100MB buffer
      });

      if (stderr && !stderr.includes('time=')) {
        console.error('FFmpeg stderr:', stderr);
      }

      console.log('FFmpeg completed successfully');
    } catch (execError: any) {
      console.error('FFmpeg execution error:', execError);
      return NextResponse.json(
        { error: `Failed to crop video: ${execError.message}` },
        { status: 500 }
      );
    }

    // Check if output file was created
    if (!fs.existsSync(outputPath)) {
      return NextResponse.json(
        { error: 'Video cropping failed - output file not created' },
        { status: 500 }
      );
    }

    // Read the processed video
    const videoBuffer = fs.readFileSync(outputPath);

    // Clean up temp files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    // Return the cropped video
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="cropped_${width}x${height}.mp4"`,
        'Content-Length': videoBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Crop error:', error);

    // Clean up temp files if they exist
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to crop video' },
      { status: 500 }
    );
  }
}