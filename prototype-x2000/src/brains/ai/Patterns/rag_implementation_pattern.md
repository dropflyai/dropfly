# RAG Implementation Pattern

## Pattern Summary

The Retrieval-Augmented Generation (RAG) pattern grounds LLM responses in specific, verifiable source documents. This pattern is the standard approach for building AI systems that answer questions about proprietary or domain-specific knowledge that is not in the model's training data.

---

## 1. Problem Statement

An application needs to provide accurate, sourced answers to questions about a specific knowledge base (documentation, policies, product catalogs, research papers, etc.). The LLM alone cannot answer these questions accurately because the information is proprietary, frequently updated, or too domain-specific.

**Symptoms Indicating You Need RAG**:
- The model hallucinates answers about your specific domain
- Answers are outdated because the model's training data is stale
- Users need citations and verifiable sources
- The knowledge base changes frequently and retraining is impractical

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    INGESTION PIPELINE                    │
│                                                         │
│  Documents → [Loader] → [Chunker] → [Embedder] → [DB]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    QUERY PIPELINE                        │
│                                                         │
│  Query → [Processor] → [Retriever] → [Reranker]        │
│                                          │              │
│                                          v              │
│                         [Context Assembly] → [LLM] → Response │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Document Loader

**Responsibility**: Convert source documents from their native format to clean text with metadata.

**Supported Formats**: PDF, DOCX, HTML, Markdown, plain text, CSV/JSON (structured data).

**Implementation**:
- Use format-specific parsers (pdf2text, mammoth for DOCX, BeautifulSoup for HTML)
- Extract metadata: title, author, creation date, section hierarchy
- Clean extracted text: remove boilerplate, fix encoding, normalize whitespace
- Handle errors gracefully: log unparseable documents, do not fail the pipeline

### 3.2 Chunker

**Responsibility**: Split documents into retrieval-sized units that are semantically coherent.

**Recommended Configuration**:
| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| Chunk size | 512 tokens | 256-1024 | Smaller for precise retrieval, larger for more context |
| Chunk overlap | 64 tokens | 0-128 | Prevents information loss at boundaries |
| Strategy | Recursive character | - | Split at paragraphs, then sentences, then words |

**Metadata per Chunk**: Source document ID, chunk index, section heading path, page number.

### 3.3 Embedder

**Responsibility**: Convert text chunks into dense vector representations for similarity search.

**Model Selection**:
| Model | Dimensions | Quality | Cost | Notes |
|-------|-----------|---------|------|-------|
| OpenAI text-embedding-3-large | 3072 | Excellent | $0.13/1M tokens | Best general-purpose |
| OpenAI text-embedding-3-small | 1536 | Good | $0.02/1M tokens | Cost-effective |
| Cohere embed-v3 | 1024 | Excellent | $0.10/1M tokens | Good multilingual |
| BGE-large-en | 1024 | Good | Free (self-hosted) | Privacy-preserving |

**Best Practice**: Use the same model for indexing and querying. Never mix embedding models in the same index.

### 3.4 Vector Database

**Responsibility**: Store and retrieve embeddings efficiently.

**Selection Guide**:
- < 100K chunks, simple setup: **Chroma** or **pgvector**
- 100K-10M chunks, managed: **Pinecone** (serverless)
- Any scale, open-source: **Weaviate** (self-hosted)
- Already using PostgreSQL: **pgvector**

### 3.5 Query Processor

**Responsibility**: Transform the user query for optimal retrieval.

**Pipeline**:
1. Intent classification (factual, comparative, exploratory)
2. Query expansion (add related terms)
3. Optional: HyDE (generate hypothetical answer, embed it)
4. Optional: Query decomposition (split complex query into sub-queries)

### 3.6 Retriever

**Responsibility**: Find the most relevant chunks for the processed query.

**Configuration**:
- Top-k: 10-20 candidates (will be reduced by reranker)
- Search type: Hybrid (dense + sparse) when available
- Metadata filters: Apply when query specifies time range, category, or source

### 3.7 Reranker

**Responsibility**: Re-score retrieved chunks using a more sophisticated model.

**Options**:
- Cohere Rerank: API-based, high quality, ~100ms latency
- Cross-encoder (self-hosted): Open-source, more control, requires GPU
- Skip reranking: Acceptable for simple use cases with low retrieval volume

**Configuration**: Rerank top-20 candidates, select top-5 for generation.

### 3.8 Context Assembler

**Responsibility**: Format retrieved chunks for injection into the LLM prompt.

**Context Template**:
```
## Relevant Information

The following passages are retrieved from the knowledge base. Use them to answer the user's question. If the passages do not contain sufficient information to answer, say so.

{for each chunk}
### Source: {document_title} (Section: {section_heading})
{chunk_content}

{end for}
```

**Token Budget**: Allocate 2000-6000 tokens for context, depending on model context window.

### 3.9 Generator (LLM)

**Responsibility**: Produce the final answer grounded in retrieved context.

**System Prompt Requirements**:
- Base answers on provided context only
- Cite sources for each claim
- Explicitly state when context is insufficient
- Do not introduce information not in the context

---

## 4. Quality Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Context Precision | > 0.8 | RAGAS or manual evaluation |
| Context Recall | > 0.7 | RAGAS with ground truth annotations |
| Faithfulness | > 0.9 | Claim verification against context |
| Answer Relevance | > 0.85 | LLM-as-judge evaluation |
| Format Compliance | > 0.95 | Citations present, correct format |
| Latency (P95) | < 5s | End-to-end measurement |

---

## 5. Production Considerations

### 5.1 Monitoring

- Track retrieval quality daily (sample and evaluate)
- Monitor latency per pipeline stage
- Alert on answer quality degradation
- Track cost per query

### 5.2 Data Freshness

- Implement incremental re-indexing for updated documents
- Set up change detection on source document stores
- Display "last updated" date in responses when relevant
- Alert on stale index (no updates in configured period)

### 5.3 Scaling

- Horizontal scaling of vector database for growing corpora
- Cache frequently retrieved chunks in memory
- Pre-compute embeddings for common queries
- Use async processing for non-real-time retrieval

---

## 6. Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Chunks too large | Low precision, irrelevant content | Reduce chunk size |
| Chunks too small | Missing context, incomplete answers | Increase chunk size or use parent retrieval |
| No reranking | Irrelevant chunks in context | Add cross-encoder reranker |
| Weak grounding prompt | Model ignores context, hallucinations | Strengthen system prompt with explicit grounding instructions |
| Stale index | Answers contain outdated information | Implement automated re-indexing |
| No citation | Users cannot verify answers | Add citation instructions to prompt |

---

## 7. Implementation Checklist

- [ ] Document loader handles all source formats
- [ ] Chunking strategy validated with retrieval quality metrics
- [ ] Embedding model selected and indexed
- [ ] Vector database deployed and populated
- [ ] Query processing pipeline implemented
- [ ] Reranking configured
- [ ] Generation prompt with grounding and citation instructions
- [ ] Evaluation dataset created (50+ query-answer pairs)
- [ ] Quality targets met on evaluation dataset
- [ ] Monitoring and alerting configured
- [ ] Incremental re-indexing automated
- [ ] Cost tracking implemented

---

*See `04_rag/` modules for detailed technical content on each component.*
