# UI_DIRECTION.md — Visual Design & UX Decisions

This document captures every UI/UX decision made during Phase 1 development. It exists so future sessions have full strategic context and don't regress or contradict established direction.

For product vision and feature scope, see `PRODUCT.md`.
For component architecture and file layout, see `ARCHITECTURE.md`.

---

## Design Philosophy

### 1. Outcome over mechanic

Users care about *what they'll get*, not *how the AI works*. Copy should communicate the result ("5 AI agents debate what you should do tonight") rather than the process ("Watch the chaos"). We removed "Pick a city. Watch the chaos." from the hero subtitle for this reason — it sounded like a tech demo tagline, not a product promise.

### 2. Less AI, more personality

The product should feel like opinionated friends arguing, not a chatbot interface. This means:
- Agents have persistent visual identities (colors, not just emojis)
- Message bubbles look like a group chat, not a log stream
- The verdict is the hero — the debate is supporting evidence
- Follow-up prompts steer conversation, not open-ended text input

### 3. Show the answer, offer the proof

Users land on the verdict first. The full debate is available but collapsed — it's there for people who enjoy the entertainment layer, not required for people who just want the recommendation. This is the "newspaper" model: headline first, article below.

### 4. Motion is structural, not decorative

Every animation communicates something: entrance timing shows hierarchy, fade-ups signal new content, hover lifts indicate interactivity. No motion exists purely for spectacle. Stagger delays are kept short (0.08–0.1s) to feel snappy rather than sluggish.

### 5. Dark-first, high contrast

The UI is built on `zinc-950` backgrounds with carefully layered zinc tones for hierarchy. Color is reserved for meaningful elements: agent identities, vibe scores, and the logo gradient. White is used sparingly for primary text and active states.

---

## Color System

### Agent Identity Colors

Each agent has a dedicated color that persists across every surface — avatars, message bubbles, borders, name labels, thinking indicators. This replaces the original approach of bare emojis with no visual differentiation.

| Agent | Color | Tailwind | Hex |
|-------|-------|----------|-----|
| Nightowl | Purple | `purple-500` / `purple-400` | `#a855f7` |
| Foodie | Orange | `orange-500` / `orange-400` | `#f97316` |
| Culture | Blue | `blue-500` / `blue-400` | `#3b82f6` |
| Local | Amber | `amber-500` / `amber-400` | `#f59e0b` |
| Wanderer | Emerald | `emerald-500` / `emerald-400` | `#10b981` |

**Implementation:** `src/config/agent-colors.ts` defines `AgentColorSet` per agent (border, bg, text, accent, ring classes). CSS custom properties are also defined in `globals.css` as `--agent-{id}` for use outside Tailwind contexts.

**Why colors, not just emojis:** Emojis render inconsistently across platforms and don't scale to complex UI surfaces like borders and backgrounds. A persistent color system makes agents feel like real characters, not decorative icons.

### Vibe Score Colors

Scores are color-coded by threshold to create instant visual feedback:

| Range | Color | Meaning |
|-------|-------|---------|
| 85+ | `emerald-400` | Hot — go now |
| 70–84 | `amber-400` | Warm — solid pick |
| < 70 | `zinc-400` | Neutral — needs context |

### Logo

The VibeCITY logo uses a gradient on "CITY" (`from-purple-400 via-blue-400 to-emerald-400`) that deliberately echoes the agent color palette. "Vibe" remains white. The nav header uses a simpler `text-zinc-400` for "CITY" — the gradient is reserved for the hero to maintain visual hierarchy.

---

## Landing Page (`/`)

### Hero Section

**Layout:** Centered column — animated title, subtitle, agent roster, search bar. Staggered `fadeUp` entrance on each element.

**Title:** "VibeCITY" with gradient treatment on "CITY".

**Subtitle:** "5 AI agents debate what you should do {timeOfDay}." — single line, communicates outcome. Time-aware via `getTimeOfDayLabel()` (see Decisions Log #8). No second line. The search bar directly below serves as the implicit CTA.

**Agent roster:** A single muted line below the subtitle:
```
🦉 Nightowl · 🍜 Foodie · 🎭 Culture · 🏮 Local · 🧭 Wanderer
```
`text-sm text-zinc-500` — informational, not decorative. Built dynamically from `AGENTS` array. This replaced the original per-emoji animated `motion.span` row, which was visually meaningless to new visitors (5 bare emojis with no labels).

**Search bar:** "Drop a city..." placeholder. Animated dropdown on results (AnimatePresence fade). Links directly to `/city/{id}`.

### Trending Cities

**Header:** "Trending Now" with an animated emerald pulse dot — signals liveness without being distracting.

**Grid:** 3-column responsive grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`). Cards enter with staggered `fadeUp` (0.1s delay per card).

**Card consistency:** All cards are equal height via `h-full` on the `Card` component and `line-clamp-1` on taglines. This solved the uneven-height problem caused by variable tagline length (Berlin's tagline was wrapping to 2 lines while Tokyo's was 1 line).

### VibeCard Design

Each card shows: city name, country, truncated tagline, and vibe score. Score uses threshold-based coloring (see above). Cards have a `whileHover={{ y: -4 }}` lift animation for interactivity feedback.

---

## City View (`/city/{id}`)

### Two-Phase Layout

The city view has two distinct states, not one continuous page:

#### Phase A — Mood Gate (pre-debate)

The user arrives at a clean screen: city name, tagline, mood selector, "Surprise me" button, and vibe score card. No debate content loads until the user makes a choice. This is an intentional gate.

**Why a mood gate:** Starting a debate immediately on page load (the original behavior) was wasteful and disorienting. The user had no context for what they were seeing. The mood gate gives them agency — they choose the lens before the Council convenes. It also means we don't fire an API call until the user signals intent.

**Mood selector (prominent mode):** Large cards with emoji, label, and description. The "surprise" mood is excluded from the grid and offered separately as a "Surprise me" button below — it's a distinct action, not a parallel choice.

**Mood emojis:** Each mood now has an emoji (chaos: ⚡, chill: 🌊, surprise: ✨, culture: 🎨, feed me: 🍴) defined in `src/config/moods.ts`. These appear in both the prominent gate cards and the compact chip view.

#### Phase B — Debate Results (post-mood-selection)

Once a mood is selected, the layout shifts:

1. **Compact header** — city name (smaller, `text-2xl`) with the selected mood shown as a disabled chip
2. **Verdict card** — appears at the top when the debate completes, not buried below the chat
3. **Live debate stream** — visible during streaming, auto-scrolls, shows agent thinking indicators
4. **Collapsible debate** — after completion, the full debate collapses behind a "Show the full debate" toggle
5. **Follow-up prompts** — appear after verdict, trigger a new debate round

### Verdict Card

Custom component (no generic `Card` wrapper). Gradient border (`from-amber-500/20 to-emerald-500/20`) over `zinc-950` background. Three sections:

- **Top Pick** (amber) — the Council's consensus recommendation
- **Wildcard** (emerald) — the unexpected suggestion
- **The Debate** (zinc) — summary of where agents agreed/disagreed

Font sizes bumped to `text-base` for section headers, `leading-relaxed` on body text for readability.

### Debate Stream

- Scrollable container with `max-h-[60vh]` to prevent the debate from pushing the verdict off-screen
- Top and bottom fade gradients (`bg-gradient-to-b/t from-zinc-950`) for visual polish on scroll boundaries
- Agent thinking indicator uses the next agent's color, not generic zinc
- Messages have agent-colored left borders (`border-l-2`) and tinted backgrounds (`bg-{color}-500/10`)
- "The verdict is coming..." pulsing text during streaming

### Agent Message Bubbles

Each bubble has:
- Colored left border (2px, agent color)
- Tinted background (agent color at 10% opacity)
- Circular avatar with colored background (not bare emoji)
- Agent name in their color
- Venue names bolded in white (`font-semibold`)
- Reactions with a top padding separator

Animation timing: 0.08s stagger (down from 0.1s), 0.35s duration (down from 0.4s) — slightly snappier entrance.

---

## Navigation

A sticky `NavHeader` component was added: transparent with backdrop blur, `zinc-800/50` bottom border. Contains the VibeCITY wordmark (plain, no gradient — gradient is reserved for the hero).

**File:** `src/components/ui/NavHeader.tsx`

---

## Global Styles

- **Scrollbar:** Custom dark scrollbar (`zinc-700` thumb, transparent track, 6px width) via `::-webkit-scrollbar` rules
- **Font:** Removed explicit `font-family: Arial` — now inherits from Next.js default (system font stack)
- **CSS variables:** Agent accent colors defined as `--agent-{id}` custom properties for non-Tailwind use cases

---

## Animation Patterns

All animations use Framer Motion. Established patterns:

| Pattern | Usage | Values |
|---------|-------|--------|
| `fadeUp` | Content entrance | `opacity: 0→1, y: 12→0, duration: 0.4s` |
| `stagger` | Sequential children | `staggerChildren: 0.08–0.1s` |
| `hover lift` | Interactive cards | `y: -4, duration: 0.2s` |
| `pulse` | Live indicators | `opacity: [1, 0.3, 1], duration: 2s, repeat: Infinity` |
| `collapse` | Show/hide sections | `height: 0→auto, opacity: 0→1, duration: 0.3s` |
| `scale in` | Verdict appearance | `scale: 0.97→1, opacity: 0→1, duration: 0.5s` |
| `dropdown` | Search results | `opacity: 0→1, y: -4→0, duration: 0.15s` |

`AnimatePresence` is used for exit animations on: search dropdown, verdict card, collapsible debate.

---

## Decisions Log

Decisions that might seem arbitrary but were deliberate:

1. **No "Surprise me" in the mood grid** — "Surprise me" is a meta-action (skip choosing), not a mood. Placing it in the grid made it look like a 5th mood, confusing the hierarchy.

2. **Verdict above debate, not below** — Users who want a quick answer shouldn't have to scroll past 5 agent messages. The debate is entertainment for those who want it.

3. **Debate collapses after completion** — Once the verdict is shown, the debate served its purpose. Keeping it expanded pushes follow-up prompts below the fold, reducing engagement.

4. **Agent names drop "The"** — "Nightowl" reads better than "The Nightowl" in compact contexts (roster line, chips). The definite article is reserved for PRODUCT.md and full prose contexts.

5. **No tagline on the search input** — The subtitle already says what the product does. A search placeholder ("Drop a city...") is sufficient CTA. Adding "Search for a city" would be redundant.

6. **Trending pulse dot is emerald, not white** — Echoes the vibe score "hot" color, subtly reinforcing that these cities are high-vibe right now.

7. **Tagline clamp to 1 line on cards** — Equal card heights are more important than showing full taglines in a grid. The full tagline is visible on the city page.

8. **Time-aware hero copy** — The hero subtitle uses `getTimeOfDayLabel()` to shift between "this morning", "this afternoon", "this evening", and "tonight" based on the user's local time. This makes the product feel alive without adding complexity — it's a client-side `new Date().getHours()` check, no API needed. "Tonight" remains the default/late-night band (21–4) since that's the product's natural energy. The trending header was changed to "Trending Now" instead of making it time-aware — "Trending This Morning" sounds odd, while "Now" is always correct. Meta description uses the static "what you should do" since meta tags can't be dynamic.

---

## What's Not Settled Yet

Areas that may evolve as we build more of the product:

- **Share Vibe Card button** — not yet implemented; will need its own visual treatment
- **Spots Map integration** — how venue mentions in debates link to map pins
- **Mobile breakpoints** — current layout is responsive but hasn't been tested on real devices
- **Dark mode toggle** — currently dark-only; may need a light mode later (unlikely given brand identity)
- **Follow-up prompt styling** — currently functional but may need visual refinement to feel less like a chatbot
