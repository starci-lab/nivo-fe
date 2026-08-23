import { skeletonVariants } from "@heroui/react"
import type { LeafProps } from "../../contracts/props"

/** The two protected presentations of the Nivo identity. */
export type NivoBrandVariant = "lockup" | "mark"

/** Fixed artwork extents owned by the brand leaf. */
export type NivoBrandScale = "navbar" | "hero"

/** What the protected brand artwork draws. */
export type NivoBrandData = {
    readonly label: string
    readonly variant?: NivoBrandVariant
    readonly scale?: NivoBrandScale
}

/** Props for {@link NivoBrand}. */
export type NivoBrandProps = LeafProps<NivoBrandData>

const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base()

const WRAPPER_CLASSES = {
    navbar: "inline-flex h-8 w-auto shrink-0 items-center",
    hero: "inline-flex h-20 w-auto shrink-0 items-center",
} as const

type OrbitProps = {
    readonly compact?: boolean
}

const Orbit = ({ compact = false }: OrbitProps) => {
    const offset = compact ? 0 : 202
    return (
        <g transform={`translate(${offset} 0)`} data-part="orbit">
            <path className="nivo-brand__accent" d="M28.7 25A30 30 0 0 1 67.3 25" />
            <path className="nivo-brand__accent" d="M71 28.7A30 30 0 0 1 71 67.3" />
            <path className="nivo-brand__accent" d="M67.3 71A30 30 0 0 1 28.7 71" />
            <path className="nivo-brand__accent" d="M25 67.3A30 30 0 0 1 25 28.7" />
        </g>
    )
}

/** Draw the protected Nivo wordmark or its segmented orbit mark. */
export const NivoBrand = ({ props, isLoading = false }: NivoBrandProps) => {
    const variant = props.variant ?? "lockup"
    const scale = props.scale ?? "navbar"
    const wrapperClasses = WRAPPER_CLASSES[scale]

    return (
        <span
            data-tier="leaf"
            data-component="NivoBrand"
            data-variant={variant}
            data-scale={scale}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            className={`${wrapperClasses} ${isLoading ? `${RESTING_CLASSES} aspect-square rounded-full` : ""}`}
        >
            {isLoading ? null : (
                <svg
                    viewBox={variant === "mark" ? "0 0 96 96" : "0 0 298 96"}
                    className="h-full w-auto overflow-visible"
                    role="img"
                    aria-label={props.label}
                    focusable="false"
                >
                    {variant === "lockup" ? (
                        <g className="nivo-brand__ink" data-part="wordmark">
                            <path d="M4 84V12h18l34 46V12h18v72H56L22 38v46Z" />
                            <path d="M86 12h18v72H86Z" />
                            <path d="M112 12h20l21 50 21-50h20l-31 72h-20Z" />
                        </g>
                    ) : null}
                    <Orbit compact={variant === "mark"} />
                </svg>
            )}
        </span>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
