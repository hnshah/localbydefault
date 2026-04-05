# Opportunity (Draft) — localbydefault

## The wedge

**Local-first model orchestration:** run local models by default; escalate to cloud only when needed.

This is a “control plane” problem, not a single-model problem.

## Why now

1) Cloud model costs and instability are forcing people to find alternatives.
2) Local models are “good enough” for a large slice of workloads.
3) Tool ecosystems (MCP) create tool overload; routing is becoming mandatory.

Evidence (early citations):
- Tool routing at scale via MCP router (token-efficient): https://www.reddit.com/r/mcp/comments/1rypd3s/i_built_a_semantic_router_that_lets_your_ai_use/
- Selective MCP tool loading: https://www.reddit.com/r/ClaudeAI/comments/1rykygr/claude_request_inspector_and_selectively_load_mcp/
- Silent cloud fallback / trust breakdown: https://www.reddit.com/r/LocalLLaMA/comments/1ro71ou/the_silent_openai_fallback_why_llamaindex_might_be_leaking_your_100_local_rag_data/
- Ollama load balancing demand: https://www.reddit.com/r/LocalLLaMA/comments/1s3ctq3/open_source_load_balancer_for_ollama_instances/

## Ribbons we can own (initial set)

### Ribbon 1: “No silent cloud fallback” policy enforcement
- Ship: explicit policy config + runtime enforcement + audit log.
- Why it wins: trust + privacy + compliance.

### Ribbon 2: Model routing + tool routing as one control plane
- Ship: MCP router integration, progressive tool disclosure, toolset narrowing.
- Why it wins: reduces context bloat; improves reliability.

### Ribbon 3: Multimodal routing (text+vision) in the same policy layer
- Ship: modality tagging + capability detection.

### Ribbon 4: Local fleet orchestration (multi-machine / multi-endpoint)
- Ship: pool endpoints, measure health/latency, pick best local target.

### Ribbon 5: Continuous eval loop (Verdict) to keep routing honest
- Ship: nightly eval pack + regression detection + suggested policy changes.

## MVP definition (what we ship first)

- Rule-based router (policy v0)
- Providers: Ollama + OpenAI-compatible endpoints
- Audit log: which model/provider was used, why, cost estimate
- Multimodal: vision routes only to vision-capable backends
- OpenClaw adapter: execution through `sessions_spawn` (reference harness)

Next: expand with deeper GitHub + web citations and convert into a crisp “GO-TO-MARKET wedge doc”.
