# Signal & Static — Architecture Document

## What It Is

Signal & Static is a gamified web app for communication mastery and toxic pattern recognition. Players progress through 20 levels across 4 tiers of difficulty, learning to identify 30+ manipulation and communication patterns and respond to them using evidence-based techniques (DBT, NVC, Tactical Empathy).

The learning model is built on three pillars:
1. **Pattern exposure** — encounter toxic patterns in realistic simulated conversations
2. **Active recall** — spaced repetition review (SM-2 algorithm) for long-term retention
3. **Skill building** — practice de-escalation frameworks in increasingly complex scenarios

AI levels use a local Ollama LLM for realistic conversation simulation with full offline fallback to scripted dialogue.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| UI | React 19 + TypeScript | Component model, strong typing |
| Routing | React Router v7 | Nested routes via Outlet |
| State | Zustand | Minimal boilerplate, Zustand's `getState()` allows cross-store access |
| Styling | Tailwind CSS v4 | Utility-first, dark-theme enforced |
| Animation | Framer Motion | Micro-interactions and breathing overlay |
| Drag-drop | dnd-kit | Accessible drag-drop (L01) |
| Build | Vite 7 | Fast HMR, optimised production output |
| PWA | vite-plugin-pwa + Workbox | Service worker, offline fonts, installable |
| LLM | Ollama (local, llama3.2) | Privacy-first; OpenAI-compatible `/v1` API |

---

## Folder Map

```
src/
├── main.tsx                    Entry point (ErrorBoundary → RouterProvider)
├── router.tsx                  All route definitions
├── index.css                   Tailwind directives + global styles
│
├── pages/
│   ├── Home.tsx                Dashboard (XP, streak, next level CTA)
│   ├── TierMap.tsx             Level browser grouped by tier
│   ├── PatternCodex.tsx        Searchable pattern encyclopedia
│   ├── PatternDetail.tsx       Individual pattern deep-dive
│   ├── Library.tsx             Techniques/frameworks index
│   ├── TechniqueDetail.tsx     Individual technique with steps & phrases
│   ├── DailyPractice.tsx       Daily 2-min scenario (pattern MCQ)
│   ├── SpacedReview.tsx        SM-2 spaced repetition review hub
│   ├── Onboarding.tsx          4-question intake survey
│   ├── LevelRouter.tsx         Dynamic loader for /level/:id
│   └── levels/
│       ├── L01_EmotionDecoder.tsx       Drag-drop emotion matching
│       ├── L02_RedFlagBingo.tsx         Flashcard sort: toxic vs healthy
│       ├── L03_FourHorsemen.tsx         Side-by-side comparison/rewrite
│       ├── L04_ValidateThis.tsx         Multiple-choice validation
│       ├── L05_PhraseLab.tsx            Fill-in-blank phrase substitution
│       ├── L06_GaslightDetective.tsx    Evidence flagging in a chat thread
│       ├── L07_DARVODecoder.tsx         AI conversation (DARVO) + fallback
│       ├── L08_MazeOfCircles.tsx        SVG maze: circular conversation traps
│       ├── L09_TacticalEmpathy.tsx      AI conversation (Voss techniques) + fallback
│       ├── L10_SpotTheTrap.tsx          Impulse meter: resist baiting
│       └── LevelComingSoon.tsx          Placeholder for L11–L20
│
├── components/
│   ├── ErrorBoundary.tsx       Root error boundary (renders recovery screen)
│   ├── layout/
│   │   ├── AppShell.tsx        Header + bottom nav + Outlet
│   │   └── CrisisBanner.tsx    Mental health resources banner
│   ├── game/
│   │   ├── ConversationUI.tsx  Message thread + streaming input
│   │   ├── RegulationMeter.tsx Stress meter + breathing overlay (4-4-4-4 box)
│   │   ├── PatternCard.tsx     Pattern preview card
│   │   ├── ReplayAnalysis.tsx  Post-level AI feedback (with Skip fallback)
│   │   └── XPToast.tsx         Floating XP notification
│   └── ui/
│       ├── Button.tsx          primary / secondary / ghost
│       ├── Card.tsx            Container with optional glow effects
│       ├── Badge.tsx           Tier + rarity badges
│       ├── Modal.tsx           Dialog overlay
│       └── ProgressBar.tsx     Linear progress indicator
│
├── store/
│   ├── progressStore.ts        Level completion, XP, weak patterns, onboarding
│   ├── sessionStore.ts         Regulation meter, conversation state (not persisted)
│   ├── streakStore.ts          Daily streak + XP tracking
│   ├── repetitionStore.ts      SM-2 items + review scheduling
│   └── codexStore.ts           Pattern unlock/view state → auto-seeds repetitionStore
│
├── services/
│   └── llm.ts                  Ollama client: config, health check, prompt builders, streamChat
│
├── hooks/
│   └── useLLMConversation.ts   Streaming chat hook (probes Ollama on mount)
│
├── data/
│   ├── levels.ts               20 level definitions
│   ├── patterns.ts             30 toxic pattern definitions
│   ├── personas.ts             7 character personas (Alex, Morgan, River, …)
│   ├── techniques.ts           De-escalation frameworks (NVC, DEAR MAN, Voss, …)
│   ├── phrases.ts              Escalating → de-escalating phrase pairs
│   └── emotions.ts             40+ emotion definitions with intensity + category
│
└── types/
    └── index.ts                All shared TypeScript interfaces
```

---

## Route Map

| URL | Page | Notes |
|---|---|---|
| `/onboarding` | Onboarding | 4-question intake; redirects to `/` on complete |
| `/` | Home | Dashboard; shows welcome screen if onboarding not done |
| `/map` | TierMap | Level browser; locked levels dimmed |
| `/codex` | PatternCodex | Search + filter; 0/30 unlocked initially |
| `/codex/:slug` | PatternDetail | Locked until pattern is encountered in a level |
| `/library` | Library | All techniques; always accessible |
| `/library/:slug` | TechniqueDetail | Steps, examples, phrase substitutions |
| `/daily` | DailyPractice | One per day; +50 XP on first correct |
| `/review` | SpacedReview | SM-2 review; +5 XP per correct card |
| `/level/:id` | LevelRouter | Loads L01–L10 components; shows coming-soon for 11–20 |

**Unlock logic:** Level N requires Level N-1 complete. Tier 2 unlocks after L5, Tier 3 after L10, Tier 4 after L15.

---

## State Management

Five Zustand stores. Four are persisted to `localStorage`.

### `progressStore` — `signal-static-progress`
```
completedLevels: Record<number, LevelResult>
totalXP: number
weakPatterns: string[]          ← patterns with <70% accuracy in last 100 reviews
onboardingComplete: boolean
onboardingContext: string | null
```
Key functions: `completeLevel`, `isLevelUnlocked`, `getUnlockedTiers`

### `sessionStore` — (not persisted)
```
regulationLevel: number         ← 0–100 stress meter
isFlooded: boolean              ← true when regulation hits 100
breathingRequired: boolean      ← triggers full-screen breathing overlay
conversationHistory: Message[]
replayData: ReplayEntry[]
```
Flooding triggers a mandatory 4-4-4-4 box breathing exercise that reduces regulation by 30.

### `streakStore` — `signal-static-streak`
```
currentStreak: number
longestStreak: number
lastPracticeDate: string | null
dailyXPEarned: number
```
Streak alive if practice recorded today or yesterday. Daily XP resets at midnight.

### `repetitionStore` — `signal-static-repetition`
```
items: Record<string, RepetitionItem>
```
SM-2 algorithm: quality 0–5 → adjusts easiness factor and next review interval. Failure resets to 1-day interval.

### `codexStore` — `signal-static-codex`
```
unlockedPatterns: string[]
viewedPatterns: string[]
```
`unlockPattern(slug)` auto-seeds the item into `repetitionStore` on first unlock (cross-store call via `getState()`).

---

## LLM Integration

**Endpoint:** `http://localhost:11434/v1` (configurable in localStorage)
**Model:** `llama3.2` (configurable)
**API:** OpenAI-compatible `/v1/chat/completions` with SSE streaming

### Prompt builders in `llm.ts`

| Function | Used By | Output |
|---|---|---|
| `buildToxicPersonaPrompt(level, persona)` | L07 | System prompt deploying specific toxic patterns as a named character |
| `buildTacticalEmpathyCoachPrompt()` | L09 | Resistant conversation partner that reacts authentically to Voss techniques |
| `buildNVCCoachPrompt()` | (future L13) | Scores OFNR components, returns JSON |
| `buildReplayAnalysisPrompt(transcript)` | ReplayAnalysis | Post-session analysis: strengths, weaknesses, key moments, score 0–100 |

### `useLLMConversation` hook
- Probes Ollama on mount (`checkLLMConnection`, 3s timeout)
- Exposes `connected: boolean | null` (null = still checking)
- Streams tokens; optimistically shows empty assistant message
- On error: sets `connected = false`, removes empty message
- L07/L09 derive `useFallback = connected === false` — no manual button needed

---

## The 20 Levels

### Tier 1 — Foundation (built)

| # | Title | Mechanic | Patterns Covered | XP |
|---|---|---|---|---|
| 1 | The Emotion Decoder | Drag-drop | — (emotional granularity) | 150 |
| 2 | Red Flag Bingo | Flashcard sort | criticism, contempt, stonewalling, defensiveness | 150 |
| 3 | The Four Horsemen | Side-by-side | criticism, contempt, stonewalling, defensiveness | 175 |
| 4 | Validate This | Multiple choice | — (validation without endorsing) | 175 |
| 5 | The Phrase Lab | Fill-in-blank | — (language substitution) | 200 |

### Tier 2 — Recognition (built)

| # | Title | Mechanic | Patterns Covered | XP |
|---|---|---|---|---|
| 6 | Gaslight Detective | Evidence flagging | gaslighting, minimizing, blame-shifting | 250 |
| 7 | DARVO Decoder | AI conversation | darvo, projection, blame-shifting | 300 |
| 8 | The Maze of Circles | SVG maze | circular-conversations, word-salad, moving-goalposts, whataboutism | 275 |
| 9 | Tactical Empathy Training | AI conversation | — (mirror, label, calibrate, audit) | 300 |
| 10 | Spot the Trap | Impulse meter | jade-trap, baiting, reactive-abuse | 275 |

### Tier 3 — Response (not built)

| # | Title | Mechanic | Patterns Covered | XP |
|---|---|---|---|---|
| 11 | Boundary Bootcamp | Script builder | emotional-blackmail, guilt-tripping | 350 |
| 12 | The Reinforcement Trap | Timeline | intermittent-reinforcement, love-bombing, hoovering, future-faking | 325 |
| 13 | NVC Workshop | NVC constructor | — (OFNR framework) | 350 |
| 14 | Counter-Move Clinic | Rapid fire | 10 top patterns | 375 |
| 15 | Coercive Control Map | Connection map | coercive-control, flying-monkeys, triangulation, silent-treatment | 350 |

### Tier 4 — Mastery (not built)

| # | Title | Mechanic | Patterns Covered | XP |
|---|---|---|---|---|
| 16 | The Workplace Minefield | Format navigator | doublespeak, moving-goalposts, contempt, blame-shifting | 500 |
| 17 | Family Systems | Multi-character AI | rage-cycling, guilt-tripping, triangulation | 500 |
| 18 | Compound Tactics | Compound battle | 3–5 simultaneous patterns | 525 |
| 19 | The Negotiation Room | AI conversation | (synthesis, 10–15 min scenario) | 550 |
| 20 | Teach to Learn | Role reversal | All patterns encountered | 600 |

---

## The 30 Toxic Patterns

Defined in `data/patterns.ts`. Each has: slug, name, category, description, feelsLike, triggers, counterMove, neuroscience (optional), rarity, relatedPatterns.

**Manipulation (9):** DARVO, Gaslighting, Word Salad, Moving Goalposts, Projection, The JADE Trap, Future Faking, Catastrophizing, Doublespeak

**Control (5):** Silent Treatment, Coercive Control, Triangulation, Flying Monkeys, Emotional Blackmail

**Avoidance (4):** Stonewalling, Defensiveness, Whataboutism, + 1

**Attack (3):** Contempt, Criticism (Gottman), + 1

**Cycle (9):** Circular Conversations, Emotional Flooding, Love Bombing, Intermittent Reinforcement, Hoovering, Rage Cycling, Reactive Abuse, Baiting, Guilt-Tripping

Rarity tiers: `common` / `uncommon` / `rare`

---

## The 7 Personas

Defined in `data/personas.ts`. Used by AI levels as named conversation characters.

| Slug | Name | Role | Difficulty |
|---|---|---|---|
| alex | Alex | Partner | 1 |
| morgan | Morgan | Manager | 2 |
| river | River | Parent | 2 |
| sage | Sage | Sibling | 2 |
| quinn | Quinn | Ex-partner | 2 |
| jordan | Jordan | Colleague | 3 |
| taylor | Taylor | Negotiation | 3 |

---

## Design System

**Palette:**

| Token | Hex | Usage |
|---|---|---|
| Base | `#0f0f1a` | App background |
| Card | `#16213e` | Card backgrounds |
| Border | `#1e2a4a` | Card borders |
| Text primary | `#ffffff` | Headings |
| Text secondary | `#8892b0`, `#b0b8cc` | Body copy |
| Tier 1 / Cyan | `#00d4ff` | Foundation, interactive accent |
| Tier 2 / Gold | `#ffd700` | Recognition |
| Tier 3 / Orange | `#ff6b35` | Response |
| Tier 4 / Green | `#00ff88` | Mastery |
| Danger | `#ff3366` | Errors, critical regulation |

---

## What Is Built

- Full app shell, routing, and navigation
- Onboarding flow
- Home dashboard with stats
- TierMap level browser with unlock gating
- All 10 Tier 1 + Tier 2 levels (L01–L10), each with unique mechanic
- Auto-fallback for AI levels (L07, L09) — Ollama optional
- Regulation meter with flooding + breathing overlay
- Post-level ReplayAnalysis (AI feedback with offline skip)
- Pattern Codex — full 30-pattern encyclopedia, unlocked progressively
- Technique Library — frameworks reference (NVC, DEAR MAN, Tactical Empathy, …)
- Daily Practice — pattern MCQ with streak integration
- Spaced Review — SM-2 flashcard review system
- XP + streak system across all activities
- Root error boundary
- PWA (installable, offline-capable via service worker)

## What Is Not Built

- **Levels 11–20** — all show "Coming Soon". Mechanics needed:
  - `script-builder` (L11 Boundary Bootcamp)
  - `timeline` (L12 Reinforcement Trap)
  - `nvc-constructor` (L13 NVC Workshop) — prompt builder exists, UI doesn't
  - `rapid-fire` (L14 Counter-Move Clinic)
  - `connection-map` (L15 Coercive Control Map)
  - `format-navigator` (L16 Workplace Minefield)
  - `multi-character` (L17 Family Systems — multi-AI simulation)
  - `compound-battle` (L18 Compound Tactics)
  - `role-reversal` (L20 Teach to Learn)
- **Settings screen** — no UI to change LLM endpoint/model (stored in localStorage but no page)
- **Recharts analytics** — imported as dependency but not used anywhere
- **Onboarding personalisation** — `onboardingContext` is stored but not acted on (no tailored level suggestions or adaptive difficulty)
- **Weak pattern weighting in levels** — `weakPatterns` computed in progressStore but only partially used in DailyPractice
- **Pattern cross-linking in Codex** — `relatedPatterns` data exists but PatternDetail doesn't render links to them
- **Persona variety** — only `alex` is used (L07); Morgan, River, Sage, Quinn, Jordan, Taylor are defined but never assigned to a level
- **Export / reporting** — no progress export or summary PDF
- **Multiplayer / social features** — no leaderboard, sharing, or community layer
