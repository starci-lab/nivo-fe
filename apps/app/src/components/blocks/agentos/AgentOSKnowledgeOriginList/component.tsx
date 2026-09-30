import { ROW_CLASS_NAME } from "./classNames"
import {
    EmptyNotice as DirectionEmpty,
    SectionHeader as DirectionHeader,
    SurfaceListCard as DirectionList,
    Badge,
    Text,
} from "@starci/grammar/common"
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/agentos-knowledge"
/** Public API role for AgentOSKnowledgeOriginListLabels. */
export type AgentOSKnowledgeOriginListLabels = {
    readonly title: string
    readonly documents: (count: number) => string
    readonly current: string
    readonly unknownVersion: string
}
/** Pure-half copy: the count formatter is an action, so only the strings stay data. */
type AgentOSKnowledgeOriginListBaseLabels = {
    readonly title: string
    readonly current: string
    readonly unknownVersion: string
}
/** Settled source rows consumed by the pure provenance renderer. */
type AgentOSKnowledgeOriginListData = {
    readonly origins: AgentosAiKnowledgeReadiness["origins"]
    readonly labels: AgentOSKnowledgeOriginListBaseLabels
    readonly loading?: boolean
}
/** The provenance count renderer lives in `on`: a fixture cannot hold a function as data. */
type AgentOSKnowledgeOriginListActions = {
    readonly documents: (count: number) => string
}
/** The atom contract the pure half draws from. */
export type AgentOSKnowledgeOriginListProps = {
    readonly props: AgentOSKnowledgeOriginListData
    readonly on: AgentOSKnowledgeOriginListActions
}
const shortDigest = (digest: string | null) => (digest === null ? "—" : `${digest.slice(0, 10)}…${digest.slice(-6)}`)
/** Draw Nivo, installed-module and uploaded-document knowledge as peer provenance rows. */
export const AgentOSKnowledgeOriginListBase = (props: AgentOSKnowledgeOriginListProps) => {
    const { origins, labels, loading = false } = props.props
    const { documents } = props.on
    const originOccurrences = new Map<string, number>()
    const originRows = origins.map((origin) => {
        const value = origin.digest ?? origin.origin
        const occurrence = originOccurrences.get(value) ?? 0
        originOccurrences.set(value, occurrence + 1)
        return { origin, key: `${value}:${occurrence}` }
    })
    return (
        <DirectionList label={labels.title} isLoading={loading}>
            {loading ? (
                <div className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3">
                    <Text isSkeleton>{labels.title}</Text>
                </div>
            ) : origins.length === 0 ? (
                <DirectionEmpty message={labels.unknownVersion} />
            ) : (
                originRows.map(({ origin, key }) => (
                    <div key={key} className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3">
                        <DirectionHeader
                            level={3}
                            title={origin.origin}
                            description={
                                <Text size="xs" tone="muted">
                                    {origin.version ?? labels.unknownVersion} · {shortDigest(origin.digest)} ·{" "}
                                    {documents(origin.documentCount)}
                                </Text>
                            }
                            action={
                                <Badge tone={origin.digest === null ? "warning" : "success"}>
                                    {origin.digest === null ? labels.unknownVersion : labels.current}
                                </Badge>
                            }
                        />
                    </div>
                ))
            )}
        </DirectionList>
    )
}
