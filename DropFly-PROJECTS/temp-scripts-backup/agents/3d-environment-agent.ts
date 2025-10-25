// 3D Environment Specialist Agent
// Specializes in 3D models, materials, environments, lighting, and PBR textures

import { aiImageService } from '../ai-image-apis'
import { AgentTask } from '../agent-coordination-system'
import * as fs from 'fs'
import * as path from 'path'

// 3D Asset Configurations
const ASSET_3D_CONFIGS = {
  model: {
    dimensions: { width: 1024, height: 1024 },
    style: '3D model concept art, detailed 3D render, professional game asset, high-poly detail',
    views: ['front', 'side', 'back', 'perspective']
  },
  environment: {
    dimensions: { width: 1792, height: 1024 },
    style: '3D environment concept, detailed architecture, atmospheric lighting, AAA game quality',
    types: ['interior', 'exterior', 'landscape', 'architectural']
  },
  material: {
    dimensions: { width: 1024, height: 1024 },
    style: 'PBR material texture, photorealistic surface, seamless tileable texture',
    maps: ['albedo', 'normal', 'roughness', 'metallic', 'ao', 'height']
  },
  lighting: {
    dimensions: { width: 1920, height: 1080 },
    style: 'Professional lighting setup, cinematic atmosphere, mood lighting',
    setups: ['key-light', 'fill-light', 'rim-light', 'ambient']
  },
  prop: {
    dimensions: { width: 512, height: 512 },
    style: '3D game prop, detailed object, clean topology, game-ready asset',
    categories: ['furniture', 'decoration', 'functional', 'interactive']
  }
}

export class ThreeDEnvironmentAgent {
  private outputDir: string
  
  constructor(outputDir: string = './agent-output/3d-assets') {
    this.outputDir = outputDir
    this.ensureOutputDirectory()
  }

  private ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }

    // Create subdirectories
    const subdirs = ['models', 'environments', 'materials', 'props', 'lighting']
    subdirs.forEach(dir => {
      const fullPath = path.join(this.outputDir, dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
    })
  }

  async processTask(task: AgentTask, sharedResources: Map<string, any>): Promise<any> {
    console.log(`🏗️ 3D Agent processing: ${task.name}`)

    try {
      switch (task.category) {
        case 'model':
          return await this.create3DModel(task, sharedResources)
        case 'environment':
          return await this.createEnvironment(task, sharedResources)
        case 'material':
          return await this.createPBRMaterial(task, sharedResources)
        case 'lighting':
          return await this.createLightingSetup(task, sharedResources)
        case 'prop':
          return await this.createProp(task, sharedResources)
        default:
          return await this.createGeneric3DAsset(task, sharedResources)
      }
    } catch (error) {
      console.error(`❌ 3D Agent failed on ${task.name}:`, error)
      throw error
    }
  }

  private async create3DModel(task: AgentTask, sharedResources: Map<string, any>) {
    const config = ASSET_3D_CONFIGS.model
    const style = sharedResources.get('art-style') || 'realistic'
    const gameGenre = sharedResources.get('game-genre') || 'sci-fi'
    
    const results = []
    
    for (const view of config.views) {
      const prompt = `${task.description}. ${config.style}. View: ${view} view. Art style: ${style}. Game genre: ${gameGenre}. Professional 3D game asset.`
      
      const result = await aiImageService.generateWithDallE({
        prompt,
        width: config.dimensions.width,
        height: config.dimensions.height,
        quality: 'hd'
      })

      const metadata = {
        type: '3d-model',
        view,
        dimensions: config.dimensions,
        url: result.urls[0],
        timestamp: Date.now(),
        style,
        genre: gameGenre
      }

      // Save metadata
      fs.writeFileSync(
        path.join(this.outputDir, 'models', `${task.name}_${view}.json`),
        JSON.stringify(metadata, null, 2)
      )

      results.push(metadata)
    }

    return {
      type: '3d-model-set',
      views: results,
      sharedResource: {
        key: `model-${task.name}`,
        data: results
      }
    }
  }

  private async createEnvironment(task: AgentTask, sharedResources: Map<string, any>) {
    const config = ASSET_3D_CONFIGS.environment
    const atmosphere = sharedResources.get('atmosphere') || 'dramatic cinematic'
    const timeOfDay = sharedResources.get('time-of-day') || 'golden hour'
    
    const prompt = `${task.description}. ${config.style}. Atmosphere: ${atmosphere}. Time: ${timeOfDay}. Professional AAA game environment.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: config.dimensions.width,
      height: config.dimensions.height,
      quality: 'hd'
    })

    const metadata = {
      type: '3d-environment',
      dimensions: config.dimensions,
      url: result.urls[0],
      timestamp: Date.now(),
      atmosphere,
      timeOfDay
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, 'environments', `${task.name}.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: '3d-environment',
      result: metadata,
      sharedResource: {
        key: `environment-${task.name}`,
        data: metadata
      }
    }
  }

  private async createPBRMaterial(task: AgentTask, sharedResources: Map<string, any>) {
    const config = ASSET_3D_CONFIGS.material
    const materialType = sharedResources.get('material-type') || 'metal and composite'
    
    const results = []
    
    for (const mapType of config.maps) {
      let prompt = `${task.description}. ${config.style}. Material: ${materialType}.`
      
      switch (mapType) {
        case 'albedo':
          prompt += ' Albedo/diffuse color map, base color information, no lighting.'
          break
        case 'normal':
          prompt += ' Normal map, blue and purple surface detail information, bump mapping data.'
          break
        case 'roughness':
          prompt += ' Roughness map, grayscale surface roughness, smooth black to rough white.'
          break
        case 'metallic':
          prompt += ' Metallic map, black non-metal to white metal areas.'
          break
        case 'ao':
          prompt += ' Ambient occlusion map, grayscale contact shadows, cavity information.'
          break
        case 'height':
          prompt += ' Height/displacement map, grayscale height information for surface detail.'
          break
      }

      const result = await aiImageService.generateWithDallE({
        prompt,
        width: config.dimensions.width,
        height: config.dimensions.height,
        quality: 'hd'
      })

      const metadata = {
        type: 'pbr-material',
        mapType,
        dimensions: config.dimensions,
        url: result.urls[0],
        timestamp: Date.now(),
        material: materialType
      }

      // Save metadata
      fs.writeFileSync(
        path.join(this.outputDir, 'materials', `${task.name}_${mapType}.json`),
        JSON.stringify(metadata, null, 2)
      )

      results.push(metadata)
    }

    return {
      type: 'pbr-material-set',
      maps: results,
      sharedResource: {
        key: `material-${task.name}`,
        data: results
      }
    }
  }

  private async createLightingSetup(task: AgentTask, sharedResources: Map<string, any>) {
    const config = ASSET_3D_CONFIGS.lighting
    const mood = sharedResources.get('lighting-mood') || 'cinematic dramatic'
    
    const prompt = `${task.description}. ${config.style}. Mood: ${mood}. Professional film lighting techniques.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: config.dimensions.width,
      height: config.dimensions.height,
      quality: 'hd'
    })

    const metadata = {
      type: '3d-lighting',
      dimensions: config.dimensions,
      url: result.urls[0],
      timestamp: Date.now(),
      mood
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, 'lighting', `${task.name}.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: '3d-lighting-setup',
      result: metadata,
      sharedResource: {
        key: `lighting-${task.name}`,
        data: metadata
      }
    }
  }

  private async createProp(task: AgentTask, sharedResources: Map<string, any>) {
    const config = ASSET_3D_CONFIGS.prop
    const style = sharedResources.get('prop-style') || 'realistic detailed'
    
    const prompt = `${task.description}. ${config.style}. Style: ${style}. Game-ready 3D prop asset.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: config.dimensions.width,
      height: config.dimensions.height,
      quality: 'hd'
    })

    const metadata = {
      type: '3d-prop',
      dimensions: config.dimensions,
      url: result.urls[0],
      timestamp: Date.now(),
      style
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, 'props', `${task.name}.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: '3d-prop',
      result: metadata,
      sharedResource: {
        key: `prop-${task.name}`,
        data: metadata
      }
    }
  }

  private async createGeneric3DAsset(task: AgentTask, sharedResources: Map<string, any>) {
    const style = sharedResources.get('art-style') || 'photorealistic'
    
    const prompt = `${task.description}. Professional 3D asset, ${style} render, AAA game quality, detailed modeling.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: 1024,
      height: 1024,
      quality: 'hd'
    })

    const metadata = {
      type: '3d-generic',
      dimensions: { width: 1024, height: 1024 },
      url: result.urls[0],
      timestamp: Date.now(),
      style
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, `${task.name}.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: '3d-asset',
      result: metadata,
      sharedResource: {
        key: `3d-${task.name}`,
        data: metadata
      }
    }
  }

  // Create complete environment kit
  async createEnvironmentKit(theme: string, complexity: 'simple' | 'complex' = 'complex'): Promise<any> {
    const kit = {
      theme,
      complexity,
      assets: {},
      timestamp: Date.now()
    }

    const assets = complexity === 'simple' 
      ? ['main-environment', 'key-prop', 'material-set']
      : ['main-environment', 'lighting-setup', 'hero-props', 'detail-props', 'material-library']

    for (const assetType of assets) {
      try {
        const task: AgentTask = {
          id: `kit-${assetType}`,
          type: '3d',
          priority: 1,
          category: assetType.includes('environment') ? 'environment' : 
                   assetType.includes('lighting') ? 'lighting' :
                   assetType.includes('material') ? 'material' : 'prop',
          name: assetType,
          description: `${theme} themed ${assetType}`,
          status: 'in-progress'
        }

        const result = await this.processTask(task, new Map([
          ['art-style', 'photorealistic'],
          ['game-genre', theme],
          ['atmosphere', 'immersive']
        ]))
        
        kit.assets[assetType] = result
      } catch (error) {
        console.error(`Failed to create ${assetType} for environment kit:`, error)
      }
    }

    // Save complete kit
    fs.writeFileSync(
      path.join(this.outputDir, `environment-kit-${theme}.json`),
      JSON.stringify(kit, null, 2)
    )

    return kit
  }

  // Generate LOD (Level of Detail) variations
  async generateLODSet(modelName: string, description: string, lodLevels: number = 4): Promise<any> {
    const lodSet = {
      model: modelName,
      levels: [],
      timestamp: Date.now()
    }

    for (let i = 0; i < lodLevels; i++) {
      const lodLevel = i
      const polyCount = ['high-poly', 'medium-poly', 'low-poly', 'very-low-poly'][i] || 'minimal-poly'
      
      const prompt = `${description}. 3D model LOD${lodLevel}, ${polyCount} count, optimized for distance ${i * 50}m+. Game engine ready.`
      
      const result = await aiImageService.generateWithDallE({
        prompt,
        width: 1024,
        height: 1024,
        quality: 'hd'
      })

      const metadata = {
        lodLevel,
        polyCount,
        distance: `${i * 50}m+`,
        url: result.urls[0],
        timestamp: Date.now()
      }

      lodSet.levels.push(metadata)

      // Save individual LOD
      fs.writeFileSync(
        path.join(this.outputDir, 'models', `${modelName}_lod${lodLevel}.json`),
        JSON.stringify(metadata, null, 2)
      )
    }

    // Save complete LOD set
    fs.writeFileSync(
      path.join(this.outputDir, 'models', `${modelName}_lodset.json`),
      JSON.stringify(lodSet, null, 2)
    )

    return lodSet
  }

  // Get 3D asset recommendations based on performance requirements
  get3DRecommendations(performanceTarget: 'mobile' | 'console' | 'pc-high'): any {
    const recommendations = {
      mobile: {
        polygonBudget: '< 5000 triangles',
        textureSizes: '512x512 max',
        materialComplexity: 'simple shaders',
        lodLevels: 3
      },
      console: {
        polygonBudget: '< 15000 triangles',
        textureSizes: '1024x1024 standard',
        materialComplexity: 'PBR with 4 maps',
        lodLevels: 4
      },
      'pc-high': {
        polygonBudget: '< 50000 triangles',
        textureSizes: '2048x2048 or higher',
        materialComplexity: 'full PBR with all maps',
        lodLevels: 5
      }
    }

    return recommendations[performanceTarget] || recommendations['console']
  }
}

// Export the processing function for the coordination system
export async function processTask(task: AgentTask, sharedResources: Map<string, any>) {
  const agent = new ThreeDEnvironmentAgent()
  return await agent.processTask(task, sharedResources)
}

export default ThreeDEnvironmentAgent