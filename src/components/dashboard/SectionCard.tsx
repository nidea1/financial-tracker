"use client";
import { PropsWithChildren, useId } from "react";

type SectionConfig = {
  title: string;
  subtitle: string;
};

export const SectionCard = ({
  title,
  subtitle,
  children,
}: PropsWithChildren<SectionConfig>) => {
  const headingId = useId();
  const descriptionId = `${headingId}-description`;

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-lg shadow-emerald-500/5 backdrop-blur-lg transition-all duration-200 hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-white/5 dark:bg-neutral-900/70 lg:p-5"
      style={{ minHeight: 140 }}
    >
      <header className="mb-4" id={headingId}>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
        <p id={descriptionId} className="text-sm text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>
      </header>
      {children}
    </section>
  );
};

export default SectionCard;
