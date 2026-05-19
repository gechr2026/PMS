---
title: Compounding artifact
type: concept
created: 2026-05-19
updated: 2026-05-19
tags: [pkm, llm, thesis]
sources: [llm-wiki-idea]
---

# Compounding artifact

## Definition

The central thesis of the [[llm-wiki-pattern]]: a knowledge base that **gets richer with every source added and every question asked**, because cross-references, contradictions, and syntheses are persisted into the wiki rather than re-derived each time.[^src1]

## Mechanism

- Each ingest is integrated, not just indexed. Entity pages are updated, summaries revised, contradictions flagged.[^src1]
- Each useful query, when refiled, becomes a new page that future queries can reuse.
- The maintenance burden that traditionally kills wikis is borne by the LLM, which "doesn't get bored, doesn't forget to update a cross-reference, and can touch 15 files in one pass."[^src1]
- Result: the wiki **stays maintained**, so additions compound rather than fragment.

## Contrast

The compounding property is precisely what pure RAG lacks. See [[rag-vs-persistent-wiki]].

## Why humans abandon wikis

The source's diagnosis: "the maintenance burden grows faster than the value."[^src1] Wikis fail because the bookkeeping (cross-references, summary currency, contradiction tracking) scales worse than the reading and thinking. LLMs flip this — the maintenance cost approaches zero, so the value compounds unimpeded.

## Implications

> Synthesis: If true, this means the long-run quality of an LLM-wiki depends more on **ingest discipline and lint frequency** than on any single page's quality. A noisy ingest that mis-files an entity will distort future cross-links for every subsequent source touching that entity. The lint operation in [[ingest-query-lint]] is therefore not optional — it is the garbage collector that lets the artifact remain healthy as it grows.

## Related

- [[llm-wiki-pattern]] — the broader pattern.
- [[rag-vs-persistent-wiki]] — the contrast that motivates compounding.
- [[memex]] — Vannevar Bush's vision of compounding personal knowledge; see [[vannevar-bush]].

## Sources

[^src1]: [[sources/llm-wiki-idea]]
