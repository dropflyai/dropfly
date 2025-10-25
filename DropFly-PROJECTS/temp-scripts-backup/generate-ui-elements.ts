#!/usr/bin/env tsx
/**
 * UI Element Kit Generator
 * Using Nano Banana (Google Gemini) for 95% cost savings
 * Generates complete tactical UI kit for Agent Academy
 */

import { NanoBananaGenerator } from '../src/lib/nano-banana-api'

const UI_ELEMENTS = [
  // Essential UI Components (Cost: $0.039 each = $0.59 total)
  {
    name: 'mission-briefing-panel',
    prompt: 'Mission briefing panel interface - tactical HUD design with corner brackets, dark military background, amber text areas, classified document styling, agent intel theme',
    category: 'panels'
  },
  {
    name: 'code-editor-window',
    prompt: 'Code editor terminal window - cyberpunk coding interface, black background with amber/green text, tactical border, monospace font styling, agent workstation',
    category: 'editors'
  },
  {
    name: 'progress-bar-digital',
    prompt: 'Progress bar with digital energy loading effect - blue to green gradient, tactical military design, percentage display, glowing progress indicator',
    category: 'indicators'
  },
  {
    name: 'achievement-notification',
    prompt: 'Achievement notification popup - gold military badge design, tactical corners, mission accomplished styling, sliding notification panel',
    category: 'notifications'
  },
  {
    name: 'agent-status-indicator',
    prompt: 'Agent status indicator with health and energy bars - tactical HUD element, red/blue bar indicators, agent vitals display, military styling',
    category: 'indicators'
  },
  {
    name: 'mission-map-waypoint',
    prompt: 'Mission map waypoint marker - GPS tactical marker with agent intel theme, location pin with classification level, navigation element',
    category: 'map'
  },
  {
    name: 'inventory-equipment-slot',
    prompt: 'Equipment inventory slot - metallic tactical grid design, item slot with border, agent gear container, military equipment styling',
    category: 'inventory'
  },
  {
    name: 'classified-dialog-box',
    prompt: 'Classified intel briefing dialog box - tactical interface with corner brackets, classified stamp, secure communication window, agent briefing panel',
    category: 'dialogs'
  },
  {
    name: 'tactical-menu-button',
    prompt: 'Tactical interface menu button - pressable 3D military button design, agent command interface, tactical styling with hover state',
    category: 'buttons'
  },
  {
    name: 'digital-score-counter',
    prompt: 'Digital score counter display - tactical military font readout, glowing numbers, agent points counter, electronic scoreboard styling',
    category: 'counters'
  },
  {
    name: 'countdown-timer-display',
    prompt: 'Mission countdown timer - amber warning colors, digital clock display, tactical timing interface, urgent mission timer styling',
    category: 'timers'
  },
  {
    name: 'shield-health-indicator',
    prompt: 'Agent shield and health indicator - tactical vitals display with red/blue bars, agent status monitor, military health readout',
    category: 'indicators'
  },
  {
    name: 'xp-energy-orb',
    prompt: 'XP collection energy orb - glowing particle effect crystal, agent experience point, tactical energy sphere with sparkles',
    category: 'collectibles'
  },
  {
    name: 'mission-complete-stamp',
    prompt: 'Mission accomplished completion stamp - military badge style, tactical approval seal, agent achievement marker, success indicator',
    category: 'stamps'
  },
  {
    name: 'system-error-alert',
    prompt: 'System malfunction error alert - red warning display, tactical emergency interface, agent system failure notification, critical alert styling',
    category: 'alerts'
  }
]

async function generateUIElementKit() {
  console.log(`🎯 UI ELEMENT KIT GENERATION`)
  console.log(`===========================`)
  console.log(`📊 Elements to generate: ${UI_ELEMENTS.length}`)
  console.log(`💰 Total cost: $${(UI_ELEMENTS.length * 0.039).toFixed(2)}`)
  console.log(`🔥 95% savings vs DALL-E: $${((UI_ELEMENTS.length * 0.04) - (UI_ELEMENTS.length * 0.039)).toFixed(3)}`)
  
  const generator = new NanoBananaGenerator()
  const results: any[] = []
  
  for (let i = 0; i < UI_ELEMENTS.length; i++) {
    const element = UI_ELEMENTS[i]
    console.log(`\n[${i + 1}/${UI_ELEMENTS.length}] 🍌 Generating: ${element.name}`)
    console.log(`Category: ${element.category}`)
    console.log(`Prompt: ${element.prompt.substring(0, 80)}...`)
    
    const result = await generator.generateImage({
      prompt: element.prompt,
      style: 'Professional game UI asset, tactical military interface, dark theme with blue (#2563eb) and amber (#f59e0b) accents, transparent background where appropriate, clean modern design'
    })
    
    results.push({
      element: element.name,
      category: element.category,
      success: result.success,
      filename: result.filename,
      error: result.error,
      cost: result.cost
    })
    
    if (result.success) {
      console.log(`✅ Generated: ${result.filename}`)
    } else {
      console.log(`❌ Failed: ${result.error}`)
    }
    
    // Rate limiting - Nano Banana is faster than DALL-E
    if (i < UI_ELEMENTS.length - 1) {
      console.log(`⏳ Rate limiting: 2 second pause...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Generate summary
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => r.success === false)
  const totalCost = successful.reduce((sum, r) => sum + r.cost, 0)
  
  console.log(`\n📊 UI ELEMENT GENERATION COMPLETE`)
  console.log(`=================================`)
  console.log(`✅ Successful: ${successful.length}/${UI_ELEMENTS.length}`)
  console.log(`❌ Failed: ${failed.length}`)
  console.log(`💰 Actual cost: $${totalCost.toFixed(3)}`)
  console.log(`⚡ Success rate: ${(successful.length / UI_ELEMENTS.length * 100).toFixed(1)}%`)
  
  if (successful.length > 0) {
    console.log(`\n✨ Successfully Generated Assets:`)
    successful.forEach((result, index) => {
      console.log(`${index + 1}. ${result.element} (${result.category}) - ${result.filename}`)
    })
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed Assets:`)
    failed.forEach((result, index) => {
      console.log(`${index + 1}. ${result.element}: ${result.error}`)
    })
  }
  
  const stats = generator.getStats()
  console.log(`\n📈 Generator Statistics:`)
  console.log(`Total cost: $${stats.totalCost.toFixed(3)}`)
  console.log(`Generation count: ${stats.generationCount}`)
  console.log(`Average cost per image: $${stats.avgCostPerImage.toFixed(3)}`)
  console.log(`Output directory: ${stats.outputDir}`)
  
  return {
    total: UI_ELEMENTS.length,
    successful: successful.length,
    failed: failed.length,
    totalCost,
    results
  }
}

// Execute if run directly
if (require.main === module) {
  generateUIElementKit()
    .then(summary => {
      if (summary.successful === summary.total) {
        console.log(`\n🎉 All UI elements generated successfully!`)
        console.log(`💡 Next step: Integrate these assets into the CodeFly curriculum`)
      } else if (summary.successful > 0) {
        console.log(`\n⚠️  Partial success: ${summary.successful}/${summary.total} assets generated`)
        console.log(`💡 Consider retrying failed assets or using fallback generation`)
      } else {
        console.log(`\n💥 Generation failed completely`)
        console.log(`🔧 Check API keys and connection settings`)
      }
      
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 Fatal error during UI generation:', error)
      process.exit(1)
    })
}

export { generateUIElementKit, UI_ELEMENTS }