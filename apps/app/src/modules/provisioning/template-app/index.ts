import { type Outcome } from "@nivo/api"
import type { ExpertDeploymentSnapshot } from "@/modules/api/expert-sites"
import type { CatalogItemRow } from "@/modules/api/commerce"

/** The durable state shown by the Template App provisioning journey. */
export type TemplateFlow =
    | { readonly phase: "catalog_loading" }
    | { readonly phase: "unsupported"; readonly name: string }
    | { readonly phase: "request"; readonly name: string }
    | { readonly phase: "submitting"; readonly name: string }
    | { readonly phase: "accepted"; readonly siteId: string; readonly subject: string }
    | {
          readonly phase: "preparing"
          readonly siteId: string
          readonly deploymentId: string
          readonly publicHost: string | null
      }
    | {
          readonly phase: "ready"
          readonly siteId: string
          readonly deploymentId: string
          readonly publicHost: string | null
      }
    | { readonly phase: "failed"; readonly subject: string; readonly reason: string }

/** The step index for each visible flow phase. */
export const TEMPLATE_PHASE_INDEX: Readonly<Record<TemplateFlow["phase"], number>> = {
    catalog_loading: 0,
    unsupported: 0,
    request: 0,
    submitting: 0,
    accepted: 2,
    preparing: 2,
    failed: 2,
    ready: 3,
}

/** Map the deployment owner's vocabulary onto the visible deployment state. */
export const deploymentPhase = (status: string): "preparing" | "ready" | "failed" => {
    if (status === "running" || status === "ready") return "ready"
    if (status === "failed") return "failed"
    return "preparing"
}

/** Derive the visible state from the durable deployment projection. */
export const settleDeployment = (
    siteId: string,
    subject: string,
    snapshot: ExpertDeploymentSnapshot | null,
    failedProvision: string,
): TemplateFlow => {
    if (snapshot === null) return { phase: "accepted", siteId, subject }
    const phase = deploymentPhase(snapshot.status)
    if (phase === "failed") return { phase: "failed", subject, reason: failedProvision }
    return { phase, siteId, deploymentId: snapshot.id, publicHost: snapshot.publicHost }
}

/** One owner event that may advance the exact deployment already shown by the flow. */
export type TemplateDeploymentEvent = {
    readonly id: string
    readonly status: string
    readonly reason: string | null
}

/** Fold a matching realtime hint into the derived view without storing a second phase state. */
export const templateFlowWithDeploymentEvent = (
    flow: TemplateFlow,
    event: TemplateDeploymentEvent | null,
    failedProvision: string,
): TemplateFlow => {
    if ((flow.phase !== "preparing" && flow.phase !== "ready") || event === null || event.id !== flow.deploymentId) return flow
    const phase = deploymentPhase(event.status)
    if (phase === "failed") return { phase: "failed", subject: event.id, reason: event.reason ?? failedProvision }
    return { ...flow, phase }
}

/** Inputs for deriving the Template App phase from catalog, mutation, and deployment answers. */
export type TemplateFlowFromAnswersInput = {
    readonly templateKey: string | null
    readonly resumeSiteId: string | null
    readonly catalog: Outcome<ReadonlyArray<CatalogItemRow>> | undefined
    readonly deployment: Outcome<ExpertDeploymentSnapshot | null> | undefined
    readonly accessReady: boolean
    readonly submitted: TemplateFlow | null
    readonly isSubmitting: boolean
    readonly failedLoad: string
    readonly failedProvision: string
}

/** Settle the catalog or deployment answer into the current Template App phase. */
export const templateFlowFromAnswers = (input: TemplateFlowFromAnswersInput): TemplateFlow => {
    const { templateKey, resumeSiteId, catalog, deployment, accessReady, submitted, isSubmitting, failedLoad, failedProvision } = input
    if (submitted?.phase === "submitting") return submitted
    if (submitted?.phase === "failed") return submitted
    if (submitted?.phase === "accepted") {
        if (!accessReady || deployment === undefined) return submitted
        if (!deployment.ok) return { phase: "failed", subject: submitted.subject, reason: failedLoad }
        return settleDeployment(submitted.siteId, submitted.subject, deployment.data, failedProvision)
    }
    if (submitted !== null) return submitted
    if (templateKey !== null) {
        if (isSubmitting) {
            const name = catalog?.ok ? catalog.data.find((candidate) => candidate.templateKey === templateKey)?.name ?? templateKey : templateKey
            return { phase: "submitting", name }
        }
        if (catalog === undefined) return { phase: "catalog_loading" }
        if (!catalog.ok) return { phase: "failed", subject: templateKey, reason: failedLoad }
        const item = catalog.data.find((candidate) => candidate.templateKey === templateKey)
        if (item === undefined || templateKey !== "ai_academy") return { phase: "unsupported", name: item?.name ?? templateKey }
        return { phase: "request", name: item.name }
    }
    if (resumeSiteId === null || !accessReady || deployment === undefined) return { phase: "catalog_loading" }
    if (!deployment.ok) return { phase: "failed", subject: resumeSiteId, reason: failedLoad }
    if (submitted !== null) return submitted
    return settleDeployment(resumeSiteId, resumeSiteId, deployment.data, failedProvision)
}

/** Settle one step against the current position. */
export const templateStepState = (index: number, phaseIndex: number): "done" | "current" | "upcoming" =>
    index < phaseIndex ? "done" : index === phaseIndex ? "current" : "upcoming"
