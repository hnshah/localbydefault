# localbydefault server (MVP)

OpenAI-compatible **proxy server** that forwards requests to **Ollama by default**, with an explicit cloud route guarded by a `cloud_policy`.

## Install / build

```bash
cd localbydefault
npm install
npm run build
```

## Config

Create a YAML config file:

```yaml
port: 8080

# Ollama daemon (default: http://localhost:11434)
ollama_base_url: http://localhost:11434

# Optional OpenAI-compatible cloud base URL (only used for /v1/cloud/*)
cloud_base_url: https://api.openai.com

# deny | warn | allow
cloud_policy: deny

audit_db_path: ./localbydefault-audit.sqlite
```

## Run

```bash
./dist/cli.js serve --config ./localbydefault.server.yaml
```

## Endpoints

### Ollama-forwarded (allowed regardless of cloud_policy)

- `POST /v1/chat/completions` → forwarded to `${ollama_base_url}/v1/chat/completions`
- `POST /v1/embeddings` → forwarded to `${ollama_base_url}/v1/chat/completions` (placeholder for MVP)

### Cloud-forwarded (guarded)

- `POST /v1/cloud/chat/completions` → forwarded to `${cloud_base_url}/chat/completions`

If `cloud_policy: deny`, this endpoint returns `403` and still writes an audit record.

## Audit log

Writes to SQLite table `audit_events`:

- `ts` (ISO timestamp)
- `endpoint`
- `provider` (`ollama` | `cloud`)
- `cloud_policy` (`deny` | `warn` | `allow`)
- `blocked` (0/1)

