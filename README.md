# localbydefault

Local-first model orchestration: run local by default, fall back to cloud when needed.

**Status:** v0.5 - MVP+ (REST API + MCP server)

## Quick Start

```bash
npm install
npm run build
npx localbydefault route "hello"
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `route <prompt>` | Show routing decision |
| `run <prompt>` | Route and execute |
| `serve` | Start REST API server |
| `mcp` | Start MCP server |
| `evaluate` | Run evaluation tasks |
| `compare` | Compare routing strategies |
| `health` | Check provider health |
| `metrics` | Show execution metrics |
| `config` | Show configuration |

### Options

| Flag | Description |
|------|-------------|
| `--fast, -f` | Prefer fastest model |
| `--best, -b` | Prefer best quality |
| `--port, -P` | API server port |
| `--policy` | Routing policy |

## REST API

```bash
localbydefault serve --port 3000
```

```bash
# Health check
curl http://localhost:3000/health

# Route decision
curl -X POST http://localhost:3000/route \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"hello"}'

# Execute
curl -X POST http://localhost:3000/execute \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"What is 1+1?"}'
```

## MCP Server

```bash
localbydefault mcp --socket /tmp/localbydefault-mcp.sock
```

Tools: `route`, `execute`, `health`, `list_providers`

## Providers

| Provider | Type | Cost |
|----------|------|------|
| Ollama | Local | Free |
| OpenAI | Cloud | $0.15/1M |
| Anthropic | Cloud | $0.80/1M |
| OpenRouter | Multi | Varies |

## Configuration

Create `localbydefault.json`:

```json
{
  "models": [
    { "id": "qwen2.5-coder:32b", "provider": "ollama", "modalities": ["text"], "costPer1MTokensUsd": 0 }
  ],
  "defaultPolicy": "local-first"
}
```

## Routing Policies

- `local-first` - Prefer free local models
- `cloud-first` - Prefer cloud models  
- `best-quality` - Prefer most capable

## License

MIT
