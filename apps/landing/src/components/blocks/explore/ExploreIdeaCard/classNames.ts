const card = "relative flex min-h-60 min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-[1.25rem] bg-[var(--surface)] p-5 text-[var(--background-inverse)] [--foreground:var(--background-inverse)] [--muted:var(--landing-ink-soft)] shadow-[var(--landing-explore-card-shadow)] after:absolute after:-right-10 after:-bottom-10 after:aspect-square after:w-24 after:rounded-full after:bg-[var(--landing-explore-card-decoration)] after:content-[''] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[var(--landing-explore-card-hover-shadow)] [&>p]:leading-[1.65] md:p-6 lg:p-8"
const featured = "col-span-2 row-span-2 min-h-124 justify-end bg-[image:var(--landing-explore-featured-background)] before:absolute before:top-8 before:right-8 before:aspect-square before:w-32 md:before:w-36 lg:before:w-56 before:rounded-full before:border before:border-[var(--landing-explore-featured-orbit)] before:shadow-[var(--landing-explore-featured-shadow)] before:content-[''] [@media(max-width:48rem)]:col-span-1 [@media(max-width:48rem)]:row-span-1 [@media(max-width:48rem)]:min-h-0"
const stagger = "translate-y-5 hover:translate-y-5 [@media(max-width:48rem)]:translate-y-0"
const mark = "absolute top-6 left-7 text-[var(--accent)] text-[0.68rem] font-bold [letter-spacing:0.12em]"

/** Utility classes for featured and supporting editorial Idea cards. */
export const CLASS_NAMES = {
    card,
    featured: `${card} ${featured}`,
    staggered: `${card} ${stagger}`,
    featuredStaggered: `${card} ${featured} ${stagger}`,
    mark,
    secondaryMark: `${mark} right-6 left-auto`,
} as const
