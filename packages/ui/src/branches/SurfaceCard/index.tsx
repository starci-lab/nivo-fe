import type { ReactNode } from "react"
import { Button } from "../../leaves/Button"
import { SeeMoreLink } from "../../leaves/SeeMoreLink"
import { Text } from "../../leaves/Text"
import { Heading } from "../../leaves/Heading"
import { SURFACE_CARD_CLASS_NAME } from "./classNames"

/** Optional heading and actions around a surface. */
export type SurfaceCardData = {
    readonly label?: string
    readonly ariaLabel?: string
    readonly fact?: string
    readonly seeMoreLabel?: string
    readonly actionLabel?: string
    readonly isFrameless?: boolean
}
/** Actions exposed by the surface heading. */
export type SurfaceCardActions = { readonly act?: () => void; readonly seeMore?: () => void }
/** Props for a neutral HeroUI-backed surface. */
export type SurfaceCardProps = {
    readonly props?: SurfaceCardData
    readonly on?: SurfaceCardActions
    readonly children?: ReactNode
    readonly render?: ReactNode
    readonly isLoading?: boolean
}

/** Render one labelled or aria-labelled surface with its supplied React content. */
export const SurfaceCard = (props: SurfaceCardProps) => {
    const data = props.props ?? {}
    const end = data.actionLabel !== undefined && props.on?.act !== undefined
        ? <Button props={{ label: data.actionLabel, size: "sm", variant: "primary" }} on={{ press: props.on.act }} isLoading={props.isLoading} />
        : data.seeMoreLabel !== undefined && props.on?.seeMore !== undefined
            ? <SeeMoreLink props={{ label: data.seeMoreLabel }} on={{ press: props.on.seeMore }} />
            : data.fact === undefined ? null : <Text props={{ content: data.fact, size: "sm", tone: "muted" }} isLoading={props.isLoading} />
    return (
        <section className={SURFACE_CARD_CLASS_NAME} aria-label={data.label === undefined ? data.ariaLabel : undefined}>
            {data.label === undefined ? null : <Heading props={{ content: data.label, level: 2 }} />}
            {end}
            <div>{props.children ?? props.render}</div>
        </section>
    )
}
