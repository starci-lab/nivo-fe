import type { ReactNode } from "react"
import { CLASS_NAMES as C } from "./classNames"

type ExploreIdeaCardProps = {
    readonly featured?: boolean
    readonly staggered?: boolean
    readonly mark?: string
    readonly children: ReactNode
}

/** An editorial card for one Idea, with a distinct featured layout. */
const ExploreIdeaCard = ({ featured = false, staggered = false, mark, children }: ExploreIdeaCardProps) => (
    <article
        className={featured ? (staggered ? C.featuredStaggered : C.featured) : staggered ? C.staggered : C.card}
        data-featured={featured ? "true" : undefined}
    >
        {mark === undefined ? null : (
            <span className={featured ? C.mark : C.secondaryMark}>{mark}</span>
        )}
        {children}
    </article>
)

export default ExploreIdeaCard
