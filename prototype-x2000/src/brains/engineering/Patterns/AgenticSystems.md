# Agentic Systems Patterns

> Engineering Brain -- Patterns Library
> Classification: Architecture / AI Systems / Agent Design

---

## What This Enables

Agentic AI systems are persistent, goal-directed entities that reason, plan, act on
their environment through tools, and revise behavior based on observed outcomes. This
document codifies the foundational patterns for designing, coordinating, and controlling
such systems. Engineers building within PX1000--or any multi-agent framework--should
treat these as first-class architectural primitives.

The patterns draw from peer-reviewed research (Yao et al. 2023; Wei et al. 2022; Shinn
et al. 2023; Asai et al. 2024), production frameworks (LangChain, AutoGen, CrewAI), and
operational experience from the PX1000 brain architecture.

---

### 1. The ReAct Pattern

ReAct (Reasoning + Acting) interleaves chain-of-thought reasoning with environment
actions in a single loop (Yao et al. 2023). The agent cycles through three primitives:

```
Thought_t     := reason(Observation_{t-1}, Goal, Memory)
Action_t      := select_tool(Thought_t, ToolSchema)
Observation_t := execute(Action_t, Environment)
```

The loop terminates on a `Finish` action or when step budget `T_max` is exhausted.

**Why it works.** Pure chain-of-thought is internal only--the model cannot verify
reasoning against external state. Pure acting executes without deliberation. ReAct fuses
both: reasoning grounds actions in rationale; observations ground reasoning in evidence.
This reduces hallucination by 8-14% on knowledge-intensive benchmarks (HotpotQA, FEVER)
over act-only baselines.

**Implementation rules:**
- Log every `Thought_t`--this is your production debugging trace.
- Enforce typed tool schemas. Free-form action strings produce unparseable outputs.
- Truncate or summarize observations before re-injection to prevent context overflow.
- Always enforce `T_max` (typical range: 5-25 steps). Unbounded loops burn tokens.

**PX1000 realization.** Each specialist brain is a ReAct agent. The CEO Brain's
orchestration is a meta-level ReAct cycle: reason about which brain to invoke (Thought),
delegate (Action), evaluate (Observation), then decide the next delegation.

---

### 2. Plan-and-Execute Architecture

Decomposes a goal into an ordered subtask sequence *before* executing any of them:

```
Planning:   Plan := decompose(Goal, Context) -> [Subtask_1, ..., Subtask_n]
Execution:  for Subtask_i: Result_i := execute(Subtask_i); replan on failure
Synthesis:  Output := synthesize(Result_1, ..., Result_n)
```

Use Plan-and-Execute when subtasks are relatively independent (multi-file refactoring,
research synthesis). Prefer ReAct when each step's output radically alters the next.

**Replanning** must detect three conditions: (a) outright failure, (b) success that
invalidates downstream assumptions, (c) new information changing the optimal plan.
Preserve completed work; only modify remaining subtasks.

**PX1000 realization.** The CEO Brain decomposes high-level goals across brains and
replans when a brain reports failure or intermediate results shift requirements.

---

### 3. Multi-Agent Coordination Patterns

**Orchestrator (hub-and-spoke).** A central coordinator decomposes, delegates, and
synthesizes. Clear authority, predictable control flow. Weakness: single point of failure.
PX1000's CEO Brain is the orchestrator over 37 specialist spokes.

**Pipeline.** Agents chained linearly--each output feeds the next. Natural for sequential
workflows (code gen -> review -> test -> deploy). No feedback unless explicitly added.

**Debate / Adversarial.** Multiple agents solve the same problem independently, then
critique each other. A judge selects or synthesizes the best result (Du et al. 2023).
Best when factual accuracy is critical or the task has no single correct answer.

**Blackboard.** A shared workspace holds evolving state. Agents read/write asynchronously;
a controller activates agents based on current state. Suited for multi-constraint problems
requiring simultaneous Engineering, Security, and Performance input.

**Anti-patterns to avoid:**
- Unmediated peer-to-peer calls (circular delegation, untrackable state)
- Implicit authority (deadlock when agents disagree without resolution protocol)
- Shared mutable state without conflict resolution (corrupted outputs)

---

### 4. Tool Use Design

**Schema design principles:**
1. Typed parameters with descriptions and explicit optionality.
2. Single responsibility--one tool, one action.
3. Verb-noun naming (`read_file`, `search_code`). No `do_thing`.
4. Bounded, structured output. Never dump unbounded data into context.
5. Structured error objects distinct from success outputs.

**Tool selection at scale (10+ tools):** Group tools into categories. Use two-stage
selection: pick category first, then specific tool. This mirrors how CEO Brain selects
a specialist brain, then the brain selects its internal tools.

**Error handling:** Never silently swallow errors. Every failure must propagate to the
reasoning layer. Silent failures cause hallucination loops where the agent proceeds as
if a tool call succeeded. Retry retryable errors (max 3), escalate others to the
orchestrator for replanning.

---

### 5. Memory Systems

Agent memory draws directly from cognitive psychology's tripartite model (Tulving 1972;
Baddeley 2000):

| Human Memory | Agent Analog | Characteristics |
|-------------|-------------|-----------------|
| Working memory | Context window | Limited capacity, volatile, active manipulation |
| Episodic memory | Experience logs | Temporally ordered events, autobiographical |
| Semantic memory | Knowledge base | Facts and relationships, time-independent |

**Working memory (context window)** is the scarcest resource. Management strategies:
sliding window, summarization of earlier turns, selective injection of only relevant
tool outputs, structured scratchpads for intermediate reasoning.

**Episodic memory** stores `(task, actions, outcome, lessons, timestamp)` tuples. In
PX1000: `Memory/ExperienceLog.md`. Index by task type; prune old entries unless they
record critical failures; use for few-shot priming of similar tasks.

**Semantic memory** stores domain knowledge indexed by concept. In PX1000:
`Solutions/SolutionIndex.md` and pattern libraries. Read-only during execution; updated
only in a dedicated reflection phase after verified new knowledge.

**Interaction cycle:** Retrieve episodic + semantic memories -> inject into working
memory -> execute task -> persist new episodic memory, optionally update semantic memory.

---

### 6. RAG Patterns

**Naive RAG.** Embed query, vector search top-k, inject into prompt, generate. Fast but
misses information requiring cross-document reasoning.

**Multi-Hop RAG.** Iterative retrieval: retrieve, reason about gaps, reformulate query,
retrieve again until sufficient context is gathered (Trivedi et al. 2023). ReAct applied
to retrieval.

**Self-RAG (Asai et al. 2024).** The model emits reflection tokens evaluating whether
retrieval is needed, whether passages are relevant, and whether output is supported by
evidence. Reduces unnecessary retrieval and hallucination simultaneously.

**Corrective RAG (Yan et al. 2024).** An evaluator scores retrieved documents. Below a
confidence threshold, the system falls back to web search rather than generating from
poor context.

| Pattern | Use When | Latency | Accuracy |
|---------|----------|---------|----------|
| Naive RAG | Simple factual lookup | Low | Moderate |
| Multi-Hop RAG | Questions spanning multiple documents | High | High |
| Self-RAG | Variable query types, hallucination-sensitive | Moderate | High |
| Corrective RAG | Knowledge base may have gaps | Moderate | High |

---

### 7. Agent Safety and Control

**The control problem.** An agent with tool access can modify files, execute code, make
network requests, and alter system state. Safety must address: preventing harmful actions,
ensuring human oversight, enabling graceful recovery.

**Sandboxing.** Constrain filesystem access (designated directories only), network access
(domain allowlists), resource consumption (CPU/memory/token budgets), and execution time
(hard timeouts on all tool calls).

**Approval gates.** Define criticality tiers:

| Tier | Actions | Approval |
|------|---------|----------|
| 0 (Read) | Search, query | None |
| 1 (Write) | Create/modify files | Auto-approve |
| 2 (Deploy) | Push, deploy, infra changes | Explicit human approval |
| 3 (Irreversible) | Delete data, financial transactions | Explicit + confirmation |

PX1000's COMMIT RULE (every brain asks before committing) is a universal Tier 2 gate.

**Output validation.** Schema conformance, content filtering (no credential leakage),
consistency checking, confidence thresholds surfaced to users.

**Kill switches.** Every system must support immediate halt, state rollback to last
known-good, and a complete immutable audit trail for forensic analysis.

---

### 8. Brain Architecture Principles

**Frozen guidance.** Governing documents (`CLAUDE.md`, `Constitution.md`) are read-only
during execution. An agent cannot rewrite its own constraints. Amendments require human
approval. This is non-negotiable--if an agent can edit its own rules, no safety
guarantee holds.

**Separation of concerns.** Each brain encapsulates one domain. Engineering does not make
design decisions; Design does not write deploy scripts. Out-of-domain tasks delegate to
the appropriate specialist. This mirrors bounded contexts in microservices.

**Governance stack.** A hierarchy of constraints where higher levels override lower:
Constitution > Governance > Modes > Score > Checklist > User Request. Analogous to
constitutional law superseding statutory law. The agent refuses requests that violate
higher-authority rules and explains why.

**Institutional memory as architecture.** PX1000 mandates `Solutions/SolutionIndex.md`
and `Memory/ExperienceLog.md` in every brain. Every solved problem becomes a retrievable
precedent, preventing knowledge loss and redundant work across sessions.

---

### 9. Evaluation of Agent Systems

**Task completion:** Success rate (binary or graded), partial credit for multi-step
tasks, goal-conditioned evaluation (correct outcome regardless of path).

**Tool use efficiency:** Total tool calls (fewer = more efficient reasoning), tool call
accuracy (useful results vs. errors), unnecessary retrieval rate in RAG.

**Reasoning quality:** Thought trace coherence, grounding rate (claims supported by
evidence), hallucination rate (unsupported or contradicted claims).

**Safety metrics:** Constraint violation rate, graceful recovery rate, audit completeness.

**Benchmarks:** SWE-bench (Jimenez et al. 2024) for software engineering, GAIA (Mialon
et al. 2023) for general assistants, AgentBench (Liu et al. 2023) for multi-environment.

---

## Practical Implications

1. Default to ReAct for general-purpose agents--best balance of reasoning and grounding.
2. Use Plan-and-Execute only when subtask independence is high.
3. Choose orchestrator for clear authority hierarchies; pipeline for sequential workflows;
   debate when diversity of perspective outweighs speed.
4. Invest in tool schema design. Bad tool interfaces degrade performance more than bad prompts.
5. Treat the context window as the scarcest resource. Irrelevant tokens are noise.
6. Implement all three memory systems from day one. Retrofitting is costly.
7. Start with Naive RAG; graduate to Self-RAG or CRAG only with empirical evidence.
8. Enforce approval gates at design time, not as afterthoughts.
9. Log every action. Debugging without traces is nearly impossible.
10. Evaluate on task completion, not intermediate metrics.
11. Frozen guidance is non-negotiable. Read-only governance during execution.
12. Build kill switches before you need them.

---

## Common Misconceptions

**"More tools = more capable."** False. Performance peaks at 10-15 well-designed tools
and declines with additional tools due to selection confusion.

**"Longer context windows eliminate RAG."** False. Stuffing 200K tokens degrades
reasoning. Retrieval filters; the context window reasons.

**"Chain-of-thought and ReAct are the same."** No. CoT is internal only. ReAct
interleaves reasoning with environmental actions and observations.

**"Multi-agent is always better."** Multi-agent introduces coordination overhead. A
single well-prompted agent with good tools often outperforms a poorly coordinated swarm.

**"Agents can safely self-improve by editing their own prompts."** The most dangerous
misconception. Self-modifying prompts can remove safety constraints and diverge from
designer intent. Frozen guidance exists for this reason.

**"Agent memory is just a vector database."** Vector stores are one implementation of
semantic memory. They do not address working memory management or episodic memory.

---

## Further Reading

**Foundational:** Yao et al. (2023) "ReAct" *ICLR* [2210.03629]; Wei et al. (2022)
"Chain-of-Thought" *NeurIPS* [2201.11903]; Shinn et al. (2023) "Reflexion" *NeurIPS*
[2303.11366].

**RAG:** Asai et al. (2024) "Self-RAG" *ICLR* [2310.11511]; Yan et al. (2024)
"Corrective RAG" [2401.15884]; Trivedi et al. (2023) "Interleaving Retrieval with CoT"
*ACL* [2212.10509].

**Multi-Agent:** Du et al. (2023) "Multiagent Debate" [2305.14325]; Wu et al. (2023)
"AutoGen" [2308.08155].

**Evaluation:** Jimenez et al. (2024) "SWE-bench" *ICLR* [2310.06770]; Liu et al.
(2023) "AgentBench" *ICLR* [2308.03688]; Mialon et al. (2023) "GAIA" [2311.12983].

**Cognitive Science:** Tulving (1972) "Episodic and Semantic Memory" Academic Press;
Baddeley (2000) "Episodic Buffer" *Trends in Cognitive Sciences* 4(11).

**Safety:** Kinniment et al. (2024) "Evaluating LM Agents on Autonomous Tasks"
[2312.11671]; Ruan et al. (2024) "Risks of LM Agents" [2309.15817].

---

*Part of the PX1000 Engineering Brain pattern library. Governed by the Engineering Brain
authority hierarchy. Update only through the standard governance process.*
