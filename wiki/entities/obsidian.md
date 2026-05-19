---
title: Obsidian
type: entity
created: 2026-05-19
updated: 2026-05-19
tags: [tools, pkm, markdown]
sources: [llm-wiki-idea]
---

# Obsidian

A local-first markdown editor designed around `[[wikilinks]]`. Recommended by the source article as the human-facing front-end for browsing an LLM-maintained wiki.[^src1]

## Role in the LLM Wiki pattern

- The LLM agent is open in one pane; Obsidian is open in another. The agent edits files; the human browses results in real time.[^src1]
- **Graph view** is the best way to see the wiki's overall shape — hubs, orphans, cluster structure.[^src1]

## Useful features mentioned

- [[obsidian-web-clipper]] — browser extension that converts web articles to markdown for fast source capture.
- [[marp]] plugin — generate markdown-based slide decks directly from wiki content.
- [[dataview]] plugin — query frontmatter to build dynamic tables and lists.
- Configurable attachment folder + a "Download attachments for current file" hotkey enables local image storage (recommended path: `raw/assets/`).[^src1]

## Caveat

LLMs cannot natively read markdown with inline images in one pass — the workaround is text-first reading, then viewing referenced images separately.[^src1]

## Sources

[^src1]: [[sources/llm-wiki-idea]]
