/**
 * Rail geometry, kept out of the component file so annotations drawn
 * outside a rail can share its domain without importing a component.
 */

export interface RailQuantiles {
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
}

export type EdgeDirection = "up" | "down" | "flat";

/**
 * Maps a stat value to its horizontal position on the rail, as a percentage.
 *
 * The domain always contains the book line, so the marker can never fall off
 * the end of the rail on a wild projection.
 */
export function railScale(
  q: RailQuantiles & { bookLine?: number },
): (value: number) => number {
  const lo = Math.min(q.p10, q.bookLine ?? q.p10);
  const hi = Math.max(q.p90, q.bookLine ?? q.p90);
  const pad = Math.max((hi - lo) * 0.12, 0.5);
  const min = Math.max(0, lo - pad);
  const max = hi + pad;
  const span = max - min || 1;
  return (value: number) => ((value - min) / span) * 100;
}

/** Which way the model leans against the book. */
export function edgeDirection(
  median: number,
  bookLine?: number,
): EdgeDirection {
  if (bookLine === undefined) return "flat";
  const delta = median - bookLine;
  // Inside a tenth of a point the model and the book agree.
  if (Math.abs(delta) < 0.1) return "flat";
  return delta > 0 ? "up" : "down";
}
