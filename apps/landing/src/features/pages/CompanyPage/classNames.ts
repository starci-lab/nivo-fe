/** Utility compositions for the company profile page. */
export const CLASS_NAMES = {
    page: "min-w-0 overflow-clip bg-[var(--landing-commercial-paper)] [&_#main-content]:min-w-0 [&_h1]:my-0 [&_h2]:my-0 [&_h3]:my-0 [&_p]:my-0 [&_blockquote]:my-0",
    eyebrow:
        "inline-flex items-center gap-[0.55rem] text-[var(--accent)] text-[0.72rem] font-extrabold tracking-[0.15em] leading-[1.4] uppercase before:h-px before:w-6 before:bg-current before:content-['']",
    eyebrowInverse: "text-[var(--landing-accent-bright)]",
    inverseHeadingText: "text-[var(--landing-commercial-white)]",
    heroGrid:
        "grid grid-cols-[minmax(0,1.12fr)_minmax(25rem,0.88fr)] items-center gap-[clamp(3rem,7vw,8rem)] py-[clamp(5rem,9vw,8rem)] [@media(max-width:64rem)]:grid-cols-[minmax(0,1fr)] [@media(max-width:64rem)]:gap-4 [@media(max-width:48rem)]:py-16",
    heroCopy:
        "grid max-w-[48rem] content-start gap-5 [&_h1]:max-w-[15ch] [&_h1]:text-[clamp(3.15rem,7vw,6.8rem)] [&_h1]:font-[620] [&_h1]:tracking-[-0.065em] [&_h1]:leading-[0.94] [&_h1_em]:font-serif [&_h1_em]:text-[var(--accent)] [&_h1_em]:font-medium [&>p]:max-w-[43rem] [&>p]:leading-[1.72] [@media(max-width:48rem)]:[&_h1]:text-[clamp(2.9rem,13vw,4.5rem)] [@media(max-width:48rem)]:gap-3.5",
    heroEmphasis: "font-serif text-[var(--accent)] font-medium",
    heroBody: "max-w-[43rem] text-base text-[var(--muted)] leading-[1.72]",
    sectionHeading:
        "grid max-w-[52rem] content-start gap-5 [&_h2]:text-[clamp(2.3rem,5vw,4.5rem)] [&_h2]:font-[620] [&_h2]:tracking-[-0.05em] [&_h2]:leading-[1.02] [&>p]:max-w-[43rem] [&>p]:leading-[1.7] [@media(max-width:48rem)]:[&_h2]:text-[clamp(2.15rem,10vw,3.35rem)]",
    sectionCopy: "max-w-[43rem] text-base leading-[1.7]",
    sectionCopyMuted: "max-w-[43rem] text-base text-[var(--muted)] leading-[1.7]",
    sectionCopyInverse: "max-w-[43rem] text-base text-[var(--landing-commercial-white)] leading-[1.7]",
    cardCopy: "text-sm text-[var(--muted)] leading-[1.55]",
    philosophyCardCopy: "text-sm text-[var(--landing-inverse-muted)] leading-[1.6]",
    truthNoticeCopy: "text-sm leading-normal",
    sectionHeadingInverse:
        "grid max-w-[52rem] content-start gap-5 text-[var(--landing-commercial-white)] [&_h2]:text-[clamp(2.3rem,5vw,4.5rem)] [&_h2]:font-[620] [&_h2]:tracking-[-0.05em] [&_h2]:leading-[1.02] [&>p]:max-w-[43rem] [&>p]:leading-[1.7] [@media(max-width:48rem)]:[&_h2]:text-[clamp(2.15rem,10vw,3.35rem)]",
    actionRow: "mt-3 flex flex-wrap gap-3 [@media(max-width:48rem)]:items-stretch [@media(max-width:48rem)]:flex-col [&>a]:[@media(max-width:48rem)]:w-full [&>a]:[@media(max-width:48rem)]:justify-center",
    cardIndex: "text-[var(--accent)] text-[0.7rem] font-extrabold tracking-[0.14em]",
    companyVisual:
        "relative grid min-h-[36rem] place-items-center [@media(max-width:64rem)]:w-[min(100%,38rem)] [@media(max-width:64rem)]:justify-self-center [@media(max-width:48rem)]:min-h-[27rem]",
    visualOrbit:
        "absolute aspect-square w-[min(31rem,90%)] rounded-full border border-[var(--landing-commercial-accent-orbit)] shadow-[var(--landing-commercial-orbit-inset)] before:absolute before:inset-[12%] before:rounded-[inherit] before:border before:border-[var(--landing-commercial-accent-orbit-inner)] before:content-[''] after:absolute after:inset-[27%] after:rounded-[inherit] after:border after:border-[var(--landing-commercial-accent-orbit-inner)] after:content-[''] [@media(max-width:48rem)]:w-[min(23rem,94%)]",
    visualCore:
        "z-[2] grid aspect-square w-40 place-content-center gap-[0.4rem] rounded-full bg-[var(--landing-commercial-ink)] text-center text-[var(--landing-commercial-white)] shadow-[var(--landing-commercial-core-shadow)] [@media(max-width:48rem)]:w-32 [&_span]:text-[var(--landing-accent-bright)] [&_span]:text-[1.65rem] [&_span]:font-extrabold [&_span]:tracking-[0.08em] [&_strong]:text-[0.72rem] [&_strong]:font-semibold",
    orbitCard:
        "absolute z-[3] grid min-w-40 gap-[0.35rem] rounded-2xl border border-[var(--landing-commercial-glass-border)] bg-[var(--landing-commercial-glass-fill)] px-5 py-4 shadow-[var(--landing-commercial-orbit-card-shadow)] backdrop-blur-[14px] [&_span]:text-[var(--accent)] [&_span]:text-[0.68rem] [&_span]:font-extrabold [&_strong]:text-[0.86rem] [@media(max-width:48rem)]:min-w-32 [@media(max-width:48rem)]:p-3",
    orbitCardOne: "top-[12%] left-0",
    orbitCardTwo: "top-[31%] right-[-4%] [@media(max-width:48rem)]:right-0",
    orbitCardThree: "right-[11%] bottom-[11%] [@media(max-width:48rem)]:right-[4%]",
    todaySection: "bg-[var(--landing-commercial-paper)] py-[clamp(5rem,9vw,8rem)]",
    todayGridSpace: "mt-[clamp(2.5rem,5vw,5rem)]",
    todayCard:
        "grid min-h-[17rem] content-between gap-4 bg-[var(--landing-commercial-white)] p-7 [&_h3]:self-end [&_h3]:text-[1.35rem] [&_p]:leading-[1.55] [@media(max-width:48rem)]:min-h-[13rem]",
    todayCardHighlight: "bg-[var(--landing-commercial-card-rose)]",
    provenanceSection: "bg-[var(--landing-commercial-white)] py-[clamp(5rem,9vw,8rem)]",
    provenanceLine:
        "relative mt-[clamp(3rem,6vw,5rem)] grid list-none grid-cols-4 gap-0 p-0 before:absolute before:inset-x-0 before:top-[1.05rem] before:h-px before:bg-[image:var(--landing-commercial-provenance-rule)] before:content-[''] [&_li]:relative [&_li]:grid [&_li]:gap-[1.35rem] [&_li]:pr-[clamp(1.25rem,3vw,3rem)] [&_li>span]:relative [&_li>span]:z-[1] [&_li>span]:grid [&_li>span]:aspect-square [&_li>span]:w-[2.1rem] [&_li>span]:place-items-center [&_li>span]:rounded-full [&_li>span]:bg-[var(--accent)] [&_li>span]:text-[var(--landing-commercial-white)] [&_li>span]:text-[0.65rem] [&_li>span]:font-extrabold [&_li>span]:shadow-[0_0_0_0.55rem_var(--landing-commercial-white)] [&_li>div]:grid [&_li>div]:gap-[0.6rem] [&_strong]:text-base [&_small]:max-w-[24ch] [&_small]:text-[var(--landing-ink-soft)] [&_small]:text-[0.85rem] [&_small]:leading-[1.55] max-lg:grid-cols-2 [@media(max-width:64rem)]:gap-y-10 [@media(max-width:64rem)]:before:hidden max-[48.01rem]:grid-cols-1",
    statementSection:
        "relative overflow-hidden bg-[var(--accent)] py-[clamp(5rem,10vw,9rem)] text-[var(--landing-commercial-white)] after:pointer-events-none after:absolute after:right-[-0.04em] after:bottom-[-0.25em] after:content-['NIVO'] after:text-[var(--landing-commercial-watermark)] after:text-[clamp(10rem,31vw,32rem)] after:font-black after:tracking-[-0.09em] after:leading-[0.8]",
    statementGrid:
        "relative z-[1] grid grid-cols-[minmax(18rem,0.65fr)_minmax(0,1.35fr)] gap-[clamp(3rem,8vw,9rem)] [@media(max-width:64rem)]:grid-cols-[minmax(0,1fr)]",
    statementLead: "grid content-start gap-5",
    sequence: "mt-8 grid gap-2 [&>span]:flex [&>span]:items-center [&>span]:gap-3 [&_svg]:w-[0.8rem] [&_svg]:rotate-90",
    missionQuote:
        "max-w-[28ch] font-serif text-[clamp(2.05rem,4vw,4rem)] tracking-[-0.035em] leading-[1.16] [&_strong]:font-semibold [&_strong]:text-[var(--landing-commercial-quote-cream)] [@media(max-width:48rem)]:text-[clamp(2rem,8vw,3rem)]",
    visionSection: "bg-[var(--landing-commercial-white)] py-[clamp(5rem,9vw,8rem)]",
    visionGrid:
        "grid grid-cols-[minmax(0,0.9fr)_minmax(25rem,1.1fr)] gap-[clamp(3rem,8vw,8rem)] [@media(max-width:64rem)]:grid-cols-[minmax(0,1fr)]",
    visionSteps:
        "m-0 list-none p-0 [&>li]:grid [&>li]:grid-cols-[4rem_1fr] [&>li]:gap-4 [&>li]:border-b [&>li]:border-[var(--landing-commercial-line)] [&>li]:py-6 [&>li>span]:font-extrabold [&>li>span]:text-[var(--accent)] [&>li>div]:grid [&>li>div]:gap-[0.4rem] [&_strong]:text-[1.2rem] [&_small]:text-[var(--landing-ink-soft)] [&_small]:text-[0.92rem]",
    philosophySection:
        "bg-[color:var(--landing-commercial-philosophy-background-color)] bg-[image:var(--landing-commercial-philosophy-background-image)] py-[clamp(5rem,9vw,8rem)] text-[var(--landing-commercial-white)]",
    philosophyIcon:
        "mb-auto grid size-14 place-items-center rounded-2xl bg-[var(--accent)] [&_svg]:size-6",
    valuesSection: "bg-[var(--landing-commercial-white)] py-[clamp(5rem,9vw,8rem)]",
    truthSection:
        "border-y border-[var(--landing-commercial-line)] bg-[var(--landing-commercial-leadership-mist)] py-16",
    truthGrid:
        "grid grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)] items-center gap-12 [&>div:first-child]:grid [&>div:first-child]:gap-4 [&_h2]:text-[clamp(2rem,4vw,3.5rem)] [@media(max-width:64rem)]:grid-cols-[minmax(0,1fr)]",
    truthNotice:
        "grid gap-4 border-l-[3px] border-[var(--accent)] bg-[var(--landing-commercial-white)] p-6 [&>span]:justify-self-start",
    companyCta: "bg-[var(--landing-commercial-soft-rose)] py-[clamp(5rem,9vw,8rem)]",
    ctaGrid:
        "grid grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)] items-end gap-16 [&>div]:grid [&>div]:gap-4 [&_h2]:text-[clamp(2.3rem,5vw,4.5rem)] [&_h2]:font-[620] [&_h2]:tracking-[-0.05em] [&_h2]:leading-[1.02] [@media(max-width:64rem)]:grid-cols-[minmax(0,1fr)] [@media(max-width:48rem)]:[&_h2]:text-[clamp(2.15rem,10vw,3.35rem)]",
    ctaLinks:
        "grid border-t border-[var(--landing-commercial-line)] [&_a]:justify-between [&_a]:border-b [&_a]:border-[var(--landing-commercial-line)] [&_a]:py-4",
    ctaLink: "flex items-center justify-between gap-3 border-b border-[var(--landing-commercial-line)] py-4",
} as const
