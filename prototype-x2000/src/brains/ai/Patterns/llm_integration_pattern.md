# LLM Integration Pattern

## Pattern Summary

The LLM Integration pattern provides a production-grade architecture for incorporating large language model capabilities into existing applications. This covers the complete integration stack from API communication through reliability engineering to cost management, providing a blueprint for applications that use LLMs for tasks such as text generation, classification, extraction, summarization, and transformation.

---

## 1. Problem Statement

An existing application needs to add AI-powered capabilities (generation, classification, extraction, or transformation) using one or more LLM providers. The integration must handle the realities of production: variable latency, provider outages, cost management, quality monitoring, and model version changes.

**Symptoms Indicating You Need This Pattern**:
- You are adding AI features to an existing application
- You need reliable, cost-effective LLM API usage at scale
- You want to avoid vendor lock-in to a single model provider
- You need to balance quality, latency, and cost across different use cases

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│                                                         │
│  Feature A ──┐                                          │
│  Feature B ──┤──→ [AI Service Layer]                    │
│  Feature C ──┘         │                                │
│                        v                                │
│              ┌─────────────────┐                        │
│              │   AI GATEWAY    │                        │
│              │                 │                        │
│              │ ┌─────────────┐ │                        │
│              │ │   Router    │ │                        │
│              │ └──────┬──────┘ │                        │
│              │        │        │                        │
│              │ ┌──────┴──────┐ │                        │
│              │ │    Cache    │ │                        │
│              │ └──────┬──────┘ │                        │
│              │        │        │                        │
│              │ ┌──────┴──────┐ │                        │
│              │ │  Fallback   │ │                        │
│              │ └──────┬──────┘ │                        │
│              │        │        │                        │
│              │ ┌──────┴──────┐ │                        │
│              │ │ Observability│ │                        │
│              │ └─────────────┘ │                        │
│              └────────┬────────┘                        │
│                       │                                 │
└───────────────────────┼─────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
     ┌────┴────┐  ┌────┴────┐  ┌────┴────┐
     │Anthropic│  │ OpenAI  │  │ Custom  │
     │  API    │  │  API    │  │ Model   │
     └─────────┘  └─────────┘  └─────────┘
```

---

## 3. Component Specifications

### 3.1 AI Service Layer

**Responsibility**: Provide a clean interface between application features and the AI gateway. Application code calls the AI service layer with business-level abstractions, not model-level details.

**Interface Design**:
```python
class AIService:
    async def classify(self, text: str, categories: list[str]) -> Classification:
        """Classify text into one of the given categories."""

    async def summarize(self, text: str, max_length: int) -> Summary:
        """Summarize text to the given maximum length."""

    async def extract(self, text: str, schema: dict) -> ExtractedData:
        """Extract structured data from text according to schema."""

    async def generate(self, prompt: str, context: str) -> GeneratedText:
        """Generate text based on prompt and context."""
```

Each method internally constructs the appropriate prompt, selects the model, and handles the response.

### 3.2 Router

**Responsibility**: Select the optimal model for each request based on task type, complexity, and cost constraints.

**Routing Rules**:
| Task Type | Default Model | Rationale |
|-----------|--------------|-----------|
| Classification | Haiku/Mini | Simple task, optimize for cost and speed |
| Extraction | Sonnet/4o | Needs accuracy for structured output |
| Summarization | Haiku/Mini | Well-defined task, smaller models handle well |
| Generation (simple) | Sonnet/4o | Balance of quality and cost |
| Generation (complex) | Opus/4o | Quality-critical, worth higher cost |
| Safety check | Haiku/Mini | Low-latency screening |

**Dynamic Routing**: Override default routing based on:
- Input complexity (longer/more complex inputs may need larger models)
- User tier (premium users get higher-quality models)
- Budget remaining (downgrade models when approaching budget limits)
- Time of day (use cheaper models during peak hours if needed)

### 3.3 Cache Layer

**Responsibility**: Reduce cost and latency by serving cached responses for repeated or similar requests.

**Caching Strategy**:
| Cache Type | Hit Criteria | TTL | Expected Hit Rate |
|-----------|-------------|-----|-------------------|
| Exact match | Identical prompt hash | 24h | 5-40% (depends on use case) |
| Semantic | Embedding similarity > 0.95 | 12h | 10-30% additional |

**Cache Key Components**: prompt_hash + model_id + temperature + max_tokens + tool_config_hash.

**Cache Bypass**: Requests with temperature > 0 and creative/generative tasks should bypass semantic cache (same input legitimately produces different outputs).

### 3.4 Fallback Manager

**Responsibility**: Ensure requests succeed even when the primary model provider is unavailable.

**Fallback Chain Configuration**:
```yaml
fallback_chains:
  default:
    - provider: anthropic
      model: claude-sonnet-4-20250514
      timeout: 30s
      retries: 2
    - provider: openai
      model: gpt-4o
      timeout: 30s
      retries: 1
    - provider: cache
      strategy: nearest_semantic_match
    - provider: template
      strategy: rule_based_fallback

  classification:
    - provider: anthropic
      model: claude-haiku-4-20250514
      timeout: 10s
      retries: 2
    - provider: openai
      model: gpt-4o-mini
      timeout: 10s
      retries: 1
```

**Circuit Breaker**: When a provider fails > 50% of requests in a 5-minute window, temporarily route all traffic to the next provider in the chain. Probe the failed provider every 30 seconds. Restore when 3 consecutive probes succeed.

### 3.5 Observability Layer

**Responsibility**: Log, monitor, and alert on all AI interactions.

**Per-Request Logging**:
```json
{
  "request_id": "uuid",
  "timestamp": "ISO 8601",
  "feature": "ticket_classification",
  "model": "claude-haiku-4-20250514",
  "provider": "anthropic",
  "input_tokens": 245,
  "output_tokens": 32,
  "latency_ms": 340,
  "cache_hit": false,
  "fallback_used": false,
  "cost_usd": 0.0001,
  "quality_score": null,
  "error": null
}
```

**Dashboards**:
- Real-time: Request rate, latency P50/P95/P99, error rate, cost rate
- Daily: Total cost, cost by feature, cost by model, cache hit rate
- Weekly: Quality trends, model comparison, optimization opportunities

---

## 4. Streaming Implementation

### 4.1 Server-Side

```python
async def stream_generation(request):
    async for chunk in ai_gateway.stream(request):
        yield ServerSentEvent(data=chunk.text)
        accumulated_text += chunk.text

    # After stream completes:
    log_request(request, accumulated_text)
    update_cache(request, accumulated_text)
```

### 4.2 Client-Side

```typescript
const eventSource = new EventSource('/api/generate');
let fullResponse = '';

eventSource.onmessage = (event) => {
    fullResponse += event.data;
    updateUI(fullResponse);
};

eventSource.onerror = () => {
    if (fullResponse.length === 0) {
        showError('Generation failed. Please try again.');
    }
    eventSource.close();
};
```

---

## 5. Cost Management

### 5.1 Budget Configuration

```yaml
budgets:
  monthly_total: 5000.00
  daily_limit: 200.00
  per_user_daily: 2.00
  per_request_max: 0.50

  alerts:
    - threshold: 0.50  # 50% of monthly budget
      action: notify_team
    - threshold: 0.75
      action: notify_team + downgrade_models
    - threshold: 0.90
      action: notify_leadership + enforce_caching
    - threshold: 1.00
      action: block_non_essential + emergency_alert
```

### 5.2 Cost Optimization Strategies

| Strategy | Implementation | Expected Savings |
|----------|---------------|-----------------|
| Prompt compression | Minimize system prompt length | 5-15% |
| Model routing | Use cheapest adequate model | 20-40% |
| Caching | Exact + semantic cache | 10-40% |
| Output limits | Set appropriate max_tokens | 5-15% |
| Batch processing | Use batch API for async tasks | 40-50% |

---

## 6. Quality Assurance

### 6.1 Automated Quality Checks

For each response, run automated checks before delivery:
- **Format Validation**: Output matches expected schema/format
- **Length Check**: Output within expected length range
- **Safety Check**: Content safety classifier passes
- **Consistency Check**: Output does not contradict known facts (for factual tasks)

### 6.2 Quality Monitoring

Sample 1-5% of production requests for quality evaluation:
- Use LLM-as-judge to score sampled outputs
- Track quality scores over time
- Alert on quality degradation
- Correlate quality changes with model updates or prompt changes

---

## 7. Quality Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Availability | > 99.9% | Successful requests / total requests |
| Latency P95 | < 3s (non-streaming) | Request timing |
| TTFT P95 | < 500ms (streaming) | Time to first token |
| Cache Hit Rate | > 20% | Cache hits / total requests |
| Format Compliance | > 99% | Automated validation |
| Cost per Request (avg) | < $0.02 | Cost tracking |

---

## 8. Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| No fallback | Outage at provider = outage for users | Implement multi-provider fallback |
| No caching | Unnecessarily high costs | Add exact + semantic caching |
| Hardcoded model | Cannot switch providers | Abstract behind unified interface |
| No cost tracking | Budget surprises | Implement per-request cost logging |
| No quality monitoring | Silent quality degradation | Sample and evaluate production outputs |
| Synchronous only | Poor UX for generation tasks | Implement streaming |

---

## 9. Implementation Checklist

- [ ] AI service layer with clean business-level interface
- [ ] Model router with task-based routing rules
- [ ] Exact match cache implemented
- [ ] Semantic cache implemented (if applicable)
- [ ] Multi-provider fallback chain configured
- [ ] Circuit breaker for provider failures
- [ ] Streaming support for generation tasks
- [ ] Per-request logging with cost tracking
- [ ] Budget limits and alerts configured
- [ ] Quality monitoring pipeline
- [ ] Dashboards for cost, latency, and quality
- [ ] Format validation for all structured outputs
- [ ] Content safety checks on outputs

---

*See `07_applications/ai_integration.md` for detailed technical content on each component.*
