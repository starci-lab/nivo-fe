import type { ReactNode } from "react"
import { CLASS_NAMES as C } from "./classNames"

type ExploreActorCardProps = {
    readonly index: number
    readonly future: boolean
    readonly staggered: boolean
    readonly fields: ReadonlyArray<{ readonly label: string; readonly value: string }>
    readonly footer: ReactNode
    readonly children: ReactNode
}

/** One actor card, including the explicitly future-facing group. */
const ExploreActorCard = ({ index, future, staggered, fields, footer, children }: ExploreActorCardProps) => (
    <article
        className={future ? (staggered ? C.futureStaggeredCard : C.futureCard) : staggered ? C.staggeredCard : C.card}
        data-future={future ? "true" : undefined}
        role="listitem"
    >
        <span className={C.index}>{String(index + 1).padStart(2, "0")}</span>
        {children}
        <dl className={C.details}>
            {fields.map(({ label, value }) => (
                <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                </div>
            ))}
        </dl>
        {footer}
    </article>
)

export default ExploreActorCard
