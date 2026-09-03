import { ROW_CLASS_NAME } from "./classNames";
import { EmptyNotice as DirectionEmpty, SectionHeader as DirectionHeader, SurfaceListCard as DirectionList, Badge, Text, type BadgeTone } from "@starci/grammar/common";
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/console";
/** Resolved copy used by the readiness component evidence inventory. */
export type AgentOSReadinessComponentListProps = AgentOSReadinessComponentListViewProps;
/** Public API role for AgentOSReadinessComponentListLabels. */
export type AgentOSReadinessComponentListLabels = {
    readonly title: string;
    readonly evidence: string;
};
/** Settled component verdicts consumed by the pure evidence renderer. */
export type AgentOSReadinessComponentListViewProps = {
    readonly components: AgentosAiKnowledgeReadiness["components"];
    readonly labels: AgentOSReadinessComponentListLabels;
    readonly loading?: boolean;
};
const toneOf = (verdict: string): BadgeTone => {
    if (["ready", "healthy", "passed", "configured"].includes(verdict))
        return "success";
    return verdict === "pending" || verdict === "testing" ? "warning" : "danger";
};
/** Draw the bounded provider, model, embedding, Qdrant and retrieval verdicts. */
export const AgentOSReadinessComponentListBase = (props: AgentOSReadinessComponentListProps) => {
    const { components, labels, loading = false } = props;
    return <DirectionList label={labels.title} isLoading={loading}>{loading ? <div className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3"><Text isSkeleton>{labels.evidence}</Text></div> : components.length === 0 ? <DirectionEmpty message={labels.evidence}/> : components.map((component, index) => <div key={index} className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3"><DirectionHeader level={3} title={component.component} description={<Text size="xs" tone="muted">{labels.evidence}</Text>} action={<Badge tone={toneOf(component.verdict)}>{component.verdict}</Badge>}/></div>)}</DirectionList>;
};
