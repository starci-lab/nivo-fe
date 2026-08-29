import { Badge, SurfaceCard, Text, type BadgeTone } from "@nivo/ui";
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
  return <SurfaceCard props={{
    label: labels.title
  }}><div>{rows.map((component, index) => <div key={index}><div>

          <Text props={{
            content: component.component,
            size: "sm",
            weight: "semibold"
          }} isLoading={loading} />
          <Text props={{
            content: labels.evidence,
            size: "xs",
            tone: "muted"
          }} isLoading={loading} /></div>

        <Badge props={{
          content: component.verdict,
          tone: toneOf(component.verdict)
        }} isLoading={loading} /></div>)}</div></SurfaceCard>;
};

