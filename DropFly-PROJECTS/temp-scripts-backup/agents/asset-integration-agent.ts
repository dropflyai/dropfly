// Asset Integration Specialist Agent
// Manages the pipeline, optimization, validation, packaging, and deployment

import { AgentTask } from '../agent-coordination-system'
import * as fs from 'fs'
import * as path from 'path'

interface AssetOptimization {
  originalSize?: number
  optimizedSize?: number
  compression?: string
  format?: string
  quality?: number
}

interface AssetValidation {
  isValid: boolean
  issues: string[]
  recommendations: string[]
  performanceScore: number
}

interface AssetPackage {
  name: string
  version: string
  assets: any[]
  manifest: any
  metadata: any
  timestamp: number
}

export class AssetIntegrationAgent {
  private outputDir: string
  private optimizationSettings: any
  
  constructor(outputDir: string = './agent-output/integration') {
    this.outputDir = outputDir
    this.optimizationSettings = this.getDefaultOptimizationSettings()
    this.ensureOutputDirectory()
  }

  private ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }

    // Create subdirectories
    const subdirs = ['optimized', 'validated', 'packages', 'manifests', 'reports']
    subdirs.forEach(dir => {
      const fullPath = path.join(this.outputDir, dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
    })
  }

  private getDefaultOptimizationSettings() {
    return {
      images: {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.85,
        formats: ['webp', 'png', 'jpg'],
        compression: 'auto'
      },
      ui: {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.9,
        formats: ['webp', 'png']
      },
      textures: {
        powerOfTwo: true,
        mipmaps: true,
        compression: 'dxt',
        quality: 0.8
      },
      characters: {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.9,
        formats: ['webp', 'png']
      }
    }
  }

  async processTask(task: AgentTask, sharedResources: Map<string, any>): Promise<any> {
    console.log(`⚙️ Integration Agent processing: ${task.name}`)

    try {
      switch (task.category) {
        case 'optimize':
          return await this.optimizeAssets(task, sharedResources)
        case 'validate':
          return await this.validateAssets(task, sharedResources)
        case 'package':
          return await this.packageAssets(task, sharedResources)
        case 'deploy':
          return await this.deployAssets(task, sharedResources)
        case 'pipeline':
          return await this.runFullPipeline(task, sharedResources)
        default:
          return await this.integrateGenericAsset(task, sharedResources)
      }
    } catch (error) {
      console.error(`❌ Integration Agent failed on ${task.name}:`, error)
      throw error
    }
  }

  private async optimizeAssets(task: AgentTask, sharedResources: Map<string, any>) {
    const assetData = sharedResources.get(task.name) || { urls: [] }
    const assetType = this.detectAssetType(task.description)
    const settings = this.optimizationSettings[assetType] || this.optimizationSettings.images
    
    const optimizedAssets = []
    
    for (let i = 0; i < assetData.urls?.length || 0; i++) {
      const url = assetData.urls[i]
      
      // Simulate optimization process
      const optimization = await this.performOptimization(url, settings, assetType)
      
      const optimizedAsset = {
        originalUrl: url,
        optimizedUrl: `${url}_optimized`,
        type: assetType,
        optimization,
        timestamp: Date.now()
      }

      optimizedAssets.push(optimizedAsset)

      // Save optimization metadata
      fs.writeFileSync(
        path.join(this.outputDir, 'optimized', `${task.name}_${i}_optimization.json`),
        JSON.stringify(optimizedAsset, null, 2)
      )
    }

    const summary = {
      task: task.name,
      type: 'optimization',
      assets: optimizedAssets,
      totalSaved: optimizedAssets.reduce((sum, asset) => {
        return sum + (asset.optimization.originalSize - asset.optimization.optimizedSize)
      }, 0),
      timestamp: Date.now()
    }

    return {
      type: 'asset-optimization',
      result: summary,
      sharedResource: {
        key: `optimized-${task.name}`,
        data: optimizedAssets
      }
    }
  }

  private async performOptimization(url: string, settings: any, assetType: string): Promise<AssetOptimization> {
    // Simulate optimization process
    const originalSize = Math.random() * 1000000 + 500000 // 500KB - 1.5MB
    const compressionRatio = assetType === 'ui' ? 0.7 : assetType === 'texture' ? 0.6 : 0.75
    const optimizedSize = Math.floor(originalSize * compressionRatio)

    return {
      originalSize: Math.floor(originalSize),
      optimizedSize: optimizedSize,
      compression: settings.compression || 'auto',
      format: settings.formats?.[0] || 'png',
      quality: settings.quality || 0.8
    }
  }

  private async validateAssets(task: AgentTask, sharedResources: Map<string, any>) {
    const assetData = sharedResources.get(task.name) || {}
    const validationResults = []

    if (assetData.urls) {
      for (let i = 0; i < assetData.urls.length; i++) {
        const url = assetData.urls[i]
        const validation = await this.performValidation(url, task.type)
        
        validationResults.push({
          url,
          validation,
          index: i,
          timestamp: Date.now()
        })
      }
    }

    const overallValidation = this.aggregateValidation(validationResults)

    // Save validation report
    fs.writeFileSync(
      path.join(this.outputDir, 'validated', `${task.name}_validation.json`),
      JSON.stringify({ results: validationResults, summary: overallValidation }, null, 2)
    )

    return {
      type: 'asset-validation',
      results: validationResults,
      summary: overallValidation,
      sharedResource: {
        key: `validated-${task.name}`,
        data: { results: validationResults, summary: overallValidation }
      }
    }
  }

  private async performValidation(url: string, assetType: string): Promise<AssetValidation> {
    const issues = []
    const recommendations = []
    let performanceScore = 90

    // Simulate validation checks
    const fileSize = Math.random() * 2000000 // Random file size
    const dimensions = {
      width: Math.floor(Math.random() * 2048) + 256,
      height: Math.floor(Math.random() * 2048) + 256
    }

    // Check file size
    if (fileSize > 1000000) {
      issues.push('File size exceeds 1MB')
      recommendations.push('Consider optimization or compression')
      performanceScore -= 20
    }

    // Check dimensions for power of two (important for textures)
    if (assetType === '3d' || assetType === 'texture') {
      if (!this.isPowerOfTwo(dimensions.width) || !this.isPowerOfTwo(dimensions.height)) {
        issues.push('Dimensions not power of two')
        recommendations.push('Resize to power-of-two dimensions for better GPU performance')
        performanceScore -= 15
      }
    }

    // Check aspect ratio for UI elements
    if (assetType === 'ui') {
      const aspectRatio = dimensions.width / dimensions.height
      if (aspectRatio > 4 || aspectRatio < 0.25) {
        issues.push('Unusual aspect ratio may cause display issues')
        recommendations.push('Consider standard aspect ratios for UI elements')
        performanceScore -= 10
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
      performanceScore: Math.max(0, performanceScore)
    }
  }

  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0
  }

  private aggregateValidation(results: any[]): AssetValidation {
    const allIssues = results.flatMap(r => r.validation.issues)
    const allRecommendations = results.flatMap(r => r.validation.recommendations)
    const avgScore = results.reduce((sum, r) => sum + r.validation.performanceScore, 0) / results.length

    return {
      isValid: allIssues.length === 0,
      issues: [...new Set(allIssues)],
      recommendations: [...new Set(allRecommendations)],
      performanceScore: Math.floor(avgScore)
    }
  }

  private async packageAssets(task: AgentTask, sharedResources: Map<string, any>) {
    const packageName = task.name
    const version = '1.0.0'
    
    // Collect all related assets
    const relatedAssets = []
    for (const [key, value] of sharedResources) {
      if (key.includes(packageName) || key.includes(task.type)) {
        relatedAssets.push({ key, data: value })
      }
    }

    // Create manifest
    const manifest = {
      name: packageName,
      version,
      type: task.type,
      assets: relatedAssets.map(asset => ({
        id: asset.key,
        type: this.detectAssetType(asset.key),
        files: this.extractFileInfo(asset.data)
      })),
      dependencies: this.extractDependencies(relatedAssets),
      metadata: {
        created: Date.now(),
        creator: 'Asset Integration Agent',
        platform: 'multi-platform',
        gameEngine: 'universal'
      }
    }

    // Create package
    const assetPackage: AssetPackage = {
      name: packageName,
      version,
      assets: relatedAssets,
      manifest,
      metadata: {
        totalAssets: relatedAssets.length,
        estimatedSize: this.estimatePackageSize(relatedAssets),
        platforms: ['web', 'mobile', 'desktop']
      },
      timestamp: Date.now()
    }

    // Save package
    fs.writeFileSync(
      path.join(this.outputDir, 'packages', `${packageName}_v${version}.json`),
      JSON.stringify(assetPackage, null, 2)
    )

    // Save manifest separately
    fs.writeFileSync(
      path.join(this.outputDir, 'manifests', `${packageName}_manifest.json`),
      JSON.stringify(manifest, null, 2)
    )

    return {
      type: 'asset-package',
      package: assetPackage,
      manifest,
      sharedResource: {
        key: `package-${packageName}`,
        data: assetPackage
      }
    }
  }

  private extractFileInfo(data: any): any[] {
    if (!data) return []
    
    if (data.urls) {
      return data.urls.map((url: string, index: number) => ({
        url,
        index,
        type: 'image',
        format: 'png'
      }))
    }
    
    if (data.url) {
      return [{
        url: data.url,
        type: 'image',
        format: 'png'
      }]
    }

    return []
  }

  private extractDependencies(assets: any[]): string[] {
    const dependencies = []
    
    // Check for shared resources and cross-references
    for (const asset of assets) {
      if (asset.data?.dependencies) {
        dependencies.push(...asset.data.dependencies)
      }
    }

    return [...new Set(dependencies)]
  }

  private estimatePackageSize(assets: any[]): number {
    // Estimate based on number and type of assets
    let totalSize = 0
    
    for (const asset of assets) {
      const fileCount = asset.data?.urls?.length || 1
      const avgFileSize = this.getAverageFileSize(this.detectAssetType(asset.key))
      totalSize += fileCount * avgFileSize
    }

    return totalSize
  }

  private getAverageFileSize(assetType: string): number {
    const sizes = {
      'ui': 100000,      // 100KB
      '3d': 500000,      // 500KB
      'character': 300000, // 300KB
      'texture': 250000,  // 250KB
      'default': 200000   // 200KB
    }
    
    return sizes[assetType] || sizes.default
  }

  private async deployAssets(task: AgentTask, sharedResources: Map<string, any>) {
    const packageData = sharedResources.get(`package-${task.name}`)
    
    if (!packageData) {
      throw new Error('No package found for deployment')
    }

    const deploymentTargets = ['development', 'staging', 'production']
    const deploymentResults = []

    for (const target of deploymentTargets) {
      const result = await this.performDeployment(packageData, target)
      deploymentResults.push(result)

      // Save deployment record
      fs.writeFileSync(
        path.join(this.outputDir, 'reports', `${task.name}_deploy_${target}.json`),
        JSON.stringify(result, null, 2)
      )
    }

    const deploymentSummary = {
      package: packageData.name,
      version: packageData.version,
      deployments: deploymentResults,
      timestamp: Date.now(),
      status: deploymentResults.every(d => d.success) ? 'success' : 'partial'
    }

    return {
      type: 'asset-deployment',
      summary: deploymentSummary,
      deployments: deploymentResults,
      sharedResource: {
        key: `deployed-${task.name}`,
        data: deploymentSummary
      }
    }
  }

  private async performDeployment(packageData: any, target: string) {
    // Simulate deployment process
    const success = Math.random() > 0.1 // 90% success rate
    const deployTime = Math.floor(Math.random() * 30) + 5 // 5-35 seconds

    return {
      target,
      success,
      deployTime,
      url: success ? `https://${target}.example.com/assets/${packageData.name}` : null,
      error: success ? null : 'Deployment timeout',
      timestamp: Date.now()
    }
  }

  private async runFullPipeline(task: AgentTask, sharedResources: Map<string, any>) {
    const pipelineSteps = ['optimize', 'validate', 'package', 'deploy']
    const pipelineResults = {}

    console.log(`🚀 Running full integration pipeline for ${task.name}`)

    for (const step of pipelineSteps) {
      try {
        console.log(`  - Running ${step} step...`)
        
        const stepTask: AgentTask = {
          ...task,
          id: `${task.id}_${step}`,
          category: step
        }

        const result = await this.processTask(stepTask, sharedResources)
        pipelineResults[step] = result

        // Update shared resources with intermediate results
        if (result.sharedResource) {
          sharedResources.set(result.sharedResource.key, result.sharedResource.data)
        }

      } catch (error) {
        console.error(`  ❌ Pipeline step ${step} failed:`, error)
        pipelineResults[step] = { error: error.message }
        break
      }
    }

    const pipelineSummary = {
      task: task.name,
      steps: pipelineSteps,
      results: pipelineResults,
      success: !Object.values(pipelineResults).some((r: any) => r.error),
      timestamp: Date.now()
    }

    // Save pipeline report
    fs.writeFileSync(
      path.join(this.outputDir, 'reports', `${task.name}_pipeline.json`),
      JSON.stringify(pipelineSummary, null, 2)
    )

    return {
      type: 'full-pipeline',
      summary: pipelineSummary,
      steps: pipelineResults
    }
  }

  private async integrateGenericAsset(task: AgentTask, sharedResources: Map<string, any>) {
    // Default integration process
    const integration = {
      task: task.name,
      type: task.type,
      category: task.category,
      processed: true,
      timestamp: Date.now(),
      metadata: {
        processingTime: Math.floor(Math.random() * 10) + 1,
        optimization: 'standard',
        validation: 'passed'
      }
    }

    // Save integration metadata
    fs.writeFileSync(
      path.join(this.outputDir, `${task.name}_integration.json`),
      JSON.stringify(integration, null, 2)
    )

    return {
      type: 'generic-integration',
      result: integration
    }
  }

  private detectAssetType(identifier: string): string {
    const lower = identifier.toLowerCase()
    
    if (lower.includes('ui') || lower.includes('button') || lower.includes('panel')) {
      return 'ui'
    } else if (lower.includes('3d') || lower.includes('model') || lower.includes('environment')) {
      return '3d'
    } else if (lower.includes('character') || lower.includes('portrait') || lower.includes('emotion')) {
      return 'character'
    } else if (lower.includes('texture') || lower.includes('material')) {
      return 'texture'
    }
    
    return 'default'
  }

  // Generate integration report
  generateIntegrationReport(): any {
    const reportPath = path.join(this.outputDir, 'reports')
    const reports = []

    if (fs.existsSync(reportPath)) {
      const files = fs.readdirSync(reportPath)
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = JSON.parse(fs.readFileSync(path.join(reportPath, file), 'utf8'))
            reports.push(content)
          } catch (error) {
            console.warn(`Failed to read report ${file}:`, error)
          }
        }
      }
    }

    const summary = {
      totalTasks: reports.length,
      successful: reports.filter(r => !r.error && r.success !== false).length,
      failed: reports.filter(r => r.error || r.success === false).length,
      pipelineRuns: reports.filter(r => r.type === 'full-pipeline').length,
      optimizations: reports.filter(r => r.type === 'optimization').length,
      deployments: reports.filter(r => r.type === 'deployment').length,
      timestamp: Date.now()
    }

    return {
      summary,
      reports: reports.slice(0, 10) // Include last 10 reports
    }
  }

  // Set custom optimization settings
  setOptimizationSettings(settings: any) {
    this.optimizationSettings = { ...this.optimizationSettings, ...settings }
  }

  // Get performance recommendations
  getPerformanceRecommendations(assetType: string, platform: string): string[] {
    const recommendations = []

    if (platform === 'mobile') {
      recommendations.push('Use smaller texture sizes (512x512 max)')
      recommendations.push('Prefer compressed formats (WebP, ASTC)')
      recommendations.push('Implement aggressive LOD systems')
    }

    if (assetType === 'ui') {
      recommendations.push('Use 9-slice sprites for scalable UI elements')
      recommendations.push('Batch UI elements into atlases')
      recommendations.push('Consider vector graphics for simple shapes')
    }

    if (assetType === '3d') {
      recommendations.push('Use LOD models for distance culling')
      recommendations.push('Implement occlusion culling')
      recommendations.push('Use compressed texture formats (DXT, ASTC)')
    }

    return recommendations
  }
}

// Export the processing function for the coordination system
export async function processTask(task: AgentTask, sharedResources: Map<string, any>) {
  const agent = new AssetIntegrationAgent()
  return await agent.processTask(task, sharedResources)
}

export default AssetIntegrationAgent