const list = "m-0 grid list-none grid-cols-3 gap-3 p-0 [@media(max-width:48rem)]:grid-cols-1"

/** Utility classes for the progression list and its readable step anatomy. */
export const CLASS_NAMES = {
    list,
    tabletResponsiveList: `${list} max-lg:grid-cols-2`,
    step: "relative grid min-w-0 gap-3 rounded-[1.15rem] bg-[var(--landing-explore-flow-background)] p-[1.35rem] text-[var(--background-inverse)] after:absolute after:top-[1.85rem] after:right-[-0.65rem] after:z-10 after:h-0.5 after:w-[0.65rem] after:bg-[var(--accent)] after:shadow-[0.65rem_0_0_-1px_var(--accent)] after:content-[''] last:after:hidden [@media(max-width:48rem)]:grid-cols-[2.5rem_minmax(0,1fr)] [@media(max-width:48rem)]:gap-3 [@media(max-width:48rem)]:bg-transparent [@media(max-width:48rem)]:p-0 [@media(max-width:48rem)]:pb-8 [@media(max-width:48rem)]:after:top-6 [@media(max-width:48rem)]:after:right-auto [@media(max-width:48rem)]:after:bottom-0 [@media(max-width:48rem)]:after:left-[0.65rem] [@media(max-width:48rem)]:after:h-auto [@media(max-width:48rem)]:after:w-px [@media(max-width:48rem)]:after:bg-[var(--border)] [@media(max-width:48rem)]:after:shadow-none [@media(max-width:48rem)]:last:pb-0",
    index: "text-[var(--accent)] text-[0.7rem] font-bold [letter-spacing:0.12em] [@media(max-width:48rem)]:row-span-2 [@media(max-width:48rem)]:pt-[0.15rem]",
    headingClassName: "pr-0 text-[0.95rem] font-bold",
    body: "pr-0 text-[var(--landing-ink-soft)] text-sm leading-[1.6]",
} as const
