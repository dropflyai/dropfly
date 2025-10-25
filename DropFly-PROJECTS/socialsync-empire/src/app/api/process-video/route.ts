import { NextRequest, NextResponse } from 'next/server';

interface WatermarkRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProcessingOptions {
  method: 'inpaint' | 'blur' | 'advanced';
  quality: 'medium' | 'high' | 'lossless';
  upscale: 'none' | '2x' | '4x' | 'auto';
  upscaleMethod: 'bicubic' | 'lanczos' | 'esrgan' | 'real-esrgan';
  outputFormat: 'mp4' | 'mov' | 'avi' | 'webm' | 'mkv';
  outputCodec: 'h264' | 'h265' | 'vp9' | 'av1';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const regionsStr = formData.get('regions') as string;
    const optionsStr = formData.get('options') as string;

    console.log('Received processing request');
    console.log('Video file:', videoFile?.name, videoFile?.size);
    console.log('Regions:', regionsStr);
    console.log('Options:', optionsStr);

    if (!videoFile || !regionsStr || !optionsStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const regions: WatermarkRegion[] = JSON.parse(regionsStr);
    const options: ProcessingOptions = JSON.parse(optionsStr);

    console.log('Parsed regions:', regions.length);
    console.log('Processing options:', options);

    // Try to process with Python, fallback to original video if fails
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { spawn } = require('child_process');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { writeFileSync, unlinkSync, existsSync } = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { join } = require('path');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { v4: uuidv4 } = require('uuid');

      // Generate unique filenames
      const sessionId = uuidv4();
      const tempDir = '/tmp';
      const inputPath = join(tempDir, `input_${sessionId}.mp4`);
      const outputExtension = options.outputFormat || 'mp4';
      const outputPath = join(tempDir, `output_${sessionId}.${outputExtension}`);
      const regionsPath = join(tempDir, `regions_${sessionId}.json`);

      // Save uploaded video
      const arrayBuffer = await videoFile.arrayBuffer();
      writeFileSync(inputPath, Buffer.from(arrayBuffer));

      // Save regions data
      writeFileSync(regionsPath, JSON.stringify(regions, null, 2));

      // Path to the Python script
      const pythonScriptPath = '/Users/rioallen/Documents/DropFly-OS-App-Builder/watermark-remover/web_processor.py';

      // Check if Python script exists
      if (!existsSync(pythonScriptPath)) {
        console.log('Python script not found, returning original video');
        throw new Error('Python script not found');
      }

      // Run Python processing script
      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const pythonProcess = spawn('python3', [
          pythonScriptPath,
          inputPath,
          outputPath,
          regionsPath,
          options.method,
          options.quality,
          options.upscale,
          options.upscaleMethod,
          options.outputFormat,
          options.outputCodec
        ]);

        let errorOutput = '';

        pythonProcess.stderr.on('data', (data: Buffer) => {
          errorOutput += data.toString();
        });

        pythonProcess.on('close', (code: number | null) => {
          if (code === 0 && existsSync(outputPath)) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: errorOutput || 'Processing failed' });
          }
        });

        // Timeout after 5 minutes
        setTimeout(() => {
          pythonProcess.kill();
          resolve({ success: false, error: 'Processing timeout' });
        }, 300000);
      });

      if (result.success) {
        // Read processed video
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const outputBuffer = require('fs').readFileSync(outputPath);

        // Clean up temp files
        if (existsSync(inputPath)) unlinkSync(inputPath);
        if (existsSync(outputPath)) unlinkSync(outputPath);
        if (existsSync(regionsPath)) unlinkSync(regionsPath);

        console.log('✅ Python processing successful');
        const mimeTypes = {
          'mp4': 'video/mp4',
          'mov': 'video/quicktime',
          'avi': 'video/x-msvideo',
          'webm': 'video/webm',
          'mkv': 'video/x-matroska'
        };
        const contentType = mimeTypes[options.outputFormat] || 'video/mp4';
        return new NextResponse(outputBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${videoFile.name.replace(/\.[^/.]+$/, '')}_clean.${outputExtension}"`
          }
        });
      } else {
        console.log('❌ Python processing failed:', result.error);
        throw new Error(result.error || 'Processing failed');
      }

    } catch (error) {
      console.log('⚠️ Falling back to original video due to error:', error);

      // Fallback: return original video
      const arrayBuffer = await videoFile.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${videoFile.name.replace(/\.[^/.]+$/, '')}_demo.mp4"`
        }
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}