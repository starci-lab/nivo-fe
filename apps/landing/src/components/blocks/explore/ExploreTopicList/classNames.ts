/** Utility classes for informational topic tags and their hover affordance. */
export const CLASS_NAMES = {
    list: "m-0 flex flex-wrap gap-[0.6rem] p-0 list-none",
    topic: "inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-[0.9rem] py-[0.65rem] text-sm font-semibold transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--landing-explore-icon-background)]",
} as const
