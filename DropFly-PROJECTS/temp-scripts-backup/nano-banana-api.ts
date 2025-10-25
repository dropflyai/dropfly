/**
 * Nano Banana API Integration
 * Google Gemini 2.5 Flash Image Generation
 * Cost: $0.039 per image (95% cheaper than DALL-E)
 * Speed: ~30 seconds per generation
 */

import fs from 'fs'
import path from 'path'

interface NanoBananaConfig {
  apiKey: string
  model: string
  endpoint: string
  outputDir: string
}

interface GenerationOptions {
  prompt: string
  style?: string
  quality?: 'standard' | 'hd'
  temperature?: number
  safetySettings?: any[]
}

interface GenerationResult {
  success: boolean
  filename?: string
  error?: string
  cost: number
  generationTime?: number
}

export class NanoBananaGenerator {
  private config: NanoBananaConfig
  private totalCost: number = 0
  private generationCount: number = 0

  constructor() {
    this.config = {
      apiKey: process.env.GOOGLE_AI_API_KEY || '',
      model: 'gemini-2.5-flash-image',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      outputDir: path.join(process.cwd(), 'public/ai-assets/nano-banana')
    }

    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true })
    }
  }

  /**
   * Generate a single image using Nano Banana
   */
  async generateImage(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now()
    
    if (!this.config.apiKey) {
      return {
        success: false,
        error: 'Google AI API key not configured',
        cost: 0
      }
    }

    try {
      console.log(`🍌 Nano Banana generating: ${options.prompt.substring(0, 50)}...`)

      const requestBody = {
        contents: [{
          parts: [{
            text: this.buildFullPrompt(options)
          }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          candidateCount: 1,
          maxOutputTokens: 1290, // Fixed cost per image
          topK: 40,
          topP: 0.95
        },
        safetySettings: options.safetySettings || [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH', 
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }

      const response = await fetch(`${this.config.endpoint}?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Nano Banana API error ${response.status}: ${errorData}`)
      }

      const data = await response.json()
      
      // Process the response - Nano Banana returns image data in candidates
      if (!data.candidates || !data.candidates[0]) {
        throw new Error('No image generated in response')
      }

      const candidate = data.candidates[0]
      
      // Check for generated image data (format may vary)
      let imageData: string | null = null
      
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            imageData = part.inlineData.data
            break
          }
          if (part.fileData?.fileUri) {
            // Handle file URI case - would need to download
            imageData = await this.downloadFromUri(part.fileData.fileUri)
            break
          }
        }
      }

      if (!imageData) {
        // Fallback: sometimes the image is directly in the response
        if (data.image?.data) {
          imageData = data.image.data
        } else {
          throw new Error('No image data found in response')
        }
      }

      // Save the image
      const filename = this.generateFilename(options.prompt)
      const filepath = path.join(this.config.outputDir, filename)
      
      // Decode and save base64 image
      const buffer = Buffer.from(imageData, 'base64')
      fs.writeFileSync(filepath, buffer)

      const generationTime = Date.now() - startTime
      const cost = 0.039 // Fixed cost per image for Nano Banana
      
      this.totalCost += cost
      this.generationCount++

      console.log(`✅ Generated: ${filename} (${generationTime}ms, $${cost.toFixed(3)})`)

      return {
        success: true,
        filename,
        cost,
        generationTime
      }

    } catch (error) {
      console.error(`❌ Nano Banana generation failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0
      }
    }
  }

  /**
   * Generate multiple images in batch
   */
  async generateBatch(prompts: string[], options: Partial<GenerationOptions> = {}): Promise<GenerationResult[]> {
    console.log(`🚀 Starting Nano Banana batch generation: ${prompts.length} images`)
    console.log(`💰 Estimated cost: $${(prompts.length * 0.039).toFixed(2)}`)

    const results: GenerationResult[] = []
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i]
      console.log(`\n[${i + 1}/${prompts.length}] Processing: ${prompt}`)
      
      const result = await this.generateImage({
        prompt,
        ...options
      })
      
      results.push(result)
      
      // Rate limiting - Nano Banana can handle faster generation than DALL-E
      if (i < prompts.length - 1) {
        console.log(`⏳ Rate limiting: 2 second pause...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return results
  }

  /**
   * Build full prompt with Agent Academy styling
   */
  private buildFullPrompt(options: GenerationOptions): string {
    const baseStyle = options.style || 'Professional game asset, tactical military interface design, dark theme with blue and amber accents, high detail, clean modern UI'
    
    return `Create a high-quality digital image: ${options.prompt}

Style requirements: ${baseStyle}

Technical specifications:
- Resolution: 1024x1024 pixels
- Format: PNG with transparency where appropriate
- Color scheme: Dark military/tactical theme with blue (#2563eb) and amber (#f59e0b) accents
- Design language: Clean, modern, professional game UI
- Lighting: Dramatic, high contrast
- Quality: Production-ready game asset

Additional context: This is for CodeFly Agent Academy, an educational coding game with a spy/agent theme. The asset should fit seamlessly into a tactical military interface while being appropriate for students.`
  }

  /**
   * Generate appropriate filename from prompt
   */
  private generateFilename(prompt: string): string {
    const timestamp = Date.now()
    const slug = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
    
    return `${slug}-${timestamp}.png`
  }

  /**
   * Download image from URI (if Nano Banana returns file URI)
   */
  private async downloadFromUri(uri: string): Promise<string> {
    try {
      const response = await fetch(uri)
      if (!response.ok) throw new Error(`Failed to download: ${response.status}`)
      
      const buffer = await response.arrayBuffer()
      return Buffer.from(buffer).toString('base64')
    } catch (error) {
      throw new Error(`Failed to download image from URI: ${error}`)
    }
  }

  /**
   * Get generation statistics
   */
  getStats() {
    return {
      totalCost: this.totalCost,
      generationCount: this.generationCount,
      avgCostPerImage: this.generationCount > 0 ? this.totalCost / this.generationCount : 0,
      outputDir: this.config.outputDir
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.totalCost = 0
    this.generationCount = 0
  }
}

// Utility function for quick generation
export async function generateWithNanoBanana(prompt: string, options: Partial<GenerationOptions> = {}): Promise<GenerationResult> {
  const generator = new NanoBananaGenerator()
  return await generator.generateImage({ prompt, ...options })
}

// Batch generation utility
export async function batchGenerateWithNanoBanana(prompts: string[], options: Partial<GenerationOptions> = {}): Promise<GenerationResult[]> {
  const generator = new NanoBananaGenerator()
  return await generator.generateBatch(prompts, options)
}

// Export cost information
export const NANO_BANANA_COSTS = {
  perImage: 0.039,
  perToken: 0.03 / 1000, // $30 per 1M tokens
  tokensPerImage: 1290,
  savingsVsDalle: 0.95 // 95% savings
}