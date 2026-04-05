# localbydefault

Local-first model orchestration: run local by default, fall back to cloud when needed.

- **Domains:** localbydefault.com / localbydefault.ai / localbydefault.dev
- **Status:** pre-MVP (in progress)

## What it is

**localbydefault** is an AI-native control plane for orchestrating a fleet of local models (Ollama/MLX/vLLM) with a cloud model as the “brain”. It routes tasks to the cheapest model that can do the job, escalates to cloud when necessary, and learns over time via evaluation.

### Core principles

- **Local-first routing:** default to free/low-cost local inference
- **Cloud escalation:** use cloud only when the task demands it (quality, multimodal, latency)
- **Harness-first:** integrates deeply with OpenClaw first, but remains harness-agnostic
- **API/MCP-first:** all capabilities exposed via APIs for agents/tools to call
- **Measurable:** cost, latency, and quality are tracked (eval loop planned)

## Roadmap

### MVP (v0.1)

- Rule-based router (task → provider/model)
- Providers: Ollama + OpenAI-compatible HTTP endpoints
- Harness adapter: OpenClaw `sessions_spawn`
- Multimodal task typing (vision vs text)
- CLI for local testing (`localbydefault route|run`)

### v0.2

- Policy packs (coding, research, vision)
- Per-task cost+latency logging
- Pluggable evaluation hooks (Verdict)

### v0.3+

- Learning loop (auto-adjust routing based on eval outcomes)
- More providers (MLX, vLLM)
- Web UI dashboard (optional)

## Why it matters

Cloud models are expensive and increasingly unstable under load. Local models are now “good enough” for a large slice of work.

localbydefault makes **hybrid inference** the default: use local models like a boss, and keep cloud as a strategic escalation.

## License

TBD (likely MIT)
