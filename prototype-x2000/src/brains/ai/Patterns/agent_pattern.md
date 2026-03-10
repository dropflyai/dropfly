# Agent Pattern

## Pattern Summary

The Agent pattern enables AI systems to accomplish multi-step tasks autonomously by reasoning about goals, planning action sequences, executing tools, observing results, and adapting. This pattern transforms an LLM from a stateless text generator into a goal-directed autonomous system.

---

## 1. Problem Statement

A task requires multiple steps that cannot be predefined because the optimal path depends on intermediate results. The system must reason about what to do next, execute actions, interpret results, and adapt its approach. Examples include research tasks, data analysis, code generation with testing, and complex customer support workflows.

**Symptoms Indicating You Need an Agent**:
- The task requires information gathering before the main work can begin
- The optimal steps depend on intermediate results
- Multiple tools or data sources need to be consulted
- The task benefits from self-correction and iterative refinement
- A human performing the task would need to make judgments at multiple points

---

## 2. Architecture

```
┌──────────────────────────────────────────────────┐
│                 ORCHESTRATOR                      │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │            AGENT LOOP                     │    │
│  │                                          │    │
│  │  [Goal] → [Reason] → [Plan] → [Act]     │    │
│  │              ^                   │        │    │
│  │              │                   v        │    │
│  │         [Observe] ← ── [Execute Tool]    │    │
│  │              │                            │    │
│  │              v                            │    │
│  │     [Complete? ] ──No──→ [Continue]       │    │
│  │         │                                 │    │
│  │        Yes                                │    │
│  │         v                                 │    │
│  │     [Return Result]                       │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ Tool Set   │  │  Memory    │  │ Guardrails│  │
│  └────────────┘  └────────────┘  └───────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Agent Core (Reasoning Engine)

**Responsibility**: Process the current state (goal, history, observations) and decide the next action.

**Model Selection**:
| Model | Agent Capability | Cost | Best For |
|-------|-----------------|------|----------|
| Claude Opus | Excellent planning and reasoning | High | Complex multi-step tasks |
| Claude Sonnet | Good planning, reliable tool use | Medium | Most agent applications |
| GPT-4o | Good planning, strong tool use | Medium | General agent tasks |
| Claude Haiku | Basic tool use, limited planning | Low | Simple tool-routing agents |

**System Prompt Template**:
```
You are an AI agent that accomplishes tasks by reasoning step-by-step
and using the provided tools. For each step:

1. THINK: Analyze what you know and what you need to do next.
2. ACT: Select and use the most appropriate tool.
3. OBSERVE: Analyze the tool's output.
4. DECIDE: Determine if the task is complete or if more steps are needed.

Always explain your reasoning before taking action.
If you encounter an error, analyze it and try an alternative approach.
If you cannot accomplish the task, explain why and what you tried.
```

### 3.2 Tool Set

**Responsibility**: Provide the agent with capabilities to interact with the external world.

**Design Principles**:
- 3-7 tools per agent (more degrades selection accuracy)
- Single responsibility per tool
- Clear, specific tool descriptions with examples
- Tools return structured output the agent can parse
- Tools handle their own errors and return informative error messages

**Essential Tool Categories**:
| Category | Example Tools | When to Include |
|----------|--------------|-----------------|
| Information Retrieval | search, database_query, api_call | Almost always |
| Computation | calculator, code_runner, data_analyzer | Math/data tasks |
| Content Creation | write_file, generate_image, send_email | Output tasks |
| System Interaction | file_system, browser, terminal | Automation tasks |
| Communication | ask_user, notify, escalate | Human-in-the-loop |

**Tool Description Example**:
```json
{
  "name": "search_docs",
  "description": "Search the product documentation for information. Returns the 5 most relevant passages. Use this when you need to find specific product features, pricing, or policy information. Input should be a natural language query.",
  "parameters": {
    "query": {
      "type": "string",
      "description": "Search query. Be specific. Example: 'refund policy for annual subscriptions'"
    }
  }
}
```

### 3.3 Memory System

**Responsibility**: Maintain context across agent steps and across sessions.

**Working Memory (Context Window)**:
- Current goal and plan
- Last 5-10 action-observation pairs
- Summary of earlier actions (if context is long)

**Persistent Memory (Cross-Session)**:
- Successful task completions (episodic memory for future reference)
- User preferences learned from interactions
- Domain facts discovered during task execution
- Error patterns and recovery strategies that worked

**Memory Management**:
```
If context_length > 80% of window:
    Summarize oldest 50% of action-observation pairs
    Replace detailed entries with summary
    Preserve: current goal, current plan, last 3 entries
```

### 3.4 Guardrails

**Responsibility**: Prevent the agent from taking harmful, unauthorized, or wasteful actions.

**Budget Guardrails**:
- Maximum steps per task (default: 20)
- Maximum tokens per task (default: 100K)
- Maximum time per task (default: 5 minutes)
- Maximum cost per task (configurable per use case)

**Action Guardrails**:
- Require confirmation for destructive actions (delete, modify, send)
- Block access to unauthorized tools or data sources
- Validate tool parameters before execution
- Prevent infinite loops (detect repeated similar actions)

**Output Guardrails**:
- Validate final output against task requirements
- Apply content safety checks before returning results
- Verify citations and sources if applicable

---

## 4. Agent Loop Implementation

### 4.1 Basic Loop

```python
def agent_loop(goal, tools, max_steps=20):
    history = []
    for step in range(max_steps):
        # Reason and select action
        response = llm.call(
            system=AGENT_SYSTEM_PROMPT,
            messages=format_history(goal, history),
            tools=tools
        )

        # Check if agent wants to use a tool
        if response.has_tool_call:
            tool_name = response.tool_call.name
            tool_params = response.tool_call.parameters

            # Execute tool with error handling
            try:
                result = execute_tool(tool_name, tool_params)
                history.append({"action": tool_name, "params": tool_params, "result": result})
            except Exception as e:
                history.append({"action": tool_name, "params": tool_params, "error": str(e)})

        # Check if agent considers task complete
        elif response.is_final:
            return {"status": "success", "result": response.text, "steps": len(history)}

    return {"status": "max_steps_reached", "partial_result": history[-1], "steps": max_steps}
```

### 4.2 Error Recovery

When a tool call fails:
1. The error message is added to the history
2. The agent reasons about the error
3. The agent tries an alternative approach (different tool, different parameters)
4. After 3 consecutive errors, the agent reports the failure

### 4.3 Stuck Detection

The agent is "stuck" when it:
- Takes the same action with the same parameters twice in a row
- Produces reasoning that repeats without new information
- Consumes budget without making measurable progress

Mitigation: Force a strategy change by injecting a meta-prompt: "You seem to be repeating the same approach. Consider a fundamentally different strategy."

---

## 5. Quality Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Task Completion Rate | > 80% | Percentage of tasks completed successfully |
| Step Efficiency | < 2x optimal | Steps taken vs. minimum possible steps |
| Tool Selection Accuracy | > 90% | Correct tool chosen for each step |
| Error Recovery Rate | > 70% | Percentage of errors recovered from |
| Hallucination Rate | < 5% | Fabricated tool results or observations |
| Budget Compliance | 100% | Never exceed configured limits |

---

## 6. Production Considerations

### 6.1 Observability

Log every agent step:
- Reasoning text (thought process)
- Tool selected and parameters
- Tool execution result
- Time and token cost per step
- Running totals (steps, tokens, cost, time)

### 6.2 Human Escalation

Implement clear escalation paths:
- Agent explicitly asks the user for clarification when needed
- Agent escalates to human when confidence is low
- Human can intervene at any point to redirect the agent
- All escalations are logged for pattern analysis

### 6.3 Testing

- Create a test suite of 20-50 representative tasks
- Include easy, medium, and hard tasks
- Include tasks that should trigger escalation
- Include adversarial tasks that test guardrail effectiveness
- Run the full test suite before every deployment

---

## 7. Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Too many tools | Agent selects wrong tools frequently | Reduce to 3-7 essential tools |
| Vague tool descriptions | Agent misuses tools | Write specific descriptions with examples |
| No step limit | Agent runs indefinitely on impossible tasks | Enforce maximum step count |
| No memory management | Context overflow on long tasks | Implement summarization |
| Missing error handling | Agent crashes on tool failures | Return informative errors, let agent adapt |
| No confirmation for actions | Agent takes harmful actions | Require confirmation for side effects |

---

## 8. Implementation Checklist

- [ ] Agent system prompt designed and tested
- [ ] Tool set defined with clear descriptions
- [ ] Agent loop implemented with error handling
- [ ] Budget guardrails enforced (steps, tokens, time, cost)
- [ ] Action guardrails implemented (confirmation for destructive actions)
- [ ] Memory management handles long tasks
- [ ] Stuck detection implemented
- [ ] Human escalation path defined
- [ ] Observability logging for every step
- [ ] Test suite of 20+ representative tasks
- [ ] Quality targets met on test suite
- [ ] Production monitoring configured

---

*See `05_agents/` modules for detailed technical content on agent architecture, multi-agent systems, and frameworks.*
