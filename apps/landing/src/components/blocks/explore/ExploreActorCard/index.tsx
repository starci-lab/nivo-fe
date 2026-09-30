import type { ReactNode } from "react"
import { DescriptionList, Text } from "@starci/grammar/common"
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
        <Text as="span">
            <Text as="span">{String(index + 1).padStart(2, "0")}</Text>
        </Text>
        {children}
        <DescriptionList
            className={C.details}
            items={fields.map(({ label, value }) => ({ id: label, term: label, description: value }))}
        />
        {footer}
    </article>
)

export default ExploreActorCard
