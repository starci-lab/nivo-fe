const section = "relative isolate py-18 lg:py-24 xl:py-32 [@media(max-width:48rem)]:py-16"

/** Utility classes for section tone, content rhythm and inverse copy. */
export const CLASS_NAMES = {
    section,
    soft: `${section} bg-[image:var(--landing-explore-soft-background)]`,
    dark: `${section} bg-[image:var(--landing-explore-dark-background)] text-[var(--landing-explore-inverse-foreground)] [--foreground:var(--landing-explore-inverse-foreground)] [--muted:var(--landing-explore-inverse-muted)]`,
    burgundy: `${section} bg-[image:var(--landing-explore-burgundy-background)] text-[var(--landing-explore-inverse-foreground)] [--foreground:var(--landing-explore-inverse-foreground)] [--muted:var(--landing-explore-inverse-muted)]`,
    inner: "grid gap-10 lg:gap-14 xl:gap-20",
} as const
