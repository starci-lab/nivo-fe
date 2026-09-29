const card = "relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-[1.25rem] bg-[var(--surface)] p-5 text-[var(--background-inverse)] [--foreground:var(--background-inverse)] [--muted:var(--landing-ink-soft)] shadow-[var(--landing-explore-card-shadow)] after:absolute after:-right-10 after:-bottom-10 after:aspect-square after:w-24 after:rounded-full after:bg-[var(--landing-explore-card-decoration)] after:content-[''] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[var(--landing-explore-card-hover-shadow)] [&>p]:leading-[1.65] md:p-6 lg:p-8"
const stagger = "translate-y-5 hover:translate-y-5 [@media(max-width:48rem)]:translate-y-0"

/** Utility classes for standard Explore cards, staggered layouts and numbered identities. */
export const CLASS_NAMES = {
    card,
    staggered: `${card} ${stagger}`,
    index: "self-end text-[var(--accent)] text-[0.68rem] font-bold [letter-spacing:0.12em]",
} as const
