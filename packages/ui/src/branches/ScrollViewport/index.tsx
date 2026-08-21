import { motion } from "framer-motion"
import type { CSSProperties, ReactNode } from "react"

/** Fixed content owned by the navigation scroll viewport. */
export type ScrollViewportProps = {
    readonly content: ReactNode
    readonly ariaLabel?: string
}

const VIEWPORT_STYLE: CSSProperties = {
    minHeight: 0,
    flex: 1,
    overflowY: "auto",
    overscrollBehavior: "contain",
    scrollbarWidth: "none",
}

/** Own the single contained vertical scroll region while keeping native scrollbar paint hidden. */
export const ScrollViewport = ({ content, ariaLabel }: ScrollViewportProps) => (
    <motion.div
        aria-label={ariaLabel}
        data-component="ScrollViewport"
        tabIndex={0}
        layoutScroll
        style={VIEWPORT_STYLE}
    >
        {content}
    </motion.div>
)

/** Source-level tier marker for the single internal scroll owner. */
export const meta = { shape: "branch", world: "pure" } as const
