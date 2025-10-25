// Character Design Specialist Agent
// Specializes in character portraits, emotions, animations, expressions, and character sheets

import { aiImageService } from '../ai-image-apis'
import { AgentTask } from '../agent-coordination-system'
import * as fs from 'fs'
import * as path from 'path'

// Character Asset Configurations
const CHARACTER_CONFIGS = {
  portrait: {
    dimensions: { width: 1024, height: 1024 },
    style: 'Character portrait, professional concept art, detailed facial features, expressive',
    angles: ['front', 'three-quarter', 'profile', 'dramatic']
  },
  emotion: {
    dimensions: { width: 1024, height: 1024 },
    style: 'Character facial expression, clear emotion, professional animation reference',
    emotions: ['happy', 'sad', 'angry', 'surprised', 'neutral', 'focused', 'determined', 'worried']
  },
  fullBody: {
    dimensions: { width: 1024, height: 1792 },
    style: 'Full body character design, professional concept art, detailed costume and anatomy',
    poses: ['standing', 'action', 'sitting', 'dynamic']
  },
  characterSheet: {
    dimensions: { width: 1792, height: 1024 },
    style: 'Character reference sheet, turnaround views, professional game development art',
    views: ['front', 'side', 'back', 'expressions']
  },
  animation: {
    dimensions: { width: 1024, height: 256 },
    style: 'Animation frame sequence, character movement, professional game animation reference',
    types: ['walk', 'run', 'idle', 'attack', 'jump']
  }
}

const EMOTION_DESCRIPTORS = {
  happy: 'bright smile, cheerful eyes, raised eyebrows, positive expression',
  sad: 'downturned mouth, droopy eyes, melancholy expression, gentle frown',
  angry: 'furrowed brow, intense eyes, clenched jaw, stern expression',
  surprised: 'wide eyes, raised eyebrows, open mouth, startled expression',
  neutral: 'calm expression, relaxed features, professional demeanor',
  focused: 'concentrated gaze, slight frown of concentration, determined look',
  determined: 'strong jawline, confident gaze, resolved expression',
  worried: 'creased forehead, concerned eyes, anxious expression'
}

export class CharacterDesignAgent {
  private outputDir: string
  
  constructor(outputDir: string = './agent-output/characters') {
    this.outputDir = outputDir
    this.ensureOutputDirectory()
  }

  private ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }

    // Create subdirectories
    const subdirs = ['portraits', 'emotions', 'full-body', 'character-sheets', 'animations']
    subdirs.forEach(dir => {
      const fullPath = path.join(this.outputDir, dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
    })
  }

  async processTask(task: AgentTask, sharedResources: Map<string, any>): Promise<any> {
    console.log(`🎭 Character Agent processing: ${task.name}`)

    try {
      switch (task.category) {
        case 'portrait':
          return await this.createPortrait(task, sharedResources)
        case 'emotion':
        case 'emotions':
          return await this.createEmotionSet(task, sharedResources)
        case 'full-body':
          return await this.createFullBody(task, sharedResources)
        case 'character-sheet':
          return await this.createCharacterSheet(task, sharedResources)
        case 'animation':
          return await this.createAnimationReference(task, sharedResources)
        default:
          return await this.createGenericCharacterAsset(task, sharedResources)
      }
    } catch (error) {
      console.error(`❌ Character Agent failed on ${task.name}:`, error)
      throw error
    }
  }

  private async createPortrait(task: AgentTask, sharedResources: Map<string, any>) {
    const config = CHARACTER_CONFIGS.portrait
    const artStyle = sharedResources.get('character-art-style') || 'semi-realistic concept art'
    const lighting = sharedResources.get('portrait-lighting') || 'dramatic cinematic'
    
    const results = []
    
    for (const angle of config.angles) {
      const prompt = `${task.description}. ${config.style}. View: ${angle} angle. Art style: ${artStyle}. Lighting: ${lighting}. Professional character design.`
      
      const result = await aiImageService.generateWithDallE({
        prompt,
        width: config.dimensions.width,
        height: config.dimensions.height,
        quality: 'hd'
      })

      const metadata = {
        type: 'character-portrait',
        angle,
        dimensions: config.dimensions,
        url: result.urls[0],
        timestamp: Date.now(),
        artStyle,
        lighting
      }

      // Save metadata
      fs.writeFileSync(
        path.join(this.outputDir, 'portraits', `${task.name}_${angle}.json`),
        JSON.stringify(metadata, null, 2)
      )

      results.push(metadata)
    }

    return {
      type: 'character-portrait-set',
      angles: results,
      sharedResource: {
        key: `portrait-${task.name}`,
        data: results
      }
    }
  }

  private async createEmotionSet(task: AgentTask, sharedResources: Map<string, any>) {
    const config = CHARACTER_CONFIGS.emotion
    const characterStyle = sharedResources.get('character-style') || 'professional game character'
    const baseDescription = task.description.replace(/emotions?.*$/i, '').trim()
    
    const results = []
    
    for (const emotion of config.emotions) {
      const emotionDesc = EMOTION_DESCRIPTORS[emotion] || 'expressive face'
      const prompt = `${baseDescription}. ${config.style}. Emotion: ${emotion}. ${emotionDesc}. Style: ${characterStyle}. Clear facial expression for game UI.`
      
      const result = await aiImageService.generateWithDallE({
        prompt,
        width: config.dimensions.width,
        height: config.dimensions.height,
        quality: 'hd'
      })

      const metadata = {
        type: 'character-emotion',
        emotion,
        description: emotionDesc,
        dimensions: config.dimensions,
        url: result.urls[0],
        timestamp: Date.now(),
        characterStyle
      }

      // Save metadata
      fs.writeFileSync(
        path.join(this.outputDir, 'emotions', `${task.name}_${emotion}.json`),
        JSON.stringify(metadata, null, 2)
      )

      results.push(metadata)
    }

    return {
      type: 'character-emotion-set',
      emotions: results,
      sharedResource: {
        key: `emotions-${task.name}`,
        data: results
      }
    }
  }

  private async createFullBody(task: AgentTask, sharedResources: Map<string, any>) {
    const config = CHARACTER_CONFIGS.fullBody
    const artStyle = sharedResources.get('character-art-style') || 'detailed concept art'
    const costume = sharedResources.get('character-costume') || 'distinctive outfit'
    
    const results = []
    
    for (const pose of config.poses) {
      const prompt = `${task.description}. ${config.style}. Pose: ${pose} pose. Art style: ${artStyle}. Costume: ${costume}. Full body character design.`
      
      const result = await aiImageService.generateWithDallE({
        prompt,
        width: config.dimensions.width,
        height: config.dimensions.height,
        quality: 'hd'
      })

      const metadata = {
        type: 'character-full-body',
        pose,
        dimensions: config.dimensions,
        url: result.urls[0],
        timestamp: Date.now(),
        artStyle,
        costume
      }

      // Save metadata
      fs.writeFileSync(
        path.join(this.outputDir, 'full-body', `${task.name}_${pose}.json`),
        JSON.stringify(metadata, null, 2)
      )

      results.push(metadata)
    }

    return {
      type: 'character-full-body-set',
      poses: results,
      sharedResource: {
        key: `fullbody-${task.name}`,
        data: results
      }
    }
  }

  private async createCharacterSheet(task: AgentTask, sharedResources: Map<string, any>) {
    const config = CHARACTER_CONFIGS.characterSheet
    const artStyle = sharedResources.get('character-art-style') || 'professional game development'
    
    const prompt = `${task.description}. ${config.style}. Complete character reference sheet with multiple views and expressions. Art style: ${artStyle}. Professional game character design.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: config.dimensions.width,
      height: config.dimensions.height,
      quality: 'hd'
    })

    const metadata = {
      type: 'character-sheet',
      dimensions: config.dimensions,
      url: result.urls[0],
      timestamp: Date.now(),
      artStyle
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, 'character-sheets', `${task.name}_sheet.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: 'character-reference-sheet',
      result: metadata,
      sharedResource: {
        key: `sheet-${task.name}`,
        data: metadata
      }
    }
  }

  private async createAnimationReference(task: AgentTask, sharedResources: Map<string, any>) {
    const config = CHARACTER_CONFIGS.animation
    const animationStyle = sharedResources.get('animation-style') || 'smooth game animation'
    
    const results = []
    
    for (const animType of config.types) {
      const prompt = `${task.description}. ${config.style}. Animation: ${animType} cycle. Style: ${animationStyle}. Frame sequence reference for game animation.`
      
      const result = await aiImageService.generateWithDallE({
        prompt,
        width: config.dimensions.width,
        height: config.dimensions.height,
        quality: 'hd'
      })

      const metadata = {
        type: 'animation-reference',
        animationType: animType,
        dimensions: config.dimensions,
        url: result.urls[0],
        timestamp: Date.now(),
        animationStyle
      }

      // Save metadata
      fs.writeFileSync(
        path.join(this.outputDir, 'animations', `${task.name}_${animType}.json`),
        JSON.stringify(metadata, null, 2)
      )

      results.push(metadata)
    }

    return {
      type: 'animation-reference-set',
      animations: results,
      sharedResource: {
        key: `animation-${task.name}`,
        data: results
      }
    }
  }

  private async createGenericCharacterAsset(task: AgentTask, sharedResources: Map<string, any>) {
    const artStyle = sharedResources.get('character-art-style') || 'professional concept art'
    
    const prompt = `${task.description}. Professional character design, ${artStyle}, detailed and expressive, game development quality.`
    
    const result = await aiImageService.generateWithDallE({
      prompt,
      width: 1024,
      height: 1024,
      quality: 'hd'
    })

    const metadata = {
      type: 'character-generic',
      dimensions: { width: 1024, height: 1024 },
      url: result.urls[0],
      timestamp: Date.now(),
      artStyle
    }

    // Save metadata
    fs.writeFileSync(
      path.join(this.outputDir, `${task.name}.json`),
      JSON.stringify(metadata, null, 2)
    )

    return {
      type: 'character-asset',
      result: metadata,
      sharedResource: {
        key: `character-${task.name}`,
        data: metadata
      }
    }
  }

  // Create complete character package
  async createCharacterPackage(characterName: string, description: string, options: any = {}): Promise<any> {
    const pkg = {
      characterName,
      description,
      components: {},
      timestamp: Date.now(),
      options
    }

    const components = [
      { type: 'portrait', category: 'portrait' },
      { type: 'emotions', category: 'emotions' },
      { type: 'full-body', category: 'full-body' },
      { type: 'character-sheet', category: 'character-sheet' }
    ]

    if (options.includeAnimations) {
      components.push({ type: 'animations', category: 'animation' })
    }

    for (const component of components) {
      try {
        const task: AgentTask = {
          id: `pkg-${component.type}`,
          type: 'character',
          priority: 1,
          category: component.category,
          name: `${characterName}-${component.type}`,
          description: `${description} - ${component.type}`,
          status: 'in-progress'
        }

        const sharedRes = new Map([
          ['character-art-style', options.artStyle || 'semi-realistic'],
          ['character-style', options.characterStyle || 'professional'],
          ['portrait-lighting', options.lighting || 'dramatic'],
          ['character-costume', options.costume || 'distinctive outfit']
        ])

        const result = await this.processTask(task, sharedRes)
        pkg.components[component.type] = result
      } catch (error) {
        console.error(`Failed to create ${component.type} for character package:`, error)
      }
    }

    // Save complete package
    fs.writeFileSync(
      path.join(this.outputDir, `character-package-${characterName}.json`),
      JSON.stringify(pkg, null, 2)
    )

    return pkg
  }

  // Generate character variations
  async generateCharacterVariations(baseDescription: string, variations: string[]): Promise<any> {
    const variationSet = {
      baseDescription,
      variations: {},
      timestamp: Date.now()
    }

    for (const variation of variations) {
      try {
        const task: AgentTask = {
          id: `var-${variation}`,
          type: 'character',
          priority: 1,
          category: 'portrait',
          name: `${variation}-variation`,
          description: `${baseDescription} - ${variation} variation`,
          status: 'in-progress'
        }

        const result = await this.processTask(task, new Map([
          ['character-art-style', 'consistent style'],
          ['portrait-lighting', 'uniform lighting']
        ]))

        variationSet.variations[variation] = result
      } catch (error) {
        console.error(`Failed to create variation ${variation}:`, error)
      }
    }

    // Save variation set
    fs.writeFileSync(
      path.join(this.outputDir, 'character-variations.json'),
      JSON.stringify(variationSet, null, 2)
    )

    return variationSet
  }

  // Get character style recommendations
  getCharacterStyleRecommendations(gameGenre: string, targetAudience: string): any {
    const recommendations = {
      'sci-fi': {
        artStyle: 'sleek futuristic, cyberpunk elements',
        colors: 'blue, cyan, metallic tones',
        costume: 'high-tech suits, armor, gadgets',
        lighting: 'neon, holographic, dramatic shadows'
      },
      'fantasy': {
        artStyle: 'detailed medieval, magical elements',
        colors: 'rich earth tones, mystical colors',
        costume: 'robes, armor, medieval clothing',
        lighting: 'magical glow, torch light, mystical'
      },
      'modern': {
        artStyle: 'contemporary realistic, urban',
        colors: 'natural palette, urban colors',
        costume: 'casual, business, street wear',
        lighting: 'natural light, urban environment'
      }
    }

    const audienceAdjustments = {
      'children': { artStyle: 'cartoon-like, friendly', complexity: 'simple' },
      'teen': { artStyle: 'anime-inspired, stylized', complexity: 'medium' },
      'adult': { artStyle: 'realistic, detailed', complexity: 'high' }
    }

    const base = recommendations[gameGenre] || recommendations['modern']
    const audience = audienceAdjustments[targetAudience] || audienceAdjustments['adult']

    return { ...base, ...audience }
  }
}

// Export the processing function for the coordination system
export async function processTask(task: AgentTask, sharedResources: Map<string, any>) {
  const agent = new CharacterDesignAgent()
  return await agent.processTask(task, sharedResources)
}

export default CharacterDesignAgent