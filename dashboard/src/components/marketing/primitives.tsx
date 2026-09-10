import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Section reveal. One move, 280ms, ease-out — enough to feel alive, not enough to wait on. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.28, delay, ease: [0, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Uppercase micro-label. Tracking is mandatory at this size. */
export function Label({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`label ${className}`}>{children}</span>;
}

/** Section heading with a rule that runs to the edge of the column. */
export function SectionHead({
  index,
  title,
  lede,
  id,
}: {
  index: string;
  title: string;
  lede?: string;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-center gap-4 border-b border-hairline pb-3">
        <Label className="num text-chalk">{index}</Label>
        <div className="h-px flex-1 bg-hairline" />
      </div>
      <h2 className="display mt-6 text-[clamp(1.75rem,3.4vw,2.6rem)] font-semibold text-ink">
        {title}
      </h2>
      {lede && (
        <p className="lede mt-3 max-w-[58ch] text-[0.9375rem] leading-relaxed text-muted">
          {lede}
        </p>
      )}
    </div>
  );
}
