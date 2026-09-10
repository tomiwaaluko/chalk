/** The only two button recipes on the marketing page. */

export function primaryCta(extra = ""): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-md",
    "bg-chalk px-5 py-3 text-[0.9375rem] font-semibold tracking-[-0.005em]",
    // Near-black on orange is 4.97:1. White on this orange is only 3.7:1.
    "text-canvas",
    "transition-[background-color,transform] duration-[120ms] ease-out",
    "hover:bg-chalk-hot active:scale-[0.985]",
    extra,
  ].join(" ");
}

export function secondaryCta(extra = ""): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-md",
    "border border-hairline-strong px-5 py-3 text-[0.9375rem] font-medium",
    "text-ink transition-colors duration-[120ms] ease-out",
    "hover:border-subtle hover:bg-surface",
    extra,
  ].join(" ");
}
