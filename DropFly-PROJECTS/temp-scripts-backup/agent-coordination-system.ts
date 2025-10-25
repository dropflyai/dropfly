// Agent Coordination System for AAA Game Development
// Manages specialized design agents working in parallel

import EventEmitter from 'events'
import * as fs from 'fs'
import * as path from 'path'

export interface AgentTask {
  id: string
  type: 'ui' | '3d' | 'character' | 'integration'
  priority: number
  category: string
  name: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  assignedAgent?: string
  startTime?: number
  completionTime?: number
  result?: any
  error?: string
  dependencies?: string[]
}

export interface AgentCapability {
  type: string
  specialization: string[]
  maxConcurrentTasks: number
  estimatedTimePerTask: number
  quality: 'fast' | 'balanced' | 'premium'
}

export interface Agent {
  id: string
  name: string
  capability: AgentCapability
  status: 'idle' | 'busy' | 'error'
  currentTasks: string[]
  totalCompleted: number
  successRate: number
  averageTime: number
}

export class AgentCoordinationSystem extends EventEmitter {
  private agents: Map<string, Agent> = new Map()
  private tasks: Map<string, AgentTask> = new Map()
  private taskQueue: AgentTask[] = []
  private sharedResources: Map<string, any> = new Map()
  private outputDir: string
  private isRunning: boolean = false

  constructor(outputDir: string = './agent-output') {
    super()
    this.outputDir = outputDir
    this.initializeOutputDirectory()
    this.initializeAgents()
  }

  private initializeOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }

    // Create specialized directories
    const dirs = ['ui-elements', '3d-assets', 'characters', 'integration', 'shared-resources']
    dirs.forEach(dir => {
      const fullPath = path.join(this.outputDir, dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
    })
  }

  private initializeAgents() {
    // UI/Graphics Agent
    this.agents.set('ui-agent', {
      id: 'ui-agent',
      name: 'UI/Graphics Specialist',
      capability: {
        type: 'ui',
        specialization: ['buttons', 'panels', 'icons', 'textures', 'hud-elements'],
        maxConcurrentTasks: 3,
        estimatedTimePerTask: 30, // seconds
        quality: 'premium'
      },
      status: 'idle',
      currentTasks: [],
      totalCompleted: 0,
      successRate: 100,
      averageTime: 30
    })

    // 3D Environment Agent
    this.agents.set('3d-agent', {
      id: '3d-agent',
      name: '3D Environment Specialist',
      capability: {
        type: '3d',
        specialization: ['models', 'materials', 'environments', 'lighting', 'pbr-textures'],
        maxConcurrentTasks: 2,
        estimatedTimePerTask: 45,
        quality: 'premium'
      },
      status: 'idle',
      currentTasks: [],
      totalCompleted: 0,
      successRate: 100,
      averageTime: 45
    })

    // Character Design Agent
    this.agents.set('character-agent', {
      id: 'character-agent',
      name: 'Character Design Specialist',
      capability: {
        type: 'character',
        specialization: ['portraits', 'emotions', 'animations', 'expressions', 'character-sheets'],
        maxConcurrentTasks: 2,
        estimatedTimePerTask: 40,
        quality: 'premium'
      },
      status: 'idle',
      currentTasks: [],
      totalCompleted: 0,
      successRate: 100,
      averageTime: 40
    })

    // Asset Integration Agent
    this.agents.set('integration-agent', {
      id: 'integration-agent',
      name: 'Asset Integration Specialist',
      capability: {
        type: 'integration',
        specialization: ['pipeline', 'optimization', 'validation', 'packaging', 'deployment'],
        maxConcurrentTasks: 4,
        estimatedTimePerTask: 15,
        quality: 'fast'
      },
      status: 'idle',
      currentTasks: [],
      totalCompleted: 0,
      successRate: 100,
      averageTime: 15
    })
  }

  // Add task to the coordination system
  addTask(task: Omit<AgentTask, 'id' | 'status'>): string {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullTask: AgentTask = {
      ...task,
      id: taskId,
      status: 'pending'
    }

    this.tasks.set(taskId, fullTask)
    this.taskQueue.push(fullTask)
    
    this.emit('task-added', fullTask)
    
    // Try to assign immediately if agents are available
    this.tryAssignTasks()
    
    return taskId
  }

  // Try to assign pending tasks to available agents
  private tryAssignTasks() {
    const availableAgents = Array.from(this.agents.values()).filter(agent => 
      agent.status === 'idle' || agent.currentTasks.length < agent.capability.maxConcurrentTasks
    )

    const pendingTasks = this.taskQueue.filter(task => task.status === 'pending')

    for (const task of pendingTasks) {
      const suitableAgent = this.findBestAgent(task)
      if (suitableAgent) {
        this.assignTaskToAgent(task, suitableAgent)
      }
    }
  }

  private findBestAgent(task: AgentTask): Agent | null {
    const suitableAgents = Array.from(this.agents.values()).filter(agent => {
      return agent.capability.type === task.type && 
             agent.currentTasks.length < agent.capability.maxConcurrentTasks
    })

    if (suitableAgents.length === 0) return null

    // Sort by availability and success rate
    suitableAgents.sort((a, b) => {
      const aLoad = a.currentTasks.length / a.capability.maxConcurrentTasks
      const bLoad = b.currentTasks.length / b.capability.maxConcurrentTasks
      return aLoad - bLoad || b.successRate - a.successRate
    })

    return suitableAgents[0]
  }

  private async assignTaskToAgent(task: AgentTask, agent: Agent) {
    task.status = 'in-progress'
    task.assignedAgent = agent.id
    task.startTime = Date.now()

    agent.status = 'busy'
    agent.currentTasks.push(task.id)

    this.emit('task-assigned', { task, agent })

    try {
      // Execute the task
      const result = await this.executeTask(task, agent)
      await this.completeTask(task.id, result)
    } catch (error) {
      await this.failTask(task.id, error.message)
    }
  }

  private async executeTask(task: AgentTask, agent: Agent): Promise<any> {
    // Import the specific agent module
    const agentModule = await this.loadAgentModule(agent.id)
    
    // Execute the task with the specialized agent
    return await agentModule.processTask(task, this.sharedResources)
  }

  private async loadAgentModule(agentId: string) {
    switch (agentId) {
      case 'ui-agent':
        return await import('./agents/ui-graphics-agent')
      case '3d-agent':
        return await import('./agents/3d-environment-agent')
      case 'character-agent':
        return await import('./agents/character-design-agent')
      case 'integration-agent':
        return await import('./agents/asset-integration-agent')
      default:
        throw new Error(`Unknown agent: ${agentId}`)
    }
  }

  async completeTask(taskId: string, result: any) {
    const task = this.tasks.get(taskId)
    const agent = task?.assignedAgent ? this.agents.get(task.assignedAgent) : null

    if (!task || !agent) return

    task.status = 'completed'
    task.completionTime = Date.now()
    task.result = result

    // Update agent stats
    agent.currentTasks = agent.currentTasks.filter(id => id !== taskId)
    agent.totalCompleted++
    
    if (task.startTime && task.completionTime) {
      const taskTime = (task.completionTime - task.startTime) / 1000
      agent.averageTime = (agent.averageTime * (agent.totalCompleted - 1) + taskTime) / agent.totalCompleted
    }

    if (agent.currentTasks.length === 0) {
      agent.status = 'idle'
    }

    this.emit('task-completed', { task, result })

    // Save result to shared resources if applicable
    if (result.sharedResource) {
      this.sharedResources.set(result.sharedResource.key, result.sharedResource.data)
    }

    // Try to assign more tasks
    this.tryAssignTasks()
  }

  async failTask(taskId: string, error: string) {
    const task = this.tasks.get(taskId)
    const agent = task?.assignedAgent ? this.agents.get(task.assignedAgent) : null

    if (!task || !agent) return

    task.status = 'failed'
    task.error = error

    // Update agent stats
    agent.currentTasks = agent.currentTasks.filter(id => id !== taskId)
    const failureCount = Array.from(this.tasks.values()).filter(
      t => t.assignedAgent === agent.id && t.status === 'failed'
    ).length

    agent.successRate = ((agent.totalCompleted) / (agent.totalCompleted + failureCount)) * 100

    if (agent.currentTasks.length === 0) {
      agent.status = 'idle'
    }

    this.emit('task-failed', { task, error })

    // Try to reassign or retry
    setTimeout(() => {
      task.status = 'pending'
      task.assignedAgent = undefined
      this.tryAssignTasks()
    }, 5000) // Retry after 5 seconds
  }

  // Start the coordination system
  async start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🚀 Agent Coordination System Started')
    console.log(`📊 Available Agents: ${this.agents.size}`)
    
    this.agents.forEach(agent => {
      console.log(`  - ${agent.name} (${agent.capability.type}): ${agent.capability.maxConcurrentTasks} concurrent tasks`)
    })

    // Start the main coordination loop
    this.coordinationLoop()
    
    this.emit('system-started')
  }

  private coordinationLoop() {
    if (!this.isRunning) return

    // Try to assign tasks every 2 seconds
    this.tryAssignTasks()

    // Check for stuck tasks
    this.checkStuckTasks()

    setTimeout(() => this.coordinationLoop(), 2000)
  }

  private checkStuckTasks() {
    const now = Date.now()
    const stuckThreshold = 300000 // 5 minutes

    Array.from(this.tasks.values()).forEach(task => {
      if (task.status === 'in-progress' && task.startTime) {
        const elapsed = now - task.startTime
        if (elapsed > stuckThreshold) {
          console.warn(`⚠️ Task ${task.id} appears stuck, attempting recovery`)
          this.failTask(task.id, 'Task timeout - exceeded 5 minutes')
        }
      }
    })
  }

  // Stop the coordination system
  stop() {
    this.isRunning = false
    this.emit('system-stopped')
    console.log('🛑 Agent Coordination System Stopped')
  }

  // Get system status
  getStatus() {
    const agentStatus = Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      currentTasks: agent.currentTasks.length,
      maxTasks: agent.capability.maxConcurrentTasks,
      completed: agent.totalCompleted,
      successRate: agent.successRate,
      averageTime: agent.averageTime
    }))

    const taskStatus = {
      total: this.tasks.size,
      pending: Array.from(this.tasks.values()).filter(t => t.status === 'pending').length,
      inProgress: Array.from(this.tasks.values()).filter(t => t.status === 'in-progress').length,
      completed: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
      failed: Array.from(this.tasks.values()).filter(t => t.status === 'failed').length
    }

    return {
      isRunning: this.isRunning,
      agents: agentStatus,
      tasks: taskStatus,
      sharedResources: this.sharedResources.size
    }
  }

  // Add shared resource
  addSharedResource(key: string, data: any) {
    this.sharedResources.set(key, data)
    this.emit('resource-shared', { key, data })
  }

  // Get shared resource
  getSharedResource(key: string) {
    return this.sharedResources.get(key)
  }

  // Batch add tasks
  addTaskBatch(tasks: Omit<AgentTask, 'id' | 'status'>[]) {
    const taskIds = tasks.map(task => this.addTask(task))
    this.emit('batch-added', { tasks: taskIds })
    return taskIds
  }

  // Wait for all tasks to complete
  async waitForCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const checkCompletion = () => {
        const pendingTasks = Array.from(this.tasks.values()).filter(
          task => task.status === 'pending' || task.status === 'in-progress'
        )

        if (pendingTasks.length === 0) {
          resolve()
        } else {
          setTimeout(checkCompletion, 1000)
        }
      }

      checkCompletion()
    })
  }

  // Generate report
  generateReport(): any {
    const agents = Array.from(this.agents.values())
    const tasks = Array.from(this.tasks.values())

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalAgents: agents.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        failedTasks: tasks.filter(t => t.status === 'failed').length,
        successRate: (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100
      },
      agentPerformance: agents.map(agent => ({
        name: agent.name,
        type: agent.capability.type,
        completed: agent.totalCompleted,
        successRate: agent.successRate,
        averageTime: agent.averageTime,
        utilization: (agent.currentTasks.length / agent.capability.maxConcurrentTasks) * 100
      })),
      taskBreakdown: {
        ui: tasks.filter(t => t.type === 'ui').length,
        '3d': tasks.filter(t => t.type === '3d').length,
        character: tasks.filter(t => t.type === 'character').length,
        integration: tasks.filter(t => t.type === 'integration').length
      },
      sharedResources: Array.from(this.sharedResources.keys())
    }
  }
}

export default AgentCoordinationSystem