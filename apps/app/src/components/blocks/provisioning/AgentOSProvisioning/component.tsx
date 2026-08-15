"use client"

import {
    Button,
    Heading,
    LifecycleStep,
    RequestSummary,
    Text,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LifecycleStepData,
} from "@nivo/ui"

/** Every settled tree the AgentOS order and workspace flow can draw. */
export type AgentOSProvisioningViewProps = {
    readonly state: "catalog_loading" | "request" | "submitting" | "awaiting_payment" | "accepted" | "preparing" | "ready" | "failed"
    readonly props: {
        readonly steps: ReadonlyArray<LifecycleStepData>
        readonly subject: string
        readonly detail: string
        readonly statusTitle: string
        readonly statusText: string
        readonly requestActionLabel?: string
        readonly statusActionLabel?: string
        readonly isRequestPending?: boolean
    }
    readonly on?: {
        readonly request?: () => void
        readonly statusAction?: () => void
    }
}

/** Draw an AgentOS order beside its exact live workspace status. */
export const _AgentOSProvisioning = ({ state, props, on }: AgentOSProvisioningViewProps) => {
    const journey = defineContractComponent("horizontal-lifecycle-run", {
        step: props.steps.map((step) => defineCompositeComponent("lifecycle-step", {}, () => (
            <LifecycleStep props={step} isLoading={state === "catalog_loading"} />
        ))),
    })
    const request = defineContractProjection("subject-over-muted-caption-with-action", () => (
        <RequestSummary
            props={{ subject: props.subject, detail: props.detail, actionLabel: props.requestActionLabel }}
            on={{ press: on?.request }}
            isLoading={state === "catalog_loading"}
        />
    ))
    const status = defineContractComponent("heading-body-action-stack", {
        heading: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: props.statusTitle, level: 3 }} />
        )),
        body: defineLeafComponent("text", {}, () => (
            <Text props={{ content: props.statusText, size: "sm", tone: state === "failed" ? "accent" : "muted" }} />
        )),
        ...(props.statusActionLabel === undefined ? {} : {
            action: defineLeafComponent("button", {}, () => (
                <Button props={{ label: props.statusActionLabel ?? "", size: "sm", variant: "secondary" }} on={{ press: on?.statusAction }} />
            )),
        }),
    })
    return (
        <Tree
            contract="request-beside-live-status"
            render={defineContractComponent("request-beside-live-status", { journey, request, status })}
        />
    )
}

/** Source-level tier marker for the pure block half. */
export const meta = { shape: "block", world: "pure" } as const
