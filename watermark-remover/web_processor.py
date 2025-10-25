#!/usr/bin/env python3
"""
SocialSync Video Processor
Handles watermark removal and AI upscaling with Real-ESRGAN
"""

import sys
import os
import json
import cv2
import numpy as np
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def process_watermark_blur(frame, regions):
    """Apply blur to watermark regions"""
    result = frame.copy()
    height, width = frame.shape[:2]

    for region in regions:
        # Convert normalized coordinates to pixel coordinates
        x = int(region['x'] * width)
        y = int(region['y'] * height)
        w = int(region['width'] * width)
        h = int(region['height'] * height)

        # Ensure coordinates are within bounds
        x = max(0, min(x, width - 1))
        y = max(0, min(y, height - 1))
        w = min(w, width - x)
        h = min(h, height - y)

        if w > 0 and h > 0:
            # Extract region
            roi = result[y:y+h, x:x+w]

            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(roi, (51, 51), 0)

            # Replace region with blurred version
            result[y:y+h, x:x+w] = blurred

            logger.info(f"Blurred region: ({x},{y}) {w}x{h}")

    return result

def process_watermark_inpaint(frame, regions):
    """Use inpainting to remove watermarks"""
    result = frame.copy()
    height, width = frame.shape[:2]

    # Create mask for all regions
    mask = np.zeros((height, width), dtype=np.uint8)

    for region in regions:
        # Convert normalized coordinates to pixel coordinates
        x = int(region['x'] * width)
        y = int(region['y'] * height)
        w = int(region['width'] * width)
        h = int(region['height'] * height)

        # Ensure coordinates are within bounds
        x = max(0, min(x, width - 1))
        y = max(0, min(y, height - 1))
        w = min(w, width - x)
        h = min(h, height - y)

        if w > 0 and h > 0:
            # Add to mask
            mask[y:y+h, x:x+w] = 255
            logger.info(f"Inpainting region: ({x},{y}) {w}x{h}")

    # Apply inpainting
    result = cv2.inpaint(result, mask, 3, cv2.INPAINT_TELEA)

    return result

def upscale_with_realesrgan(frame, scale=2):
    """Upscale frame using Real-ESRGAN"""
    try:
        from realesrgan import RealESRGANer
        from basicsr.archs.rrdbnet_arch import RRDBNet

        logger.info(f"Initializing Real-ESRGAN {scale}x upscaler...")

        # Initialize model
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=scale)

        # Create upsampler
        upsampler = RealESRGANer(
            scale=scale,
            model_path='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
            model=model,
            tile=0,
            tile_pad=10,
            pre_pad=0,
            half=False
        )

        logger.info("Upscaling frame with Real-ESRGAN...")
        output, _ = upsampler.enhance(frame, outscale=scale)

        logger.info(f"Upscaled from {frame.shape} to {output.shape}")
        return output

    except Exception as e:
        logger.error(f"Real-ESRGAN upscaling failed: {e}")
        logger.info("Falling back to bicubic upscaling")
        return upscale_bicubic(frame, scale)

def upscale_bicubic(frame, scale):
    """Standard bicubic upscaling"""
    height, width = frame.shape[:2]
    new_height = int(height * scale)
    new_width = int(width * scale)

    logger.info(f"Bicubic upscaling from {width}x{height} to {new_width}x{new_height}")
    return cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_CUBIC)

def upscale_lanczos(frame, scale):
    """Lanczos upscaling (high quality)"""
    height, width = frame.shape[:2]
    new_height = int(height * scale)
    new_width = int(width * scale)

    logger.info(f"Lanczos upscaling from {width}x{height} to {new_width}x{new_height}")
    return cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)

def process_video(input_path, output_path, regions_path, method, quality, upscale, upscale_method, output_format, output_codec):
    """Main video processing function"""
    try:
        logger.info("="*60)
        logger.info("SOCIALSYNC VIDEO PROCESSOR")
        logger.info("="*60)
        logger.info(f"Input: {input_path}")
        logger.info(f"Output: {output_path}")
        logger.info(f"Method: {method}")
        logger.info(f"Quality: {quality}")
        logger.info(f"Upscale: {upscale}")
        logger.info(f"Upscale Method: {upscale_method}")
        logger.info(f"Output Format: {output_format}")
        logger.info(f"Output Codec: {output_codec}")

        # Load regions
        regions = []
        if os.path.exists(regions_path):
            with open(regions_path, 'r') as f:
                regions = json.load(f)
            logger.info(f"Loaded {len(regions)} watermark regions")

        # Open input video
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise Exception(f"Could not open video: {input_path}")

        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        logger.info(f"Video: {width}x{height} @ {fps}fps, {total_frames} frames")

        # Determine output dimensions based on upscale
        scale_factor = 1
        if upscale == '2x':
            scale_factor = 2
        elif upscale == '4x':
            scale_factor = 4
        elif upscale == 'auto':
            # Auto upscale to at least 1080p
            if height < 1080:
                scale_factor = max(2, int(1080 / height) + 1)

        output_width = width * scale_factor
        output_height = height * scale_factor

        logger.info(f"Output dimensions: {output_width}x{output_height} (scale: {scale_factor}x)")

        # Set up video writer
        fourcc_map = {
            'h264': cv2.VideoWriter_fourcc(*'avc1'),
            'h265': cv2.VideoWriter_fourcc(*'hev1'),
            'vp9': cv2.VideoWriter_fourcc(*'vp09'),
            'av1': cv2.VideoWriter_fourcc(*'av01'),
        }

        fourcc = fourcc_map.get(output_codec, cv2.VideoWriter_fourcc(*'avc1'))

        # Create temporary output path
        temp_output = output_path + '.temp.mp4'

        out = cv2.VideoWriter(
            temp_output,
            fourcc,
            fps,
            (output_width, output_height)
        )

        if not out.isOpened():
            raise Exception("Could not create output video writer")

        logger.info("Processing frames...")
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Apply watermark removal
            if len(regions) > 0:
                if method == 'blur':
                    frame = process_watermark_blur(frame, regions)
                elif method == 'inpaint':
                    frame = process_watermark_inpaint(frame, regions)
                elif method == 'advanced':
                    # First inpaint, then slight blur for smooth result
                    frame = process_watermark_inpaint(frame, regions)
                    frame = cv2.GaussianBlur(frame, (3, 3), 0)

            # Apply upscaling
            if scale_factor > 1:
                if upscale_method == 'real-esrgan' or upscale_method == 'esrgan':
                    frame = upscale_with_realesrgan(frame, scale_factor)
                elif upscale_method == 'lanczos':
                    frame = upscale_lanczos(frame, scale_factor)
                else:
                    frame = upscale_bicubic(frame, scale_factor)

            # Write frame
            out.write(frame)

            frame_count += 1
            if frame_count % 30 == 0:
                progress = (frame_count / total_frames) * 100
                logger.info(f"Progress: {frame_count}/{total_frames} frames ({progress:.1f}%)")

        # Release resources
        cap.release()
        out.release()

        logger.info(f"Processed {frame_count} frames")

        # Use FFmpeg to add audio and finalize
        logger.info("Adding audio track with FFmpeg...")

        ffmpeg_cmd = f'ffmpeg -y -i "{temp_output}" -i "{input_path}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0? "{output_path}"'
        os.system(ffmpeg_cmd)

        # Clean up temp file
        if os.path.exists(temp_output):
            os.remove(temp_output)

        # Verify output
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            logger.info(f"✅ Success! Output: {output_path} ({file_size / 1024 / 1024:.2f} MB)")
            return 0
        else:
            logger.error("❌ Output file was not created")
            return 1

    except Exception as e:
        logger.error(f"❌ Processing failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 10:
        logger.error("Usage: web_processor.py <input> <output> <regions> <method> <quality> <upscale> <upscale_method> <output_format> <output_codec>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    regions_path = sys.argv[3]
    method = sys.argv[4]
    quality = sys.argv[5]
    upscale = sys.argv[6]
    upscale_method = sys.argv[7]
    output_format = sys.argv[8]
    output_codec = sys.argv[9]

    exit_code = process_video(
        input_path,
        output_path,
        regions_path,
        method,
        quality,
        upscale,
        upscale_method,
        output_format,
        output_codec
    )

    sys.exit(exit_code)
