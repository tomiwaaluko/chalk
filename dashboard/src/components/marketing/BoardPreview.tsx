import { ProjectionRail } from "../Rail/ProjectionRail";

export interface BoardRow {
  player: string;
  team: string;
  opponent: string;
  stat: string;
  book: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  overProb: number;
  edge: number;
}

/**
 * The board, as it actually reads in the product: one row per player-stat,
 * ordered by how far the model sits from the book. The rail rides in the
 * row so the shape stays visible while you scan the numbers.
 */
export function BoardPreview({ rows }: { rows: BoardRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[8%]" />
          <col className="w-[30%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[13%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-hairline-strong text-subtle">
            <th className="label py-3 pr-4 font-semibold">Player</th>
            <th className="label py-3 pr-4 font-semibold">Stat</th>
            <th className="label w-[34%] py-3 pr-4 font-semibold">
              Distribution
            </th>
            <th className="label py-3 pr-4 text-right font-semibold">Book</th>
            <th className="label py-3 pr-4 text-right font-semibold">Model</th>
            <th className="label py-3 pr-4 text-right font-semibold">Over</th>
            <th className="label py-3 text-right font-semibold">Edge</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const lean = r.edge > 0 ? "over" : "under";
            const tone =
              r.edge > 0 ? "text-edge-up" : "text-edge-down";
            return (
              <tr
                key={`${r.player}-${r.stat}`}
                className="border-b border-hairline transition-colors duration-[120ms] last:border-b-0 hover:bg-surface"
              >
                <td className="py-3 pr-4">
                  <div className="text-[0.875rem] font-medium text-ink">
                    {r.player}
                  </div>
                  <div className="num mt-0.5 text-[0.6875rem] tracking-[0.04em] text-subtle">
                    {r.team} vs {r.opponent}
                  </div>
                </td>
                <td className="num py-3 pr-4 text-[0.75rem] tracking-[0.06em] text-muted">
                  {r.stat}
                </td>
                <td className="py-3 pr-6">
                  <ProjectionRail
                    p10={r.p10}
                    p25={r.p25}
                    median={r.median}
                    p75={r.p75}
                    p90={r.p90}
                    bookLine={r.book}
                    statLabel={r.stat}
                  />
                </td>
                <td className="num py-3 pr-4 text-right text-[0.875rem] text-muted">
                  {r.book.toFixed(1)}
                </td>
                <td className="num py-3 pr-4 text-right text-[0.875rem] font-semibold text-ink">
                  {r.median.toFixed(1)}
                </td>
                <td className="num py-3 pr-4 text-right text-[0.875rem] text-muted">
                  {Math.round(r.overProb * 100)}%
                </td>
                <td className={`py-3 text-right align-middle ${tone}`}>
                  <span className="inline-flex items-baseline gap-2">
                    <span className="num text-[0.875rem] font-semibold">
                      {r.edge > 0 ? "+" : "−"}
                      {Math.abs(r.edge * 100).toFixed(1)}%
                    </span>
                    <span className="label w-12 shrink-0 text-left opacity-80">{lean}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
