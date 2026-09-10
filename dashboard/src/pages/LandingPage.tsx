import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ProjectionRail } from "../components/Rail/ProjectionRail";
import { railScale } from "../components/Rail/scale";
import { BoardPreview, type BoardRow } from "../components/marketing/BoardPreview";
import { Label, Reveal, SectionHead } from "../components/marketing/primitives";
import { primaryCta, secondaryCta } from "../components/marketing/cta";

/* ── Sample data ───────────────────────────────────────────────
   Shaped like real model output. Labelled as a sample everywhere it
   appears — the live numbers are on the board, behind the CTA.        */

const HERO = {
  player: "Jayson Tatum",
  team: "BOS",
  opponent: "NYK",
  stat: "Points",
  p10: 18.1,
  p25: 21.4,
  median: 24.5,
  p75: 27.9,
  p90: 32.0,
  book: 23.5,
  overProb: 0.57,
  impliedProb: 0.524,
};

const HERO_EDGE = HERO.overProb - HERO.impliedProb;

const BOARD_ROWS: BoardRow[] = [
  { player: "Tyrese Haliburton", team: "IND", opponent: "MIL", stat: "AST", book: 9.5, p10: 6.2, p25: 8.1, median: 10.3, p75: 12.4, p90: 14.6, overProb: 0.58, edge: 0.052 },
  { player: "Jayson Tatum", team: "BOS", opponent: "NYK", stat: "PTS", book: 23.5, p10: 18.1, p25: 21.4, median: 24.5, p75: 27.9, p90: 32.0, overProb: 0.57, edge: 0.046 },
  { player: "Anthony Edwards", team: "MIN", opponent: "DEN", stat: "3PM", book: 3.5, p10: 1.0, p25: 2.1, median: 3.1, p75: 4.2, p90: 5.6, overProb: 0.44, edge: -0.038 },
  { player: "Alperen Şengün", team: "HOU", opponent: "OKC", stat: "AST", book: 5.5, p10: 3.4, p25: 4.6, median: 6.1, p75: 7.3, p90: 8.8, overProb: 0.56, edge: 0.037 },
  { player: "Nikola Jokić", team: "DEN", opponent: "MIN", stat: "REB", book: 12.5, p10: 9.1, p25: 11.2, median: 13.4, p75: 15.1, p90: 17.3, overProb: 0.55, edge: 0.031 },
  { player: "Domantas Sabonis", team: "SAC", opponent: "PHX", stat: "REB", book: 13.5, p10: 9.4, p25: 11.3, median: 12.8, p75: 14.6, p90: 16.9, overProb: 0.45, edge: -0.029 },
];

const ACCURACY = [
  { stat: "Points", mae: 4.906, target: 5.0, note: "Vegas closing line ≈ 4.5" },
  { stat: "Rebounds", mae: 1.995, target: 2.5, note: "—" },
  { stat: "Assists", mae: 1.454, target: 2.0, note: "—" },
  { stat: "3-pointers", mae: 0.907, target: 1.2, note: "—" },
  { stat: "Team total", mae: 15.4, target: 8.0, note: "Needs live odds + injury features" },
];

const METHOD = [
  {
    n: "01",
    title: "Ingest",
    body: "Every box score since 2015, pulled from the NBA API at 07:00 UTC. Writes are upserts, so re-running a job can never double-count a game.",
  },
  {
    n: "02",
    title: "Features",
    body: "74 features per player-game: rolling 5/10/20 windows, opponent defensive profile, rest days, injury context. Every one is gated on an as-of date, so no feature can see a game that hadn’t been played yet.",
  },
  {
    n: "03",
    title: "Model",
    body: "One LightGBM regressor per stat, tuned across 400 Optuna trials. Walk-forward validation only — train through 2022, validate on 2022-23, test on 2023-24. Never k-fold on a time series.",
  },
  {
    n: "04",
    title: "Distribution",
    body: "Quantile regression turns each point estimate into p10 / p25 / p50 / p75 / p90, then into over-under probabilities and DraftKings, FanDuel and Yahoo scores.",
  },
];

const READING: {
  key: string;
  title: string;
  body: string;
  q: { p10: number; p25: number; median: number; p75: number; p90: number };
  book?: number;
  bookLabel?: string;
  emphasis: "box" | "tick" | "book";
}[] = [
  {
    key: "box",
    title: "The box is the middle half",
    body: "p25 to p75 — where the outcome lands half the time. A wide box is a volatile player, and a line near the edge of a wide box is a coin flip dressed up as a number.",
    // Deliberately wide: this is what volatility looks like.
    q: { p10: 8, p25: 15, median: 22, p75: 30, p90: 37 },
    emphasis: "box",
  },
  {
    key: "tick",
    title: "The tick is the median",
    body: "Half of simulated outcomes fall above it, half below. It is the single number most products hand you on its own, with the uncertainty quietly removed.",
    // Tight box, so the eye goes to the tick.
    q: { p10: 17, p25: 20.5, median: 22, p75: 23.5, p90: 27 },
    emphasis: "tick",
  },
  {
    key: "dash",
    title: "The dash is the book",
    body: "The sportsbook’s posted line. Tick to the right of the dash is an over lean, to the left an under. The gap between them, priced against the vig, is the edge.",
    q: { p10: 16, p25: 20, median: 25, p75: 29, p90: 33 },
    book: 22.5,
    bookLabel: "Book 22.5",
    emphasis: "book",
  },
];

const CONTAINER = "mx-auto w-full max-w-[1180px] px-5 sm:px-8";

/* ── Page ──────────────────────────────────────────────────── */

export default function LandingPage() {
  const reduced = useReducedMotion();
  const at = railScale(HERO);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-chalk focus:px-4 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="pt-24 sm:pt-32">
          <div className={CONTAINER}>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: [0, 0, 0.2, 1] }}
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-edge-up opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-edge-up" />
                  </span>
                  <Label className="text-edge-up">Live slate</Label>
                </span>
                <span className="hidden h-3 w-px bg-hairline-strong sm:block" />
                <Label className="text-subtle">
                  <span className="sm:hidden">LightGBM · 74 features</span>
                  <span className="hidden sm:inline">
                    LightGBM · 74 features · walk-forward validated
                  </span>
                </Label>
              </div>

              <h1 className="display mt-7 max-w-[16ch] text-[clamp(2.5rem,6.6vw,4.25rem)] font-semibold">
                A projection is a range.
                <br />
                <span className="text-muted">Not a number.</span>
              </h1>

              <p className="lede mt-6 max-w-[56ch] text-[1.0625rem] leading-relaxed text-muted sm:text-[1.125rem]">
                Chalk models every NBA statline as a full distribution — floor,
                middle, ceiling — and marks where it disagrees with the
                sportsbook. You read the shape of the outcome, not somebody’s
                point estimate.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/dashboard" className={primaryCta()}>
                  Open tonight’s board
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a href="#method" className={secondaryCta()}>
                  How the number is made
                </a>
              </div>
            </motion.div>
          </div>

          {/* The rail, at full width. The one thing to remember about Chalk. */}
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-14 border-y border-hairline bg-sunken sm:mt-16"
          >
            <div className="mx-auto w-full max-w-[1320px] px-5 py-9 sm:px-8 sm:py-12">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[1.0625rem] font-semibold text-ink">
                    {HERO.player}
                  </span>
                  <span className="num text-[0.75rem] tracking-[0.06em] text-subtle">
                    {HERO.team} vs {HERO.opponent}
                  </span>
                  <span className="h-3 w-px bg-hairline-strong" />
                  <Label className="text-muted">{HERO.stat}</Label>
                </div>
                <Label className="text-subtle">Sample projection</Label>
              </div>

              {/* Rail + its scale share one domain via railScale(). */}
              <div className="relative mt-12 sm:mt-14">
                <ProjectionRail
                  {...HERO}
                  bookLine={HERO.book}
                  bookLabel={`Book ${HERO.book.toFixed(1)}`}
                  size="lg"
                  statLabel={HERO.stat}
                />

                <div className="relative mt-3 h-9" aria-hidden>
                  {[
                    { v: HERO.p10, k: "p10" },
                    { v: HERO.p25, k: "p25" },
                    { v: HERO.median, k: "median" },
                    { v: HERO.p75, k: "p75" },
                    { v: HERO.p90, k: "p90" },
                  ].map(({ v, k }) => (
                    <div
                      key={k}
                      className="absolute top-0 flex flex-col items-center gap-1"
                      style={{ left: `${at(v)}%`, transform: "translateX(-50%)" }}
                    >
                      <span
                        className={`num text-[0.8125rem] ${
                          k === "median"
                            ? "font-semibold text-ink"
                            : "text-muted"
                        }`}
                      >
                        {v.toFixed(1)}
                      </span>
                      <span
                        className={`label ${
                          k === "median" ? "text-chalk" : "text-subtle"
                        }`}
                      >
                        {k}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <dl className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-hairline bg-hairline sm:grid-cols-4">
                <Readout label="Book line" value={HERO.book.toFixed(1)} />
                <Readout label="Model median" value={HERO.median.toFixed(1)} />
                <Readout
                  label="Over probability"
                  value={`${Math.round(HERO.overProb * 100)}%`}
                />
                <Readout
                  label="Edge"
                  value={`+${(HERO_EDGE * 100).toFixed(1)}%`}
                  hint="over"
                  tone="up"
                />
              </dl>
            </div>
          </motion.div>

          {/* Proof. Facts, not adjectives. */}
          <div className="border-b border-hairline">
            <div className={CONTAINER}>
              <dl className="grid grid-cols-2 divide-hairline sm:grid-cols-4 sm:divide-x">
                <Proof value="4.91" unit="MAE" label="Points, held-out 2023-24" />
                <Proof value="0.91" unit="MAE" label="Threes, held-out 2023-24" />
                <Proof value="321" unit="tests" label="Passing, zero failures" />
                <Proof value="40" unit="ms" label="p99 prediction latency" />
              </dl>
            </div>
          </div>
        </section>

        {/* ── Reading the rail ─────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className={CONTAINER}>
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <Reveal className="lg:sticky lg:top-28">
                  <SectionHead
                    index="01"
                    title="Three marks, one decision."
                    lede="Every projection in Chalk is drawn the same way. Learn it once in the next thirty seconds and it holds for every player, every stat, all season."
                  />
                </Reveal>
              </div>

              <div className="lg:col-span-7">
                <div className="divide-y divide-hairline border-y border-hairline">
                  {READING.map((item, i) => (
                    <Reveal key={item.key} delay={i * 0.06}>
                      <div className="py-8 sm:py-9">
                        <ProjectionRail
                          {...item.q}
                          bookLine={item.book}
                          bookLabel={item.bookLabel}
                          emphasis={item.emphasis}
                          size="lg"
                          statLabel={item.title}
                        />
                        <h3 className="mt-5 text-[1.0625rem] font-semibold text-ink">
                          {item.title}
                        </h3>
                        <p className="lede mt-2 max-w-[54ch] text-[0.9375rem] leading-relaxed text-muted">
                          {item.body}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Method ───────────────────────────────────────── */}
        <section className="border-y border-hairline bg-sunken py-20 sm:py-28">
          <div className={CONTAINER}>
            <Reveal>
              <SectionHead
                id="method"
                index="02"
                title="How the number is made."
                lede="Four stages, one rule that governs all of them: a feature may never see a game that had not been played at prediction time."
              />
            </Reveal>

            <div className="mt-12 grid divide-y divide-hairline border-y border-hairline sm:mt-16 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
              {METHOD.map((step, i) => (
                <Reveal
                  key={step.n}
                  delay={i * 0.05}
                  className="lg:px-7 lg:first:pl-0 lg:last:pr-0"
                >
                  <div className="h-full py-7 sm:py-8">
                    <div className="flex items-baseline gap-3">
                      <span className="num text-[0.8125rem] font-semibold text-chalk">
                        {step.n}
                      </span>
                      <h3 className="text-[1rem] font-semibold text-ink">
                        {step.title}
                      </h3>
                    </div>
                    <p className="lede mt-3 text-[0.875rem] leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Accuracy ─────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className={CONTAINER}>
            <Reveal>
              <SectionHead
                id="accuracy"
                index="03"
                title="Where it lands. And where it doesn’t."
                lede="Mean absolute error on the held-out 2023-24 season, against the target set before training. Lower is better."
              />
            </Reveal>

            <Reveal delay={0.06}>
              <div className="mt-10 overflow-x-auto sm:mt-12">
                <table className="w-full min-w-[560px] max-w-[900px] border-collapse text-left align-middle">
                  <colgroup>
                    <col className="w-[26%]" />
                    <col className="w-[16%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-hairline-strong text-subtle">
                      <th className="label py-3 pr-4 font-semibold">Stat</th>
                      <th className="label py-3 pr-4 text-right font-semibold">
                        Chalk MAE
                      </th>
                      <th className="label py-3 pr-4 text-right font-semibold">
                        Target
                      </th>
                      <th className="label py-3 pr-4 font-semibold">Result</th>
                      <th className="label py-3 font-semibold">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ACCURACY.map((row) => {
                      const met = row.mae <= row.target;
                      return (
                        <tr
                          key={row.stat}
                          className="border-b border-hairline last:border-b-0"
                        >
                          <td className="py-3.5 pr-4 align-middle text-[0.9375rem] text-ink">
                            {row.stat}
                          </td>
                          <td className="num py-3.5 pr-4 text-right align-middle text-[0.9375rem] font-semibold text-ink">
                            {row.mae.toFixed(2)}
                          </td>
                          <td className="num py-3.5 pr-4 text-right align-middle text-[0.9375rem] text-muted">
                            {row.target.toFixed(2)}
                          </td>
                          <td className="py-3.5 pr-4 align-middle">
                            <span
                              className={`label inline-flex items-center ${met ? "text-edge-up" : "text-caution"}`}
                            >
                              {met ? "Met" : "Not yet"}
                            </span>
                          </td>
                          <td className="py-3.5 align-middle text-[0.8125rem] text-subtle">
                            {row.note}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 max-w-[64ch] rounded-md border border-hairline bg-sunken p-5 sm:p-6">
                <Label className="text-subtle">On the points number</Label>
                <p className="lede mt-3 text-[0.9375rem] leading-relaxed text-muted">
                  Points sits about four tenths above the Vegas closing-line
                  baseline. We are not claiming to beat the book on points — we
                  are claiming to show you the whole distribution while we close
                  that gap. Team totals are not there yet, and they stay on this
                  table until they are.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Board ────────────────────────────────────────── */}
        <section className="border-y border-hairline bg-sunken py-20 sm:py-28">
          <div className={CONTAINER}>
            <Reveal>
              <SectionHead
                index="04"
                title="Tonight’s board."
                lede="Every player in every game on the slate, ordered by the size of the disagreement between the model and the book."
              />
            </Reveal>
          </div>

          {/* Data runs wider than prose — same rule as the hero band. */}
          <Reveal delay={0.06}>
            <div className="mx-auto mt-10 w-full max-w-[1320px] px-5 sm:mt-12 sm:px-8">
              <BoardPreview rows={BOARD_ROWS} />
            </div>
          </Reveal>

          <div className="mx-auto mt-8 w-full max-w-[1320px] px-5 sm:px-8">
            <Label className="text-subtle">Sample rows</Label>
          </div>
        </section>

        {/* ── Close ────────────────────────────────────────── */}
        <section className="py-24 sm:py-32">
          <div className={CONTAINER}>
            <Reveal>
              <h2 className="display max-w-[18ch] text-[clamp(2rem,5vw,3.25rem)] font-semibold">
                The slate posts at 18:00 UTC.
              </h2>
              <p className="lede mt-5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-muted">
                Projections for every player in tonight’s games, with the
                distribution attached. No account, no card.
              </p>
              <div className="mt-9">
                <Link to="/dashboard" className={primaryCta("px-6 py-3.5")}>
                  Open the board
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ── Pieces ────────────────────────────────────────────────── */

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      {/* The chalk tick, same mark that sits on every median. */}
      <span className="h-4 w-[3px] shrink-0 translate-y-[1px] rounded-full bg-chalk" />
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink">
        Chalk
      </span>
    </span>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-canvas/85 backdrop-blur-md">
      <div className={`${CONTAINER} flex h-16 items-center justify-between`}>
        <Link to="/" aria-label="Chalk home">
          <Wordmark />
        </Link>

        <nav className="flex items-center gap-6 sm:gap-8">
          <a
            href="#method"
            className="hidden text-[0.875rem] text-muted transition-colors duration-[120ms] hover:text-ink sm:inline"
          >
            Method
          </a>
          <a
            href="#accuracy"
            className="hidden text-[0.875rem] text-muted transition-colors duration-[120ms] hover:text-ink sm:inline"
          >
            Accuracy
          </a>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-ink transition-colors duration-[120ms] hover:text-chalk"
          >
            Open the board
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Readout({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "up";
}) {
  return (
    <div className="bg-sunken px-4 py-4 sm:px-5">
      <dt className="label text-subtle">{label}</dt>
      <dd className="mt-2 flex items-baseline gap-2">
        <span
          className={`num text-[1.375rem] font-semibold ${
            tone === "up" ? "text-edge-up" : "text-ink"
          }`}
        >
          {value}
        </span>
        {hint && <span className="label text-subtle">{hint}</span>}
      </dd>
    </div>
  );
}

function Proof({
  value,
  unit,
  label,
}: {
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="border-b border-hairline px-0 py-6 sm:border-b-0 sm:px-6 sm:py-8 sm:first:pl-0">
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="flex items-baseline gap-1.5">
          <span className="num text-[1.75rem] font-semibold text-ink">
            {value}
          </span>
          <Label className="text-subtle">{unit}</Label>
        </span>
        <span className="mt-2 block text-[0.8125rem] leading-snug text-muted">
          {label}
        </span>
      </dd>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hairline bg-sunken">
      <div className={`${CONTAINER} py-12`}>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-[42ch] text-[0.8125rem] leading-relaxed text-subtle">
              NBA statline projections from LightGBM quantile models, trained on
              nine seasons of box scores and validated walk-forward.
            </p>
          </div>

          <nav className="flex gap-10 text-[0.875rem]">
            <div className="flex flex-col gap-2.5">
              <Label className="text-subtle">Product</Label>
              <Link
                to="/dashboard"
                className="text-muted transition-colors duration-[120ms] hover:text-ink"
              >
                Board
              </Link>
              <a
                href="#method"
                className="text-muted transition-colors duration-[120ms] hover:text-ink"
              >
                Method
              </a>
              <a
                href="#accuracy"
                className="text-muted transition-colors duration-[120ms] hover:text-ink"
              >
                Accuracy
              </a>
            </div>
          </nav>
        </div>

        <div className="mt-10 border-t border-hairline pt-6">
          <p className="max-w-[68ch] text-[0.75rem] leading-relaxed text-subtle">
            Projections are model output, not advice, and a distribution is not
            a guarantee. Bet only what you can afford to lose. If gambling stops
            being a game, call 1-800-GAMBLER.
          </p>
        </div>
      </div>
    </footer>
  );
}
