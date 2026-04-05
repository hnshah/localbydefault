# Perplexity — Deep Research & Product Strategy Pack (localbydefault)

Source: Hiten-provided Perplexity output (inbound attachment `localbydefault_Deep_Research_Product_Strategy_Pack---f9afde9f-a1f4-4379-8db2-77144f73b184.md`).

## Key claims to incorporate

- No OSS project enforces **local-by-default** with explicit **no-cloud-escape** guarantees.
- Pain signals: Claude outages (Jul 2025–Apr 2026), OpenClaw silent fallback charging $75–150/mo when local routing fails, MCP tool bloat (70k+ tokens), rate limits/instability.
- LiteLLM is closest incumbent but cloud-centric; RouteLLM proved economics; Apple Silicon MLX improvements make local more viable.
- OpenClaw is a strong first integration surface; known silent fallback bug (#13159).
- Wedge: **no silent cloud fallback** policy/audit; MCP tool gating; multimodal routing; local fleet pooling; continuous evaluation.

## MVP prescription (2 weeks)

- Ship an OpenAI-compatible proxy with:
  - YAML policy engine (`cloud_policy: deny|warn|allow`)
  - Provider registry (Ollama + OpenAI-compatible endpoints + cloud)
  - MCP tool gate (progressive disclosure)
  - Audit log (SQLite)
  - Capability detection (vision/text)

## Action items

- Verify and cite key references in canonical docs:
  - LiteLLM, Portkey, RouteLLM, TensorZero, ArchGW
  - OpenClaw #13159
  - Claude outage threads
  - MCP tool bloat evidence
  - MLX performance/distributed inference references

- Update canonical docs:
  - `docs/landscape.md`: tables w/ verified repo stats + gaps
  - `docs/opportunity.md`: ribbons + enforcement narrative
  - `docs/examples.md`: strict_local mode, tool gating flows
