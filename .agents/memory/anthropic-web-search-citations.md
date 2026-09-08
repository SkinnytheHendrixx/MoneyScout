---
name: Anthropic web-search citations
description: How to validate sources when Claude returns structured JSON after server-side web search.
---

Claude server-side web search can return populated `web_search_tool_result` blocks while attaching zero citations to the final text block when the requested output is strict JSON. Validate structured findings against authoritative URLs in the returned search-result blocks as well as citation metadata.

**Why:** A policy check received ten search results but zero text citations and zero findings when the search query drifted toward scraper vendors. A tightly policy-focused query plus result-block URL validation produced authoritative first-party findings.

**How to apply:** Keep searches tightly constrained by the task intent, retain the one-search/cost limits, apply authority checks to returned result URLs, and require each stored finding to match one of those approved URLs.