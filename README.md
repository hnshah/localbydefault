# localbydefault

Local-first model orchestration: run local by default, fall back to cloud when needed.

- **Domains:** localbydefault.com / localbydefault.ai / localbydefault.dev
- **Status:** MVP (in progress)

## What it is

**localbydefault** is an AI-native control plane for orchestrating a fleet of local models (Ollama/MLX/vLLM) with a cloud model as the "brain". It routes tasks to the cheapest model that can do the job, escalates to cloud when necessary, and learns over time via evaluation.

### Core principles

- **Local-first routing:** default to free/low-cost local inference
- **Cloud escalation:** use cloud only when the task demands it (quality, multimodal, latency)
- **Harness-first:** integrates deeply with OpenClaw first, but remains harness-agnostic
- **API/MCP-first:** all capabilities exposed via APIs for agents/tools to call
- **Measurable:** cost, latency, and quality are tracked

## Quick Start

```bash
# Install
npm install

# Build
npm run build

# Route a prompt (show decision without executing)
npx localbydefault route "write a hello world function"

# Run a prompt (route + execute)
npx localbydefault run "hello world"

# Check provider health
npx localbydefault health

# Show configuration
npx localbydefault config

# Create config file
npx localbydefault init
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `route <prompt>` | Show routing decision for prompt |
| `run <prompt>` | Route and execute prompt |
| `health` | Check provider health status |
| `config` | Show current configuration |
| `init` | Create default config file |

### Options

| Flag | Description |
|------|-------------|
| `--fast, -f` | Prefer fastest/smallest model |
| `--best, -b` | Prefer best quality model |
| `--model, -m` | Specify model to use |
| `--provider, -p` | Specify provider (ollama, openai) |

## Configuration

Create `localbydefault.json` to customize behavior:

```json
{
  "models": [
    { "id": "qwen2.5-coder:32b", "provider": "ollama", "modalities": ["text"], "costPer1MTokensUsd": 0 },
    { "id": "gpt-4o-mini", "provider": "openai_compatible", "modalities": ["text", "vision"], "costPer1MTokensUsd": 0.15 }
  ],
  "defaultPolicy": "local-first"
}
```

### Routing Policies

- `local-first` (default) - Prefer free local models
- `cloud-first` - Prefer cloud models
- `best-quality` - Prefer most capable model regardless of cost

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                      CLI                              │
├─────────────────────────────────────────────────────┤
│              LocalOrchestrator                        │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │   Router     │  │  Providers  │                  │
│  │  (routing)   │  │  (execution) │                  │
│  └─────────────┘  └─────────────┘                  │
│                         │                            │
│         ┌───────────────┼───────────────┐           │
│         ▼               ▼               ▼           │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐      │
│   │  Ollama  │   │  OpenAI  │   │  Health  │      │
│   │ Provider │   │ Provider │   │  Checker │      │
│   └──────────┘   └──────────┘   └──────────┘      │
└─────────────────────────────────────────────────────┘
```

## Roadmap

### MVP (v0.1) ✅
- [x] Rule-based router (task → provider/model)
- [x] Providers: Ollama + OpenAI-compatible HTTP endpoints
- [x] Harness adapter: OpenClaw `sessions_spawn`
- [x] Multimodal task typing (vision vs text)
- [x] CLI for local testing

### v0.2
- [ ] Policy packs (coding, research, vision)
- [ ] Per-task cost+latency logging
- [ ] Pluggable evaluation hooks (Verdict)

### v0.3+
- [ ] Learning loop (auto-adjust routing based on eval outcomes)
- [ ] More providers (MLX, vLLM)
- [ ] Web UI dashboard (optional)

## Why it matters

Cloud models are expensive and increasingly unstable under load. Local models are now "good enough" for a large slice of work.

localbydefault makes **hybrid inference** the default: use local models like a boss, and keep cloud as a strategic escalation.

## License

MIT
