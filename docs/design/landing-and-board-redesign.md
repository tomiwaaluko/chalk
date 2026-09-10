# Landing page + board redesign

Design record for the `claude/landing-page-redesign-4ubp92` work. Written so a
future change can tell an intentional decision from an accident.

Methodology: the [refero-design](https://github.com/referodesign/refero_skill)
skill. The Refero MCP server was **not** configured for that session, so the
skill's documented fallback applied — research and lock a direction against the
bundled craft references and the product's own constraints, then validate the
rendered result against the lock before handing off. There was no live styles /
screens / flows research, and no design decision here should be attributed to it.

---

## Brief

```
Designing the marketing page and the board UI for Chalk, an NBA statline
projector, on web.
Goal: get a bettor or DFS player to trust the number and open the board.
Tone: quantitative, unsentimental, fast. A market terminal, not a hype site.
Main objection: "another AI picks site."
Must remember: a projection is a distribution, and Chalk shows you the whole thing.
Constraints: existing navy/orange brand, React + Tailwind v4, no live odds feed yet.
Path: direct build against a locked direction.
```

## Reference lock

```
Primary direction: market-data terminal — dense tabular figures, hairline rules
  instead of card walls, monospaced tabular numerals, uppercase micro-labels.
Preserve: dark navy canvas (#0F1624, brand-given), data denser than prose,
  rules over boxes, one accent used sparingly, numerals in mono throughout.
Borrow only: restrained hairline geometry and compact UI copy from precise
  developer-tool marketing pages.
Role rules:
  - chalk orange  → brand mark, primary CTA, median tick. Nothing else.
  - green / red   → edge direction and player availability. Never decorative.
  - mono          → numerals and identifiers. Never prose.
Media strategy: code-native. The product's own distribution rail is the hero
  graphic at full scale. No stock photography, no fake illustration, and no
  grey-rectangle mockups pretending to be product screenshots.
Reject: gradient headline text, decorative blur blobs, a symmetric three-card
  feature grid, indigo/violet anything, emoji as icons, decorative side stripes.
Tokens: canvas #0F1624 · sunken #0A0F19 · surface #151E2E · hairline #212D40 ·
  ink #E8EDF5 · muted #93A1B8 · subtle #7B8AA3 · chalk #E8531A ·
  edge-up #22C55E · edge-down #EF4444 · caution #F5A524.
  Type: Inter (UI) + JetBrains Mono (figures), both self-hosted.
```

Dark mode is a deliberate exception to the craft references' light-mode default:
the navy canvas is pre-existing brand, and the brief asked to keep the theme.

## Decision ledger

| Decision | Source | Role preserved | Why |
|---|---|---|---|
| The rail as the one signature graphic | Product constraint + media rule ("do not fake complex imagery") | Median tick is the only place brand orange is a mark | It is real product output, it teaches the thesis in three seconds, and it is code-native so it never depends on an asset that may not load |
| Same rail primitive at hero and row scale | Craft: consistency over novelty | `size` varies, marks do not | What a visitor learns on the landing page is what they read all season on the board |
| Full-bleed hero band instead of left-text/right-image | Anti-slop: the split hero is the most-copied layout there is | — | Gives the rail the width to be legible and breaks the expected shape |
| Headline "A projection is a range. Not a number." | Copywriting: sticky line, clarity before character | Second sentence uses the `muted` *text-hierarchy* token, not an accent | States the product thesis and the competitive claim in six words |
| Accuracy table publishes the missed target | Copywriting: proof beats hype, real limits build credibility | `caution` marks "not yet" | Sharp bettors discount pages that only show wins; team-total MAE 15.4 vs a target of 8.0 stays on the table until it is fixed |
| Dropped "Vegas-beating accuracy" | Repo metrics | — | 4.91 points MAE against a ~4.5 closing-line baseline does not support the claim. See "Copy corrections" below |
| Near-black text on the orange CTA | Contrast | CTA keeps its accent role | White on #E8531A is 3.7:1 and fails AA; #0F1624 on it is 4.97:1 and reads sharper on a dark canvas |
| Numbered method sequence, not a card grid | Anti-slop: cards only where there is an interaction | Hairline rules replace card chrome | Nothing in that section is clickable, so nothing in it is a card |
| Availability badge hidden for active players | Colour semantics | Badge always means something changed | A green badge on every card trains the eye to skip the one row that matters |
| Tabular numerals everywhere (`.num`) | Craft: data density | Mono is figures-only | Columns stop jittering as predictions refresh on a 5-minute interval |

## Removed, and why

| Removed | Reason |
|---|---|
| Gradient-filled headline text | Decoration with no function; the #1 giveaway of a generated page |
| `blur-[120px]` orange glow blob | Same |
| Three symmetric feature cards | Card-as-default-container; none of them was interactive |
| Grey-rectangle "dashboard preview" mockup | Fake product imagery. Replaced with the real board, rendered by the real component |
| Non-functional "See How It Works" button | Dead control. Now an anchor to the method section |
| Player headshots from `cdn.nba.com` | The hero no longer depends on a third-party image host, which is unreachable from some networks |
| Duplicate "Model" column on the props board | It rendered `line` twice. Now shows model over-probability against the book's vig-adjusted implied probability, which is the comparison that matters |

## Copy corrections

The previous page claimed **"AI-powered player projections with Vegas-beating
accuracy"** and **"MAE beating Vegas on 4/4 stats"**. The repo's own numbers do
not support this: points MAE is 4.906 against a Vegas closing-line baseline of
roughly 4.5, and lower is better. `CLAUDE.md` frames ≤5.0 as *approaching* the
baseline, not beating it. The page now states the gap plainly.

The footer also credited **XGBoost**. Since Phase 8, `chalk/predictions/player.py`
uses **LightGBM** as the primary model for pts/reb/ast/fg3m. Copy updated.

## Accessibility

- All four text tokens pass WCAG AA on the canvas (15.6:1 / 7.0:1 / 5.3:1, accent 5.0:1).
- `:focus-visible` only, never removed, 2px offset ring.
- Tabs are a real `tablist` with arrow-key navigation and roving `tabIndex`.
- Each rail is `role="img"` with a spoken description of its quantiles.
- `prefers-reduced-motion` disables reveals and transitions; `useReducedMotion`
  short-circuits the JS-driven ones rather than animating to the same place.
- Verified 0px horizontal overflow at 1440px and 390px.

## Verification

`tsc -b`, `eslint`, and `vite build` all clean. Both routes driven under
Playwright at 1440×900 and 390×844, with the board rendered against stubbed
`/v1` fixtures; no console or page errors.
