---
title: Three-layer architecture (Raw / Wiki / Schema)
type: concept
created: 2026-05-19
updated: 2026-05-19
tags: [architecture, pkm, llm]
sources: [llm-wiki-idea]
---

# Three-layer architecture (Raw / Wiki / Schema)

## Definition

The structural decomposition of an [[llm-wiki-pattern]] system into three distinct layers, each with a different owner and mutation rule.[^src1]

## The layers

### 1. Raw sources

- **What**: Articles, papers, images, data files — the human's curated input collection.[^src1]
- **Owner**: Human (curator).
- **Mutation rule**: **Immutable.** The LLM reads from this layer but never modifies it.[^src1]
- **In this wiki**: `raw/` (subfolders: `articles/`, `books/`, `papers/`, `notes/`, `assets/`).

### 2. Wiki

- **What**: LLM-generated markdown pages — source summaries, entity pages, concept pages, comparisons, overviews, syntheses.[^src1]
- **Owner**: LLM (writes, updates, cross-references).
- **Mutation rule**: The LLM owns this layer entirely. The human reads it.[^src1]
- **In this wiki**: `wiki/` (subfolders: `sources/`, `entities/`, `concepts/`, `overviews/`).

### 3. Schema

- **What**: The config document (CLAUDE.md, AGENTS.md, etc.) that defines structure, conventions, and workflows.[^src1]
- **Owner**: Co-evolved by human and LLM together.
- **Mutation rule**: Changes are deliberate and discussed; this file is the contract.
- **In this wiki**: [CLAUDE.md](../../CLAUDE.md).

## Why the separation matters

> Synthesis: The immutability of raw and the schema-as-contract together prevent the LLM from inventing or losing primary sources, and prevent convention drift across sessions. Without layer 1, claims become unfalsifiable; without layer 3, conventions reset each conversation.

## Related

- [[llm-wiki-pattern]] — the pattern this architecture implements.
- [[ingest-query-lint]] — the operations that move information through these layers.

## Sources

[^src1]: [[sources/llm-wiki-idea]]
