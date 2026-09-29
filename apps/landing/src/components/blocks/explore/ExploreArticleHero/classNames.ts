/** Utility classes for the editorial header, thesis and provenance metadata. */
export const CLASS_NAMES = {
    header: "relative isolate overflow-hidden bg-[image:var(--landing-explore-article-background)] py-[clamp(4rem,8vw,7rem)]",
    ring: "pointer-events-none absolute -z-10 top-[12%] right-[8%] aspect-square w-[min(26rem,36vw)] rounded-full border border-[var(--landing-explore-article-orbit)] shadow-[var(--landing-explore-article-shadow)]",
    inner: "grid max-w-[64rem] gap-5 [&>h1]:max-w-[14ch] [&>h1]:[text-wrap:balance]",
    thesis: "max-w-[52rem] rounded-r-[1.25rem] border-l-4 border-l-[var(--accent)] bg-[var(--landing-explore-thesis-background)] px-8 py-7 text-[clamp(1.1rem,2vw,1.35rem)] leading-[1.6] shadow-[var(--landing-explore-thesis-shadow)] backdrop-blur-[12px]",
    metadata: "m-0 flex flex-wrap gap-x-10 gap-y-4 [&>div]:grid [&>div]:gap-1 [&_dt]:text-[var(--accent)] [&_dt]:text-[0.7rem] [&_dt]:font-bold [&_dt]:[letter-spacing:0.1em] [&_dt]:uppercase [&_dd]:m-0 [&_dd]:leading-[1.6]",
} as const
