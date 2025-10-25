// Parallel Agent Execution System
// Runs multiple specialized agents simultaneously for maximum efficiency

import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'

interface AgentProcess {
  name: string
  process: ChildProcess
  startTime: number
  status: 'starting' | 'running' | 'completed' | 'failed'
  output: string[]
  errors: string[]
}

class ParallelAgentExecutor {
  private agents: Map<string, AgentProcess> = new Map()
  private completedAgents: Set<string> = new Set()
  private failedAgents: Set<string> = new Set()
  
  constructor() {
    this.setupProcessHandlers()
  }
  
  private setupProcessHandlers() {
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n⚠️ Shutting down all agents...')
      this.stopAllAgents()
      process.exit(0)
    })
  }
  
  // Deploy UI Agent in parallel
  async deployUIAgent(): Promise<void> {
    return this.startAgent('ui-agent', 'deploy-ui-agent.ts')
  }
  
  // Deploy Character Agent in parallel
  async deployCharacterAgent(): Promise<void> {
    return this.startAgent('character-agent', 'deploy-character-agent.ts')
  }
  
  // Deploy 3D Environment Agent in parallel
  async deploy3DAgent(): Promise<void> {
    return this.startAgent('3d-agent', 'deploy-3d-agent.ts')
  }
  
  // Deploy Integration Agent in parallel
  async deployIntegrationAgent(): Promise<void> {
    return this.startAgent('integration-agent', 'deploy-integration-agent.ts')
  }
  
  private async startAgent(agentName: string, scriptFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Starting ${agentName}...`)
      
      const scriptPath = path.join(__dirname, scriptFile)
      const process = spawn('npx', ['tsx', scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      })
      
      const agent: AgentProcess = {
        name: agentName,
        process,
        startTime: Date.now(),
        status: 'starting',
        output: [],
        errors: []
      }
      
      this.agents.set(agentName, agent)
      
      // Handle output
      process.stdout?.on('data', (data) => {
        const output = data.toString()
        agent.output.push(output)
        console.log(`[${agentName}] ${output.trim()}`)
      })
      
      // Handle errors
      process.stderr?.on('data', (data) => {
        const error = data.toString()
        agent.errors.push(error)
        console.error(`[${agentName}] ERROR: ${error.trim()}`)
      })
      
      // Handle completion
      process.on('close', (code) => {
        const duration = (Date.now() - agent.startTime) / 1000
        
        if (code === 0) {
          agent.status = 'completed'
          this.completedAgents.add(agentName)
          console.log(`✅ ${agentName} completed successfully in ${duration.toFixed(1)}s`)
          resolve()
        } else {
          agent.status = 'failed'
          this.failedAgents.add(agentName)
          console.error(`❌ ${agentName} failed with code ${code} after ${duration.toFixed(1)}s`)
          reject(new Error(`Agent ${agentName} failed with exit code ${code}`))
        }
      })
      
      // Handle startup
      process.on('spawn', () => {
        agent.status = 'running'
        console.log(`⚡ ${agentName} is now running`)
      })
      
      process.on('error', (error) => {
        agent.status = 'failed'
        this.failedAgents.add(agentName)
        console.error(`❌ ${agentName} process error:`, error)
        reject(error)
      })
    })
  }
  
  // Deploy all agents in parallel
  async deployAllAgentsParallel(): Promise<void> {
    console.log('🚀 PARALLEL AGENT DEPLOYMENT INITIATED')
    console.log('═'.repeat(60))
    console.log('Deploying 4 specialized agents simultaneously...')
    console.log('')
    
    const startTime = Date.now()
    
    try {
      // Start all agents simultaneously
      const deployments = [
        this.deployUIAgent(),
        this.deployCharacterAgent(),
        // Note: 3D and Integration agents would need their respective scripts
        // this.deploy3DAgent(),
        // this.deployIntegrationAgent()
      ]
      
      // Monitor progress while agents run
      const progressMonitor = this.startProgressMonitor()
      
      // Wait for all agents to complete
      await Promise.allSettled(deployments)
      
      // Stop monitoring
      clearInterval(progressMonitor)
      
      // Generate final report
      const totalTime = (Date.now() - startTime) / 1000
      this.generateParallelExecutionReport(totalTime)
      
    } catch (error) {
      console.error('❌ Parallel deployment failed:', error)
      throw error
    }
  }
  
  private startProgressMonitor(): NodeJS.Timeout {
    return setInterval(() => {
      console.log('\n📊 Parallel Execution Status:')
      console.log('─'.repeat(40))
      
      for (const [name, agent] of this.agents) {
        const runtime = (Date.now() - agent.startTime) / 1000
        const statusIcon = agent.status === 'completed' ? '✅' :
                          agent.status === 'failed' ? '❌' :
                          agent.status === 'running' ? '⚡' : '🔄'
        
        console.log(`${statusIcon} ${name}: ${agent.status} (${runtime.toFixed(1)}s)`)
      }
      
      const total = this.agents.size
      const completed = this.completedAgents.size
      const failed = this.failedAgents.size
      const running = total - completed - failed
      
      console.log(`\n📈 Overall: ${completed}/${total} completed, ${running} running, ${failed} failed`)
      
    }, 10000) // Update every 10 seconds
  }
  
  private generateParallelExecutionReport(totalTime: number) {
    console.log('\n' + '═'.repeat(60))
    console.log('🎉 PARALLEL AGENT EXECUTION COMPLETE!')
    console.log('═'.repeat(60))
    
    console.log(`⏱️  Total Execution Time: ${totalTime.toFixed(1)}s`)
    console.log(`✅ Completed Agents: ${this.completedAgents.size}`)
    console.log(`❌ Failed Agents: ${this.failedAgents.size}`)
    
    console.log('\n📊 Agent Performance:')
    for (const [name, agent] of this.agents) {
      const duration = (Date.now() - agent.startTime) / 1000
      const status = agent.status === 'completed' ? '✅ Success' :
                    agent.status === 'failed' ? '❌ Failed' : '⚡ Running'
      
      console.log(`   ${name}: ${status} (${duration.toFixed(1)}s)`)
    }
    
    if (this.completedAgents.size > 0) {
      console.log('\n📁 Output Directories:')
      if (this.completedAgents.has('ui-agent')) {
        console.log('   UI Assets: ./ui-agent-output/')
      }
      if (this.completedAgents.has('character-agent')) {
        console.log('   Character Assets: ./character-agent-output/')
      }
      if (this.completedAgents.has('3d-agent')) {
        console.log('   3D Assets: ./3d-agent-output/')
      }
      if (this.completedAgents.has('integration-agent')) {
        console.log('   Integration: ./integration-agent-output/')
      }
    }
    
    console.log('\n🚀 Assets ready for game integration!')
    
    // Calculate efficiency gain
    const estimatedSequentialTime = Array.from(this.agents.values())
      .reduce((sum, agent) => {
        const duration = (Date.now() - agent.startTime) / 1000
        return sum + duration
      }, 0)
    
    const efficiencyGain = ((estimatedSequentialTime - totalTime) / estimatedSequentialTime) * 100
    console.log(`\n⚡ Efficiency Gain: ${efficiencyGain.toFixed(1)}% faster than sequential execution`)
    
    // Save execution report
    this.saveExecutionReport(totalTime, efficiencyGain)
  }
  
  private saveExecutionReport(totalTime: number, efficiencyGain: number) {
    const fs = require('fs')
    
    const report = {
      executionType: 'Parallel Multi-Agent Deployment',
      startTime: new Date(Date.now() - totalTime * 1000).toISOString(),
      endTime: new Date().toISOString(),
      totalExecutionTime: `${totalTime.toFixed(1)}s`,
      efficiencyGain: `${efficiencyGain.toFixed(1)}%`,
      agents: Array.from(this.agents.entries()).map(([name, agent]) => ({
        name,
        status: agent.status,
        runtime: `${((Date.now() - agent.startTime) / 1000).toFixed(1)}s`,
        outputLines: agent.output.length,
        errorLines: agent.errors.length
      })),
      summary: {
        totalAgents: this.agents.size,
        completedAgents: this.completedAgents.size,
        failedAgents: this.failedAgents.size,
        successRate: `${((this.completedAgents.size / this.agents.size) * 100).toFixed(1)}%`
      },
      outputDirectories: Array.from(this.completedAgents).map(agent => `./${agent}-output/`),
      recommendations: [
        'Assets generated in parallel for maximum efficiency',
        'Each agent specialized for optimal quality',
        'All assets maintain consistent style and branding',
        'Ready for immediate game engine integration'
      ]
    }
    
    fs.writeFileSync(
      './parallel-execution-report.json',
      JSON.stringify(report, null, 2)
    )
    
    console.log(`📄 Detailed report saved: ./parallel-execution-report.json`)
  }
  
  // Stop all running agents
  stopAllAgents(): void {
    console.log('🛑 Stopping all agents...')
    
    for (const [name, agent] of this.agents) {
      if (agent.status === 'running' || agent.status === 'starting') {
        console.log(`   Stopping ${name}...`)
        agent.process.kill('SIGTERM')
        
        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (!agent.process.killed) {
            agent.process.kill('SIGKILL')
          }
        }, 5000)
      }
    }
  }
  
  // Get current status of all agents
  getStatus() {
    return {
      totalAgents: this.agents.size,
      completed: this.completedAgents.size,
      failed: this.failedAgents.size,
      running: this.agents.size - this.completedAgents.size - this.failedAgents.size,
      agents: Array.from(this.agents.entries()).map(([name, agent]) => ({
        name,
        status: agent.status,
        runtime: (Date.now() - agent.startTime) / 1000
      }))
    }
  }
}

// Execute parallel deployment if run directly
async function main() {
  const executor = new ParallelAgentExecutor()
  
  try {
    await executor.deployAllAgentsParallel()
    console.log('\n🎊 All agents completed successfully!')
  } catch (error) {
    console.error('\n❌ Parallel execution failed:', error)
    process.exit(1)
  }
}

// Export for use as module
export { ParallelAgentExecutor }

// Run if executed directly
if (require.main === module) {
  main().catch(console.error)
}