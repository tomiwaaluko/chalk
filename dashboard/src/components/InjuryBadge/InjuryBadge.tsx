interface InjuryBadgeProps {
  status?: string | null;
}

/** Availability. The only place these colours mean "health" rather than "edge". */
const STATUS_STYLES: Record<string, string> = {
  questionable: "border-caution/30 bg-caution/10 text-caution",
  doubtful: "border-caution/40 bg-caution/15 text-caution",
  out: "border-edge-down/30 bg-edge-down/10 text-edge-down",
};

/**
 * Renders nothing for an available player.
 *
 * Most players on a slate are active, so a badge on every card is noise that
 * trains the eye to skip the row where it finally matters. No badge means
 * available; a badge always means something changed.
 */
export function InjuryBadge({ status }: InjuryBadgeProps) {
  const normalized = status?.trim() || "Active";
  const style = STATUS_STYLES[normalized.toLowerCase()];

  if (!style) return null;

  return (
    <span
      className={`label inline-flex items-center rounded border px-1.5 py-1 ${style}`}
    >
      {normalized}
    </span>
  );
}
