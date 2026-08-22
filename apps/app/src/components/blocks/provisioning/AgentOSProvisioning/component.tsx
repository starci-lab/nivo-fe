"use client"

import {
    Button,
    HighlightCard,
    LifecycleStep,
    MicrochipArtwork,
    SurfaceCard,
    Text,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LifecycleStepData,
} from "@nivo/ui"

/** Block-owned conditions of the AgentOS order and provisioning continuation. */
export type AgentOSProvisioningBlockState =
    | "catalog_loading"
    | "request"
    | "submitting"
    | "awaiting_payment"
    | "accepted"
    | "preparing"
    | "ready"
    | "failed"

/** Every settled tree the AgentOS provisioning block can draw. */
export type AgentOSProvisioningViewProps = {
    readonly state: AgentOSProvisioningBlockState
    readonly props: {
        readonly progressLabel?: string
        readonly continuationLabel?: string
        readonly steps: ReadonlyArray<LifecycleStepData>
        readonly subject: string
        readonly detail: string
        readonly statusTitle: string
        readonly statusText: string
        readonly requestActionLabel?: string
        readonly statusActionLabel?: string
        readonly statusActionDisabled?: boolean
        readonly isRequestPending?: boolean
    }
    readonly on?: {
        readonly request?: () => void
        readonly statusAction?: () => void
    }
}

/** Draw an AgentOS order beside its exact live workspace status. */
export const AgentOSProvisioningBase = ({ state, props, on }: AgentOSProvisioningViewProps) => {
    const journey = defineContractComponent("responsive-four-stage-lifecycle-stepper", {
        step: props.steps.map((step) => defineCompositeComponent("lifecycle-step", {}, () => (
            <LifecycleStep props={step} isLoading={state === "catalog_loading"} />
        ))),
    })
    const identity = defineContractComponent("subject-over-muted-caption", {
        subject: defineLeafComponent("text", {}, () => (
            <Text props={{ content: props.subject, size: "md", weight: "medium" }} isLoading={state === "catalog_loading"} />
        )),
        caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: props.detail, size: "xs", tone: "muted" }} isLoading={state === "catalog_loading"} />
        )),
    })
    const actionLabel = props.requestActionLabel ?? props.statusActionLabel
    const action = actionLabel === undefined ? undefined : defineLeafComponent("button", {}, () => (
        <Button
            props={{
                label: actionLabel,
                variant: "primary",
                isPending: props.isRequestPending,
                disabled: props.statusActionDisabled,
            }}
            on={{ press: props.requestActionLabel === undefined ? on?.statusAction : on?.request }}
        />
    ))
    const phaseAction = defineContractComponent("identity-phase-action", {
        identity,
        prompt: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: props.statusTitle, size: "sm" }} />
        )),
        body: defineLeafComponent("text", {}, () => (
            <Text props={{ content: props.statusText, size: "sm", tone: state === "failed" ? "accent" : "muted" }} />
        )),
        action,
    })
    const artwork = defineContractComponent("provisioning-brand-mark-cell", {
        mark: defineLeafComponent("microchip-artwork", {}, () => (
            <MicrochipArtwork
                props={{ tone: "brand" }}
                isLoading={state === "catalog_loading"}
            />
        )),
    })
    const continuation = defineContractComponent("provisioning-phase-with-mark", {
        details: phaseAction,
        artwork,
    })
    const orderContent = defineContractComponent("provisioning-order-content", {
        journey,
        continuation,
    })
    const highlightsContinuation = state === "ready"
        || state === "awaiting_payment" && props.statusActionDisabled !== true && on?.statusAction !== undefined
    return (
        <Tree
            contract="provisioning-order-stack"
            render={defineContractComponent("provisioning-order-stack", {
                order: defineContractProjection("label-row-over-card", () => highlightsContinuation ? (
                    <HighlightCard props={{ label: props.progressLabel ?? props.subject }} contract="provisioning-order-content" render={orderContent} />
                ) : (
                    <SurfaceCard props={{ label: props.progressLabel ?? props.subject }} contract="provisioning-order-content" render={orderContent} isLoading={state === "catalog_loading"} />
                )),
            })}
        />
    )
}

/** Source-level tier marker for the pure block half. */
export const meta = { shape: "block", world: "pure" } as const
