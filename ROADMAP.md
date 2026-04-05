# localbydefault Roadmap

## Current Status: v0.4 Complete ✅

### What's Working
- [x] **4 Providers**: Ollama, OpenAI, Anthropic, OpenRouter
- [x] **Local-first routing** with free local models
- [x] **Quality hints** (--fast, --best)
- [x] **Health checks**
- [x] **Config file system**
- [x] **Metrics logging**
- [x] **SmartRouter** with adaptive routing
- [x] **Compare command** for benchmarking

### Full CLI
```bash
localbydefault route "hello"           # Show routing
localbydefault run "hello"            # Execute
localbydefault run --fast "..."      # Fast mode
localbydefault run --best "..."       # Best quality
localbydefault health                 # Check providers
localbydefault config                 # Show config
localbydefault init                   # Create config
localbydefault evaluate --count 10     # Run evals
localbydefault metrics --summary      # Show metrics
localbydefault compare                # Benchmark policies
localbydefault stats                  # Show statistics
```

---

## v0.5: Agent Integration

### Goals
- [ ] **OpenClaw adapter** - Use localbydefault from OpenClaw
- [ ] **MCP server** - Model Context Protocol server
- [ ] **REST API** - HTTP endpoints for routing decisions
- [ ] **Webhook support** - Callbacks on routing events

---

## Future Ideas

### Plugin System
- [ ] Custom provider plugins
- [ ] Routing policy plugins
- [ ] Webhook integrations

### Learning
- [ ] Success-rate based model ranking
- [ ] Latency prediction
- [ ] Cost optimization

### UI
- [ ] Web dashboard
- [ ] Real-time routing visualization
- [ ] Cost tracking dashboard

---

## Commit History

| Hash | Version | Description |
|------|---------|-------------|
| 81a2cb4 | v0.4 | SmartRouter + compare command |
| cd21986 | v0.3 | Anthropic + OpenRouter providers |
| 12592bf | v0.2 | Metrics logging + CLI |
| 12b39d9 | v0.2 | Evaluate command + Verdict integration |
| faf56e0 | v0.1 | Health checks |
| c86b2c6 | v0.1 | Quality hints routing |
| b89c629 | v0.1 | OpenAI provider + config |
| 7521865 | v0.1 | Ollama provider + run/route |

---

## Dependencies

- **Verdict** - Evaluation framework
- **OpenClaw** - Agent integration (planned)
- **Ollama** - Local inference
- **OpenAI API** - Cloud inference
- **Anthropic** - Claude API
- **OpenRouter** - Multi-provider API
