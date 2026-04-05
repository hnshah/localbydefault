# Quote Catalog (WIP) — localbydefault

Goal: collect **verbatim quotes** (and short excerpts) from primary sources that demonstrate:
- silent cloud fallback pain
- cost shocks
- cloud instability
- MCP/tool context bloat
- DIY local→cloud escalation patterns

Each entry must include: source type, URL, date (if available), and the quote.

---

## A) Silent cloud fallback (policy wedge)

### OpenClaw — model override ignored (silent fallback)
- **Source:** GitHub issue
- **URL:** https://github.com/openclaw/openclaw/issues/13159
- **Date:** 2026-02-10
- **Quote:**
  > "Model overrides are silently ignored across all isolated session creation paths. Both `sessions_spawn` and isolated cron jobs accept the `model` parameter (returning `modelApplied: true`) but always spawn sessions with the configured default primary model instead of the requested model."
  
  > "This affects local Ollama models and likely all non-default model overrides, resulting in unexpected API costs when users expect to use free local models for background tasks."
  
  > "Impact: Users expecting $0 cost for local model background tasks are instead charged at default model API rates (~$75-150/month for hourly checks)."
- **Notes:** This is the canonical “no silent cloud fallback” wedge example.

### LlamaIndex — silent OpenAI fallback in local/air-gapped
- **Source:** GitHub issue
- **URL:** https://github.com/run-llama/llama_index/issues/20912
- **Date:** 2026-03-08
- **Quote:**
  > "When instantiating components like `VectorStoreIndex` or `QueryFusionRetriever` without explicitly passing the `llm` or `embed_model` kwargs, LlamaIndex silently falls back to OpenAI's models (`gpt-3.5-turbo` and `text-embedding-ada-002`)."
  
  > "...it creates a critical security/privacy flaw for developers building Local-First, Air-Gapped, or Privacy-Strict architectures... If a developer misses injecting the local LLM into a nested retriever, the framework will silently attempt to send the user's private data/vectors to `api.openai.com`."
  
  > "If an old `OPENAI_API_KEY` happens to exist in the system's environment variables, the data leak occurs completely silently without any warnings."

### Ollama — GPU→CPU silent fallback
- **Source:** GitHub issue
- **URL:** https://github.com/ollama/ollama/issues/14258
- **Date:** 2026-02-14
- **Quote:**
  > "When Ollama cannot fit a model (or any layers) into GPU VRAM, it silently falls back to CPU execution. Users experience unexpected slowness and have no way to know why — the only indication is buried in debug-level logs that are invisible by default."
  
  > "This is arguably the single most common source of user confusion in Ollama."

---

## B) MCP tool/context bloat (second wedge)

### Claude Code — lazy-loading tools request
- **Source:** GitHub issue
- **URL:** https://github.com/anthropics/claude-code/issues/16826
- **Date:** 2026-01-08
- **Quote:**
  > "Add support for lazy-loading MCP servers so tools are only registered when needed, rather than loading all tools at conversation start. This would dramatically reduce token consumption for users with multiple MCP servers configured."
  
  > "Real-world impact: In a typical debugging session, I only used 6 tools (~6.6k tokens) but paid for 150k tokens of tool definitions. That's 95% waste."

### Reddit — MCP tool responses blow context
- **Source:** Reddit thread
- **URL:** https://www.reddit.com/r/LLMDevs/comments/1qduann
- **Quote:** _TBD (extract exact lines)_

### MCP SEP-1576 — mitigating token bloat
- **Source:** GitHub issue/spec discussion
- **URL:** https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1576
- **Quote:** _TBD (extract exact lines)_

---

## C) DIY routing patterns

### RouteLLM — local routing example
- **Source:** GitHub doc
- **URL:** https://github.com/lm-sys/RouteLLM/blob/main/examples/routing_to_local_models.md
- **Quote:** _TBD (extract exact lines)_

---

## D) Local-first desire

### Medium — “Local by Default”
- **Source:** Medium article
- **URL:** https://medium.com/@hekleiman/local-by-default-why-mac-developers-should-run-llms-with-ollama-and-when-not-to-add342d9eb11
- **Quote:** _TBD (extract exact lines)_

---

## E) Cloud instability

### Claude outages (examples)
- **Source:** Reddit / dev.to
- **URL:** https://dev.to/adioof/claude-went-down-for-2-days-and-devs-forgot-how-to-code-6me
- **Quote:** _TBD (extract exact lines)_

---

## Extraction status

- [ ] Pull exact quotes from the core GitHub issues (13159, 20912, 14258, 16826)
- [ ] Pull exact quotes from key MCP bloat posts
- [ ] Add 30+ quotes total across categories
