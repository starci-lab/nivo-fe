import { EmptyNotice as DirectionEmpty, SectionHeader as DirectionHeader, SurfaceListCard as DirectionList, Badge, Text } from "@starci/grammar/common";
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/console";
/** Resolved copy used by the owner-safe knowledge provenance inventory. */
export type AgentOSKnowledgeOriginListProps = AgentOSKnowledgeOriginListViewProps;
/** Public API role for AgentOSKnowledgeOriginListLabels. */
export type AgentOSKnowledgeOriginListLabels = {
    readonly title: string;
    readonly documents: (count: number) => string;
    readonly current: string;
    readonly unknownVersion: string;
};
/** Settled source rows consumed by the pure provenance renderer. */
export type AgentOSKnowledgeOriginListViewProps = {
    readonly origins: AgentosAiKnowledgeReadiness["origins"];
    readonly labels: AgentOSKnowledgeOriginListLabels;
    readonly loading?: boolean;
};
const shortDigest = (digest: string | null) => digest === null ? "—" : `${digest.slice(0, 10)}…${digest.slice(-6)}`;
/** Draw Nivo, installed-module and uploaded-document knowledge as peer provenance rows. */
export const AgentOSKnowledgeOriginListBase = (props: AgentOSKnowledgeOriginListProps) => {
    const { origins, labels, loading = false } = props;
    return <DirectionList label={labels.title} isLoading={loading}>{loading ? <div className="border-b border-separator px-4 py-3 last:border-b-0" data-contract="BOUNDARY-2 PADDING-4 PADDING-3"><Text isSkeleton>{labels.title}</Text></div> : origins.length === 0 ? <DirectionEmpty message={labels.unknownVersion}/> : origins.map((origin, index) => <div key={index} className="border-b border-separator px-4 py-3 last:border-b-0" data-contract="BOUNDARY-2 PADDING-4 PADDING-3"><DirectionHeader level={3} title={origin.origin} description={<Text size="xs" tone="muted">{origin.version ?? labels.unknownVersion} · {shortDigest(origin.digest)} · {labels.documents(origin.documentCount)}</Text>} action={<Badge tone={origin.digest === null ? "warning" : "success"}>{origin.digest === null ? labels.unknownVersion : labels.current}</Badge>}/></div>)}</DirectionList>;
};
