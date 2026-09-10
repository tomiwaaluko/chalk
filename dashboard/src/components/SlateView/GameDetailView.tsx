import { useRef, useState } from "react";
import type { GameSlate, OverUnderLine, FantasyProjection } from "../../types/chalk";
import { PlayerCard } from "../PlayerCard/PlayerCard";
import { PropsBoard } from "../PropsBoard/PropsBoard";
import { FantasyBoard } from "../FantasyBoard/FantasyBoard";

interface GameDetailViewProps {
  game: GameSlate;
  props: OverUnderLine[];
  fantasyProjections: FantasyProjection[];
}

const TABS = [
  { id: "players", label: "Players" },
  { id: "props", label: "Props" },
  { id: "fantasy", label: "Fantasy" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function GameDetailView({
  game,
  props,
  fantasyProjections,
}: GameDetailViewProps) {
  const [tab, setTab] = useState<Tab>("players");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /** Arrow keys move between tabs, as a tablist is expected to. */
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section>
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-hairline pb-4">
        <h2 className="num text-[1.125rem] font-semibold tracking-[0.01em] text-ink">
          {game.away_team}
          <span className="mx-2 text-subtle">@</span>
          {game.home_team}
        </h2>

        <div className="flex items-baseline gap-2">
          <span className="label text-subtle">Projected total</span>
          <span className="num text-[1.125rem] font-semibold text-ink">
            {game.predicted_total.toFixed(1)}
          </span>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Game views"
        className="-mx-1 mb-6 mt-4 flex gap-1 overflow-x-auto"
      >
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
            className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-[0.8125rem] font-medium transition-colors duration-[120ms] ${
              tab === t.id
                ? "bg-surface text-ink"
                : "text-subtle hover:bg-surface/60 hover:text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={-1}
      >
        {tab === "players" && (
          <div className="space-y-8">
            <TeamGroup team={game.away_team} label="Away" predictions={game.away_predictions} />
            <TeamGroup team={game.home_team} label="Home" predictions={game.home_predictions} />
          </div>
        )}

        {tab === "props" && <PropsBoard props={props} />}

        {tab === "fantasy" && (
          <FantasyBoard projections={fantasyProjections} platform="draftkings" />
        )}
      </div>
    </section>
  );
}

function TeamGroup({
  team,
  label,
  predictions,
}: {
  team: string;
  label: string;
  predictions: GameSlate["home_predictions"];
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <h3 className="num text-[0.8125rem] font-semibold tracking-[0.06em] text-ink">
          {team}
        </h3>
        <span className="label text-subtle">{label}</span>
        <span className="h-px flex-1 bg-hairline" />
        <span className="num text-[0.6875rem] text-subtle">
          {predictions.length}
        </span>
      </div>

      {predictions.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {predictions.map((p) => (
            <PlayerCard key={p.player_id} prediction={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-hairline px-4 py-6 text-center text-[0.8125rem] text-subtle">
          No projections for this side yet.
        </p>
      )}
    </div>
  );
}
