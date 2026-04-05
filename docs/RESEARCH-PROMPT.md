# Deep Research Prompt — localbydefault

Use this prompt with any deep-research model/tool (Claude, ChatGPT Deep Research, Perplexity, etc.). Goal: produce a *cited*, *thorough*, *actionable* research pack for the product **localbydefault**.

---

## Prompt

You are an expert researcher and product strategist for developer infrastructure.

### Product context (do not change)
We are building **localbydefault**: a local-first model orchestration control plane.

**Core wedge:** Route tasks to *local models by default* (Ollama/MLX/vLLM/OpenAI-compatible servers), and escalate to *cloud models only when needed* (quality, multimodal, latency, tool reliability). The orchestrator is API/MCP-first and will integrate deeply with OpenClaw first, but is harness-agnostic long-term.

**Target outcomes:**
- 60–95% cost reduction for agentic workloads
- predictable reliability and latency
- auditable “no silent cloud fallback” policy
- multimodal routing (text + vision first; audio later)

### Your mission
Deliver an exhaustive landscape + wedge analysis with citations.

### Requirements
1) **Cite everything** with clickable URLs.
2) Prefer primary sources: GitHub repos, docs, issues, PRs, benchmark writeups, blog posts by builders.
3) Cover both: (a) what exists now, (b) what’s missing (our wedge).
4) Provide a clear recommendation: what we should build first and why.

---

## Research Questions (answer all)

### A) Landscape map (what exists)
1) List the most relevant **open source** projects for each category:
   - LLM gateways/proxies (OpenAI-compatible endpoints, routing, load balancing)
   - model routing / route-to-cheapest systems (learned routers, policy routers)
   - local inference orchestration (Ollama/vLLM/MLX fleets)
   - agent orchestration frameworks (LangGraph/CrewAI/etc.)
   - MCP tool routers / progressive tool loading / tool gating
   - multimodal routing or inference orchestration

For each project include:
- Repo link
- Stars / activity signals
- 1–2 sentence summary
- What it does well
- What it lacks for our “local by default” wedge

2) Identify if any project already does **exactly**:
- local-first policy routing + cloud escalation
- continuous evaluation loop that updates routing
- explicit “no silent cloud fallback” enforcement
- OpenClaw-style harness integration

### B) “Ribbons” / wedges we can own
3) What are the top 5 **ribbons** (distinct, defensible wedges) in this space?
Examples of ribbons:
- Policy layer that prevents silent cloud usage
- Audit log + cost/latency/quality metrics
- MCP tool routing & progressive disclosure to keep context/tool lists small
- Multimodal routing (vision/text) with capability detection
- Local fleet orchestration (pooling multiple machines)

For each ribbon:
- Why it matters now
- Evidence people want it (links)
- Why incumbents don’t already own it
- What MVP looks like

### C) Developer pain (evidence)
4) Collect at least **15 citations** (HN threads, Reddit threads, GitHub issues) showing:
- cost pain / price hikes
- instability of cloud APIs
- desire to go local-first
- DIY routing patterns (local triage → cloud escalate)
- complaints about tools loading too many MCP tools / context bloat

Summarize the recurring complaints in a table.

### D) MVP scope and architecture
5) Propose an MVP that takes **< 2 weeks** to build and is clearly unique.
Include:
- components
- interfaces (APIs / MCP endpoints)
- config format
- routing policy v0 (rules)
- how to add providers (Ollama/MLX/vLLM/OpenAI-compatible)

6) Provide a phased roadmap (v0.1 → v0.3) that stays true to the wedge.

### E) Naming check (sanity)
7) Quick sanity check: does the name **localbydefault** conflict with any major project/brand? Provide evidence.

---

## Output format

Return a structured report with these sections:

1) Executive summary (10 bullets max)
2) Landscape (table)
3) Competitive gaps (bullets)
4) Ribbons we can own (top 5)
5) Evidence of pain (15+ citations)
6) MVP proposal (architecture + milestones)
7) Roadmap (v0.1–v0.3)
8) Risks & mitigations
9) Appendix: full link list

---

## Quality bar

- If you cannot find citations, say so.
- Do not guess API features—verify from docs/code.
- Prefer recent evidence (last 90 days) but include older foundational projects where relevant.

