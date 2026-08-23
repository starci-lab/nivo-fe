import { skeletonVariants } from "@heroui/react"
import { Icon, type IconName } from "../Icon"
import type { LeafProps } from "../../contracts/props"

/** Semantic state carried by the corner signal on a console tile. */
export type TileIconSignal = "none" | "active" | "attention"

/** Meaning and state drawn by the console tile mark. */
export type TileIconData = {
    readonly icon: IconName
    readonly signal?: TileIconSignal
}

/** Props for the fixed console tile mark. */
export type TileIconProps = LeafProps<TileIconData>

const SIGNAL_CLASSES = {
    none: "hidden",
    active: "bg-success",
    attention: "bg-warning",
} as const

const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base()

/**
 * Draw the persistent 40px console tile icon and its optional state signal.
 *
 * The corner signal is part of the mark's anatomy, so callers name its meaning instead of
 * assembling an absolute-positioned dot beside a generic icon.
 */
export const TileIcon = ({ props, isLoading = false }: TileIconProps) => {
    const signal = props.signal ?? "none"
    return (
        <span
            data-tier="leaf"
            data-component="TileIcon"
            data-signal={signal}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden="true"
            className={[
                "relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                isLoading ? RESTING_CLASSES : "bg-accent-soft text-accent-soft-foreground",
            ].join(" ")}
        >
            {isLoading ? null : <Icon props={{ name: props.icon, role: "leading" }} />}
            <span
                data-component="TileIconSignal"
                className={`absolute -right-0.5 -top-0.5 size-2.5 rounded-full ring-2 ring-background ${SIGNAL_CLASSES[signal]}`}
            />
        </span>
    )
}

/** Source-level tier marker for the pure leaf. */
export const meta = { shape: "leaf", world: "pure" } as const
