/** Utility compositions for the relationship router and its response panels. */
export const CLASS_NAMES = {
    page: "min-w-0 overflow-clip bg-[var(--landing-commercial-paper)] [&_#main-content]:min-w-0 [&_h1]:my-0 [&_h2]:my-0 [&_h3]:my-0 [&_p]:my-0 [&_blockquote]:my-0",
    contactHeroGrid:
        "relative z-[1] grid min-h-[min(48rem,calc(100dvh-var(--landing-header-height)))] grid-cols-[minmax(0,1fr)_minmax(20rem,0.68fr)] items-center gap-[clamp(3rem,8vw,8rem)] py-[clamp(5rem,9vw,8rem)] [@media(max-width:64rem)]:grid-cols-[minmax(0,1fr)] [@media(max-width:48rem)]:py-16",
    heroCopy:
        "grid max-w-[48rem] content-start gap-5 [&_h1]:max-w-[12ch] [&_h1]:text-[clamp(3.15rem,7vw,6.8rem)] [&_h1]:font-[620] [&_h1]:tracking-[-0.065em] [&_h1]:leading-[0.94] [&_h1_em]:font-serif [&_h1_em]:text-[var(--accent)] [&_h1_em]:font-medium [&>p]:max-w-[43rem] [&>p]:leading-[1.72] [&>a]:mt-2 [&>a]:justify-self-start [@media(max-width:48rem)]:[&_h1]:text-[clamp(2.9rem,13vw,4.5rem)] [@media(max-width:48rem)]:gap-3.5",
    heroBody: "max-w-[43rem] text-base text-[var(--muted)] leading-[1.72]",
    eyebrow:
        "inline-flex items-center gap-[0.55rem] text-[var(--accent)] text-[0.72rem] font-extrabold tracking-[0.15em] leading-[1.4] uppercase before:h-px before:w-6 before:bg-current before:content-['']",
    eyebrowInverse: "text-[var(--landing-accent-bright)]",
    inverseHeadingText: "text-[var(--landing-commercial-white)]",
    sectionHeading:
        "grid max-w-[52rem] content-start gap-5 [&_h2]:text-[clamp(2.3rem,5vw,4.5rem)] [&_h2]:font-[620] [&_h2]:tracking-[-0.05em] [&_h2]:leading-[1.02] [&>p]:max-w-[43rem] [&>p]:leading-[1.7] [@media(max-width:48rem)]:[&_h2]:text-[clamp(2.15rem,10vw,3.35rem)]",
    sectionCopy: "max-w-[43rem] text-base leading-[1.7]",
    sectionCopyMuted: "max-w-[43rem] text-base text-[var(--muted)] leading-[1.7]",
    sectionCopyInverse: "max-w-[43rem] text-base text-[var(--landing-commercial-white)] leading-[1.7]",
    resultCopy: "text-sm text-[var(--landing-commercial-muted-ink)] leading-[1.6]",
    privacyCopy: "text-sm text-[var(--landing-commercial-ink)] leading-normal",
    resultLink: "flex items-center justify-between gap-3 text-[var(--landing-commercial-white)]",
    sectionHeadingInverse:
        "grid max-w-[52rem] content-start gap-5 text-[var(--landing-commercial-white)] [&_h2]:text-[clamp(2.3rem,5vw,4.5rem)] [&_h2]:font-[620] [&_h2]:tracking-[-0.05em] [&_h2]:leading-[1.02] [&>p]:max-w-[43rem] [&>p]:leading-[1.7] [@media(max-width:48rem)]:[&_h2]:text-[clamp(2.15rem,10vw,3.35rem)]",
    contactRouteMap:
        "relative m-0 w-[min(100%,38rem)] list-none rounded-[1.75rem] border border-[var(--landing-commercial-contact-border)] bg-[var(--landing-commercial-contact-fill)] p-5 shadow-[var(--landing-commercial-contact-card-shadow)] backdrop-blur-2xl before:absolute before:top-12 before:bottom-12 before:left-[3.18rem] before:w-px before:bg-[var(--landing-commercial-accent-glass-line)] before:content-[''] [&>li]:relative [&>li]:grid [&>li]:min-h-20 [&>li]:grid-cols-[2.5rem_1fr] [&>li]:items-center [&>li]:gap-4 [&>li]:rounded-2xl [&>li]:p-3 [&>li[data-active='true']]:-translate-x-6 [&>li[data-active='true']]:bg-[var(--landing-commercial-ink)] [&>li[data-active='true']]:text-[var(--landing-commercial-white)] [&>li[data-active='true']]:shadow-[var(--landing-commercial-contact-active-shadow)] [&>li>span]:relative [&>li>span]:z-[1] [&>li>span]:grid [&>li>span]:aspect-square [&>li>span]:w-10 [&>li>span]:place-items-center [&>li>span]:rounded-full [&>li>span]:border [&>li>span]:border-[var(--accent)] [&>li>span]:bg-[var(--landing-commercial-white)] [&>li>span]:text-[var(--accent)] [&>li>span]:text-[0.68rem] [&>li>span]:font-extrabold [@media(max-width:48rem)]:[&>li[data-active='true']]:translate-x-0",
    intentSection:
        "scroll-mt-[var(--landing-header-height)] bg-[var(--landing-commercial-paper)] py-[clamp(5rem,9vw,8rem)]",
    intentLayout:
        "grid grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.5fr)] items-start gap-[clamp(2rem,5vw,5rem)] [@media(max-width:64rem)]:grid-cols-[minmax(0,1fr)]",
    intentMain: "min-w-0",
    cardIndex: "text-[var(--accent)] text-[0.7rem] font-extrabold tracking-[0.14em]",
    routeResult:
        "sticky top-[calc(var(--landing-header-height)+1.5rem)] grid min-h-96 content-start gap-5 rounded-3xl bg-[var(--landing-commercial-ink)] p-8 text-[var(--landing-commercial-white)] shadow-[var(--landing-commercial-contact-result-shadow)] [&_h3]:text-[var(--landing-commercial-white)] [&>p]:text-[var(--landing-commercial-muted-ink)] [&>p]:leading-[1.6] [&>span:nth-child(2)]:justify-self-start [&_a]:justify-between [&_a]:text-[var(--landing-commercial-white)] [@media(max-width:64rem)]:static [@media(max-width:64rem)]:min-h-72",
    resultIcon:
        "mt-auto grid size-16 place-items-center rounded-[1.1rem] bg-[var(--landing-commercial-icon-fill)] text-[var(--landing-accent-bright)] [&_svg]:size-6",
    resultLinks: "grid gap-3",
    contactTruthSection:
        "bg-[var(--accent)] py-[clamp(5rem,9vw,8rem)] text-[var(--landing-commercial-white)]",
    contactTruthGrid:
        "grid grid-cols-[minmax(0,1fr)_minmax(23rem,0.8fr)] gap-[clamp(2rem,6vw,6rem)] [&>div:first-child]:grid [&>div:first-child]:content-start [&>div:first-child]:gap-5 [&_h2]:text-[clamp(2.4rem,5vw,4.8rem)] [&_h2]:tracking-[-0.05em] [&_h2]:leading-none [&>div:first-child_p]:max-w-[37rem] [&>div:first-child_p]:leading-[1.65] [@media(max-width:64rem)]:grid-cols-[minmax(0,1fr)]",
    privacyCard:
        "grid content-start gap-5 rounded-3xl bg-[var(--landing-commercial-white)] p-8 text-[var(--landing-commercial-ink)] shadow-[var(--landing-commercial-privacy-shadow)] [&>span]:justify-self-start",
    privacyIcon: "grid size-14 place-items-center rounded-2xl bg-[var(--landing-commercial-soft-rose)] text-[var(--accent)] [&_svg]:size-6",
    noSubmission:
        "col-span-full grid grid-cols-[minmax(13rem,auto)_1fr] gap-8 border-t border-[var(--landing-commercial-inverse-rule)] pt-8 [&>span]:text-[0.72rem] [&>span]:font-extrabold [&>span]:tracking-[0.14em] [&>p]:max-w-[55rem] [&>p]:leading-[1.6] [@media(max-width:48rem)]:grid-cols-[minmax(0,1fr)] [@media(max-width:48rem)]:gap-3",
    directSection:
        "bg-[var(--landing-commercial-ink)] py-[clamp(5rem,9vw,8rem)] text-[var(--landing-commercial-white)]",
    directGrid:
        "grid grid-cols-[minmax(0,0.8fr)_minmax(24rem,1.2fr)] gap-[clamp(3rem,8vw,8rem)] [@media(max-width:64rem)]:grid-cols-[minmax(0,1fr)]",
    directLinks:
        "grid grid-cols-2 [--muted:var(--landing-commercial-white)] [--starci-core-muted:var(--landing-commercial-white)] content-start border-t border-[var(--landing-commercial-inverse-grid-rule)] [&_a]:min-h-[4.5rem] [&_a]:justify-between [&_a]:border-b [&_a]:border-[var(--landing-commercial-inverse-grid-rule)] [&_a]:p-4 [&_a]:text-[var(--landing-commercial-white)] [&_a:nth-child(odd)]:border-r [&_small]:mr-3 [&_small]:text-[var(--landing-accent-bright)] [&_small]:text-[0.65rem] [@media(max-width:48rem)]:grid-cols-1 [@media(max-width:48rem)]:[&_a:nth-child(odd)]:border-r-0",
    directLinkContent: "flex items-center",
} as const
