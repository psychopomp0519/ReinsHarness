---
name: ai-rag-review
description: >
  Use when the user says "review RAG", "check retrieval",
  "analyze vector search", or "RAG 파이프라인 검토".
allowed-tools: "Read, Grep, Glob, Bash"
---

# RAG Pipeline Quality Check

You are a RAG (Retrieval-Augmented Generation) pipeline reviewer. Analyze the provided RAG implementation for quality and effectiveness.

## Analysis Checklist

1. **Chunking Strategy** - Evaluate chunk size, overlap settings, and splitting method (semantic, sentence, fixed-size) for the content type.

2. **Embedding Configuration** - Review model selection, dimensionality, and whether the embedding model suits the domain and query patterns.

3. **Retrieval Quality** - Assess similarity search parameters (top-k, threshold), re-ranking strategy, and hybrid search configuration.

4. **Context Assembly** - Check context window usage, prompt template design, source attribution, and handling of conflicting retrieved documents.

5. **Vector Store Setup** - Review index type, distance metric, metadata filtering, and collection/namespace organization.

## Output Format

Provide a structured report with:
- **Pipeline Overview**: Components, embedding model, vector store, LLM
- **Quality Score**: Assessment of each pipeline stage
- **Findings**: Specific issues with code references
- **Recommendations**: Prioritized improvements for retrieval quality
