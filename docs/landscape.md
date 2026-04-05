# Landscape (Draft) — localbydefault

> This is a working draft. Sources are currently primarily from last30days outputs and GitHub repo searches; I’m expanding this with deeper GitHub archaeology + web citations.

## Categories

### 1) Local-first orchestration (agents / harness)
- **localcrew** — “local-first orchestration harness… pool Ollama and OpenAI-compatible endpoints across your LAN, route tasks by capability…” (GitHub search result)
- **HARNESS** — “local-first orchestration layer for AI coding agents…” (GitHub search result)
- **maestro** — “local-first orchestration for coding agents” (GitHub search result)

**Gap:** these tend to be *agent/harness implementations*, not a portable **control plane** with explicit policy + audit + multimodal routing.

### 2) Gateways / proxies / load balancers (OpenAI-compatible)
- Multiple projects exist framing themselves as “OpenAI-compatible local proxy / model unifier / load balancer”.

**Key ribbon:** localbydefault is not “just a proxy.” It’s **policy + orchestration**: local-first defaults, explicit cloud escalation, and auditability (“no silent cloud fallback”).

Evidence of demand:
- “Open source load balancer for Ollama instances” (Reddit thread) — https://www.reddit.com/r/LocalLLaMA/comments/1s3ctq3/open_source_load_balancer_for_ollama_instances/
- “Announcing Olla - LLM Load Balancer, Proxy & Model Unifier …” (Reddit thread) — https://www.reddit.com/r/LocalLLaMA/comments/1mg7qpa/announcing_olla_llm_load_balancer_proxy_model/

### 3) Tool routing / MCP routing / progressive disclosure
This is adjacent to model routing and may be a *bigger* wedge:
- “semantic router that lets your AI use 1,000+ tools through a single MCP tool (~200 tokens)” — https://www.reddit.com/r/mcp/comments/1rypd3s/i_built_a_semantic_router_that_lets_your_ai_use/
- “Claude Request Inspector and selectively load MCP tools on demand” — https://www.reddit.com/r/ClaudeAI/comments/1rykygr/claude_request_inspector_and_selectively_load_mcp/

**Why it matters:** tool overload is becoming the new context window problem. A control plane that can route *tools* and *models* is uniquely powerful.

### 4) Hybrid inference security / trust
- “Silent OpenAI fallback… leaking your ‘100% local’ RAG data” — https://www.reddit.com/r/LocalLLaMA/comments/1ro71ou/the_silent_openai_fallback_why_llamaindex_might_be_leaking_your_100_local_rag_data/

**Ribbon:** auditability + enforcement. localbydefault should make “no cloud” and “cloud only for X” an enforceable policy with logs.

---

## What looks unique about localbydefault (early thesis)

1) **Policy-first** (local by default, cloud only when needed) — not just routing, but enforceable behavior.
2) **Auditability** (“no silent cloud fallback”) — a trust layer around hybrid inference.
3) **MCP-first** — treat tool routing + model routing as one control plane.
4) **Harness adapters** — OpenClaw first, then others.
5) **Multimodal routing** — first-class text/vision capability detection.

Next: I’ll replace “GitHub search result” placeholders with concrete repo links, star/activity, and gap analysis.
