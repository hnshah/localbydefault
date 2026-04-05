# Grok feedback (ingested)

This note captures Grok’s key findings for incorporation into the `landscape.md` and `opportunity.md` docs.

## Key takeaways

- **Positioning:** localbydefault = local-first orchestration control plane that routes to local (Ollama/vLLM/MLX/OpenAI-compatible local servers) and escalates to cloud only when needed (quality, multimodal, latency, tool reliability). Target 60–95% cost reduction with auditable **no silent cloud fallback**.

- **Landscape:** LiteLLM (~42k+ stars) dominates gateways/proxies with routing/fallbacks and recent MCP support. RouteLLM/ClawRouter cover learned/cheapest routing. Gap: no project combines **strict local-by-default policy enforcement + explicit escalation + no-silent-fallback + audit** (+ deep OpenClaw/MCP integration) as the primary product.

- **Pain signals:** exploding agent costs (example: $638/6 weeks), MCP tool/context bloat (10k+ tokens), API instability/rate limits, widespread DIY local-triage → cloud-escalate.

- **Top 5 ownable ribbons:**
  1) Enforceable no-silent-cloud policy + audit
  2) MCP progressive tool gating
  3) Multimodal capability routing
  4) Local fleet pooling
  5) Continuous evaluation loop

## MVP proposal (architecture)

- OpenAI-compatible `/v1/chat/completions` endpoint (drop-in for OpenClaw/Cursor/etc.)
- MCP endpoint/server stub for progressive tool discovery/gating
- Policy engine (rule-based initially)
- Audit logger (JSON + optional dashboard)
- Provider registry

Config: YAML, with strict modes (e.g., `strict_local`) and logged escalation reasons.

## Sources cited

- LiteLLM: https://github.com/BerriAI/litellm
- RouteLLM: https://github.com/lm-sys/routellm
- ClawRouter: https://github.com/BlockRunAI/ClawRouter
- OpenClaw: https://github.com/openclaw/openclaw
- MCP spec: https://modelcontextprotocol.io/
- LlamaIndex silent fallback issue: https://github.com/run-llama/llama_index/issues/20912
- HN cost example: https://news.ycombinator.com/item?id=45914307
- Local-by-default philosophy: https://medium.com/@hekleiman/local-by-default-why-mac-developers-should-run-llms-with-ollama-and-when-not-to-add342d9eb11
- vLLM: https://github.com/vllm-project/vllm
- Ollama: https://github.com/ollama/ollama
