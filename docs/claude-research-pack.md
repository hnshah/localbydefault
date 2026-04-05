# Claude research pack (received)

This document is Hiten-provided Claude output (Compass artifact): a comprehensive research pack for **localbydefault**.

## Key claims

- No existing project combines: local-first policy routing + cloud escalation enforcement + continuous evaluation + multimodal capability detection.
- Widest gap: **no silent cloud fallback** enforcement.
- Developer pain: quadratic token growth; $1.5K–$126K/mo API bills; repeated outages; MCP context bloat consuming 40–72% of context.
- OpenClaw is an ideal first integration target.
- Multimodal routing remains a gap in research + tooling.
- Incumbents are structurally disincentivized from local-first (cloud token monetization).

## Useful source list (verify + cite)

- LiteLLM: https://github.com/BerriAI/litellm
- Portkey Gateway: https://github.com/Portkey-AI/gateway
- RouteLLM: https://github.com/lm-sys/RouteLLM
- TensorZero: https://github.com/tensorzero/tensorzero
- OpenClaw: https://github.com/openclaw/openclaw
- MCP: https://modelcontextprotocol.io/
- Vitalik post (local-first inference): https://vitalik.eth.limo/general/2026/04/02/secure_llms.html
- Tool bloat sources: Redis, Atlassian mcp-compressor, IBM context-forge
- Naming overlap: postcss-modules-local-by-default

## Next steps

- Convert this research pack into our canonical docs:
  - `docs/landscape.md` (with verified stars + links)
  - `docs/opportunity.md`
  - `docs/examples.md`

- Use it to define MVP v0.1 scope:
  - OpenAI-compatible proxy endpoint
  - local-first policy engine + audit
  - provider registry + capability detection (incl. vision)
  - OpenClaw integration path

