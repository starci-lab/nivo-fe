"use client"

import { Badge, Button, SurfaceCard, Text, Tree, defineContractComponent, defineContractProjection, defineLeafComponent, type BadgeTone } from "@nivo/ui"
import { AgentOSKnowledgeOriginList } from "@/components/blocks/agentos/AgentOSKnowledgeOriginList"
import { AgentOSReadinessComponentList } from "@/components/blocks/agentos/AgentOSReadinessComponentList"
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/console"

/** Resolved bilingual copy for the workspace AI and knowledge operating surface. */
export type AgentOSWorkspaceAiKnowledgeLabels = {
    readonly title: string; readonly description: string; readonly ready: string; readonly testing: string; readonly refused: string
    readonly provider: string; readonly model: string; readonly embedding: string; readonly qdrant: string; readonly credential: string; readonly testedAt: string
    readonly runTest: string; readonly recover: string; readonly origins: string; readonly components: string; readonly evidence: string
    readonly documents: (count: number) => string; readonly current: string; readonly unknownVersion: string; readonly formatTestedAt: (value: string) => string
}
/** Closed readiness and action conditions consumed by the pure workspace renderer. */
export type AgentOSWorkspaceAiKnowledgeViewProps = {
    readonly state: "loading" | "ready" | "refused" | "testing" | "recovering" | "success"
    readonly readiness?: AgentosAiKnowledgeReadiness
    readonly labels: AgentOSWorkspaceAiKnowledgeLabels
    readonly onTest: () => void
    readonly onRecover: () => void
}

const fact = (label: string, value: string | undefined, loading: boolean) => defineContractComponent("ai-readiness-fact-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: label, size: "sm" }} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value, size: "sm" }} isLoading={loading} />),
})
const toneOf = (state: AgentOSWorkspaceAiKnowledgeViewProps["state"]): BadgeTone => state === "ready" || state === "success" ? "success" : state === "refused" ? "danger" : "warning"

/** Compose the complete workspace AI verdict, source provenance and bounded recovery controls. */
export const AgentOSWorkspaceAiKnowledgeBase = ({ state, readiness, labels, onTest, onRecover }: AgentOSWorkspaceAiKnowledgeViewProps) => {
    const loading = state === "loading"
    const status = state === "ready" || state === "success" ? labels.ready : state === "refused" ? labels.refused : labels.testing
    const summary = defineContractProjection("workspace-ai-readiness-summary", () => <SurfaceCard props={{ label: labels.title }} contract="workspace-ai-readiness-summary" render={defineContractComponent("workspace-ai-readiness-summary", {
        identity: defineContractComponent("subject-over-muted-caption", {
            subject: defineLeafComponent("text", {}, () => <Text props={{ content: labels.title, size: "md", weight: "semibold" }} />),
            caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: state === "refused" ? readiness?.failureCode ?? labels.refused : labels.description, size: "xs", tone: "muted" }} />),
        }),
        status: defineLeafComponent("badge", {}, () => <Badge props={{ content: status, tone: toneOf(state) }} isLoading={loading} />),
        facts: defineContractComponent("ai-readiness-fact-stack", { fact: [
            fact(labels.provider, readiness?.provider, loading),
            fact(labels.model, readiness?.chatModel, loading),
            fact(labels.embedding, readiness === undefined ? undefined : `${readiness.embeddingProfile} · ${readiness.embeddingDimension}`, loading),
            fact(labels.credential, readiness === undefined ? undefined : `${readiness.credentialStatus}${readiness.credentialMaskedHint === null ? "" : ` · ${readiness.credentialMaskedHint}`}`, loading),
            fact(labels.qdrant, readiness?.qdrantHealth, loading),
            fact(labels.testedAt, readiness?.testedAt === null || readiness?.testedAt === undefined ? "—" : labels.formatTestedAt(readiness.testedAt), loading),
        ] }),
        actions: defineContractComponent("inline-action-run", { action: [
            defineLeafComponent("button", {}, () => <Button props={{ label: labels.runTest, variant: "primary", disabled: loading || state === "testing" || readiness?.credentialStatus !== "configured", isPending: state === "testing" }} on={{ press: onTest }} />),
            defineLeafComponent("button", {}, () => <Button props={{ label: labels.recover, variant: "secondary", disabled: loading || state === "recovering", isPending: state === "recovering" }} on={{ press: onRecover }} />),
        ] }),
    })} />)
    const origins = defineContractProjection("knowledge-origin-list", () => <AgentOSKnowledgeOriginList origins={readiness?.origins ?? []} loading={loading} labels={{ title: labels.origins, documents: labels.documents, current: labels.current, unknownVersion: labels.unknownVersion }} />)
    const components = defineContractProjection("readiness-component-list", () => <AgentOSReadinessComponentList components={readiness?.components ?? []} loading={loading} labels={{ title: labels.components, evidence: labels.evidence }} />)
    return <Tree contract="workspace-ai-knowledge-stack" render={defineContractComponent("workspace-ai-knowledge-stack", { summary, origins, components })} />
}

/** Source-level tier marker for the pure workspace AI and knowledge block. */
export const meta = { shape: "block", world: "pure" } as const
