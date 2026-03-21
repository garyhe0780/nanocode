# Workflow

## Sprint Cadence

- **Sprint duration:** 1 week (Monday → Sunday)
- **Sprint planning:** Monday morning, 30 min
- **Daily sync:** Async via task updates (no standup unless blocked)
- **Sprint review:** Sunday evening, 30 min
- **Retrospective:** First Monday of each month, 30 min

---

## Issue Tracking

### Issue States

| State | Meaning |
|-------|---------|
| `backlog` | Prioritized but not started |
| `in_progress` | Actively being worked |
| `in_review` | PR open, waiting for review |
| `blocked` | Waiting on something (dependency, decision, external) |
| `done` | Merged and verified |

### Issue Priority

| Priority | Meaning |
|----------|---------|
| `p0` | Must ship in current sprint — blocking core loop |
| `p1` | Should ship — important but not blocking |
| `p2` | Nice to have — ship if time allows |
| `p3` | Future — not in current plan |

### Issue Labels

- `frontend` — React/shadcn-ui work
- `backend` — API/Prisma/Bun.serve work
- `ai` — Agent system / LLM integration
- `infra` — Deploy, CI/CD, DevOps
- `bug` — Something is broken
- `chore` — Tooling, deps, non-feature work
- `spike` — Time-boxed investigation

---

## Task Workflow

### Creating Tasks

Every feature/chore gets a task before work starts. No coding without a task.

```
Format: <type>-<short-description>
Examples:
  backend-001-prisma-schema-setup
  frontend-003-auth-login-flow
  ai-007-data-analyst-agent-prompt
  chore-002-bun-workspaces-setup
```

### Working a Task

1. **Assign task** to yourself
2. **Set status** to `in_progress`
3. **Create branch**: `git checkout -b <task-id>-<short-name>`
4. **Do the work**
5. **Add tests** (if applicable)
6. **Commit** with message: `feat(<task-id>): description` or `fix(<task-id>): description`
7. **Push**: `git push -u origin <branch-name>`
8. **Open PR** → set status to `in_review`
9. **Reviewer approves** → merge to `main`
10. **Mark task** as `done`

### PR Rules

- PR title matches commit format: `feat(task-id): description`
- PR description links to task
- 1 PR per task (small PRs, fast reviews)
- Reviews: 1 approval required from co-founder
- Never merge your own PR
- If blocked on review > 24h, ping reviewer directly

### Branch Strategy

```
main          ← production-ready, always deployable
  └── <task-id>-<name>   ← feature branches
```

- `main` is locked — no direct pushes
- PRs auto-deploy to staging on merge
- Staging must be green before production deploy

---

## Sprint Planning (Monday)

1. Review last sprint's `done` tasks
2. Pull from `backlog` into sprint based on priority
3. Capacity check — don't overcommit
4. Assign tasks to team members
5. Update sprint board

### Sprint Board Layout

```
[This Sprint]              [Backlog]              [Done this week]
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ backend-001  👤 │  │ frontend-010    │  │ backend-003  ✓  │
│ backend-002  👤 │  │ ai-012          │  │ frontend-005  ✓ │
│ ai-007       👤 │  │ infra-008       │  │                 │
│ frontend-003    │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Definition of Done

A task is `done` when:

- [ ] Code merged to `main`
- [ ] Staging verified (manual or automated)
- [ ] No regressions
- [ ] Task link updated with final notes

---

## Communication

- **Primary:** Async — update task status, leave notes
- **Secondary:** Chat for quick questions
- **Blocking issue:** Voice/call if stuck > 15 min
- **Decision needed:** Tag co-founder, give 24h to respond

### Response Time Expectations

| Type | Expected |
|------|----------|
| PR review request | Review within 4 hours (same day) |
| Blocking issue | Respond within 1 hour |
| Non-urgent question | Next business day |

---

## Development Rules

### General
- Use Bun for everything (package manager, runtime, test runner)
- Never commit directly to `main`
- Keep `main` green — broken builds stop the team
- If you break `main`, fix it immediately (your top priority)

### Code
- TypeScript strict mode
- No `any` — use `unknown` + type guards
- Prisma for all DB access (no raw SQL unless absolutely necessary)
- Bun.serve for API (no Express/Fastify)

### Testing
- Backend: `bun test` for unit tests
- No test coverage requirement for v1 — ship features over tests
- Test critical paths manually before marking `done`

### Commits
```
feat(task-id): add user authentication
fix(task-id): resolve CORS issue on /api/tables
chore(task-id): upgrade Prisma to v6
```

---

## Retrospective (Monthly)

First Monday of the month, 30 min:

1. What went well?
2. What could be improved?
3. Action items for next month
