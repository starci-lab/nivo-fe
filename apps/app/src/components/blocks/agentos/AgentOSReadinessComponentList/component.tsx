
import { SurfaceCard, Text, Badge, type BadgeTone } from "@starci/grammar/common";
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
  if (["ready", "healthy", "passed", "configured"].includes(verdict)) return "success";
  return verdict === "pending" || verdict === "testing" ? "warning" : "danger";
};

/** Draw the bounded provider, model, embedding, Qdrant and retrieval verdicts. */
export const AgentOSReadinessComponentListBase = (props: AgentOSReadinessComponentListProps) => {
  const {
    components,
    labels,
    loading = false
  }: AgentOSReadinessComponentListViewProps = props;
  const rows = loading ? [{
    component: labels.title,
    verdict: labels.evidence
  }] : components;
  return <SurfaceCard
    label={labels.title}
  ><div>{rows.map((component, index) => <div key={index}><div>

          <Text size="sm" weight="semibold" isSkeleton={loading}>{component.component}</Text>
          <Text size="xs" tone="muted" isSkeleton={loading}>{labels.evidence}</Text></div>

        <Badge tone={toneOf(component.verdict)} isSkeleton={loading}>{component.verdict}</Badge></div>)}</div></SurfaceCard>;
};

