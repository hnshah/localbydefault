# Grok — Verified Citation Catalog (received)

Source: Hiten-shared Grok output: “Entire Verified Citation Catalog for localbydefault Research” (April 2026). This file aggregates the items shared so far.

> Note: Star counts and performance claims should be re-verified locally at time of publishing; links should be kept as primary sources.

---

## 1) Landscape projects

### LLM gateways / proxies
- LiteLLM — https://github.com/BerriAI/litellm (Grok: ~42k stars; MCP docs: https://docs.litellm.ai/docs/mcp)
- Bifrost (maximhq) — https://github.com/maximhq/bifrost

### Model routing / route-to-cheapest
- RouteLLM — https://github.com/lm-sys/RouteLLM (local routing example guide below)
- ClawRouter — https://github.com/BlockRunAI/ClawRouter

### Local inference orchestration
- Ollama — https://github.com/ollama/ollama
- vLLM — https://github.com/vllm-project/vllm

### Agent orchestration
- CrewAI — https://github.com/crewAIInc/crewAI

### MCP tool routers / progressive loading
- mcp-router — https://github.com/mcp-router/mcp-router
- MCP spec — https://modelcontextprotocol.io/

### Multimodal / other
- OpenClaw — https://github.com/openclaw/openclaw

---

## 2) Competitive gaps / silent fallback citations

- LlamaIndex silent OpenAI fallback in air-gapped/local setups — https://github.com/run-llama/llama_index/issues/20912
- OpenClaw subagent silent cloud fallback (missing Ollama creds) — https://github.com/openclaw/openclaw/issues/43945
- OpenClaw timeout → silent cloud — https://github.com/openclaw/openclaw/issues/43946
- Ollama GPU-to-CPU silent fallback — https://github.com/ollama/ollama/issues/14258

Claim: No project enforces strict “local-by-default + explicit escalation + mandatory audit + no-silent-fallback”.

---

## 3) Developer pain evidence (HN)

- “LLM-use – cost-effective LLM orchestrator” — https://news.ycombinator.com/item?id=47073778
- “The unreasonable effectiveness of an LLM agent loop” — https://news.ycombinator.com/item?id=43998472
- “Improving 15 LLMs at Coding” — https://news.ycombinator.com/item?id=46988596

---

## 4) Desire for local-first

- Medium — “Local by Default: Why Mac Developers Should Run LLMs with Ollama (and When Not To)” — https://medium.com/@hekleiman/local-by-default-why-mac-developers-should-run-llms-with-ollama-and-when-not-to-add342d9eb11

---

## 5) DIY routing patterns

- RouteLLM local Ollama guide — https://github.com/lm-sys/RouteLLM/blob/main/examples/routing_to_local_models.md

---

## 6) MCP tool/context bloat

- Reddit r/LLMDevs — “How do you handle MCP tool responses that blow past context limits?” — https://www.reddit.com/r/LLMDevs/comments/1qduann
- dev.to — “Too Many MCP Tools Make Agents Worse” — https://dev.to/deathsaber/too-many-mcp-tools-make-agents-worse-heres-how-i-fixed-it-44n2
- Medium — “When Too Many Tools Become Too Much Context (RAG-MCP)” — https://medium.com/@pankaj_pandey/when-too-many-tools-become-too-much-context-a-deep-dive-into-rag-mcp-9b628c8476d3
- MCP SEP-1576 — “Mitigating Token Bloat in MCP” — https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1576

---

## 7) X (Twitter) citations (IDs provided)

> Note: These are cited by post ID; verify content by fetching the tweet at time of publishing.

- @dan_biderman (Feb 2025) — Post ID 1894387622006722919
- @freeCodeCamp (Mar 2026) — Post ID 2039892497237971215
- @RoundtableSpace (Mar 2026) — Post ID 2033373940022665604
- @vzarytovskii (Mar 2026) — Post ID 2039064384366944330
- @arlanr (Oct 2025) — Post ID 1978170891751072171
- @goyalayus (Mar 2026) — Post ID 2038173094809145511
- @goon_nguyen (Nov 2025) — Post ID 1987720058504982561

---

## 8) Naming check

- “localbydefault” appears clean; only notable overlap mentioned is unrelated PostCSS plugin concept:
  - https://github.com/css-modules/postcss-modules-local-by-default

---

## 9) Notes

- Evidence density highest for: cost shocks + MCP bloat + silent fallbacks (matches wedge).
- Grok claims total unique citations 50+.
