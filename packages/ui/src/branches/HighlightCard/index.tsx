import { motion, useReducedMotion, type MotionStyle } from "framer-motion"
import type { ReactNode } from "react"
import type { SurfaceCardData } from "../SurfaceCard"
import { Heading } from "../../leaves/Heading"

/** Props for the optional highlighted surface. */
export type HighlightCardProps = { readonly props?: Pick<SurfaceCardData, "label" | "ariaLabel">; readonly children?: ReactNode; readonly render?: ReactNode; readonly isLoading?: boolean }

const SWEEP_STYLE = { position: "absolute", inset: -2, borderRadius: "min(32px, var(--starci-radius-3xl))", "--highlight-card-angle": "0deg", background: "conic-gradient(from var(--highlight-card-angle), transparent 0%, transparent 82%, var(--nivo-accent) 92%, transparent 100%)", pointerEvents: "none" } as MotionStyle

/** Render content with a decorative accent sweep while preserving reduced-motion behavior. */
export const HighlightCard = (props: HighlightCardProps) => {
    const reduced = useReducedMotion()
    return (
        <div>
            {props.isLoading === true ? null : <motion.span aria-hidden style={SWEEP_STYLE} animate={reduced === true ? undefined : { "--highlight-card-angle": "360deg" }} transition={reduced === true ? undefined : { duration: 3, ease: "linear", repeat: Infinity }} />}
            <section aria-label={props.props?.label === undefined ? props.props?.ariaLabel : undefined}>
                {props.props?.label === undefined ? null : <Heading props={{ content: props.props.label, level: 2 }} />}
                {props.children ?? props.render}
            </section>
        </div>
    )
}
