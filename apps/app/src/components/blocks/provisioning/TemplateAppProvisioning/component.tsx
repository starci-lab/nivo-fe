"use client"

import {
    Button,
    Field,
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

/** The settled trees the template-app flow can draw. */
export type TemplateAppProvisioningViewProps = {
    readonly state: "catalog_loading" | "unsupported" | "request" | "submitting" | "accepted" | "preparing" | "ready" | "failed"
    readonly props: {
        readonly steps: ReadonlyArray<LifecycleStepData>
        readonly subject: string
        readonly detail: string
        readonly statusTitle: string
        readonly statusText: string
        readonly slugLabel: string
        readonly slugPlaceholder: string
        readonly slugHint?: string
        readonly submitLabel: string
        readonly actionLabel?: string
        readonly isActionPending?: boolean
    }
    readonly on?: {
        readonly changeSlug?: (value: string) => void
        readonly submit?: () => void
        readonly act?: () => void
    }
}

/** Draw one Template App request and its deployment journey. */
export const _TemplateAppProvisioning = ({ state, props, on }: TemplateAppProvisioningViewProps) => {
    const isRequest = state === "request" || state === "submitting"
    const journey = defineContractComponent("horizontal-lifecycle-run", {
        step: props.steps.map((step) => defineCompositeComponent("lifecycle-step", {}, () => (
            <LifecycleStep props={step} isLoading={state === "catalog_loading"} />
        ))),
    })
    const request = isRequest
        ? defineContractComponent("form-column", {
            field: [defineContractProjection("label-field-hint", () => (
                <Field
                    props={{
                        id: "template-app-slug",
                        name: "slug",
                        label: props.slugLabel,
                        placeholder: props.slugPlaceholder,
                        hint: props.slugHint,
                        disabled: state === "submitting",
                    }}
                    on={{ change: on?.changeSlug }}
                />
            ))],
            submit: defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: props.submitLabel,
                        variant: "primary",
                        isPending: state === "submitting",
                    }}
                    on={{ press: on?.submit }}
                />
            )),
        })
        : defineContractProjection("subject-over-muted-caption-with-action", () => (
            <RequestSummary
                props={{ subject: props.subject, detail: props.detail, actionLabel: props.actionLabel }}
                on={{ press: on?.act }}
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
        ...(state === "failed" || state === "unsupported" ? {
            action: defineLeafComponent("button", {}, () => (
                <Button props={{ label: props.actionLabel ?? "", size: "sm", variant: "secondary" }} on={{ press: on?.act }} />
            )),
        } : {}),
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
