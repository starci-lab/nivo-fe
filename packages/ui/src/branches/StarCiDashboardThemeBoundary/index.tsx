import { motion } from "framer-motion"
import type { ReactNode } from "react"

/** Fixed content projected into the one authenticated-dashboard visual theme. */
export type StarCiDashboardThemeBoundaryProps = {
    readonly content: ReactNode
}

/** Bind every authenticated dashboard viewport and disclosure state to the StarCi theme. */
export const StarCiDashboardThemeBoundary = ({ content }: StarCiDashboardThemeBoundaryProps) => (
    <motion.div layout data-theme="starci-dashboard" data-visual-contract="starci-dashboard-theme">
        {content}
    </motion.div>
)

/** Source-level tier marker for the strict dashboard theme boundary. */
export const meta = { shape: "branch", world: "pure" } as const
