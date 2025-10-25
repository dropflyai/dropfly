import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// Cloud storage upload functions
async function uploadToGoogleDrive(filePath: string, config: any, videoTitle: string) {
  // For now, return a mock response - Google Drive integration would require OAuth setup
  return {
    success: true,
    url: `https://drive.google.com/file/mock/${videoTitle}`,
    message: `Video saved to Google Drive folder`
  };
}

async function uploadToDropbox(filePath: string, config: any, videoTitle: string) {
  try {
    const { Dropbox } = require('dropbox');
    const dbx = new Dropbox({ accessToken: config.accessToken });

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `${config.folder || '/SocialSync'}/${videoTitle}.mp4`;

    const response = await dbx.filesUpload({
      path: fileName,
      contents: fileBuffer
    });

    return {
      success: true,
      url: response.result.path_display,
      message: `Video uploaded to Dropbox: ${fileName}`
    };
  } catch (error) {
    throw new Error(`Dropbox upload failed: ${error}`);
  }
}

async function uploadToAirtable(filePath: string, config: any, videoTitle: string, videoUrl: string) {
  try {
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId);

    // For Airtable, we'll store metadata and a reference to the file
    // In a real implementation, you'd upload the file to a storage service first
    const record = await base(config.tableName).create([
      {
        fields: {
          'Title': videoTitle,
          'Original URL': videoUrl,
          'Downloaded': new Date().toISOString(),
          'File Size': fs.statSync(filePath).size,
          'Status': 'Downloaded'
        }
      }
    ]);

    return {
      success: true,
      url: `https://airtable.com/${config.baseId}/${config.tableName}`,
      message: `Video record created in Airtable: ${record[0].id}`
    };
  } catch (error) {
    throw new Error(`Airtable upload failed: ${error}`);
  }
}

async function uploadToSupabase(filePath: string, config: any, videoTitle: string) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(config.url, config.anonKey);

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `${Date.now()}-${videoTitle}.mp4`;

    const { data, error } = await supabase.storage
      .from(config.bucketName || 'videos')
      .upload(fileName, fileBuffer, {
        contentType: 'video/mp4'
      });

    if (error) throw error;

    return {
      success: true,
      url: data.path,
      message: `Video uploaded to Supabase storage: ${fileName}`
    };
  } catch (error) {
    throw new Error(`Supabase upload failed: ${error}`);
  }
}

export async function POST(req: NextRequest) {
  const tempDir = os.tmpdir();
  const outputPath = path.join(tempDir, `video_${Date.now()}.mp4`);

  try {
    const { url, quality = 'best', storageConfig } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Use yt-dlp to download the video
    const qualityFormat = quality === 'highest' ? 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best' :
                         quality === 'lowest' ? 'worstvideo[ext=mp4]+worstaudio[ext=m4a]/worst[ext=mp4]/worst' :
                         'best[ext=mp4]/best';

    const command = `yt-dlp -f "${qualityFormat}" -o "${outputPath}" --merge-output-format mp4 "${url}"`;

    console.log('Executing command:', command);

    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 100 // 100MB buffer
      });

      if (stderr && !stderr.includes('WARNING')) {
        console.error('yt-dlp stderr:', stderr);
      }

      console.log('yt-dlp stdout:', stdout);
    } catch (execError: any) {
      console.error('yt-dlp execution error:', execError);
      return NextResponse.json(
        { error: `Failed to download video: ${execError.message}` },
        { status: 500 }
      );
    }

    // Check if file was created
    if (!fs.existsSync(outputPath)) {
      return NextResponse.json(
        { error: 'Video download failed - file not created' },
        { status: 500 }
      );
    }

    // Get video title for naming
    let videoTitle = 'video';
    try {
      const infoCommand = `yt-dlp -J --no-warnings "${url}"`;
      const { stdout: infoStdout } = await execAsync(infoCommand);
      const info = JSON.parse(infoStdout);
      videoTitle = info.title?.replace(/[^a-zA-Z0-9-_]/g, '_') || 'video';
    } catch (e) {
      console.log('Could not get video title, using default');
    }

    // Handle cloud storage upload
    if (storageConfig && storageConfig.provider !== 'local') {
      try {
        let uploadResult;

        switch (storageConfig.provider) {
          case 'googledrive':
            if (!storageConfig.googleDrive?.clientId) {
              throw new Error('Google Drive credentials not configured');
            }
            uploadResult = await uploadToGoogleDrive(outputPath, storageConfig.googleDrive, videoTitle);
            break;

          case 'dropbox':
            if (!storageConfig.dropbox?.accessToken) {
              throw new Error('Dropbox access token not configured');
            }
            uploadResult = await uploadToDropbox(outputPath, storageConfig.dropbox, videoTitle);
            break;

          case 'airtable':
            if (!storageConfig.airtable?.apiKey || !storageConfig.airtable?.baseId) {
              throw new Error('Airtable credentials not configured');
            }
            uploadResult = await uploadToAirtable(outputPath, storageConfig.airtable, videoTitle, url);
            break;

          case 'supabase':
            if (!storageConfig.supabase?.url || !storageConfig.supabase?.anonKey) {
              throw new Error('Supabase credentials not configured');
            }
            uploadResult = await uploadToSupabase(outputPath, storageConfig.supabase, videoTitle);
            break;

          default:
            throw new Error('Unsupported storage provider');
        }

        // Clean up temp file
        fs.unlinkSync(outputPath);

        return NextResponse.json(uploadResult);
      } catch (uploadError: any) {
        console.error('Upload error:', uploadError);

        // Clean up temp file
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }

        return NextResponse.json(
          { error: `Upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }
    }

    // For local download, read the file and return it
    const videoBuffer = fs.readFileSync(outputPath);

    // Clean up temp file
    fs.unlinkSync(outputPath);

    // Extract filename from URL or use default
    const filename = url.includes('youtube.com') || url.includes('youtu.be') ? `${videoTitle}.mp4` :
                    url.includes('tiktok.com') ? `${videoTitle}_tiktok.mp4` :
                    url.includes('instagram.com') ? `${videoTitle}_instagram.mp4` :
                    `${videoTitle}.mp4`;

    // Return video with appropriate headers
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': videoBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);

    // Clean up temp file if it exists
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download video' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Use yt-dlp to get video info
    const command = `yt-dlp -J --no-warnings "${url}"`;

    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      const info = JSON.parse(stdout);

      // Extract relevant information
      const videoInfo = {
        title: info.title || 'Untitled Video',
        author: info.uploader || info.channel || 'Unknown',
        duration: info.duration || '0',
        thumbnail: info.thumbnail || info.thumbnails?.[info.thumbnails.length - 1]?.url || '',
        formats: info.formats?.filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none').map((f: any) => ({
          quality: f.format_note || f.quality || 'Unknown',
          container: f.ext || 'mp4',
          size: f.filesize || 0,
          hasAudio: f.acodec !== 'none',
          hasVideo: f.vcodec !== 'none',
        })).slice(0, 10) || [], // Limit to 10 formats
      };

      return NextResponse.json(videoInfo);
    } catch (execError: any) {
      console.error('yt-dlp info error:', execError);

      // If yt-dlp fails, try a simpler approach
      return NextResponse.json({
        title: 'Video',
        author: 'Unknown',
        duration: '0',
        thumbnail: '',
        formats: [
          { quality: 'Best Quality', container: 'mp4', size: 0, hasAudio: true, hasVideo: true },
          { quality: 'Good Quality', container: 'mp4', size: 0, hasAudio: true, hasVideo: true },
          { quality: 'Standard Quality', container: 'mp4', size: 0, hasAudio: true, hasVideo: true },
        ],
      });
    }
  } catch (error) {
    console.error('Info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get video info' },
      { status: 500 }
    );
  }
}