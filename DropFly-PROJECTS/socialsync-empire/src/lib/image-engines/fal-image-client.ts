/**
 * FAL.ai Image Generation Client
 *
 * Supported models:
 * - Flux Pro (highest quality)
 * - Flux Dev (fast, good quality)
 * - SDXL (cost-effective)
 * - Qwen-VL (visual language model)
 * - Product Photography (virtual product placement)
 */

const FAL_AI_KEY = process.env.FAL_AI_KEY;
const FAL_AI_BASE_URL = 'https://fal.run';

export type ImageModel =
  | 'flux-pro'
  | 'flux-dev'
  | 'flux-schnell'
  | 'sdxl'
  | 'qwen-vl';

export type AspectRatio =
  | '1:1'    // Square (1024x1024)
  | '16:9'   // Landscape (1920x1080)
  | '9:16'   // Portrait (1080x1920)
  | '4:5'    // Instagram Portrait (1024x1280)
  | '3:2'    // Photo (1536x1024)
  | '2:3';   // Vertical (1024x1536)

export interface ImageGenerationRequest {
  prompt: string;
  model?: ImageModel;
  aspectRatio?: AspectRatio;
  numImages?: number;
  negativePrompt?: string;
  seed?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  images: {
    url: string;
    width: number;
    height: number;
    contentType: string;
  }[];
  seed?: number;
  model: string;
  cost: number;
  error?: string;
}

export interface ProductInsertionRequest {
  productImage: string; // URL or base64
  backgroundPrompt: string; // "luxury bedroom", "modern kitchen", etc.
  productName?: string;
  style?: 'realistic' | 'artistic' | 'minimal';
  lighting?: 'natural' | 'studio' | 'dramatic';
}

export interface ProductInsertionResponse {
  success: boolean;
  image: {
    url: string;
    width: number;
    height: number;
  };
  cost: number;
  error?: string;
}

const FAL_IMAGE_MODELS: Record<ImageModel, string> = {
  'flux-pro': 'fal-ai/flux-pro',
  'flux-dev': 'fal-ai/flux/dev',
  'flux-schnell': 'fal-ai/flux/schnell',
  'sdxl': 'fal-ai/fast-sdxl',
  'qwen-vl': 'fal-ai/qwen-vl',
};

const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '4:5': { width: 1024, height: 1280 },
  '3:2': { width: 1536, height: 1024 },
  '2:3': { width: 1024, height: 1536 },
};

export class FalImageClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || FAL_AI_KEY || '';

    if (!this.apiKey) {
      console.warn('FAL_AI_KEY not set - image generation will use mock responses');
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const model = request.model || 'flux-dev';
    const modelId = FAL_IMAGE_MODELS[model];
    const aspectRatio = request.aspectRatio || '1:1';
    const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio];

    // If no API key, return mock response
    if (!this.apiKey) {
      return this.getMockImageResponse(request);
    }

    try {
      const response = await fetch(`${FAL_AI_BASE_URL}/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          image_size: {
            width: dimensions.width,
            height: dimensions.height,
          },
          num_images: request.numImages || 1,
          negative_prompt: request.negativePrompt,
          seed: request.seed,
          guidance_scale: request.guidanceScale || 7.5,
          num_inference_steps: request.numInferenceSteps || 50,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`FAL.ai API error: ${error}`);
      }

      const data = await response.json();

      return {
        success: true,
        images: data.images.map((img: any) => ({
          url: img.url,
          width: img.width || dimensions.width,
          height: img.height || dimensions.height,
          contentType: img.content_type || 'image/jpeg',
        })),
        seed: data.seed,
        model: model,
        cost: this.estimateImageCost(model, request.numImages || 1),
      };
    } catch (error) {
      const err = error as Error;
      console.error(`FAL.ai image generation error:`, err);

      return {
        success: false,
        images: [],
        model: model,
        cost: 0,
        error: err.message || 'Image generation failed',
      };
    }
  }

  async insertProduct(request: ProductInsertionRequest): Promise<ProductInsertionResponse> {
    // Use FAL's image composition/inpainting models
    const modelId = 'fal-ai/flux-pro'; // Best for product photography

    if (!this.apiKey) {
      return this.getMockProductInsertionResponse(request);
    }

    try {
      // Enhanced prompt for product photography
      const enhancedPrompt = this.buildProductPrompt(request);

      const response = await fetch(`${FAL_AI_BASE_URL}/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          image_size: {
            width: 1920,
            height: 1080,
          },
          num_images: 1,
          guidance_scale: 8.0,
          num_inference_steps: 60,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Product insertion error: ${error}`);
      }

      const data = await response.json();
      const image = data.images[0];

      return {
        success: true,
        image: {
          url: image.url,
          width: image.width || 1920,
          height: image.height || 1080,
        },
        cost: this.estimateImageCost('flux-pro', 1),
      };
    } catch (error) {
      const err = error as Error;
      console.error(`Product insertion error:`, err);

      return {
        success: false,
        image: { url: '', width: 0, height: 0 },
        cost: 0,
        error: err.message || 'Product insertion failed',
      };
    }
  }

  private buildProductPrompt(request: ProductInsertionRequest): string {
    const parts: string[] = [];

    // Product name/description
    if (request.productName) {
      parts.push(`product photography of ${request.productName}`);
    }

    // Background scene
    parts.push(`in a ${request.backgroundPrompt}`);

    // Style
    const styleMap = {
      'realistic': 'photorealistic, high-end commercial photography',
      'artistic': 'artistic composition, creative lighting',
      'minimal': 'clean minimal aesthetic, white background',
    };
    parts.push(styleMap[request.style || 'realistic']);

    // Lighting
    const lightingMap = {
      'natural': 'natural window lighting, soft shadows',
      'studio': 'professional studio lighting, perfectly lit',
      'dramatic': 'dramatic side lighting, cinematic mood',
    };
    parts.push(lightingMap[request.lighting || 'natural']);

    // Quality modifiers
    parts.push('8K, ultra detailed, professional product photography, sharp focus');

    return parts.join(', ');
  }

  private getMockImageResponse(request: ImageGenerationRequest): ImageGenerationResponse {
    const numImages = request.numImages || 1;
    const aspectRatio = request.aspectRatio || '1:1';
    const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio];

    return {
      success: true,
      images: Array.from({ length: numImages }, (_, i) => ({
        url: `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${Date.now() + i}`,
        width: dimensions.width,
        height: dimensions.height,
        contentType: 'image/jpeg',
      })),
      seed: Math.floor(Math.random() * 1000000),
      model: request.model || 'flux-dev',
      cost: this.estimateImageCost(request.model || 'flux-dev', numImages),
    };
  }

  private getMockProductInsertionResponse(request: ProductInsertionRequest): ProductInsertionResponse {
    return {
      success: true,
      image: {
        url: `https://picsum.photos/1920/1080?random=${Date.now()}`,
        width: 1920,
        height: 1080,
      },
      cost: 0.10,
    };
  }

  private estimateImageCost(model: ImageModel, numImages: number): number {
    // Cost per image for each model
    const costs: Record<ImageModel, number> = {
      'flux-pro': 0.055,      // Highest quality
      'flux-dev': 0.025,      // Good balance
      'flux-schnell': 0.003,  // Fastest/cheapest
      'sdxl': 0.00325,        // Very cheap
      'qwen-vl': 0.04,        // Visual language
    };

    return (costs[model] || 0.025) * numImages;
  }

  async checkAvailability(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${FAL_AI_BASE_URL}/health`, {
        headers: {
          'Authorization': `Key ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('FAL.ai health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const falImageClient = new FalImageClient();
