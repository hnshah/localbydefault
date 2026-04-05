# Grok — Verified Citation Catalog (received)

Source: Hiten-shared Grok output: “Entire Verified Citation Catalog for localbydefault Research” (April 2026).

## 1) Landscape projects

### LLM gateways / proxies
- LiteLLM — https://github.com/BerriAI/litellm (Grok claims 42.2k stars, active MCP gateway work; MCP docs: https://docs.litellm.ai/docs/mcp)
- Bifrost (maximhq) — https://github.com/maximhq/bifrost (Grok claims <11µs overhead, 5k+ RPS; supports Ollama)

### Model routing / route-to-cheapest
- RouteLLM — https://github.com/lm-sys/RouteLLM (learned routers; includes local routing examples)
- ClawRouter — https://github.com/BlockRunAI/ClawRouter (OpenClaw router; <1ms, 92% cost reduction claim)

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

## 2) Competitive gaps / silent fallback citations

- LlamaIndex silent OpenAI fallback in air-gapped/local setups — https://github.com/run-llama/llama_index/issues/20912
- OpenClaw subagent silent cloud fallback (missing Ollama creds) — https://github.com/openclaw/openclaw/issues/43945
- OpenClaw timeout → silent cloud — https://github.com/openclaw/openclaw/issues/43946
- Ollama GPU-to-CPU silent fallback — https://github.com/ollama/ollama/issues/14258

Claim: No project enforces strict “local-by-default + explicit escalation + mandatory audit + no-silent-fallback”.

## 3) Developer pain evidence (partial list received)

HN:
- “LLM-use – cost-effective LLM orchestrator” — https://news.ycombinator.com/item?id=47073778
- “The unreasonable effectiveness of an LLM agent loop” — https://news.ycombinator.com/item?id=43998472
- “Improving 15 LLMs at Coding” — https://news.ycombinator.com/item?id=46988596

Notes:
- Grok claims all links/stats were verified as of April 2026.
- We still need to *locally* re-verify star counts/claims and extract the exact quotes we want to use.
