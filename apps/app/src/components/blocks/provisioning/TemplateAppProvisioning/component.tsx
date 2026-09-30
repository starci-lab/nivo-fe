import { Breadcrumbs, LifecycleStep, RequestSummary } from "@nivo/ui"
import { Button, Input, Heading, Text } from "@starci/grammar/common"
import { TemplateAppProvisioning } from "./index"
import type { TemplateAppProvisioningViewProps } from "@/modules/provisioning/template-app/view"

export type { TemplateAppProvisioningViewProps } from "@/modules/provisioning/template-app/view"

/** Draw one Template App request and its deployment journey. */
const TemplateAppProvisioningFlow = (props: TemplateAppProvisioningViewProps) => {
    const { state, props: viewProps, on }: TemplateAppProvisioningViewProps = props
    const isRequest = state === "request" || state === "submitting"
    const journey = (
        <div>
            {viewProps.steps.map((step) => (
                <LifecycleStep key={step.ordinal} props={step} isLoading={state === "catalog_loading"} />
            ))}
        </div>
    )
    const request = isRequest ? (
        <div>
            <>
                <Input
                    id="template-app-slug"
                    name="slug"
                    label={viewProps.slugLabel}
                    placeholder={viewProps.slugPlaceholder}
                    isDisabled={state === "submitting"}
                    variant="secondary"
                    hint={viewProps.slugHint}
                    onValueChange={on?.changeSlug}
                />
            </>

            <Button variant="primary" isPending={state === "submitting"} onPress={on?.submit}>
                {viewProps.submitLabel}
            </Button>
        </div>
    ) : (
        <RequestSummary
            props={{
                subject: viewProps.subject,
                detail: viewProps.detail,
                actionLabel: viewProps.actionLabel,
            }}
            on={{
                press: on?.act,
            }}
            isLoading={state === "catalog_loading"}
        />
    )
    const status = (
        <div>
            <Heading level={3}>{viewProps.statusTitle}</Heading>

            <Text size="sm" tone={state === "failed" ? "accent" : "muted"}>
                {viewProps.statusText}
            </Text>
            {state === "failed" || state === "unsupported" ? (
                <Button size="sm" variant="secondary" onPress={on?.act}>
                    {viewProps.actionLabel ?? ""}
                </Button>
            ) : null}
        </div>
    )
    return (
        <div>
            {journey}
            {request}
            {status}
        </div>
    )
}

/** Route identity needed to create or resume one Template App. */
export type TemplateAppProvisioningRouteProps =
    | {
          readonly mode: "new"
          readonly templateKey: string
      }
    | {
          readonly mode: "resume"
          readonly siteId: string
      }

/** Page-owned copy around the connected provisioning flow. */
export type TemplateAppProvisioningPageLabels = {
    readonly path: string
    readonly apps: string
    readonly createTitle: string
    readonly createDescription: string
    readonly provisioningTitle: string
    readonly provisioningDescription: string
}

/** Resolved route facts and copy drawn by the provisioning block. */
export type TemplateAppProvisioningPageViewProps = TemplateAppProvisioningRouteProps & {
    readonly labels: TemplateAppProvisioningPageLabels
}

/** Atom-only page composition and resolved lifecycle view accepted by the twin. */
export type TemplateAppProvisioningBaseProps =
    | TemplateAppProvisioningViewProps
    | {
          readonly state: "page"
          readonly props: TemplateAppProvisioningPageViewProps
          readonly on: TemplateAppProvisioningPageActions
      }

/** Actions the route composition exposes. */
type TemplateAppProvisioningPageActions = {
    readonly openApps: () => void
}

/** Draw the route heading and breadcrumb around the connected lifecycle screen. */
export const TemplateAppProvisioningBase = (props: TemplateAppProvisioningBaseProps) => {
    if (props.state !== "page") return <TemplateAppProvisioningFlow {...props} />
    const { props: view, on } = props
    const context =
        view.mode === "new"
            ? { mode: "new" as const, templateKey: view.templateKey }
            : { mode: "resume" as const, siteId: view.siteId }
    const title = view.mode === "new" ? view.labels.createTitle : view.labels.provisioningTitle
    const description = view.mode === "new" ? view.labels.createDescription : view.labels.provisioningDescription
    return (
        <div>
            <Breadcrumbs
                props={{
                    mode: "trail",
                    label: view.labels.path,
                    steps: [
                        {
                            id: "apps",
                            label: view.labels.apps,
                        },
                        {
                            id: view.mode,
                            label: title,
                            isCurrent: true,
                        },
                    ],
                }}
                on={{
                    activate: (id) => {
                        if (id === "apps") on.openApps()
                    },
                }}
            />
            <div>
                <Heading level={1}>{title}</Heading>
                <Text size="sm" tone="muted">
                    {description}
                </Text>
            </div>
            <TemplateAppProvisioning context={context} />
        </div>
    )
}
