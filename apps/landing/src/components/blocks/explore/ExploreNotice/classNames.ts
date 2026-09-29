/** Utility classes for a truth-boundary notice and its explanatory text. */
export const CLASS_NAMES = {
    notice: "flex flex-col gap-[0.9rem] rounded-[1.25rem] border-0 border-l-[0.3rem] border-l-[var(--accent)] bg-[image:var(--landing-explore-notice-background)] py-5 pl-[clamp(1.75rem,4vw,3rem)] pr-[clamp(1.25rem,3vw,2rem)] text-[var(--background-inverse)] [--foreground:var(--background-inverse)] [--muted:var(--landing-ink-soft)] shadow-[var(--landing-explore-card-shadow)]",
    title: "text-[var(--landing-accent-ink)]",
    body: "[&>p]:leading-[1.65]",
} as const
