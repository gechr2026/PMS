---
title: "Source: LLM Wiki idea file"
type: source
created: 2026-05-19
updated: 2026-05-19
tags: [pkm, llm, methodology]
sources: [llm-wiki-idea]
aliases: ["LLM Wiki pattern article"]
---

# Source: LLM Wiki idea file

## Metadata

- **Author**: Unknown (shared as a copy-paste idea file for LLM agents)
- **Format**: Markdown article, ~2000 words
- **Raw path**: `raw/articles/llm-wiki-idea.md`
- **Ingested**: 2026-05-19

## Summary

- Proposes building a **persistent, LLM-maintained wiki** as a middle layer between raw sources and the user, replacing query-time RAG with a compounding knowledge artifact.
- Architecture has three layers: immutable **raw sources**, LLM-owned **wiki pages**, and a **schema file** (CLAUDE.md / AGENTS.md) defining conventions.
- Three operations cycle: **ingest** (read → discuss → file), **query** (search → answer → optionally refile), **lint** (orphans, contradictions, gaps).
- `index.md` + `log.md` are the navigation backbone, sufficient up to ~100 sources before search tools become necessary.
- Spiritual descendant of [[vannevar-bush]]'s 1945 [[memex]] — the maintenance problem Bush couldn't solve is now solved by LLMs that don't get bored.

## Key takeaways

- The **core distinction** is RAG-as-retrieval vs wiki-as-artifact: see [[rag-vs-persistent-wiki]].
- The **architecture** is described in [[three-layer-architecture]].
- The **workflow** is described in [[ingest-query-lint]].
- The **central thesis** — why this beats raw RAG — is [[compounding-artifact]].
- The article is **intentionally abstract**: the user and their LLM agent are expected to co-evolve the specifics.

## Entities introduced

- [[vannevar-bush]], [[memex]], [[obsidian]], [[qmd]], [[notebooklm]], [[tolkien-gateway]]
- Mentioned but not yet expanded: [[marp]], [[dataview]], [[obsidian-web-clipper]]

## Concepts introduced

- [[llm-wiki-pattern]], [[rag-vs-persistent-wiki]], [[three-layer-architecture]], [[ingest-query-lint]], [[compounding-artifact]]

## Overviews this contributes to

- [[personal-knowledge-management]]
