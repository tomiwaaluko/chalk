import { useState } from "react";
import type { OverUnderLine } from "../../types/chalk";

interface PropsBoardProps {
  props: OverUnderLine[];
}

const STAT_LABELS: Record<string, string> = {
  pts: "PTS",
  reb: "REB",
  ast: "AST",
  fg3m: "3PM",
};

type FilterStat = "all" | string;
type FilterConf = "all" | "high" | "medium" | "low";

/** An edge this size is worth surfacing above the rest of the board. */
const STRONG_EDGE = 0.08;

export function PropsBoard({ props }: PropsBoardProps) {
  const [statFilter, setStatFilter] = useState<FilterStat>("all");
  const [confFilter, setConfFilter] = useState<FilterConf>("all");

  const filtered = props
    .filter((p) => statFilter === "all" || p.stat === statFilter)
    .filter((p) => confFilter === "all" || p.confidence === confFilter)
    .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));

  const uniqueStats = [...new Set(props.map((p) => p.stat))];

  if (props.length === 0) {
    return (
      <EmptyState
        title="No book lines for this game yet"
        body="Props appear once sportsbook lines have been ingested for the slate. Player projections are on the Players tab in the meantime."
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="label mr-1 text-subtle">Stat</span>
        <FilterBtn active={statFilter === "all"} onClick={() => setStatFilter("all")}>
          All
        </FilterBtn>
        {uniqueStats.map((s) => (
          <FilterBtn
            key={s}
            active={statFilter === s}
            onClick={() => setStatFilter(s)}
          >
            {STAT_LABELS[s] ?? s}
          </FilterBtn>
        ))}

        <span className="mx-2 hidden h-4 w-px bg-hairline sm:block" />

        <span className="label mr-1 text-subtle">Confidence</span>
        <FilterBtn active={confFilter === "all"} onClick={() => setConfFilter("all")}>
          Any
        </FilterBtn>
        {(["high", "medium", "low"] as const).map((c) => (
          <FilterBtn
            key={c}
            active={confFilter === c}
            onClick={() => setConfFilter(c)}
          >
            {c}
          </FilterBtn>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] max-w-[980px] border-collapse text-left">
          <colgroup>
            <col className="w-[32%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-hairline-strong text-subtle">
              <th className="label py-2.5 pr-4 font-semibold">Player</th>
              <th className="label py-2.5 pr-4 font-semibold">Stat</th>
              <th className="label py-2.5 pr-4 text-right font-semibold">Line</th>
              <th className="label py-2.5 pr-4 text-right font-semibold">Model</th>
              <th className="label py-2.5 pr-4 text-right font-semibold">Implied</th>
              <th className="label py-2.5 text-right font-semibold">Edge</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const strong = Math.abs(p.edge) >= STRONG_EDGE;
              return (
                <tr
                  key={`${p.player_id}-${p.stat}-${i}`}
                  className="border-b border-hairline transition-colors duration-[120ms] last:border-b-0 hover:bg-surface"
                >
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-2">
                      {/* Marks the handful of lines worth acting on. */}
                      <span
                        aria-hidden
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          strong ? "bg-chalk" : "bg-transparent"
                        }`}
                      />
                      <span className="text-[0.875rem] text-ink">
                        {p.player_name || String(p.player_id)}
                      </span>
                      {strong && <span className="sr-only">Strong edge</span>}
                    </span>
                  </td>
                  <td className="num py-2.5 pr-4 text-[0.75rem] tracking-[0.06em] text-muted">
                    {STAT_LABELS[p.stat] ?? p.stat}
                  </td>
                  <td className="num py-2.5 pr-4 text-right text-[0.875rem] text-muted">
                    {p.line.toFixed(1)}
                  </td>
                  <td className="num py-2.5 pr-4 text-right text-[0.875rem] font-semibold text-ink">
                    {(p.over_probability * 100).toFixed(0)}%
                  </td>
                  <td className="num py-2.5 pr-4 text-right text-[0.875rem] text-muted">
                    {(p.implied_over_prob * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 text-right align-middle">
                    <EdgeCell edge={p.edge} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          title="Nothing matches those filters"
          body="Widen the stat or confidence filter to see the rest of the board."
        />
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-dashed border-hairline px-6 py-10 text-center">
      <p className="text-[0.9375rem] font-medium text-muted">{title}</p>
      <p className="lede mx-auto mt-2 max-w-[46ch] text-[0.8125rem] leading-relaxed text-subtle">
        {body}
      </p>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded px-2 py-1 text-[0.75rem] font-medium capitalize transition-colors duration-[120ms] ${
        active
          ? "bg-surface text-ink"
          : "text-subtle hover:bg-surface/60 hover:text-muted"
      }`}
    >
      {children}
    </button>
  );
}

/** Model probability minus the book's vig-adjusted implied probability. */
function EdgeCell({ edge }: { edge: number }) {
  const pct = Math.abs(edge * 100).toFixed(1);
  const meaningful = Math.abs(edge) > 0.04;
  const tone = !meaningful
    ? "text-subtle"
    : edge > 0
      ? "text-edge-up"
      : "text-edge-down";

  return (
    <span className={`inline-flex items-baseline gap-2 ${tone}`}>
      <span className="num text-[0.875rem] font-semibold">
        {edge > 0 ? "+" : "−"}
        {pct}%
      </span>
      {/* Fixed width keeps every row the same height whether or not the
          lean is worth naming. */}
      <span className="label w-12 shrink-0 text-left opacity-80">
        {meaningful ? (edge > 0 ? "over" : "under") : ""}
      </span>
    </span>
  );
}
