import type { TemplateFlow } from "./index"

type CopyCatalog = (key: string) => string
/** One resolved lifecycle milestone in the Template App progress rail. */
export type TemplateStepView = {
    readonly ordinal: string
    readonly label: string
    readonly state: "done" | "current" | "upcoming"
    readonly stateLabel: string
}
/** Render-ready Template App state, copy, progress, and action handlers. */
export type TemplateAppProvisioningViewProps = {
    readonly state: "catalog_loading" | "unsupported" | "request" | "submitting" | "accepted" | "preparing" | "ready" | "failed"
    readonly props: {
        readonly steps: ReadonlyArray<TemplateStepView>
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

/** Data required to resolve one localized Template App phase into the block view. */
export type TemplateAppProvisioningViewInput = {
    readonly flow: TemplateFlow
    readonly steps: ReadonlyArray<TemplateStepView>
    readonly t: CopyCatalog
    readonly realtimeStatus: string
    readonly changeSlug: (value: string) => void
    readonly submit: () => void
    readonly act: (flow: TemplateFlow) => void
}

/** Resolve the localized Template App surface from its derived flow phase. */
export const templateAppProvisioningView = (input: TemplateAppProvisioningViewInput): TemplateAppProvisioningViewProps => {
    const { flow, steps, t, realtimeStatus, changeSlug, submit, act } = input
    const subject =
        flow.phase === "catalog_loading"
            ? t("template.productName")
            : flow.phase === "request" || flow.phase === "submitting" || flow.phase === "unsupported"
              ? flow.name
              : flow.phase === "failed" || flow.phase === "accepted"
                ? flow.subject
                : (flow.publicHost ?? flow.siteId)
    const detail =
        flow.phase === "preparing" || flow.phase === "ready"
            ? flow.deploymentId
            : flow.phase === "accepted"
              ? flow.siteId
              : t("template.detail")
    const common = {
        steps,
        subject,
        detail,
        slugLabel: t("template.slugLabel"),
        slugPlaceholder: t("template.slugPlaceholder"),
        slugHint: t("template.slugHint"),
        submitLabel: t("template.submit"),
    }
    if (flow.phase === "unsupported")
        return {
            state: "unsupported",
            props: { ...common, statusTitle: t("unsupportedTitle"), statusText: t("unsupportedText"), actionLabel: t("backToApps") },
            on: { act: () => act(flow) },
        }
    if (flow.phase === "failed")
        return {
            state: "failed",
            props: { ...common, statusTitle: t("failedTitle"), statusText: flow.reason, actionLabel: t("backToApps") },
            on: { act: () => act(flow) },
        }
    if (flow.phase === "request" || flow.phase === "submitting")
        return {
            state: flow.phase,
            props: { ...common, statusTitle: t("template.requestTitle"), statusText: t("template.requestText") },
            on: { changeSlug, submit },
        }
    if (flow.phase === "ready")
        return {
            state: "ready",
            props: { ...common, statusTitle: t("readyTitle"), statusText: t("template.readyText"), actionLabel: t("manageApps") },
            on: { act: () => act(flow) },
        }
    if (flow.phase === "accepted")
        return {
            state: "accepted",
            props: { ...common, statusTitle: t("template.acceptedTitle"), statusText: t("template.acceptedText") },
        }
    const isCatalogLoading = flow.phase === "catalog_loading"
    return {
        state: flow.phase,
        props: {
            ...common,
            statusTitle: isCatalogLoading ? t("loadingTitle") : t("preparingTitle"),
            statusText: isCatalogLoading ? t("loadingText") : realtimeStatus === "connecting" ? t("connecting") : t("template.preparingText"),
        },
    }
}
