# Project: NanoDB

AI-native NoCode database platform — a Nocodb/Nocobase alternative with built-in AI agents and a visual agent builder.

## Product Vision

An AI-first internal tool builder where **AI agents are the primary interface**, not a bolt-on feature. Users describe what they want in natural language, and AI creates tables, queries data, generates reports, and automates workflows. Pro developers build the agents; non-technical users consume them via chat.

### Differentiators vs Nocodb/Nocobase

1. **AI-native** — agents that share context/state with the app. Agents understand your schema semantically (not just foreign key IDs), can traverse relations naturally, and remember context across sessions.
2. **Visual agent builder** — template-based flow builder (v1) with full node editor (v2). Users chain tools (DB Query, LLM Call, HTTP Request, Filter, Transform) without writing code.
3. **Open core** — self-hosted option for enterprise, SaaS for teams wanting managed infrastructure.

---

## Target Users

- **Anchor:** Pro developers / technical founders building internal tools
- **Secondary:** Non-technical team members using AI agents built by developers
- **Tertiary:** Enterprise teams (self-hosted)

Agents built by pro devs → consumed by non-technical users via natural language chat.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun (full-stack) |
| Framework | Waku (React Server Components) |
| UI | shadcn-ui (Radix + Tailwind) |
| Auth | better-auth |
| Database | PostgreSQL |
| ORM | Prisma |
| Real-time | Bun.serve WebSocket |
| AI | Anthropic + OpenAI (abstraction layer) |
| Deployment | Fly.io |
| Monorepo | Bun workspaces |

### Monorepo Structure

```
apps/
  web/           # React frontend (Waku)
  api/           # Bun.serve REST/WebSocket API
  agent-runtime/ # Agent execution worker
packages/
  db/            # Prisma schema, migrations
  auth/          # better-auth config
  ai/            # Agent SDK, tool definitions, prompts
```

### Agent Runtime

- Separate worker process (scales independently from API)
- Shared Prisma client (same DB, same row-level permissions)
- Agent permissions = invoking user's permissions (chat agents)
- Agent permissions = explicit role permissions (automation agents)

---

## Architecture Decisions

### Schema Design
- **Hybrid** relational + document (typed fields + JSON support)
- Agents understand relations as semantic relationships (`orders → customers → addresses → city`)
- Not just foreign key IDs — agents traverse relations naturally

### Permissions Model
- Row-level + field-level + table-level
- Workspace-scoped via `workspace_id` on every row
- RLS enforced via Prisma middleware
- **Agents inherit invoking user's permissions** (chat agents)
- **Agents run with explicit roles** (automation agents)

### Multi-tenancy
- Shared DB cluster per deployment
- Row-level isolation (`workspace_id`)
- SaaS: workspaces on shared infra
- Self-hosted (v2): each tenant can have own DB schema

### LLM Strategy
- Abstraction layer (not tied to one provider)
- Anthropic (default) + OpenAI + local models (Ollama) in v2
- LangChain model abstractions used as utilities, NOT as framework
- Custom `Tool` interface: `{ name, description, parameters, handler }`

### Conflict Resolution
- Optimistic locking with merge UI
- Agents play by same rules as humans

---

## v1 Feature Set (60-day sprint)

### Month 1 — Core Loop
- PostgreSQL + Prisma + REST API
- better-auth (email + OAuth)
- React table view + CRUD + WebSocket live updates
- Pre-built Data Analyst agent (chat → SQL → table results)

### Month 2 — Visual Builder
- Step builder UI (linear form, drag-reorder, 5 tools)
- 3 agent templates: Data Analyst, Customer Research, Report Generator
- Customize prompts per template
- Chat-invoked only (no schedule/triggers yet)

### v1 Ships With
- Database CRUD + REST API
- 1 pre-built agent: Data Analyst
- Visual builder: 3 templates, 5 tools (DB Query, LLM Call, HTTP Request, Filter, Transform)
- Chat-only trigger
- Basic auth (email + OAuth)
- SaaS only

### Deferred to v2
- Agent memory across sessions (stateful + persistent)
- Schedule triggers (cron)
- Webhook triggers
- Self-hosted / Docker
- Field-level permissions
- Full node editor (visual builder)
- Multiple LLM providers (local models)

---

## Agent System

### Pre-built Agents (v1)

**Data Analyst**
- User asks natural language questions about data
- Agent generates + executes SQL
- Returns formatted results in chat + table view
- Can export to CSV

### Agent Templates (v2)

| Template | Tools Used | Description |
|----------|------------|-------------|
| Data Analyst | DB Query, Transform, Filter | Ask questions, get answers |
| Customer Research | DB Query, HTTP Request, Transform | Enrich customer records |
| Report Generator | DB Query, Filter, Transform, LLM Call | Generate formatted reports |

### Tool Definitions

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  handler: (params: unknown, context: AgentContext) => Promise<ToolResult>;
}
```

**v1 Tools:**
- `db_query` — Execute read-only SQL, return results
- `llm_call` — Call LLM with prompt template
- `http_request` — GET/POST to external API
- `filter` — Filter array of results by condition
- `transform` — Map/reshape data structures

### Agent Memory

- Session-scoped memory (within a chat conversation)
- Persistent memory across sessions (v2) — agent builds model of your schema
- Memory is per-user, per-workspace

---

## MVP Core Loop

```
User connects PostgreSQL database
       ↓
NanoDB introspects schema automatically
       ↓
User creates views / tables via UI or natural language
       ↓
User invites team (OAuth)
       ↓
User creates agent from template (or uses Data Analyst)
       ↓
User chats with agent: "What are top 10 customers by revenue?"
       ↓
Agent interprets → generates SQL → executes → returns results
```

---

## Monetization

- **Early access:** $50/mo per workspace (invite-only)
- **v1 launch:** Tiered pricing (free, pro, team, enterprise)
- **Open core:** Self-hosted paid license (v2)
- **LLM costs:** Free tier uses user's own API key; paid tier includes inference

---

## References

- Nocodb: https://github.com/nocodb/nocodb
- Nocobase: https://www.nocobase.com/
- shadcn-ui: https://ui.shadcn.com/
- better-auth: https://www.better-auth.com/
- Waku: https://waku.gg/
