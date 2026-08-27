import { Badge, SurfaceCard, Text, defineContractComponent, defineLeafComponent, type BadgeTone } from "@nivo/ui"
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/console"

/** Resolved copy used by the readiness component evidence inventory. */
export type AgentOSReadinessComponentListLabels = { readonly title: string; readonly evidence: string }
/** Settled component verdicts consumed by the pure evidence renderer. */
export type AgentOSReadinessComponentListViewProps = {
    readonly components: AgentosAiKnowledgeReadiness["components"]
    readonly labels: AgentOSReadinessComponentListLabels
    readonly loading?: boolean
}

const toneOf = (verdict: string): BadgeTone => {
    if (["ready", "healthy", "passed", "configured"].includes(verdict)) return "success"
    return verdict === "pending" || verdict === "testing" ? "warning" : "danger"
}

/** Draw the bounded provider, model, embedding, Qdrant and retrieval verdicts. */
export const AgentOSReadinessComponentListBase = ({ components, labels, loading = false }: AgentOSReadinessComponentListViewProps) => {
    const rows = loading ? [{ component: labels.title, verdict: labels.evidence }] : components
    return <SurfaceCard props={{ label: labels.title }} contract="readiness-component-list" render={defineContractComponent("readiness-component-list", {
        component: rows.map((component) => defineContractComponent("provenance-status-row", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("text", {}, () => <Text props={{ content: component.component, size: "sm", weight: "semibold" }} isLoading={loading} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: labels.evidence, size: "xs", tone: "muted" }} isLoading={loading} />),
            }),
            status: defineLeafComponent("badge", {}, () => <Badge props={{ content: component.verdict, tone: toneOf(component.verdict) }} isLoading={loading} />),
        })),
    })} />
}

/** Source-level tier marker for the pure readiness evidence block. */
export const meta = { shape: "block", world: "pure" } as const
