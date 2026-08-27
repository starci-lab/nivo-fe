import { motion } from "framer-motion"
import type { ComponentType } from "react"

/** Fixed content projected into the one authenticated-dashboard visual theme. */
export type StarCiDashboardThemeBoundaryProps<P extends object> = {
    readonly content: ComponentType<P>
    readonly contentProps: P
}

/** Bind every authenticated dashboard viewport and disclosure state to the StarCi theme. */
export const StarCiDashboardThemeBoundary = <P extends object>({ content: Content, contentProps }: StarCiDashboardThemeBoundaryProps<P>) => (
    <motion.div data-theme="starci-dashboard" data-visual-contract="starci-dashboard-theme">
        <Content {...contentProps} />
    </motion.div>
)

/** Source-level tier marker for the strict dashboard theme boundary. */
export const meta = { shape: "branch", world: "pure" } as const
