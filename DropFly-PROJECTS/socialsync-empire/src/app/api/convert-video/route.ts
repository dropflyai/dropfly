import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;
    const optionsStr = formData.get('options') as string;

    if (!video) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    const options = JSON.parse(optionsStr);

    // Create temporary file paths
    const tempDir = tmpdir();
    const inputFileName = `input_${uuidv4()}.${video.name.split('.').pop()}`;
    const outputFileName = `output_${uuidv4()}.${options.outputFormat}`;
    const inputPath = join(tempDir, inputFileName);
    const outputPath = join(tempDir, outputFileName);

    // Save input video to temp file
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(inputPath, buffer);

    // Build FFmpeg command
    const ffmpegArgs = [
      '-i', inputPath,
    ];

    // Add codec settings
    switch (options.codec) {
      case 'h264':
        ffmpegArgs.push('-c:v', 'libx264', '-preset', 'medium');
        break;
      case 'h265':
        ffmpegArgs.push('-c:v', 'libx265', '-preset', 'medium');
        break;
      case 'vp9':
        ffmpegArgs.push('-c:v', 'libvpx-vp9');
        break;
      case 'av1':
        ffmpegArgs.push('-c:v', 'libaom-av1', '-cpu-used', '8');
        break;
    }

    // Add quality settings
    switch (options.quality) {
      case 'low':
        ffmpegArgs.push('-crf', '32');
        break;
      case 'medium':
        ffmpegArgs.push('-crf', '23');
        break;
      case 'high':
        ffmpegArgs.push('-crf', '18');
        break;
      case 'lossless':
        ffmpegArgs.push('-crf', '0');
        break;
    }

    // Add resolution settings
    switch (options.resolution) {
      case '720p':
        ffmpegArgs.push('-vf', 'scale=-1:720');
        break;
      case '1080p':
        ffmpegArgs.push('-vf', 'scale=-1:1080');
        break;
      case '1440p':
        ffmpegArgs.push('-vf', 'scale=-1:1440');
        break;
      case '4k':
        ffmpegArgs.push('-vf', 'scale=-1:2160');
        break;
    }

    // Add framerate settings
    if (options.framerate !== 'original') {
      ffmpegArgs.push('-r', options.framerate);
    }

    // Audio codec
    ffmpegArgs.push('-c:a', 'aac', '-b:a', '128k');

    // Web optimization for MP4
    if (options.outputFormat === 'mp4') {
      ffmpegArgs.push('-movflags', '+faststart');
    }

    // Pixel format for compatibility
    ffmpegArgs.push('-pix_fmt', 'yuv420p');

    // Overwrite output
    ffmpegArgs.push('-y', outputPath);

    console.log('FFmpeg command:', 'ffmpeg', ffmpegArgs.join(' '));

    // Execute FFmpeg
    const result = await new Promise<Buffer>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log('FFmpeg:', data.toString());
      });

      ffmpeg.on('error', (error) => {
        console.error('FFmpeg spawn error:', error);
        reject(new Error(`FFmpeg failed to start: ${error.message}`));
      });

      ffmpeg.on('close', async (code) => {
        if (code === 0) {
          try {
            const { readFile } = await import('fs/promises');
            const outputBuffer = await readFile(outputPath);

            // Clean up temp files
            await unlink(inputPath).catch(() => {});
            await unlink(outputPath).catch(() => {});

            resolve(outputBuffer);
          } catch (error) {
            reject(new Error(`Failed to read output file: ${error}`));
          }
        } else {
          // Clean up temp files
          await unlink(inputPath).catch(() => {});
          await unlink(outputPath).catch(() => {});

          reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`));
        }
      });
    });

    // Return the converted video
    return new NextResponse(result, {
      headers: {
        'Content-Type': `video/${options.outputFormat}`,
        'Content-Disposition': `attachment; filename="converted.${options.outputFormat}"`
      }
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Conversion failed' },
      { status: 500 }
    );
  }
}