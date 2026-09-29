/** Renderer-backed relationship-router controls and their card presentation. */
export const CLASS_NAMES = {
    form: "grid justify-items-start gap-6 mt-12",
    cardCopy: "grid grid-cols-[1fr_auto] gap-[0.8rem]",
    cardIndex: "col-start-1 text-[var(--accent)] text-[0.7rem] font-extrabold tracking-[0.14em]",
    cardTitle: "col-span-full text-[1.06rem]",
    cardDescription: "col-span-full max-w-[33rem] text-[var(--landing-ink-soft)] text-[0.88rem] leading-[1.5]",
    cardCheck: "grid size-[1.6rem] place-items-center rounded-full border border-[var(--landing-commercial-line)] text-transparent [&_svg]:size-3",
} as const
