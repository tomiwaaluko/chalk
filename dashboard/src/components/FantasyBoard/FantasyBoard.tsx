import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { FantasyProjection } from "../../types/chalk";

interface FantasyBoardProps {
  projections: FantasyProjection[];
  platform: string;
}

type SortKey = "mean" | "floor" | "ceiling" | "boom_rate" | "bust_rate";

/** Bust rate is the one column where a smaller number is the better one. */
const LOWER_IS_BETTER: SortKey[] = ["bust_rate"];

const PLATFORM_LABELS: Record<string, string> = {
  draftkings: "DraftKings",
  fanduel: "FanDuel",
  yahoo: "Yahoo",
};

const VALUE_THRESHOLD = 30;

export function FantasyBoard({ projections, platform }: FantasyBoardProps) {
  const [sortKey, setSortKey] = useState<SortKey>("mean");
  const [showValueOnly, setShowValueOnly] = useState(false);

  const sorted = [...projections].sort((a, b) =>
    LOWER_IS_BETTER.includes(sortKey)
      ? a[sortKey] - b[sortKey]
      : b[sortKey] - a[sortKey],
  );

  const filtered = showValueOnly
    ? sorted.filter((p) => p.mean > VALUE_THRESHOLD)
    : sorted;

  if (projections.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-hairline px-6 py-10 text-center">
        <p className="text-[0.9375rem] font-medium text-muted">
          No fantasy projections for this game
        </p>
        <p className="lede mx-auto mt-2 max-w-[46ch] text-[0.8125rem] leading-relaxed text-subtle">
          Scores are computed from the player projections once they finish
          loading. Check the Players tab for the underlying statlines.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="label text-subtle">
          {PLATFORM_LABELS[platform] ?? platform} scoring
        </span>

        <label className="flex cursor-pointer items-center gap-2 text-[0.8125rem] text-muted">
          <input
            type="checkbox"
            checked={showValueOnly}
            onChange={(e) => setShowValueOnly(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer rounded border-hairline-strong accent-chalk"
          />
          Value plays only
          <span className="num text-subtle">({VALUE_THRESHOLD}+)</span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] max-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline-strong text-subtle">
              <th className="label py-2.5 pr-4 font-semibold">Player</th>
              <SortHeader label="Proj" sortKey="mean" current={sortKey} onSort={setSortKey} />
              <SortHeader label="Floor" sortKey="floor" current={sortKey} onSort={setSortKey} />
              <SortHeader label="Ceiling" sortKey="ceiling" current={sortKey} onSort={setSortKey} />
              <SortHeader label="Boom" sortKey="boom_rate" current={sortKey} onSort={setSortKey} />
              <SortHeader label="Bust" sortKey="bust_rate" current={sortKey} onSort={setSortKey} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.player_id}
                className="border-b border-hairline transition-colors duration-[120ms] last:border-b-0 hover:bg-surface"
              >
                <td className="py-2.5 pr-4 text-[0.875rem] text-ink">
                  {p.player_name || String(p.player_id)}
                </td>
                <td className="num py-2.5 pr-4 text-right text-[0.875rem] font-semibold text-ink">
                  {p.mean.toFixed(1)}
                </td>
                <td className="num py-2.5 pr-4 text-right text-[0.875rem] text-subtle">
                  {p.floor.toFixed(1)}
                </td>
                <td className="num py-2.5 pr-4 text-right text-[0.875rem] text-muted">
                  {p.ceiling.toFixed(1)}
                </td>
                <td className="num py-2.5 pr-4 text-right text-[0.875rem]">
                  <span className={p.boom_rate >= 0.15 ? "text-edge-up" : "text-subtle"}>
                    {(p.boom_rate * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="num py-2.5 text-right text-[0.875rem]">
                  <span className={p.bust_rate >= 0.25 ? "text-edge-down" : "text-subtle"}>
                    {(p.bust_rate * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-md border border-dashed border-hairline px-6 py-8 text-center text-[0.8125rem] text-subtle">
          No player clears {VALUE_THRESHOLD} projected points in this game.
        </div>
      )}
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  const ascending = LOWER_IS_BETTER.includes(sortKey);
  const Arrow = ascending ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={active ? (ascending ? "ascending" : "descending") : "none"}
      className="py-2.5 pr-4 text-right last:pr-0"
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`label inline-flex cursor-pointer items-center gap-1 transition-colors duration-[120ms] ${
          active ? "text-ink" : "text-subtle hover:text-muted"
        }`}
      >
        {label}
        <Arrow
          size={10}
          aria-hidden
          className={active ? "text-chalk" : "text-transparent"}
        />
      </button>
    </th>
  );
}
