# AI Brain Patterns

## Overview

This directory contains reusable architectural patterns for common AI system implementations. Each pattern provides a complete blueprint including architecture, implementation guidance, configuration recommendations, evaluation criteria, and production considerations. Patterns are designed to be composed -- a production AI system typically combines multiple patterns.

---

## Available Patterns

### 1. RAG Implementation Pattern (`rag_implementation_pattern.md`)

A complete pattern for building retrieval-augmented generation systems. Covers document ingestion, chunking strategies, embedding selection, vector storage, retrieval and reranking, context assembly, and generation. Includes production considerations for monitoring, cost optimization, and quality evaluation.

**Use When**: Building a system that needs to answer questions based on a specific document corpus, knowledge base, or dataset.

**Key Decisions**: Chunk size, embedding model, vector database, reranking strategy, context window budget.

### 2. Agent Pattern (`agent_pattern.md`)

A complete pattern for building autonomous AI agents that reason, plan, and execute actions using tools. Covers agent loop design, tool integration, memory management, error handling, and guardrails.

**Use When**: Building a system that needs to accomplish multi-step tasks autonomously, such as research assistants, coding agents, or workflow automation.

**Key Decisions**: Planning algorithm, tool set design, memory architecture, guardrail placement.

### 3. LLM Integration Pattern (`llm_integration_pattern.md`)

A complete pattern for integrating LLM capabilities into existing applications. Covers API integration, streaming, caching, fallback strategies, model routing, and observability.

**Use When**: Adding AI capabilities (summarization, classification, generation, extraction) to an existing application.

**Key Decisions**: Model selection, caching strategy, fallback chain, cost management approach.

---

## How to Use Patterns

1. **Identify the Primary Pattern**: Which pattern most closely matches your use case?
2. **Review the Complete Pattern**: Read through all sections, noting decisions that apply to your context.
3. **Customize for Your Domain**: Adapt the pattern's recommendations to your specific requirements, constraints, and infrastructure.
4. **Compose Patterns**: Most production systems combine multiple patterns. A RAG system may also use the LLM integration pattern for its API layer.
5. **Evaluate Against Pattern Criteria**: Use the evaluation criteria in each pattern to measure your implementation.

---

## Pattern Naming Convention

- `*_pattern.md` -- Complete architectural pattern
- Patterns reference modules in the numbered directories for detailed technical content
- Patterns reference templates in the Templates directory for standardized artifacts

---

## Contributing New Patterns

When creating a new pattern, include:
1. Problem statement (what problem does this pattern solve)
2. Architecture diagram
3. Component descriptions
4. Configuration recommendations
5. Implementation guidance
6. Evaluation criteria
7. Production considerations
8. Common pitfalls and mitigations
