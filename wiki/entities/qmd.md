---
title: qmd
type: entity
created: 2026-05-19
updated: 2026-05-19
tags: [tools, search, markdown]
sources: [llm-wiki-idea]
---

# qmd

A local search engine for markdown files, mentioned by the source as a good option once an LLM-maintained wiki grows beyond the scale where `index.md` alone suffices.[^src1]

## Capabilities (per source)

- **Hybrid search**: BM25 (lexical) + vector (semantic).[^src1]
- **LLM re-ranking** of results.[^src1]
- **On-device** — no external service dependency.[^src1]
- Available as both a **CLI** (LLMs can shell out to it) and an **MCP server** (LLMs use it as a native tool).[^src1]

## When to adopt

The source recommends sticking with `index.md`-driven navigation at small scale (~100 sources) and introducing proper search like qmd only when the wiki outgrows that.[^src1]

> Synthesis: For this wiki, qmd is not yet justified. Revisit after ~50 sources are ingested or when query latency / miss rate becomes a felt problem.

## Sources

[^src1]: [[sources/llm-wiki-idea]]
