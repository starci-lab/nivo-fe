import type { ReactNode } from "react"
import { CLASS_NAMES } from "./classNames"

type ExploreCardProps = {
    readonly staggered?: boolean
    readonly index?: string
    readonly children: ReactNode
}

/** Standard surface card used within the trust and Ideas sections. */
const ExploreCard = ({ staggered = false, index, children }: ExploreCardProps) => (
    <article className={staggered ? CLASS_NAMES.staggered : CLASS_NAMES.card}>
        {index === undefined ? null : <span className={CLASS_NAMES.index}>{index}</span>}
        {children}
    </article>
)

export default ExploreCard
