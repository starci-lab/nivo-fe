/** Utility classes for the Trust page's evidence signature panel. */
export const CLASS_NAMES = {
    panel: "relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-[2rem] bg-[var(--landing-explore-signature-background)] p-[clamp(1.5rem,4vw,2.5rem)] text-[var(--landing-explore-inverse-foreground)]",
    icon: "row-span-2 grid aspect-square w-[2.7rem] place-items-center rounded-[0.9rem] bg-[var(--landing-explore-signature-icon-background)] text-[var(--landing-explore-inverse-foreground)]",
    title: "text-[clamp(1rem,1.65vw,1.3rem)] leading-[1.2]",
    sequence: "flex flex-wrap gap-x-3 gap-y-[0.55rem] text-[var(--landing-explore-sequence)] text-[0.8rem] font-semibold",
    item: "inline-flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4",
} as const
