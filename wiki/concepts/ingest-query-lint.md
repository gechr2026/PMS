---
title: Ingest / Query / Lint
type: concept
created: 2026-05-19
updated: 2026-05-19
tags: [workflow, pkm, llm]
sources: [llm-wiki-idea]
aliases: ["the three operations"]
---

# Ingest / Query / Lint

## Definition

The three operations that constitute the working cycle of an [[llm-wiki-pattern]] system.[^src1]

## Ingest

- Human drops a source into `raw/` and asks the LLM to process it.[^src1]
- LLM reads the source, discusses takeaways with the human, then writes:
  - A summary page in `wiki/sources/`.
  - Updates to relevant entity and concept pages across the wiki.
  - An entry in `index.md`.
  - A log entry in `log.md`.
- A single source might touch 10–15 wiki pages.[^src1]
- This wiki's preferred mode is **interactive** (one source at a time, discussion first). Batch ingest is possible but loses the curation step.[^src1]

## Query

- Human asks a question; LLM searches the wiki (starting with `index.md`), reads candidates, synthesizes an answer with citations.[^src1]
- Answers can take any form: markdown page, comparison table, slide deck (Marp), chart, canvas.[^src1]
- **Key insight**: good answers should be **filed back into the wiki**, not lost to chat history. The pattern wants synthesized insights to compound just like ingested sources.[^src1]

## Lint

- A periodic health check, run when the human asks.[^src1]
- Looks for: contradictions between pages, stale claims newer sources have superseded, orphan pages (no inbound wikilinks), important concepts mentioned but lacking their own page, missing cross-references, data gaps that could be filled with a web search.[^src1]
- The LLM is also expected to suggest **new questions to investigate and new sources to look for** during lint — the wiki should generate its own to-do list.[^src1]

## Why this cycle

> Synthesis: Ingest builds the artifact, query exploits it, lint repairs it. Without lint, entropy wins as the wiki grows — orphan pages and contradictions accumulate faster than ingest can fix them. Without query-refile, the wiki becomes write-only and misses the chance to capture the most valuable synthesis (the one a human actually asked for).

## Related

- [[llm-wiki-pattern]] — the pattern this cycle drives.
- [[three-layer-architecture]] — the layers this cycle moves information across.
- [[compounding-artifact]] — what the cycle produces over time.

## Sources

[^src1]: [[sources/llm-wiki-idea]]
