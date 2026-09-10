import type { StatPrediction } from "../../types/chalk";
import { ProjectionRail } from "../Rail/ProjectionRail";

interface StatDistributionProps {
  prediction: StatPrediction;
  vegasLine?: number;
  edge?: number;
}

const STAT_LABELS: Record<string, string> = {
  pts: "PTS",
  reb: "REB",
  ast: "AST",
  fg3m: "3PM",
  stl: "STL",
  blk: "BLK",
  to_committed: "TO",
};

/**
 * One stat, one row: label, the rail, and the median called out.
 * The rail carries the uncertainty so the number doesn't have to pretend.
 */
export function StatDistribution({ prediction, vegasLine }: StatDistributionProps) {
  const { stat, p10, p25, median, p75, ceiling } = prediction;
  const label = STAT_LABELS[stat] ?? stat.toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <span className="label w-8 shrink-0 text-subtle">{label}</span>

      <ProjectionRail
        p10={p10}
        p25={p25}
        median={median}
        p75={p75}
        p90={ceiling}
        bookLine={vegasLine}
        statLabel={label}
        className="min-w-0 flex-1"
      />

      <span className="num w-10 shrink-0 text-right text-[0.8125rem] font-semibold text-ink">
        {median.toFixed(1)}
      </span>
    </div>
  );
}
