# localbydefault Roadmap

## Current Status: v0.5 Complete ✅

### What's Working

**Providers:**
- [x] Ollama (local, free)
- [x] OpenAI (cloud)
- [x] Anthropic (cloud)
- [x] OpenRouter (multi-provider)

**CLI Commands:**
- [x] `route <prompt>` - Show routing decision
- [x] `run <prompt>` - Execute
- [x] `serve` - REST API server
- [x] `mcp` - MCP server
- [x] `tui` - Interactive TUI
- [x] `webhook` - Webhook receiver
- [x] `evaluate` - Run evals
- [x] `compare` - Compare policies
- [x] `health` - Provider health
- [x] `metrics` - Execution metrics

**Integrations:**
- [x] REST API (port 3000)
- [x] MCP Server (Unix socket)
- [x] Webhooks (event callbacks)
- [x] OpenClaw adapter
- [x] OpenClaw skill

---

## Future Ideas

### Learning & Optimization
- [ ] Success-rate based model ranking
- [ ] Latency prediction
- [ ] Cost optimization

### More Providers
- [ ] Azure OpenAI
- [ ] AWS Bedrock
- [ ] Google Vertex AI

### UI
- [ ] Web dashboard
- [x] TUI (done)

### Plugins
- [ ] Custom provider plugins
- [ ] Routing policy plugins

---

## Commit History (v0.5)

| Hash | Description |
|------|-------------|
| e8548a2 | OpenClaw adapter, webhooks, TUI |
| 6979b25 | README v0.5 |
| 6f234d7 | MCP server |
| ef718ca | REST API server |
| 81a2cb4 | SmartRouter + compare |
| cd21986 | Anthropic + OpenRouter |
| 12592bf | Metrics logging |
| 12b39d9 | Evaluate command |
| faf56e0 | Health checks |
| b89c629 | OpenAI + config |
| 7521865 | Ollama provider |
