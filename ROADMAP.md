# localbydefault Roadmap

## Current Status: MVP Complete ✅

### What's Working
- [x] Ollama provider (local inference)
- [x] OpenAI provider (cloud fallback)
- [x] Local-first routing policy
- [x] Quality hints (--fast, --best)
- [x] Health checks
- [x] Config file system
- [x] CLI (route, run, health, config, init)

---

## v0.2: Evaluation & Learning

### Milestone: Hook up Verdict for model evaluation

**Goal:** Integrate Verdict to measure routing quality

#### Tech Debt (Pay Down First)
- [ ] Fix git commit author (bobhns vs Bob Shah)
- [ ] Add `.gitignore` for `dist/` and `node_modules/`
- [ ] Add `vitest.config.ts` properly
- [ ] CI/CD setup (GitHub Actions)

#### Feature: Verdict Integration
- [ ] Create `verdict-eval.ts` - run Verdict evals through localbydefault routing
- [ ] Create `eval-hooks.ts` - Verdict callbacks for routing decisions
- [ ] Add `evaluate` command to CLI
- [ ] Track routing accuracy vs direct model calls

**Example usage:**
```bash
localbydefault evaluate --pack coding --models qwen2.5-coder:32b,gpt-4o-mini
```

#### Feature: Metrics & Logging
- [ ] Add execution log (`~/.localbydefault/logs/`)
- [ ] Track: model used, latency, tokens, cost, success/failure
- [ ] JSON lines format for easy parsing

**Log entry:**
```json
{"ts":"2026-04-05T00:00:00Z","task":"hello","model":"qwen2.5-coder:32b","provider":"ollama","latencyMs":2500,"success":true}
```

---

## v0.3: Provider Expansion

### Goals
- [ ] **MLX Provider** - Apple Silicon MLX support
- [ ] **vLLM Provider** - NVIDIA GPU inference
- [ ] **OpenRouter Provider** - Unified API for multiple providers
- [ ] **Anthropic Provider** - Claude via API

---

## v0.4: Smart Routing

### Goals
- [ ] **Latency-based routing** - Route based on measured latency
- [ ] **Success-rate tracking** - Which models succeed/fail for what tasks
- [ ] **Cost caps** - Max cost per task or per day
- [ ] **Auto-fallback learning** - Learn from failures

### Example Config
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

1. **Tech Debt** (this session)
   - Fix git author
   - Add .gitignore
   - Fix vitest config
   - GitHub Actions CI

2. **Verdict Integration** (high value)
   - eval-hooks.ts
   - evaluate command
   - Metrics logging

3. **Provider Expansion** (medium priority)
   - OpenRouter for multi-provider
   - Anthropic for Claude

4. **Smart Routing** (future)
   - Latency-based
   - Cost caps

---

## Dependencies

- **Verdict** (hnshah/verdict) - Evaluation framework
- **OpenClaw** (openclaw/openclaw) - Agent integration
- **Ollama** - Local inference
- **OpenAI API** - Cloud inference
