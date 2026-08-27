import { motion } from "framer-motion"
import type { ComponentType, CSSProperties } from "react"

/** Fixed content owned by the navigation scroll viewport. */
export type ScrollViewportProps<P extends object> = {
    readonly content: ComponentType<P>
    readonly contentProps: P
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
export const ScrollViewport = <P extends object>({ content: Content, contentProps, ariaLabel }: ScrollViewportProps<P>) => (
    <motion.div
        aria-label={ariaLabel}
        data-component="ScrollViewport"
        tabIndex={0}
        layoutScroll
        style={VIEWPORT_STYLE}
    >
        <Content {...contentProps} />
    </motion.div>
)

/** Source-level tier marker for the single internal scroll owner. */
export const meta = { shape: "branch", world: "pure" } as const
