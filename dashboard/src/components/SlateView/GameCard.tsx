interface GameCardProps {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  predictedTotal?: number;
  playerCount?: number;
  selected: boolean;
  onClick: () => void;
}

export function GameCard({
  homeTeam,
  awayTeam,
  predictedTotal,
  playerCount,
  selected,
  onClick,
}: GameCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      className={`group relative w-full cursor-pointer rounded-md border px-3 py-2.5 text-left transition-colors duration-[120ms] ${
        selected
          ? "border-hairline-strong bg-surface"
          : "border-hairline bg-transparent hover:border-hairline-strong hover:bg-surface/60"
      }`}
    >
      {/* Selection is the one thing a side mark is allowed to mean. */}
      <span
        aria-hidden
        className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full transition-colors duration-[120ms] ${
          selected ? "bg-chalk" : "bg-transparent"
        }`}
      />

      <div className="flex items-baseline justify-between gap-2 pl-2">
        <span className="num whitespace-nowrap text-[0.8125rem] tracking-[0.02em]">
          <span className={selected ? "text-ink" : "text-muted"}>{awayTeam}</span>
          <span className="mx-1.5 text-subtle">@</span>
          <span className={selected ? "text-ink" : "text-muted"}>{homeTeam}</span>
        </span>

        {predictedTotal !== undefined && (
          <span className="num shrink-0 text-[0.8125rem] font-semibold text-ink">
            {predictedTotal.toFixed(1)}
          </span>
        )}
      </div>

      {playerCount !== undefined && playerCount > 0 && (
        <div className="num mt-1 pl-2 text-[0.6875rem] tracking-[0.04em] text-subtle">
          {playerCount} projected
        </div>
      )}
    </button>
  );
}
