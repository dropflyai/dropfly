// Comprehensive Asset Generation Pipeline for Agent Academy
// Generates ALL visual assets needed for the complete curriculum

import { config } from 'dotenv'
import { aiImageService } from '../src/lib/ai-image-apis'
import { designAgent } from '../src/lib/ai-design-agent'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config({ path: '.env.local' })

// Asset generation categories with priorities
const ASSET_CATEGORIES = {
  // Phase 1: Achievement & Rewards (50+ assets)
  achievements: {
    priority: 1,
    assets: [
      // Beginner Badges (Week 1-4)
      { name: 'first-code', description: 'First successful code execution badge with python snake' },
      { name: 'variable-master', description: 'Variables mastery badge with data containers' },
      { name: 'input-output-pro', description: 'I/O operations badge with data flow arrows' },
      { name: 'logic-champion', description: 'Conditional logic badge with circuit paths' },
      { name: 'week-1-complete', description: 'Week 1 completion badge with star' },
      
      // Intermediate Badges (Week 5-8)
      { name: 'loop-wizard', description: 'Loop mastery badge with infinity symbol' },
      { name: 'function-architect', description: 'Functions badge with modular blocks' },
      { name: 'array-commander', description: 'Arrays badge with data grid' },
      { name: 'debugging-expert', description: 'Debug badge with magnifying glass' },
      
      // Advanced Badges (Week 9-13)
      { name: 'oop-master', description: 'Object-oriented badge with class hierarchy' },
      { name: 'algorithm-ace', description: 'Algorithm badge with flowchart' },
      { name: 'ai-pioneer', description: 'AI fundamentals badge with neural network' },
      { name: 'ml-explorer', description: 'Machine learning badge with brain' },
      
      // Expert Badges (Week 14-18)
      { name: 'api-integrator', description: 'API badge with connection nodes' },
      { name: 'database-architect', description: 'Database badge with data vault' },
      { name: 'agent-creator', description: 'AI agent creation badge with robot' },
      { name: 'graduation-honor', description: 'Course completion badge with graduation cap' },
      
      // Special Achievement Badges
      { name: 'speed-coder', description: 'Fast completion badge with lightning bolt' },
      { name: 'perfect-score', description: '100% accuracy badge with checkmark' },
      { name: 'helper-hero', description: 'Helping others badge with hands' },
      { name: 'streak-warrior', description: 'Daily streak badge with flame' },
      { name: 'bug-hunter', description: 'Found and fixed bugs badge' },
      { name: 'creative-coder', description: 'Creative solution badge with lightbulb' }
    ]
  },

  // Phase 2: UI Elements (30+ assets)
  uiElements: {
    priority: 2,
    assets: [
      // Buttons
      { name: 'button-primary-normal', description: 'Blue glowing primary button with spy tech design' },
      { name: 'button-primary-hover', description: 'Blue primary button hover state with glow' },
      { name: 'button-primary-pressed', description: 'Blue primary button pressed state' },
      { name: 'button-secondary-normal', description: 'Purple secondary button with tech design' },
      { name: 'button-danger-normal', description: 'Red alert button for warnings' },
      { name: 'button-success-normal', description: 'Green success button for completion' },
      
      // Panels & Cards
      { name: 'panel-lesson-card', description: 'Lesson card background with holographic effect' },
      { name: 'panel-code-editor', description: 'Code editor panel with terminal aesthetic' },
      { name: 'panel-dialogue-box', description: 'Character dialogue panel with tech frame' },
      { name: 'panel-achievement', description: 'Achievement notification panel' },
      
      // Progress Indicators
      { name: 'progress-bar-empty', description: 'Empty progress bar with tech design' },
      { name: 'progress-bar-fill', description: 'Progress bar fill with energy effect' },
      { name: 'progress-circle', description: 'Circular progress indicator' },
      { name: 'loading-spinner', description: 'Spy tech loading animation sprite' }
    ]
  },

  // Phase 3: Concept Illustrations (25+ assets)
  concepts: {
    priority: 3,
    assets: [
      // Python Basics
      { name: 'concept-variables', description: 'Variables as storage containers in spy base' },
      { name: 'concept-data-types', description: 'Different data types as different containers' },
      { name: 'concept-loops', description: 'Loop concept as circular conveyor system' },
      { name: 'concept-functions', description: 'Functions as modular machine components' },
      { name: 'concept-conditionals', description: 'If-else as diverging paths in facility' },
      
      // Advanced Concepts
      { name: 'concept-arrays', description: 'Arrays as organized data grid storage' },
      { name: 'concept-objects', description: 'Objects as blueprint schematics' },
      { name: 'concept-classes', description: 'Classes as agent training templates' },
      { name: 'concept-inheritance', description: 'Inheritance as skill transfer diagram' },
      
      // AI Concepts
      { name: 'concept-neural-network', description: 'Neural network as connected nodes' },
      { name: 'concept-machine-learning', description: 'ML as pattern recognition system' },
      { name: 'concept-training-data', description: 'Training data flowing into AI' },
      { name: 'concept-ai-agent', description: 'Autonomous AI agent architecture' }
    ]
  },

  // Phase 4: Character Emotions (20 assets)
  characterEmotions: {
    priority: 4,
    assets: [
      // Commander Atlas Emotions
      { name: 'atlas-confident', description: 'Commander Atlas confident expression' },
      { name: 'atlas-thinking', description: 'Commander Atlas thoughtful expression' },
      { name: 'atlas-proud', description: 'Commander Atlas proud expression' },
      { name: 'atlas-serious', description: 'Commander Atlas serious mission briefing' },
      { name: 'atlas-encouraging', description: 'Commander Atlas encouraging smile' },
      
      // Dr. Maya Nexus Emotions  
      { name: 'maya-excited', description: 'Dr. Maya excited about discovery' },
      { name: 'maya-explaining', description: 'Dr. Maya explaining concept' },
      { name: 'maya-focused', description: 'Dr. Maya focused on research' },
      { name: 'maya-celebrating', description: 'Dr. Maya celebrating success' },
      
      // Tech Chief Binary Emotions
      { name: 'binary-alert', description: 'Tech Chief Binary security alert' },
      { name: 'binary-analyzing', description: 'Tech Chief Binary analyzing code' },
      { name: 'binary-satisfied', description: 'Tech Chief Binary satisfied nod' },
      
      // Coach Nova Emotions
      { name: 'nova-motivating', description: 'Coach Nova motivating expression' },
      { name: 'nova-teaching', description: 'Coach Nova teaching gesture' },
      { name: 'nova-celebrating', description: 'Coach Nova celebrating achievement' }
    ]
  },

  // Phase 5: Story Cutscenes (16 assets)
  cutscenes: {
    priority: 5,
    assets: [
      // Operation Beacon Cutscenes
      { name: 'cutscene-arrival', description: 'Agent arriving at Digital Fortress' },
      { name: 'cutscene-first-hack', description: 'First successful system breach' },
      { name: 'cutscene-beacon-victory', description: 'Operation Beacon completion' },
      
      // Data Strike Cutscenes
      { name: 'cutscene-data-discovery', description: 'Discovering encrypted data vault' },
      { name: 'cutscene-loop-canyon', description: 'Navigating Loop Canyon defenses' },
      
      // Neural Network Cutscenes
      { name: 'cutscene-ai-awakening', description: 'AI system coming online' },
      { name: 'cutscene-neural-breach', description: 'Breaking into neural core' },
      
      // Quantum Core Cutscenes
      { name: 'cutscene-final-approach', description: 'Approaching quantum core' },
      { name: 'cutscene-agent-creation', description: 'Creating the super AI agent' },
      { name: 'cutscene-victory', description: 'Mission complete celebration' }
    ]
  }
}

// Asset generation configuration (DALL-E 3 supported sizes only)
const GENERATION_CONFIG = {
  achievements: {
    width: 1024,
    height: 1024,
    style: 'Badge design, metallic, shiny, game achievement style, blue and gold colors',
    quality: 'hd'
  },
  uiElements: {
    width: 1024,
    height: 1024,
    style: 'UI element, futuristic spy tech, holographic, blue and purple glow',
    quality: 'hd'
  },
  concepts: {
    width: 1024,
    height: 1792,
    style: 'Educational illustration, clean diagram, spy facility theme, blue tech aesthetic',
    quality: 'hd'
  },
  characterEmotions: {
    width: 1024,
    height: 1024,
    style: 'Character portrait, spy agent, professional, blue and purple lighting',
    quality: 'hd'
  },
  cutscenes: {
    width: 1792,
    height: 1024,
    style: 'Cinematic scene, spy thriller, dramatic lighting, high-tech facility',
    quality: 'hd'
  }
}

// Main generation function
async function generateAllAssets() {
  console.log('🚀 Starting Comprehensive Asset Generation Pipeline\n')
  console.log('📊 Total Assets to Generate: ~140 professional game assets\n')
  
  const results: any = {}
  const startTime = Date.now()
  
  // Create output directory
  const outputDir = './generated-assets'
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Generate assets by priority
  const sortedCategories = Object.entries(ASSET_CATEGORIES)
    .sort(([, a], [, b]) => a.priority - b.priority)

  for (const [category, categoryData] of sortedCategories) {
    console.log(`\n🎨 Phase ${categoryData.priority}: Generating ${category.toUpperCase()} (${categoryData.assets.length} assets)`)
    console.log('━'.repeat(50))
    
    const categoryDir = path.join(outputDir, category)
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true })
    }
    
    results[category] = []
    const config = GENERATION_CONFIG[category as keyof typeof GENERATION_CONFIG]
    
    for (let i = 0; i < categoryData.assets.length; i++) {
      const asset = categoryData.assets[i]
      console.log(`  [${i + 1}/${categoryData.assets.length}] Generating: ${asset.name}...`)
      
      try {
        const prompt = `${asset.description}. ${config.style}. Agent Academy educational game asset.`
        
        const result = await aiImageService.generateWithDallE({
          prompt,
          width: config.width,
          height: config.height,
          quality: config.quality as 'standard' | 'hd',
          n: 1
        })
        
        const assetData = {
          name: asset.name,
          description: asset.description,
          url: result.urls[0],
          category,
          generatedAt: Date.now(),
          metadata: result.metadata
        }
        
        results[category].push(assetData)
        
        // Save metadata
        fs.writeFileSync(
          path.join(categoryDir, `${asset.name}.json`),
          JSON.stringify(assetData, null, 2)
        )
        
        console.log(`  ✅ ${asset.name} generated successfully`)
        
      } catch (error) {
        console.error(`  ❌ Failed to generate ${asset.name}:`, error.message)
        results[category].push({
          name: asset.name,
          error: error.message
        })
      }
      
      // Rate limiting - wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    console.log(`✅ Completed ${category}: ${results[category].filter((r: any) => !r.error).length}/${categoryData.assets.length} successful`)
  }
  
  // Generate summary report
  const endTime = Date.now()
  const totalTime = (endTime - startTime) / 1000 / 60 // minutes
  
  const summary = {
    generationDate: new Date().toISOString(),
    totalTime: `${totalTime.toFixed(1)} minutes`,
    totalAssets: Object.values(results).flat().length,
    successfulAssets: Object.values(results).flat().filter((r: any) => !r.error).length,
    categories: Object.keys(results).map(cat => ({
      name: cat,
      total: results[cat].length,
      successful: results[cat].filter((r: any) => !r.error).length
    })),
    results
  }
  
  // Save complete manifest
  fs.writeFileSync(
    path.join(outputDir, 'asset-manifest.json'),
    JSON.stringify(summary, null, 2)
  )
  
  console.log('\n' + '═'.repeat(60))
  console.log('🎉 ASSET GENERATION COMPLETE!')
  console.log('═'.repeat(60))
  console.log(`⏱️  Total Time: ${totalTime.toFixed(1)} minutes`)
  console.log(`📊 Assets Generated: ${summary.successfulAssets}/${summary.totalAssets}`)
  console.log(`💾 Output Directory: ${outputDir}`)
  console.log(`📄 Manifest: ${outputDir}/asset-manifest.json`)
  
  return summary
}

// Execute if run directly
if (require.main === module) {
  generateAllAssets()
    .then(() => console.log('\n✨ Agent Academy visual assets ready for deployment!'))
    .catch(console.error)
}

export { generateAllAssets, ASSET_CATEGORIES, GENERATION_CONFIG }