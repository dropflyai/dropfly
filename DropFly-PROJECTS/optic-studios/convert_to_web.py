#!/usr/bin/env python3
"""
Convert video to web-compatible format (H.264 codec in MP4 container)
This ensures maximum browser compatibility
"""

import sys
import subprocess
import os

def convert_to_web_compatible(input_path, output_path=None):
    """Convert video to web-compatible H.264 MP4"""

    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}")
        return False

    if output_path is None:
        # Create output filename with _web suffix
        base, ext = os.path.splitext(input_path)
        output_path = f"{base}_web.mp4"

    print(f"Converting {input_path} to web-compatible format...")
    print(f"Output: {output_path}")

    try:
        # Use ffmpeg to convert to H.264 with web-compatible settings
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',           # H.264 codec
            '-preset', 'medium',          # Balance between speed and compression
            '-crf', '23',                 # Quality (lower = better, 23 is default)
            '-c:a', 'aac',                # AAC audio codec
            '-b:a', '128k',               # Audio bitrate
            '-movflags', '+faststart',    # Enable fast start for web playback
            '-pix_fmt', 'yuv420p',        # Pixel format for compatibility
            '-y',                         # Overwrite output file
            output_path
        ]

        subprocess.run(cmd, check=True)
        print(f"✅ Conversion successful: {output_path}")

        # Show file sizes for comparison
        input_size = os.path.getsize(input_path) / (1024 * 1024)
        output_size = os.path.getsize(output_path) / (1024 * 1024)
        print(f"Input size: {input_size:.2f} MB")
        print(f"Output size: {output_size:.2f} MB")
        print(f"Compression ratio: {(1 - output_size/input_size) * 100:.1f}%")

        return True

    except subprocess.CalledProcessError as e:
        print(f"❌ Conversion failed: {e}")
        return False
    except FileNotFoundError:
        print("❌ Error: ffmpeg not found. Please install ffmpeg:")
        print("   macOS: brew install ffmpeg")
        print("   Linux: sudo apt-get install ffmpeg")
        print("   Windows: Download from https://ffmpeg.org/download.html")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python convert_to_web.py <input_video> [output_video]")
        print("Example: python convert_to_web.py video.mp4")
        print("         python convert_to_web.py video.avi output.mp4")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    success = convert_to_web_compatible(input_path, output_path)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()