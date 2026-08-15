import { Button } from "../../leaves/Button"
import { Text } from "../../leaves/Text"
import { Tree } from "../../branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type CompositeProps,
} from "../../contracts/props"

/** Resolved identity and optional onward action for one submitted request. */
export type RequestSummaryData = {
    readonly subject: string
    readonly detail: string
    readonly actionLabel?: string
}

/** The one action a request summary may expose. */
export type RequestSummaryActions = { readonly press?: () => void }

/** Props for the closed request-summary shape. */
export type RequestSummaryProps = CompositeProps<RequestSummaryData, RequestSummaryActions>

/** Draw a subject over its quiet identity, with at most one onward action. */
export const RequestSummary = ({ props, on, isLoading = false }: RequestSummaryProps) => (
    <Tree
        contract="subject-over-muted-caption-with-action"
        render={defineContractComponent("subject-over-muted-caption-with-action", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("text", {}, () => (
                    <Text props={{ content: props.subject, size: "sm", weight: "semibold" }} isLoading={isLoading} />
                )),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: props.detail, size: "xs", tone: "muted" }} isLoading={isLoading} />
                )),
            }),
            ...(props.actionLabel === undefined ? {} : {
                action: defineLeafComponent("button", {}, () => (
                    <Button props={{ label: props.actionLabel ?? "", size: "sm", variant: "secondary" }} on={{ press: on?.press }} />
                )),
            }),
        })}
    />
)

/** Source-level tier marker for the reusable closed request composition. */
export const meta = { shape: "composite", world: "pure" } as const
