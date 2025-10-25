// UI/Graphics Specialist Agent
// Specializes in buttons, panels, icons, textures, and HUD elements

import { aiImageService } from '../ai-image-apis'
import { AgentTask } from '../agent-coordination-system'
import * as fs from 'fs'
import * as path from 'path'

// UI Element Configurations
const UI_CONFIGS = {
  button: {
    dimensions: { width: 1024, height: 1024 },
    style: 'Modern button design, futuristic UI, glossy finish, sci-fi game interface, blue and purple gradient',
    variants: ['normal', 'hover', 'pressed', 'disabled']
  },
  panel: {
    dimensions: { width: 1024, height: 1024 },
    style: 'Game UI panel, futuristic HUD, transparent glass effect, holographic border, sci-fi interface',
    variants: ['default', 'dialog', 'inventory', 'settings']
  },
  icon: {
    dimensions: { width: 1024, height: 1024 },
    style: 'Game icon, isometric view, detailed 3D style, professional game asset, clear silhouette',
    variants: ['default']
  },
  texture: {
    dimensions: { width: 1024, height: 1024 },
    style: 'Seamless texture, tileable pattern, high resolution, game-ready material',
    variants: ['diffuse', 'normal', 'roughness']
  },
  hud: {
    dimensions: { width: 1792, height: 1024 },
    style: 'Game HUD element, futuristic interface, transparent overlay, minimal design',
    variants: ['health', 'score', 'minimap', 'progress']
  }
}

export class UIGraphicsAgent {
  private outputDir: string
  
  constructor(outputDir: string = './agent-output/ui-elements') {
    this.outputDir = outputDir
    this.ensureOutputDirectory()
  }

  private ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  async processTask(task: AgentTask, sharedResources: Map<string, any>): Promise<any> {
    console.log(`🎨 UI Agent processing: ${task.name}`)

    try {
      switch (task.category) {
        case 'button':
          return await this.createButton(task, sharedResources)
        case 'panel':
          return await this.createPanel(task, sharedResources)
        case 'icon':
          return await this.createIcon(task, sharedResources)
        case 'texture':
          return await this.createTexture(task, sharedResources)
        case 'hud':
          return await this.createHUDElement(task, sharedResources)
        default:
          return await this.createGenericUIElement(task, sharedResources)
      }
    } catch (error) {
      console.error(`❌ UI Agent failed on ${task.name}:`, error)
      throw error
    }
  }

  private async createButton(task: AgentTask, sharedResources: Map<string, any>) {
    const config = UI_CONFIGS.button
    const colorScheme = sharedResources.get('ui-color-scheme') || 'blue and purple gradient'
    
    const results = []
    
    for (const variant of config.variants) {
      const prompt = `${task.description}. ${config.style}. Button state: ${variant}. Color scheme: ${colorScheme}. Professional game UI asset.`
      
      const result = await aiImageService.generateWithDallE({
        prompt,
        width: config.dimensions.width,
        height: config.dimensions.height,
        quality: 'hd'
      })

      const filename = `${task.name}_${variant}.png`
      const metadata = {
        type: 'button',
        variant,
        dimensions: config.dimensions,
        url: result.urls[0],
        timestamp: Date.now()
      }

      // Save metadata
      fs.writeFileSync(
        path.join(this.outputDir, `${task.name}_${variant}.json`),
        JSON.stringify(metadata, null, 2)
      )

      results.push(metadata)
    }

    return {
      type: 'ui-button-set',
      variants: results,
      sharedResource: {
        key: `button-${task.name}`,
        data: results
      }
    }
  }

  private async createPanel(task: AgentTask, sharedResources: Map<string, any>) {
    const config = UI_CONFIGS.panel
    const theme = sharedResources.get('ui-theme') || 'futuristic sci-fi'
    
    const prompt = `${task.description}. ${config.style}. Theme: ${theme}. Professional AAA game UI panel.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: config.dimensions.width,
      height: config.dimensions.height,
      quality: 'hd'
    })

    const metadata = {
      type: 'panel',
      dimensions: config.dimensions,
      url: result.urls[0],
      timestamp: Date.now(),
      theme
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, `${task.name}.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: 'ui-panel',
      result: metadata,
      sharedResource: {
        key: `panel-${task.name}`,
        data: metadata
      }
    }
  }

  private async createIcon(task: AgentTask, sharedResources: Map<string, any>) {
    const config = UI_CONFIGS.icon
    const iconStyle = sharedResources.get('icon-style') || 'modern 3D isometric'
    
    const prompt = `${task.description}. ${config.style}. Style: ${iconStyle}. Game icon for UI interface.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: config.dimensions.width,
      height: config.dimensions.height,
      quality: 'hd'
    })

    const metadata = {
      type: 'icon',
      dimensions: config.dimensions,
      url: result.urls[0],
      timestamp: Date.now(),
      style: iconStyle
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, `${task.name}_icon.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: 'ui-icon',
      result: metadata,
      sharedResource: {
        key: `icon-${task.name}`,
        data: metadata
      }
    }
  }

  private async createTexture(task: AgentTask, sharedResources: Map<string, any>) {
    const config = UI_CONFIGS.texture
    const materialType = sharedResources.get('material-type') || 'metal and glass'
    
    const results = []
    
    for (const mapType of config.variants) {
      let prompt = `${task.description}. ${config.style}. Material: ${materialType}.`
      
      switch (mapType) {
        case 'normal':
          prompt += ' Normal map texture, purple and blue height information, bump mapping.'
          break
        case 'roughness':
          prompt += ' Roughness map texture, grayscale, surface roughness information.'
          break
        default:
          prompt += ' Diffuse color map texture.'
      }

      const result = await aiImageService.generateWithDallE({
        prompt,
        width: config.dimensions.width,
        height: config.dimensions.height,
        quality: 'hd'
      })

      const metadata = {
        type: 'texture',
        mapType,
        dimensions: config.dimensions,
        url: result.urls[0],
        timestamp: Date.now(),
        material: materialType
      }

      // Save metadata
      fs.writeFileSync(
        path.join(this.outputDir, `${task.name}_${mapType}.json`),
        JSON.stringify(metadata, null, 2)
      )

      results.push(metadata)
    }

    return {
      type: 'ui-texture-set',
      maps: results,
      sharedResource: {
        key: `texture-${task.name}`,
        data: results
      }
    }
  }

  private async createHUDElement(task: AgentTask, sharedResources: Map<string, any>) {
    const config = UI_CONFIGS.hud
    const hudStyle = sharedResources.get('hud-style') || 'minimal futuristic overlay'
    
    const prompt = `${task.description}. ${config.style}. Style: ${hudStyle}. Professional AAA game HUD element.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: config.dimensions.width,
      height: config.dimensions.height,
      quality: 'hd'
    })

    const metadata = {
      type: 'hud',
      dimensions: config.dimensions,
      url: result.urls[0],
      timestamp: Date.now(),
      style: hudStyle
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, `${task.name}_hud.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: 'ui-hud-element',
      result: metadata,
      sharedResource: {
        key: `hud-${task.name}`,
        data: metadata
      }
    }
  }

  private async createGenericUIElement(task: AgentTask, sharedResources: Map<string, any>) {
    const theme = sharedResources.get('ui-theme') || 'futuristic sci-fi game interface'
    
    const prompt = `${task.description}. Modern UI element, ${theme}, professional game asset, high quality design.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: 1024,
      height: 1024,
      quality: 'hd'
    })

    const metadata = {
      type: 'ui-generic',
      dimensions: { width: 1024, height: 1024 },
      url: result.urls[0],
      timestamp: Date.now(),
      theme
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, `${task.name}.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: 'ui-element',
      result: metadata,
      sharedResource: {
        key: `ui-${task.name}`,
        data: metadata
      }
    }
  }

  // Batch create UI kit
  async createUIKit(elements: string[], theme: string = 'futuristic'): Promise<any> {
    const kit = {
      theme,
      elements: {},
      timestamp: Date.now()
    }

    for (const element of elements) {
      try {
        const task: AgentTask = {
          id: `kit-${element}`,
          type: 'ui',
          priority: 1,
          category: element,
          name: element,
          description: `UI kit ${element} component`,
          status: 'in-progress'
        }

        const result = await this.processTask(task, new Map([['ui-theme', theme]]))
        kit.elements[element] = result
      } catch (error) {
        console.error(`Failed to create ${element} for UI kit:`, error)
      }
    }

    // Save complete kit
    fs.writeFileSync(
      path.join(this.outputDir, `ui-kit-${theme}.json`),
      JSON.stringify(kit, null, 2)
    )

    return kit
  }

  // Get UI style recommendations based on game genre
  getStyleRecommendations(genre: string): any {
    const recommendations = {
      'sci-fi': {
        colors: 'blue, cyan, purple, electric colors',
        style: 'holographic, glowing edges, transparent panels, futuristic',
        materials: 'metal, glass, energy effects'
      },
      'fantasy': {
        colors: 'gold, brown, green, mystical colors',
        style: 'ornate, magical, ancient textures, runes',
        materials: 'stone, wood, magical energy'
      },
      'modern': {
        colors: 'clean whites, grays, accent colors',
        style: 'minimal, flat design, clean lines',
        materials: 'matte, subtle gradients'
      }
    }

    return recommendations[genre] || recommendations['modern']
  }
}

// Export the processing function for the coordination system
export async function processTask(task: AgentTask, sharedResources: Map<string, any>) {
  const agent = new UIGraphicsAgent()
  return await agent.processTask(task, sharedResources)
}

export default UIGraphicsAgent