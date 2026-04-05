# localbydefault Roadmap

## Current Status: v0.2 Complete ✅

### What's Working
- [x] Ollama provider (local inference)
- [x] OpenAI provider (cloud fallback)
- [x] Local-first routing policy
- [x] Quality hints (--fast, --best)
- [x] Health checks
- [x] Config file system
- [x] CLI (route, run, health, config, init, evaluate, metrics)
- [x] Metrics logging
- [x] Verdict integration (eval hooks)

---

## Tech Debt (Paid ✅)
- [x] Fixed git commit author
- [x] Added .gitignore
- [x] Added vitest.config.ts
- [x] Added GitHub Actions CI
- [x] All tests passing (9/9)

---

## v0.3: Provider Expansion

### Goals
- [ ] **OpenRouter Provider** - Unified API for multiple providers
- [ ] **Anthropic Provider** - Claude via API
- [ ] **MLX Provider** - Apple Silicon MLX support
- [ ] **vLLM Provider** - NVIDIA GPU inference

---

## v0.4: Smart Routing

### Goals
- [ ] **Latency-based routing** - Route based on measured latency
- [ ] **Success-rate tracking** - Which models succeed/fail for what tasks
- [ ] **Cost caps** - Max cost per task or per day
- [ ] **Auto-fallback learning** - Learn from failures

### Example Config (planned)
```json
{
  "routing": {
    "latencyBudgetMs": 5000,
    "maxCostPerTask": 0.01,
    "retryOnFailure": true,
    "fallbackChain": ["qwen2.5-coder:32b", "gpt-4o-mini"]
  }
}
```

---

## v0.5: Agent Integration

### Goals
- [ ] **OpenClaw adapter** - Use localbydefault from OpenClaw
- [ ] **MCP server** - Model Context Protocol server
- [ ] **REST API** - HTTP endpoints for routing decisions
- [ ] **Webhook support** - Callbacks on routing events

---

## Priority Order

1. **v0.3: Provider Expansion** (high value)
   - OpenRouter for multi-provider
   - Anthropic for Claude

2. **v0.4: Smart Routing** (medium priority)
   - Latency-based
   - Cost caps

3. **v0.5: Agent Integration** (future)
   - OpenClaw adapter
   - MCP server

---

## Dependencies

- **Verdict** (hnshah/verdict) - Evaluation framework
- **OpenClaw** (openclaw/openclaw) - Agent integration
- **Ollama** - Local inference
- **OpenAI API** - Cloud inference
- **OpenRouter** - Multi-provider API (planned)
- **Anthropic** - Claude API (planned)

---

## Commit History

| Hash | Description |
|------|-------------|
| 12592bf | Metrics logging + metrics CLI |
| 12b39d9 | Evaluate command + Verdict integration |
| f537a66 | README with architecture |
| faf56e0 | Health checks |
| c86b2c6 | Quality hints routing |
| b89c629 | OpenAI provider + config |
| 7521865 | Ollama provider + run/route |
