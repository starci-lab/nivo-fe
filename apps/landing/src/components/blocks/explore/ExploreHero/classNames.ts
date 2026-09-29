const modelStep = "relative grid min-h-22 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[1.25rem] border border-[var(--landing-explore-model-border)] bg-[var(--landing-explore-model-background)] p-4 shadow-[var(--landing-explore-model-shadow)]"

/** Utility classes for the Explore hero, action row and progressive model. */
export const CLASS_NAMES = {
    section: "relative isolate overflow-clip bg-[image:var(--landing-explore-hero-background)] py-18 lg:py-24 xl:py-32 [@media(max-width:48rem)]:py-16",
    ring: "pointer-events-none absolute -z-10 -top-[22rem] -right-[16rem] aspect-square w-[clamp(32rem,56vw,54rem)] rounded-full border border-[var(--landing-explore-orbit)] shadow-[var(--landing-explore-orbit-shadow)]",
    dots: "pointer-events-none absolute -z-10 right-[8%] -bottom-[15rem] h-[25rem] w-[25rem] bg-[image:var(--landing-explore-dots)] [background-size:18px_18px] [mask-image:var(--landing-explore-dot-mask)] [@media(max-width:48rem)]:opacity-55",
    inner: "grid min-h-[min(46rem,calc(100dvh-var(--landing-header-height)))] grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.78fr)] items-center gap-[clamp(3rem,8vw,8rem)] max-lg:grid-cols-1 max-lg:min-h-0",
    copy: "flex flex-col items-start gap-[1.35rem] [&>h1]:max-w-[16ch] [&>h1]:[text-wrap:balance] [&>p:last-of-type]:max-w-[46rem] [&>p:last-of-type]:leading-[1.75]",
    actions: "mt-2 flex flex-wrap items-center gap-3 [@media(max-width:48rem)]:w-full [@media(max-width:48rem)]:flex-col [@media(max-width:48rem)]:items-stretch",
    action: "inline-flex rounded-full shadow-[var(--landing-explore-action-shadow)] [@media(max-width:48rem)]:w-full [@media(max-width:48rem)]:[&>a]:w-full [@media(max-width:48rem)]:[&>a]:justify-center",
    model: "relative grid min-w-0 gap-5 rounded-[2rem] bg-[var(--landing-explore-panel-background)] p-4 shadow-[var(--landing-explore-panel-shadow)] backdrop-blur-[18px] max-lg:w-full max-lg:max-w-[40rem]",
    modelEdge: "pointer-events-none absolute -inset-px -z-10 rounded-[inherit] bg-[image:var(--landing-explore-panel-edge)]",
    modelHalo: "pointer-events-none absolute -z-10 inset-[28%_-7%_-8%_30%] rounded-full bg-[var(--landing-explore-panel-halo)] blur-[38px]",
    modelTop: "flex items-center gap-[0.65rem] px-[0.65rem] py-[0.45rem] text-[var(--landing-ink-soft)] [letter-spacing:0.08em] uppercase",
    modelPulse: "aspect-square w-[0.55rem] rounded-full bg-[var(--accent)] shadow-[0_0_0_0.35rem_var(--landing-explore-pulse-ring)]",
    modelList: "m-0 grid list-none gap-[0.7rem] p-0",
    modelStep,
    modelStepTwo: `${modelStep} w-[calc(100%_-_1.6rem)] ml-[1.6rem] [@media(max-width:48rem)]:ml-0 [@media(max-width:48rem)]:w-full`,
    modelStepThree: `${modelStep} w-[calc(100%_-_3.2rem)] ml-[3.2rem] [@media(max-width:48rem)]:ml-0 [@media(max-width:48rem)]:w-full`,
    modelStepFour: `${modelStep} w-[calc(100%_-_4.8rem)] ml-[4.8rem] [@media(max-width:48rem)]:ml-0 [@media(max-width:48rem)]:w-full`,
    modelIndex: "text-[var(--accent)] text-[0.68rem] font-bold [letter-spacing:0.12em]",
    modelIcon: "grid aspect-square w-[2.7rem] place-items-center rounded-[0.9rem] bg-[var(--landing-explore-icon-background)] text-[var(--accent)] [&_svg]:h-5 [&_svg]:w-5",
    modelStepTitle: "text-[clamp(1rem,1.65vw,1.3rem)] leading-[1.2]",
    modelNext: "grid text-[var(--accent)]",
} as const
