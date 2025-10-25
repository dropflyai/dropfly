import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

interface ProcessingStep {
  id: string;
  type: 'crop' | 'trim' | 'watermark' | 'subtitle' | 'compress' | 'convert';
  name: string;
  parameters: any;
  applied: boolean;
}

export async function POST(req: NextRequest) {
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
  let currentPath = inputPath;
  const intermediateFiles: string[] = [];

  try {
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const stepsData = formData.get('steps') as string;
    const isPreview = formData.get('preview') === 'true';
    const storageConfigData = formData.get('storageConfig') as string;

    if (!videoFile) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
    }

    // Save uploaded file
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(inputPath, buffer);

    let steps: ProcessingStep[] = [];
    if (stepsData) {
      try {
        steps = JSON.parse(stepsData);
      } catch (e) {
        console.error('Failed to parse steps:', e);
      }
    }

    // Process each step in sequence
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const outputPath = path.join(tempDir, `step_${i}_${Date.now()}.mp4`);
      intermediateFiles.push(outputPath);

      console.log(`Processing step ${i + 1}/${steps.length}: ${step.type}`);

      try {
        switch (step.type) {
          case 'crop':
            await processCropStep(currentPath, outputPath, step.parameters, isPreview);
            break;
          case 'trim':
            await processTrimStep(currentPath, outputPath, step.parameters, isPreview);
            break;
          case 'watermark':
            await processWatermarkStep(currentPath, outputPath, step.parameters, isPreview);
            break;
          case 'compress':
            await processCompressStep(currentPath, outputPath, step.parameters, isPreview);
            break;
          case 'convert':
            await processConvertStep(currentPath, outputPath, step.parameters, isPreview);
            break;
          default:
            console.warn(`Unknown step type: ${step.type}`);
            // Skip unknown steps by copying the file
            fs.copyFileSync(currentPath, outputPath);
        }

        currentPath = outputPath;
      } catch (stepError) {
        console.error(`Error in step ${step.type}:`, stepError);
        throw new Error(`Failed to process ${step.type}: ${stepError}`);
      }
    }

    // Handle cloud storage if configured
    if (storageConfigData && !isPreview) {
      try {
        const storageConfig = JSON.parse(storageConfigData);
        const uploadResult = await handleCloudUpload(currentPath, storageConfig, videoFile.name);

        // Clean up temp files
        cleanupFiles([inputPath, ...intermediateFiles]);

        return NextResponse.json(uploadResult);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        cleanupFiles([inputPath, ...intermediateFiles]);
        return NextResponse.json(
          { error: `Upload failed: ${uploadError}` },
          { status: 500 }
        );
      }
    }

    // Read the final processed video
    const finalVideoBuffer = fs.readFileSync(currentPath);

    // Clean up temp files
    cleanupFiles([inputPath, ...intermediateFiles]);

    // Return the processed video
    const filename = isPreview
      ? `preview_${Date.now()}.mp4`
      : `processed_${videoFile.name}`;

    return new NextResponse(finalVideoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': finalVideoBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Pipeline error:', error);

    // Clean up temp files
    cleanupFiles([inputPath, ...intermediateFiles]);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process video' },
      { status: 500 }
    );
  }
}

async function processCropStep(inputPath: string, outputPath: string, params: any, isPreview: boolean) {
  const { width, height, x = 0, y = 0 } = params;

  // Get input video dimensions
  const probeCommand = `ffprobe -v quiet -show_entries stream=width,height -select_streams v:0 -of csv=s=x:p=0 "${inputPath}"`;
  let inputWidth = 1920;
  let inputHeight = 1080;

  try {
    const { stdout } = await execAsync(probeCommand);
    const [w, h] = stdout.trim().split('x').map(Number);
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
    cropHeight = inputHeight;
    cropWidth = Math.round(inputHeight * targetAspectRatio);
    cropX = Math.round(((inputWidth - cropWidth) / 2) + (x / 100 * (inputWidth - cropWidth)));
    cropY = Math.round(y / 100 * (inputHeight - cropHeight));
  } else {
    cropWidth = inputWidth;
    cropHeight = Math.round(inputWidth / targetAspectRatio);
    cropX = Math.round(x / 100 * (inputWidth - cropWidth));
    cropY = Math.round(((inputHeight - cropHeight) / 2) + (y / 100 * (inputHeight - cropHeight)));
  }

  cropX = Math.max(0, Math.min(cropX, inputWidth - cropWidth));
  cropY = Math.max(0, Math.min(cropY, inputHeight - cropHeight));

  const scaleWidth = isPreview ? Math.min(width, 1280) : width;
  const scaleHeight = isPreview ? Math.min(height, 720) : height;

  const command = `ffmpeg -i "${inputPath}" -vf "crop=${cropWidth}:${cropHeight}:${cropX}:${cropY},scale=${scaleWidth}:${scaleHeight}" -c:a copy -y "${outputPath}"`;

  await execAsync(command, { maxBuffer: 1024 * 1024 * 100 });
}

async function processTrimStep(inputPath: string, outputPath: string, params: any, isPreview: boolean) {
  const { startTime = 0, endTime } = params;

  let command = `ffmpeg -i "${inputPath}"`;

  if (startTime > 0) {
    command += ` -ss ${startTime}`;
  }

  if (endTime) {
    const duration = endTime - startTime;
    command += ` -t ${duration}`;
  }

  command += ` -c copy -y "${outputPath}"`;

  await execAsync(command, { maxBuffer: 1024 * 1024 * 100 });
}

async function processWatermarkStep(inputPath: string, outputPath: string, params: any, isPreview: boolean) {
  const { regions = [] } = params;

  if (regions.length === 0) {
    fs.copyFileSync(inputPath, outputPath);
    return;
  }

  // For now, implement basic watermark removal with blur
  let filterString = '';
  regions.forEach((region: any, index: number) => {
    const x = Math.round(region.x);
    const y = Math.round(region.y);
    const w = Math.round(region.width);
    const h = Math.round(region.height);

    if (index === 0) {
      filterString = `boxblur=10:enable='between(t,0,999)'`;
    }
  });

  const command = `ffmpeg -i "${inputPath}" -vf "${filterString}" -c:a copy -y "${outputPath}"`;

  await execAsync(command, { maxBuffer: 1024 * 1024 * 100 });
}

async function processCompressStep(inputPath: string, outputPath: string, params: any, isPreview: boolean) {
  const { quality = 'medium', targetSize } = params;

  let crf = 23; // Default quality
  switch (quality) {
    case 'high': crf = 18; break;
    case 'medium': crf = 23; break;
    case 'low': crf = 28; break;
  }

  if (isPreview) {
    crf = Math.min(crf + 5, 30); // Lower quality for preview
  }

  const command = `ffmpeg -i "${inputPath}" -c:v libx264 -crf ${crf} -c:a aac -b:a 128k -y "${outputPath}"`;

  await execAsync(command, { maxBuffer: 1024 * 1024 * 100 });
}

async function processConvertStep(inputPath: string, outputPath: string, params: any, isPreview: boolean) {
  const { outputFormat = 'mp4', codec = 'h264' } = params;

  let videoCodec = 'libx264';
  switch (codec) {
    case 'h264': videoCodec = 'libx264'; break;
    case 'h265': videoCodec = 'libx265'; break;
    case 'vp9': videoCodec = 'libvpx-vp9'; break;
  }

  const command = `ffmpeg -i "${inputPath}" -c:v ${videoCodec} -c:a aac -y "${outputPath}"`;

  await execAsync(command, { maxBuffer: 1024 * 1024 * 100 });
}

async function handleCloudUpload(filePath: string, storageConfig: any, originalName: string) {
  // Implement cloud upload logic here (similar to download-video route)
  // This is a simplified version - you'd implement the actual upload logic
  return {
    success: true,
    message: `Video processed and uploaded to ${storageConfig.provider}`,
    url: `https://example.com/${originalName}`
  };
}

function cleanupFiles(filePaths: string[]) {
  filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to cleanup file ${filePath}:`, error);
      }
    }
  });
}