"use client"

import {
    Button,
    Heading,
    LifecycleStep,
    Text,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
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
    const journey = defineContractComponent("responsive-five-stage-lifecycle-run", {
        step: props.steps.map((step) => defineCompositeComponent("lifecycle-step", {}, () => (
            <LifecycleStep props={step} isLoading={state === "catalog_loading"} />
        ))),
    })
    const request = defineContractComponent("subject-over-muted-caption-with-action", {
        identity: defineContractComponent("subject-over-muted-caption", {
            subject: defineLeafComponent("text", {}, () => (
                <Text props={{ content: props.subject, size: "sm", weight: "semibold" }} isLoading={state === "catalog_loading"} />
            )),
            caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: props.detail, size: "xs", tone: "muted" }} isLoading={state === "catalog_loading"} />
            )),
        }),
        ...(props.requestActionLabel === undefined ? {} : {
            action: defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: props.requestActionLabel ?? "", size: "sm", variant: "secondary", isPending: props.isRequestPending }}
                    on={{ press: on?.request }}
                />
            )),
        }),
    })
    const status = defineContractComponent("heading-body-action-stack", {
        heading: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: props.statusTitle, level: 3 }} />
        )),
        body: defineLeafComponent("text", {}, () => (
            <Text props={{ content: props.statusText, size: "sm", tone: state === "failed" ? "accent" : "muted" }} />
        )),
        ...(props.statusActionLabel === undefined ? {} : {
            action: defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: props.statusActionLabel ?? "", size: "sm", variant: "secondary", disabled: props.statusActionDisabled }}
                    on={{ press: on?.statusAction }}
                />
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
