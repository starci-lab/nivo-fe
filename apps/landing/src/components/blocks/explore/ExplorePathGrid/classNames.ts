/** Utility classes for numbered continuation and reference paths. */
export const CLASS_NAMES = {
    list: "grid grid-cols-3 gap-4 max-lg:grid-cols-2 [@media(max-width:48rem)]:grid-cols-1",
    card: "relative flex min-h-32 min-w-0 flex-col justify-between gap-[0.9rem] overflow-hidden rounded-[1.25rem] bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)] text-[var(--background-inverse)] [--foreground:var(--background-inverse)] [--muted:var(--landing-ink-soft)] shadow-[var(--landing-explore-card-shadow)] after:absolute after:-right-10 after:-bottom-10 after:aspect-square after:w-24 after:rounded-full after:bg-[var(--landing-explore-card-decoration)] after:content-[''] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[var(--landing-explore-card-hover-shadow)]",
    index: "self-end text-[var(--accent)] text-[0.68rem] font-bold [letter-spacing:0.12em]",
    actionContent: "inline-flex items-center gap-2",
} as const
