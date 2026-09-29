const card = "relative flex min-h-108 min-w-0 flex-col items-start gap-4 overflow-hidden rounded-[1.25rem] bg-[var(--surface)] px-5 pb-5 pt-10 text-[var(--background-inverse)] [--foreground:var(--background-inverse)] [--muted:var(--landing-ink-soft)] shadow-[var(--landing-explore-card-shadow)] after:absolute after:-right-10 after:-bottom-10 after:aspect-square after:w-24 after:rounded-full after:bg-[var(--landing-explore-card-decoration)] after:content-[''] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[var(--landing-explore-card-hover-shadow)] md:px-6 md:pb-6 lg:px-8 lg:pb-8"
const future = "outline outline-1 outline-dashed outline-[var(--landing-explore-orbit)] outline-offset-[-1px] bg-[image:var(--landing-explore-future-background)]"
const stagger = "translate-y-8 hover:translate-y-[1.65rem] [@media(max-width:48rem)]:translate-y-0"

/** Utility classes that define actor cards and their future/staggered variants. */
export const CLASS_NAMES = {
    card,
    futureCard: `${card} ${future}`,
    staggeredCard: `${card} ${stagger}`,
    futureStaggeredCard: `${card} ${future} ${stagger}`,
    index: "absolute top-4 right-5 text-[var(--accent)] text-[0.68rem] font-bold [letter-spacing:0.12em]",
    details: "m-0 grid gap-[0.85rem] [&>div]:grid [&>div]:gap-1 [&_dt]:text-[var(--accent)] [&_dt]:text-[0.7rem] [&_dt]:font-bold [&_dt]:[letter-spacing:0.1em] [&_dt]:uppercase [&_dd]:m-0 [&_dd]:leading-[1.6]",
} as const
