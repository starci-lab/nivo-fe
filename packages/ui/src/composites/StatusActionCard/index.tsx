import { ActionLink } from "../../leaves/ActionLink"
import { Badge } from "../../leaves/Badge"
import { Button } from "../../leaves/Button"
import { Text } from "../../leaves/Text"
import { Tree } from "../../branches/Tree"
import type { BadgeTone } from "../../leaves/Badge"
import type { CompositeProps } from "../../contracts/props"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"

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

/** The one safe action exposed by a capability card. */
export type StatusActionCardActions = { readonly press?: () => void }
/** Closed data and action surface for one capability. */
export type StatusActionCardProps = CompositeProps<StatusActionCardData, StatusActionCardActions>

/** Draw one capability without accepting credentials or transient authorization codes as props. */
export const StatusActionCard = ({ props, on, isLoading = false }: StatusActionCardProps) => (
    <Tree
        contract="status-action-card"
        render={defineContractComponent("status-action-card", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("text", { weight: "semibold" }, () => <Text props={{ content: props.title, weight: "semibold" }} isLoading={isLoading} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.description, size: "xs", tone: "muted" }} isLoading={isLoading} />),
            }),
            state: defineLeafComponent("badge", {}, () => <Badge props={{ content: props.statusLabel, tone: props.statusTone }} isLoading={isLoading} />),
            ...(props.detail === undefined ? {} : {
                detail: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: props.detail, size: "sm", tone: "muted" }} />),
            }),
            action: props.actionHref !== undefined && props.disabled !== true
                ? defineLeafComponent("action-link", {}, () => (
                    <ActionLink props={{ label: props.actionLabel, href: props.actionHref!, target: props.actionTarget }} on={{ press: on?.press }} />
                ))
                : defineLeafComponent("button", {}, () => (
                    <Button props={{ label: props.actionLabel, disabled: props.disabled, isPending: props.isPending }} on={{ press: on?.press }} isLoading={isLoading} />
                )),
        })}
    />
)

/** Source-level tier marker for a generic status/action capability card. */
export const meta = { shape: "composite", world: "pure" } as const
