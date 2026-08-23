import { Badge, SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/console"

/** Resolved copy used by the owner-safe knowledge provenance inventory. */
export type AgentOSKnowledgeOriginListLabels = {
    readonly title: string
    readonly documents: (count: number) => string
    readonly current: string
    readonly unknownVersion: string
}

/** Settled source rows consumed by the pure provenance renderer. */
export type AgentOSKnowledgeOriginListViewProps = {
    readonly origins: AgentosAiKnowledgeReadiness["origins"]
    readonly labels: AgentOSKnowledgeOriginListLabels
    readonly loading?: boolean
}

const shortDigest = (digest: string | null) => digest === null ? "—" : `${digest.slice(0, 10)}…${digest.slice(-6)}`

/** Draw Nivo, installed-module and uploaded-document knowledge as peer provenance rows. */
export const AgentOSKnowledgeOriginListBase = ({ origins, labels, loading = false }: AgentOSKnowledgeOriginListViewProps) => {
    const rows = loading ? [{ origin: labels.title, version: null, digest: null, documentCount: 0, lastUpdatedAt: null }] : origins
    return <SurfaceCard props={{ label: labels.title }} contract="knowledge-origin-list" render={defineContractComponent("knowledge-origin-list", {
        origin: rows.map((origin) => defineContractComponent("provenance-status-row", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("text", {}, () => <Text props={{ content: origin.origin, size: "sm", weight: "semibold" }} isLoading={loading} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: `${origin.version ?? labels.unknownVersion} · ${shortDigest(origin.digest)} · ${labels.documents(origin.documentCount)}`, size: "xs", tone: "muted" }} isLoading={loading} />),
            }),
            status: defineLeafComponent("badge", {}, () => <Badge props={{ content: origin.digest === null ? labels.unknownVersion : labels.current, tone: origin.digest === null ? "warning" : "success" }} isLoading={loading} />),
        })),
    })} />
}

/** Source-level tier marker for the pure provenance block. */
export const meta = { shape: "block", world: "pure" } as const
