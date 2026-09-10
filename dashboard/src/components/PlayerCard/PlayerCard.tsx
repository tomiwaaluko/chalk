import type { PlayerPrediction } from "../../types/chalk";
import { InjuryBadge } from "../InjuryBadge/InjuryBadge";
import { StatDistribution } from "../StatDistribution/StatDistribution";
import { AlertTriangle } from "lucide-react";

interface PlayerCardProps {
  prediction: PlayerPrediction;
}

/** How tightly the quantile models agree across this player's key stats. */
const CONFIDENCE_STYLES: Record<string, string> = {
  high: "text-edge-up",
  medium: "text-caution",
  low: "text-edge-down",
};

const KEY_STATS = ["pts", "reb", "ast", "fg3m"];

export function PlayerCard({ prediction }: PlayerCardProps) {
  const {
    player_id,
    player_name,
    opponent_team,
    predictions,
    fantasy_scores,
    injury_context,
  } = prediction;

  const keyPreds = predictions.filter((p) => KEY_STATS.includes(p.stat));
  const overallConfidence = getOverallConfidence(keyPreds);
  const absent = injury_context.absent_teammates;

  return (
    <article className="flex h-full flex-col rounded-md border border-hairline bg-surface transition-colors duration-[120ms] hover:border-hairline-strong">
      <header className="flex items-start justify-between gap-3 border-b border-hairline px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-[0.9375rem] font-semibold text-ink">
            {player_name || String(player_id)}
          </h3>
          <p className="num mt-0.5 text-[0.6875rem] tracking-[0.04em] text-subtle">
            vs {opponent_team}
          </p>
          {/* An available player shows no badge, so state it for screen readers. */}
          <span className="sr-only">
            Status: {injury_context.player_status || "Active"}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <InjuryBadge status={injury_context.player_status} />
          <span
            className={`label ${CONFIDENCE_STYLES[overallConfidence]}`}
            title={`Model confidence: ${overallConfidence}`}
          >
            {overallConfidence}
          </span>
        </div>
      </header>

      {absent.length > 0 && (
        <div className="flex items-start gap-2 border-b border-hairline bg-caution/5 px-4 py-2.5">
          <AlertTriangle
            size={13}
            className="mt-px shrink-0 text-caution"
            aria-hidden
          />
          <p className="text-[0.75rem] leading-snug text-caution">
            Usage bump — {absent.join(", ")} {absent.length === 1 ? "is" : "are"} out
          </p>
        </div>
      )}

      <div className="flex-1 space-y-2.5 px-4 py-4">
        {keyPreds.length > 0 ? (
          keyPreds.map((p) => <StatDistribution key={p.stat} prediction={p} />)
        ) : (
          <p className="text-[0.8125rem] text-subtle">No stat models ran for this player.</p>
        )}
      </div>

      <footer className="mt-auto flex items-center gap-5 border-t border-hairline px-4 py-2.5">
        <span className="label text-subtle">Fantasy</span>
        <div className="flex flex-1 items-center justify-end gap-4">
          <FantasyChip label="DK" value={fantasy_scores.draftkings} />
          <FantasyChip label="FD" value={fantasy_scores.fanduel} />
          <FantasyChip label="YH" value={fantasy_scores.yahoo} />
        </div>
      </footer>
    </article>
  );
}

function FantasyChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="label text-subtle">{label}</span>
      <span className="num text-[0.8125rem] font-semibold text-ink">
        {value.toFixed(1)}
      </span>
    </span>
  );
}

function getOverallConfidence(
  preds: { confidence: "high" | "medium" | "low" }[],
): "high" | "medium" | "low" {
  const scores = { high: 3, medium: 2, low: 1 };
  if (preds.length === 0) return "medium";
  const avg =
    preds.reduce((sum, p) => sum + scores[p.confidence], 0) / preds.length;
  if (avg >= 2.5) return "high";
  if (avg >= 1.5) return "medium";
  return "low";
}
