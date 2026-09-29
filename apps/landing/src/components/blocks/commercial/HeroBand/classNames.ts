/** Shared hero surfaces for the company profile and contact router. */
const VARIANTS = {
    company:
        "relative isolate grid min-h-[calc(100dvh-var(--landing-header-height))] place-items-center overflow-hidden border-b border-[var(--landing-commercial-line)] bg-[image:var(--landing-commercial-hero-background)] before:absolute before:inset-[8%_-12%_auto_56%] before:z-[-1] before:h-px before:bg-[var(--accent)] before:shadow-[var(--landing-commercial-company-trace-shadow)] before:rotate-[-12deg] before:content-[''] [@media(max-width:64rem)]:min-h-0",
    contact:
        "relative overflow-hidden bg-[color:var(--landing-commercial-contact-background-color)] bg-[image:var(--landing-commercial-contact-background-image)] after:absolute after:top-[-16rem] after:right-[-12rem] after:aspect-square after:w-[42rem] after:rounded-full after:border after:border-[var(--landing-commercial-accent-glass-line)] after:shadow-[var(--landing-commercial-contact-ring-shadow)] after:content-['']",
} as const

/** Colocated hero-band utilities and route-variant composition. */
export const CLASS_NAMES = {
    ...VARIANTS,
    root: (variant: keyof typeof VARIANTS, className?: string) =>
        `${VARIANTS[variant]} ${className ?? ""}`.trim(),
} as const
