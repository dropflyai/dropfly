/**
 * Runway API Integration
 * Gen-4 Image and Video Generation
 * Cost: $0.08 per image generation
 * Capabilities: High-quality images, video generation, cinematic effects
 */

import fs from 'fs'
import path from 'path'

interface RunwayConfig {
  apiKey: string
  baseUrl: string
  outputDir: string
}

interface RunwayGenerationOptions {
  prompt: string
  type?: 'image' | 'video'
  width?: number
  height?: number
  style?: string
  quality?: 'standard' | 'hd'
  duration?: number // For video generation
}

interface RunwayResult {
  success: boolean
  filename?: string
  error?: string
  cost: number
  generationTime?: number
  type: 'image' | 'video'
}

export class RunwayGenerator {
  private config: RunwayConfig
  private totalCost: number = 0
  private generationCount: number = 0

  constructor() {
    this.config = {
      apiKey: process.env.RUNWAY_API_KEY || '',
      baseUrl: 'https://api.dev.runwayml.com/v1',
      outputDir: path.join(process.cwd(), 'public/ai-assets/runway')
    }

    // Ensure output directories exist
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true })
    }

    const imageDir = path.join(this.config.outputDir, 'images')
    const videoDir = path.join(this.config.outputDir, 'videos')
    
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true })
    }
    
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true })
    }
  }

  /**
   * Generate image using Runway Gen-4
   */
  async generateImage(options: RunwayGenerationOptions): Promise<RunwayResult> {
    const startTime = Date.now()
    
    if (!this.config.apiKey) {
      return {
        success: false,
        error: 'Runway API key not configured',
        cost: 0,
        type: 'image'
      }
    }

    try {
      console.log(`🎬 Runway Gen-4 generating image: ${options.prompt.substring(0, 50)}...`)

      const requestBody = {
        prompt: this.buildCinematicPrompt(options.prompt, options.style),
        width: options.width || 1024,
        height: options.height || 1024,
        quality: options.quality || 'standard'
      }

      const response = await fetch(`${this.config.baseUrl}/image_generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Runway API error ${response.status}: ${errorData}`)
      }

      const data = await response.json()
      
      // Handle Runway response format
      let imageUrl: string | null = null
      
      if (data.data && data.data[0]?.url) {
        imageUrl = data.data[0].url
      } else if (data.url) {
        imageUrl = data.url
      } else if (data.image_url) {
        imageUrl = data.image_url
      } else {
        throw new Error('No image URL found in Runway response')
      }

      // Download and save the image
      const filename = this.generateFilename(options.prompt, 'image')
      const filepath = path.join(this.config.outputDir, 'images', filename)
      
      await this.downloadAndSaveImage(imageUrl, filepath)

      const generationTime = Date.now() - startTime
      const cost = 0.08 // Runway Gen-4 Image cost
      
      this.totalCost += cost
      this.generationCount++

      console.log(`✅ Generated image: ${filename} (${generationTime}ms, $${cost.toFixed(3)})`)

      return {
        success: true,
        filename: `images/${filename}`,
        cost,
        generationTime,
        type: 'image'
      }

    } catch (error) {
      console.error(`❌ Runway image generation failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0,
        type: 'image'
      }
    }
  }

  /**
   * Generate video using Runway (if API supports it)
   */
  async generateVideo(options: RunwayGenerationOptions): Promise<RunwayResult> {
    const startTime = Date.now()
    
    if (!this.config.apiKey) {
      return {
        success: false,
        error: 'Runway API key not configured',
        cost: 0,
        type: 'video'
      }
    }

    try {
      console.log(`🎬 Runway generating video: ${options.prompt.substring(0, 50)}...`)

      const requestBody = {
        prompt: this.buildCinematicPrompt(options.prompt, options.style),
        width: options.width || 1024,
        height: options.height || 576,
        duration: options.duration || 4, // Default 4 seconds
        quality: options.quality || 'standard'
      }

      const response = await fetch(`${this.config.baseUrl}/video_generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Runway video API error ${response.status}: ${errorData}`)
      }

      const data = await response.json()
      
      // Handle video generation - may return job ID for polling
      if (data.job_id || data.id) {
        const jobId = data.job_id || data.id
        const videoResult = await this.pollVideoCompletion(jobId)
        
        if (videoResult.success && videoResult.url) {
          const filename = this.generateFilename(options.prompt, 'video')
          const filepath = path.join(this.config.outputDir, 'videos', filename)
          
          await this.downloadAndSaveVideo(videoResult.url, filepath)
          
          const generationTime = Date.now() - startTime
          const cost = 0.12 // Estimated video cost (higher than image)
          
          this.totalCost += cost
          this.generationCount++

          console.log(`✅ Generated video: ${filename} (${generationTime}ms, $${cost.toFixed(3)})`)

          return {
            success: true,
            filename: `videos/${filename}`,
            cost,
            generationTime,
            type: 'video'
          }
        } else {
          throw new Error('Video generation failed or timed out')
        }
      } else {
        throw new Error('No job ID returned from video generation request')
      }

    } catch (error) {
      console.error(`❌ Runway video generation failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0,
        type: 'video'
      }
    }
  }

  /**
   * Generate batch of cutscene assets
   */
  async generateCutsceneBatch(prompts: string[]): Promise<RunwayResult[]> {
    console.log(`🚀 Starting Runway cutscene batch: ${prompts.length} assets`)
    console.log(`💰 Estimated cost: $${(prompts.length * 0.08).toFixed(2)}`)

    const results: RunwayResult[] = []
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i]
      console.log(`\n[${i + 1}/${prompts.length}] Processing cutscene: ${prompt}`)
      
      // Generate high-quality cinematic image for cutscenes
      const result = await this.generateImage({
        prompt,
        style: 'cinematic, dramatic lighting, high production value',
        quality: 'hd',
        width: 1792,
        height: 1024 // Widescreen cinematic format
      })
      
      results.push(result)
      
      // Rate limiting for Runway API
      if (i < prompts.length - 1) {
        console.log(`⏳ Rate limiting: 5 second pause...`)
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    return results
  }

  /**
   * Build cinematic prompt with Agent Academy theming
   */
  private buildCinematicPrompt(basePrompt: string, additionalStyle?: string): string {
    const cinematicStyle = additionalStyle || 'Cinematic quality, dramatic lighting, tactical spy thriller aesthetic, professional film production'
    
    return `${basePrompt}. ${cinematicStyle}. Visual style: Dark military operations, tactical spy thriller, high contrast lighting, dramatic shadows, professional cinematography. Color palette: Deep blues, tactical greens, amber highlights. Atmosphere: Tense, high-stakes, covert operations. Quality: 4K cinematic, sharp focus, detailed textures.`
  }

  /**
   * Generate appropriate filename
   */
  private generateFilename(prompt: string, type: 'image' | 'video'): string {
    const timestamp = Date.now()
    const slug = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 40)
    
    const extension = type === 'video' ? 'mp4' : 'png'
    return `${slug}-${timestamp}.${extension}`
  }

  /**
   * Download and save image from URL
   */
  private async downloadAndSaveImage(url: string, filepath: string): Promise<void> {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to download image: ${response.status}`)
      
      const buffer = await response.arrayBuffer()
      fs.writeFileSync(filepath, Buffer.from(buffer))
    } catch (error) {
      throw new Error(`Failed to download and save image: ${error}`)
    }
  }

  /**
   * Download and save video from URL
   */
  private async downloadAndSaveVideo(url: string, filepath: string): Promise<void> {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to download video: ${response.status}`)
      
      const buffer = await response.arrayBuffer()
      fs.writeFileSync(filepath, Buffer.from(buffer))
    } catch (error) {
      throw new Error(`Failed to download and save video: ${error}`)
    }
  }

  /**
   * Poll for video generation completion
   */
  private async pollVideoCompletion(jobId: string, maxAttempts: number = 30): Promise<{success: boolean, url?: string}> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`🔄 Polling video job ${jobId} (attempt ${attempt + 1}/${maxAttempts})`)
        
        const response = await fetch(`${this.config.baseUrl}/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to poll job status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.status === 'completed' && data.output_url) {
          return { success: true, url: data.output_url }
        } else if (data.status === 'failed' || data.status === 'error') {
          return { success: false }
        }
        
        // Wait 10 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 10000))
        
      } catch (error) {
        console.error(`❌ Error polling job ${jobId}:`, error)
      }
    }
    
    return { success: false }
  }

  /**
   * Get generation statistics
   */
  getStats() {
    return {
      totalCost: this.totalCost,
      generationCount: this.generationCount,
      avgCostPerAsset: this.generationCount > 0 ? this.totalCost / this.generationCount : 0,
      outputDir: this.config.outputDir
    }
  }
}

// Utility functions for quick generation
export async function generateImageWithRunway(prompt: string, options: Partial<RunwayGenerationOptions> = {}): Promise<RunwayResult> {
  const generator = new RunwayGenerator()
  return await generator.generateImage({ prompt, ...options })
}

export async function generateVideoWithRunway(prompt: string, options: Partial<RunwayGenerationOptions> = {}): Promise<RunwayResult> {
  const generator = new RunwayGenerator()
  return await generator.generateVideo({ prompt, ...options })
}

export async function generateCutsceneAssets(prompts: string[]): Promise<RunwayResult[]> {
  const generator = new RunwayGenerator()
  return await generator.generateCutsceneBatch(prompts)
}

// Export cost information
export const RUNWAY_COSTS = {
  imageGeneration: 0.08,
  videoGeneration: 0.12, // Estimated
  hdUpscaling: 0.02,
  cinematicQuality: true
}