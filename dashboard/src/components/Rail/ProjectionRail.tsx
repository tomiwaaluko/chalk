import { edgeDirection, type EdgeDirection, type RailQuantiles, railScale } from "./scale";

/**
 * The rail — Chalk's one signature graphic.
 *
 * A projection is not a number, it is a shape. The rail draws that shape:
 * the p10–p90 whisker, the p25–p75 box where the outcome usually lands,
 * a chalk tick on the median, and a dashed marker for the sportsbook's
 * number. Where the tick sits relative to the dash *is* the product.
 *
 * The same primitive renders at hero scale on the landing page and at row
 * scale inside a player card, so the thing a visitor learns to read is the
 * thing they use all season.
 */
interface ProjectionRailProps extends RailQuantiles {
  /** The sportsbook's posted line, when there is one. */
  bookLine?: number;
  size?: "sm" | "lg";
  /** Stat name, used to build the accessible description. */
  statLabel?: string;
  /**
   * Dims the other two marks so one can be talked about on its own.
   * Used by the explainer on the landing page.
   */
  emphasis?: "box" | "tick" | "book";
  /** Caption pinned above the book line, e.g. "Book 23.5". */
  bookLabel?: string;
  className?: string;
}

const GEOMETRY = {
  sm: { track: 20, range: 2, box: 10, tick: 16, radius: 2, tickWidth: 2, bookWidth: 1, bookOverhang: 0 },
  // The book line overhangs the track at hero scale so the dash reads as a
  // marker laid across the distribution rather than a scratch inside it.
  lg: { track: 48, range: 3, box: 28, tick: 40, radius: 4, tickWidth: 3, bookWidth: 2, bookOverhang: 10 },
} as const;

const DIRECTION_TEXT: Record<EdgeDirection, string> = {
  up: "text-edge-up",
  down: "text-edge-down",
  flat: "text-muted",
};

export function ProjectionRail({
  p10,
  p25,
  median,
  p75,
  p90,
  bookLine,
  size = "sm",
  statLabel,
  emphasis,
  bookLabel,
  className = "",
}: ProjectionRailProps) {
  const g = GEOMETRY[size];
  const at = railScale({ p10, p25, median, p75, p90, bookLine });
  const direction = edgeDirection(median, bookLine);

  /**
   * Everything stays full strength until one mark is singled out. The book
   * marker keeps the tick lit alongside it, because the whole point of the
   * dash is where the tick sits relative to it.
   */
  const dim = (mark: "box" | "tick" | "book") => {
    if (!emphasis) return "opacity-100";
    if (emphasis === mark) return "opacity-100";
    if (emphasis === "book" && mark === "tick") return "opacity-100";
    return "opacity-30";
  };

  const description = [
    statLabel ? `${statLabel} projection` : "Projection",
    `median ${median.toFixed(1)}`,
    `middle half ${p25.toFixed(1)} to ${p75.toFixed(1)}`,
    `range ${p10.toFixed(1)} to ${p90.toFixed(1)}`,
    bookLine !== undefined ? `book line ${bookLine.toFixed(1)}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      role="img"
      aria-label={description}
      className={`relative w-full ${className}`}
      style={{ height: g.track }}
    >
      {/* p10 → p90: the tail. Thin, so it reads as context not content. */}
      <div
        className="absolute rounded-full bg-hairline-strong"
        style={{
          top: (g.track - g.range) / 2,
          height: g.range,
          left: `${at(p10)}%`,
          width: `${at(p90) - at(p10)}%`,
        }}
      />

      {/* p25 → p75: where it lands half the time. */}
      <div
        className={`absolute border border-chalk/50 bg-chalk/15 transition-opacity ${dim("box")}`}
        style={{
          top: (g.track - g.box) / 2,
          height: g.box,
          left: `${at(p25)}%`,
          width: `${at(p75) - at(p25)}%`,
          borderRadius: g.radius,
        }}
      />

      {/* The chalk tick. The only place the brand orange appears as a mark. */}
      <div
        className={`absolute bg-chalk transition-opacity ${dim("tick")}`}
        style={{
          top: (g.track - g.tick) / 2,
          height: g.tick,
          width: g.tickWidth,
          left: `${at(median)}%`,
          transform: "translateX(-50%)",
          borderRadius: 999,
        }}
      />

      {/* The book's number. Dashed, because it is somebody else's guess. */}
      {bookLine !== undefined && (
        <div
          className={`absolute transition-opacity ${dim("book")}`}
          style={{ left: `${at(bookLine)}%`, top: 0, height: g.track }}
        >
          <div
            className={`book-line absolute ${DIRECTION_TEXT[direction]}`}
            style={{
              top: -g.bookOverhang,
              height: g.track + g.bookOverhang * 2,
              width: g.bookWidth,
              transform: "translateX(-50%)",
            }}
          />
          {bookLabel && (
            <span
              className={`label absolute whitespace-nowrap ${DIRECTION_TEXT[direction]}`}
              style={{
                bottom: g.track + g.bookOverhang + 6,
                transform: "translateX(-50%)",
              }}
            >
              {bookLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
