---
title: LLM Wiki pattern
type: concept
created: 2026-05-19
updated: 2026-05-19
tags: [pkm, llm, methodology]
sources: [llm-wiki-idea]
aliases: ["LLM-maintained wiki", "Second brain pattern"]
---

# LLM Wiki pattern

## Definition

A pattern for building personal knowledge bases in which an LLM **incrementally builds and maintains a persistent wiki** of markdown files that sits between a human and their raw sources. The wiki is the compounding artifact; the LLM does the bookkeeping; the human curates and asks questions.[^src1]

## Mechanism

The pattern has three layers and three operations:

- **Layers** (see [[three-layer-architecture]]):
  1. Raw sources — immutable inputs.
  2. Wiki — LLM-owned markdown pages.
  3. Schema — a CLAUDE.md / AGENTS.md file encoding conventions and workflow.
- **Operations** (see [[ingest-query-lint]]):
  1. Ingest a new source → discuss → file pages.
  2. Query the wiki → synthesize → optionally refile good answers.
  3. Lint periodically for orphans, contradictions, gaps.

The central thesis for *why* the pattern works is [[compounding-artifact]]; the differentiator from existing tools is [[rag-vs-persistent-wiki]].

## Applicable contexts

The source lists five archetypal use cases:[^src1]

- **Personal** — goals, health, psychology, journaling, self-improvement.
- **Research** — multi-month topical deep dives with an evolving thesis.
- **Book companions** — chapter-by-chapter wikis with characters, themes, plot threads. [[tolkien-gateway]] is the aspirational model.
- **Business / team** — internal wikis fed by Slack, transcripts, meetings, calls.
- **Competitive analysis, due diligence, trip planning, course notes, hobby deep-dives.**

## Required props

- A capable LLM agent with file-system access ([Claude Code](https://claude.com/claude-code), Codex, OpenCode, etc.).
- A markdown front-end like [[obsidian]] for human browsing.
- A schema file (this wiki uses [CLAUDE.md](../../CLAUDE.md)).
- Optional: a markdown search engine like [[qmd]] once scale demands it.

## Critique / open questions

- Scale ceiling for `index.md`-only navigation is empirical — source claims ~100 sources but doesn't justify it.[^src1]
- Image-in-markdown handling is "clunky but works well enough" — friction worth tracking.[^src1]
- Lock-in to a specific LLM provider's conventions (CLAUDE.md vs AGENTS.md) is real; the schema file pattern mitigates but doesn't eliminate.

## Related

- Counter-example: [[notebooklm]] (and similar RAG-first products).
- Intellectual ancestor: [[memex]] (see [[vannevar-bush]]).
- Broader topic: [[personal-knowledge-management]].

## Sources

[^src1]: [[sources/llm-wiki-idea]]
