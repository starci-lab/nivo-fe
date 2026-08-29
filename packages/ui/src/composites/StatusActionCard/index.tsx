import { ActionLink } from "../../leaves/ActionLink"
import { Badge, type BadgeTone } from "../../leaves/Badge"
import { Button } from "../../leaves/Button"
import { Text } from "../../leaves/Text"

/** Resolved customer-safe capability with one action. */
export type StatusActionCardData = {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly statusLabel: string
    readonly statusTone: BadgeTone
    readonly actionLabel: string
    readonly disabled?: boolean
    readonly isPending?: boolean
    readonly detail?: string
    readonly actionHref?: string
    readonly actionTarget?: "_blank" | "_self"
}
/** Action reported by the capability card. */
export type StatusActionCardActions = { readonly press?: () => void }
/** Props for one capability card. */
export type StatusActionCardProps = { readonly props: StatusActionCardData; readonly on?: StatusActionCardActions; readonly isLoading?: boolean }

/** Render one capability with status and one safe action. */
export const StatusActionCard = (props: StatusActionCardProps) => (
    <div>
        <div>
            <Text props={{ content: props.props.title, weight: "semibold" }} isLoading={props.isLoading} />
            <Text props={{ content: props.props.description, size: "xs", tone: "muted" }} isLoading={props.isLoading} />
        </div>
        <Badge props={{ content: props.props.statusLabel, tone: props.props.statusTone }} isLoading={props.isLoading} />
        {props.props.detail === undefined ? null : <Text props={{ content: props.props.detail, size: "sm", tone: "muted" }} />}
        {props.props.actionHref !== undefined && props.props.disabled !== true ? (
            <ActionLink props={{ label: props.props.actionLabel, href: props.props.actionHref, target: props.props.actionTarget }} on={{ press: props.on?.press }} />
        ) : (
            <Button props={{ label: props.props.actionLabel, disabled: props.props.disabled, isPending: props.props.isPending }} on={{ press: props.on?.press }} isLoading={props.isLoading} />
        )}
    </div>
)