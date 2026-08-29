import type { ReactNode } from "react"
import { Button } from "../../leaves/Button"
import { Text } from "../../leaves/Text"
import { Heading } from "../../leaves/Heading"

/** Resolved copy and list presentation options. */
export type SurfaceListCardData = {
    readonly [key: string]: unknown
    readonly label: string
    readonly fact?: string
    readonly description?: string
    readonly actionLabel?: string
    readonly isNested?: boolean
    readonly isLabelHidden?: boolean
}
/** Whole-list action. */
export type SurfaceListCardActions = { readonly act?: () => void }
/** Props for a joined list surface. */
export type SurfaceListCardProps = {
    readonly props: SurfaceListCardData
    readonly on?: SurfaceListCardActions
    readonly children?: ReactNode
    readonly render?: ReactNode
    readonly isLoading?: boolean
}

/** Render a labelled list surface and its optional footer. */
export const SurfaceListCard = (props: SurfaceListCardProps) => {
    const data = props.props
    const footer = data.actionLabel !== undefined && (props.isLoading === true || props.on?.act !== undefined)
        ? <Button props={{ label: data.actionLabel, size: "sm", variant: "primary" }} on={{ press: props.on?.act }} isLoading={props.isLoading} />
        : data.description === undefined ? null : <Text props={{ content: data.description, size: "xs", tone: "muted" }} isLoading={props.isLoading} />
    return (
        <section aria-label={data.isLabelHidden === true ? undefined : data.label}>
            {data.isLabelHidden === true ? null : <Heading props={{ content: data.label, level: 2 }} />}
            {data.fact === undefined ? null : <Text props={{ content: data.fact, size: "xs", tone: "muted" }} isLoading={props.isLoading} />}
            <div>{props.children ?? props.render}</div>
            {footer}
        </section>
    )
}
