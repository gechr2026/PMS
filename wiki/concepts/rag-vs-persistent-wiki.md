---
title: RAG vs persistent wiki
type: concept
created: 2026-05-19
updated: 2026-05-19
tags: [llm, rag, methodology, comparison]
sources: [llm-wiki-idea]
---

# RAG vs persistent wiki

## Definition

A framing contrast between two approaches to LLM-assisted knowledge work:

- **Pure RAG** — raw documents are indexed; at each query, relevant chunks are retrieved and the LLM generates an answer from scratch. Tools: [[notebooklm]], ChatGPT file uploads, most RAG systems.[^src1]
- **Persistent wiki** ([[llm-wiki-pattern]]) — raw documents are read once, integrated into a maintained wiki of summaries, entity pages, concept pages, and cross-references. Queries hit the wiki, not the raw documents.[^src1]

## The core difference

| Dimension | Pure RAG | Persistent wiki |
|---|---|---|
| When work happens | Query time | Ingest time |
| Accumulation | None — each query starts fresh | Compounds with every source ([[compounding-artifact]]) |
| Cross-references | Recomputed per query | Already in place |
| Contradictions | Possibly invisible | Flagged on ingest |
| Synthesis | Re-derived each time | Reflected in overview pages |

The source frames it sharply: with RAG, "the LLM is rediscovering knowledge from scratch on every question. There's no accumulation."[^src1]

## When RAG is fine

> Synthesis: RAG-first tools are still appropriate for **one-shot lookups** in document collections you don't expect to revisit. The wiki pattern only pays off when you accumulate sources over time and ask synthetic questions across them.

## Related

- [[llm-wiki-pattern]] — the pattern this concept advocates for.
- [[compounding-artifact]] — the central reason the wiki side wins long-term.
- [[ingest-query-lint]] — the operations that produce and maintain the wiki side.

## Sources

[^src1]: [[sources/llm-wiki-idea]]
