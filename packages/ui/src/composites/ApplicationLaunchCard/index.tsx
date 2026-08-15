import { Badge } from "../../leaves/Badge"
import { Button } from "../../leaves/Button"
import { Text } from "../../leaves/Text"
import { Tree } from "../../branches/Tree"
import type { BadgeTone } from "../../leaves/Badge"
import type { CompositeProps } from "../../contracts/props"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"

/** Resolved customer-safe application capability. */
export type ApplicationLaunchCardData = {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly statusLabel: string
    readonly statusTone: BadgeTone
    readonly actionLabel: string
    readonly disabled?: boolean
    readonly isPending?: boolean
    readonly detail?: string
}

/** The one safe destination an application card may open. */
export type ApplicationLaunchCardActions = { readonly press?: () => void }
/** Closed data and action surface for one application card. */
export type ApplicationLaunchCardProps = CompositeProps<ApplicationLaunchCardData, ApplicationLaunchCardActions>

/** Draw one bundled application without accepting credentials or launch codes as props. */
export const ApplicationLaunchCard = ({ props, on, isLoading = false }: ApplicationLaunchCardProps) => (
    <Tree
        contract="application-launch-card"
        render={defineContractComponent("application-launch-card", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("text", { weight: "semibold" }, () => <Text props={{ content: props.title, weight: "semibold" }} isLoading={isLoading} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.description, size: "xs", tone: "muted" }} isLoading={isLoading} />),
            }),
            state: defineLeafComponent("badge", {}, () => <Badge props={{ content: props.statusLabel, tone: props.statusTone }} isLoading={isLoading} />),
            ...(props.detail === undefined ? {} : {
                detail: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: props.detail, size: "sm", tone: "muted" }} />),
            }),
            action: defineLeafComponent("button", {}, () => (
                <Button props={{ label: props.actionLabel, disabled: props.disabled, isPending: props.isPending }} on={{ press: on?.press }} isLoading={isLoading} />
            )),
        })}
    />
)

/** Source-level tier marker for the application capability card. */
export const meta = { shape: "composite", world: "pure" } as const
