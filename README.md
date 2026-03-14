<div align="center">

# vibecosystem

**AI software team built on Claude Code.**

119 agents. 202 skills. 48 hooks. Zero manual work.

[Turkce](#turkce) | [English](#english) | [Espanol](docs/README_ES.md) | [Francais](docs/README_FR.md) | [Deutsch](docs/README_DE.md) | [Portugues](docs/README_PT.md) | [Italiano](docs/README_IT.md) | [Nederlands](docs/README_NL.md) | [中文](docs/README_ZH.md) | [日本語](docs/README_JA.md) | [한국어](docs/README_KO.md) | [العربية](docs/README_AR.md) | [हिन्दी](docs/README_HI.md) | [Русский](docs/README_RU.md)

<img src="assets/gif1-numbers.gif" alt="Ecosystem Numbers" width="700">

</div>

---

## At a Glance

| Metric | Count |
|--------|-------|
| Agents | **119** |
| Skills | **202** |
| Hooks | **48** |
| Rules | **16** |
| Manual work | **0** |

---

<a name="english"></a>

## What is this?

vibecosystem turns Claude Code into a full AI software team. Not a single assistant — a **team** of 119 specialized agents that plan, build, review, test, and learn from every mistake.

No custom model. No custom API. Just Claude Code's hook + agent + rules system, pushed to the limit.

### The Big Picture

<img src="assets/gif5-bigpicture.gif" alt="Big Picture" width="700">

---

## Core Features

### 1. Self-Learning Pipeline

Every error becomes a rule. Automatically.

<img src="assets/gif2-pipeline.gif" alt="Self-Learning Pipeline" width="700">

```
Error happens → passive-learner captures pattern
→ consolidator groups & counts
→ confidence >= 5 → auto-inject into context
→ 10x repeat → permanent .md rule file
```

No manual intervention. The system writes its own rules.

### 2. Agent Swarm

Say "add a new feature" and 20+ agents activate across 5 phases.

<img src="assets/gif3-swarm.gif" alt="Agent Swarm" width="700">

```
Phase 1 (Discovery):    scout + architect + project-manager
Phase 2 (Development):  backend-dev + frontend-dev + devops + specialists
Phase 3 (Review):       code-reviewer + security-reviewer + qa-engineer
Phase 4 (QA Loop):      verifier + tdd-guide (max 3 retry → escalate)
Phase 5 (Final):        self-learner + technical-writer
```

### 3. Adaptive Hook Loading

48 hooks exist but they don't all run at once. Intent determines which hooks fire.

<img src="assets/gif4-hooks.gif" alt="Adaptive Hooks" width="700">

```
"fix the bug"      → compiler-in-loop + error-broadcast     ~2,400 tok
"add api endpoint"  → edit-context + signature-helper + arch  ~3,100 tok
"explain this code" → (nothing)                               ~800 tok
```

### 4. Dev-QA Loop

Every task goes through a quality gate:

```
Developer implements → code-reviewer + verifier check
→ PASS → next task
→ FAIL → feedback to developer, retry (max 3)
→ 3x FAIL → escalate (reassign / decompose / defer)
```

### 5. Canavar Cross-Training

When one agent makes a mistake, the entire team learns from it.

```
Agent error → error-ledger.jsonl → skill-matrix.json
→ All agents get the lesson at session start
→ Team-wide error prevention
```

### 6. Assignment Matrix

74-row routing table: every task type maps to the right agent.

```
GraphQL API      → graphql-expert  (backup: backend-dev)
Kubernetes       → kubernetes-expert (backup: devops)
DDD modeling     → ddd-expert      (backup: architect)
Bug reproduction → replay          (backup: sleuth)
... 70 more rows
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                          │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Hooks   │  │  Agents  │  │  Skills  │              │
│  │  (48)    │→ │  (119)   │← │  (202)   │              │
│  └────┬─────┘  └────┬─────┘  └──────────┘              │
│       │              │                                   │
│       ▼              ▼                                   │
│  ┌──────────┐  ┌──────────┐                              │
│  │  Rules   │  │  Memory  │                              │
│  │  (16)    │  │ (PgSQL)  │                              │
│  └──────────┘  └──────────┘                              │
│                                                         │
│  ┌──────────────────────────────────────┐                │
│  │  Self-Learning Pipeline             │                │
│  │  instincts → consolidate → rules    │                │
│  └──────────────────────────────────────┘                │
│                                                         │
│  ┌──────────────────────────────────────┐                │
│  │  Canavar Cross-Training             │                │
│  │  error-ledger → skill-matrix → team │                │
│  └──────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## Agent Categories

| Category | Count | Examples |
|----------|-------|---------|
| Core Dev | 12 | frontend-dev, backend-dev, kraken, spark, devops |
| Review & QA | 8 | code-reviewer, security-reviewer, verifier, qa-engineer |
| Domain Experts | 35 | graphql-expert, kubernetes-expert, ddd-expert, redis-expert |
| Architecture | 8 | architect, planner, clean-arch-expert, cqrs-expert |
| Testing | 6 | tdd-guide, e2e-runner, arbiter, mocksmith |
| DevOps & Cloud | 12 | aws-expert, gcp-expert, azure-expert, terraform-expert |
| Analysis | 10 | scout, sleuth, data-analyst, profiler, strategist |
| Orchestration | 16 | nexus, sentinel, commander, neuron, vault, nitro |
| Documentation | 5 | technical-writer, doc-updater, copywriter, api-doc-generator |
| Learning | 7 | self-learner, canavar, reputation-engine, session-replay-analyzer |

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Claude Code (Claude Max) |
| Models | Opus 4.6 / Sonnet 4.6 |
| Hook engine | TypeScript → esbuild → .mjs |
| Memory DB | PostgreSQL + pgvector (Docker) |
| Agent format | Markdown + YAML frontmatter |
| Skill format | prompt.md / SKILL.md |
| Cross-training | JSONL ledger + JSON skill matrix |

---

## Philosophy

```
hooks are sensors. observe, filter, signal.
agents are muscles. build, produce, fix.
the bridge between them: context injection.
no direct RPC. no message passing. by design.
implicit coordination through context.
```

---

<a name="turkce"></a>

## Turkce

### Nedir?

vibecosystem, Claude Code'u tam bir AI yazilim ekibine donusturur. Tek bir asistan degil — planlayan, gelistiren, review yapan, test eden ve her hatasindan ogrenen **119 uzman agent'lik bir ekip**.

Ozel model yok. Ozel API yok. Sadece Claude Code'un hook + agent + rules sistemi, sonuna kadar kullanilmis.

### Nasil Calisir?

1. **Hook'lar sensor** — gozlemler, filtreler, isaret eder
2. **Agent'lar kas** — calisir, uretir, duzeltir
3. **Aralarindaki kopru:** context injection
4. **Direkt RPC yok** — bilerek boyle. Claude Code'un hook API'si buna izin vermiyor
5. **Context uzerinden implicit koordinasyon** calisiyor

### Temel Ozellikler

- **Self-Learning:** Her hata otomatik kural olur
- **Agent Swarm:** 5 fazda 20+ agent paralel calisir
- **Adaptive Hooks:** Intent'e gore sadece gerekli hook'lar calisir
- **Dev-QA Loop:** Her task icin implement → review → max 3 retry → escalate
- **Canavar:** Bir agent'in hatasi tum ekibe yayilir
- **Assignment Matrix:** 74 satirlik task→agent yonlendirme tablosu

### Felsefe

```
Kullanicinin hicbir sey hatirlamasina gerek yok.
Her sey otomatik.
```

---

## License

MIT

---

<div align="center">

**Built by [@vibeeval](https://x.com/vibeeval)**

No custom model. No custom API. Just good engineering.

</div>
