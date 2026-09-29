/** Utility classes for a numbered article section and its readable copy. */
export const CLASS_NAMES = {
    section: "relative grid gap-4 border-l border-l-[var(--landing-explore-article-line)] pb-12 pl-20 pt-4 last:pb-4 [@media(max-width:48rem)]:pl-16",
    index: "absolute top-5 left-5 grid aspect-square w-[2.2rem] place-items-center rounded-full bg-[var(--landing-explore-article-index-background)] text-[var(--accent)] text-[0.68rem] font-bold [letter-spacing:0.12em]",
    paragraph: "[&>p]:leading-[1.8]",
} as const
