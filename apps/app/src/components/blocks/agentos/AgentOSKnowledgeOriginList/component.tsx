import { Badge, SurfaceCard, Text } from "@nivo/ui";
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
  const {
    origins,
    labels,
    loading = false
  }: AgentOSKnowledgeOriginListViewProps = props;
  const rows = loading ? [{
    origin: labels.title,
    version: null,
    digest: null,
    documentCount: 0,
    lastUpdatedAt: null
  }] : origins;
  return <SurfaceCard props={{
    label: labels.title
  }}><div>{rows.map((origin, index) => <div key={index}><div>

          <Text props={{
            content: origin.origin,
            size: "sm",
            weight: "semibold"
          }} isLoading={loading} />
          <Text props={{
            content: `${origin.version ?? labels.unknownVersion} · ${shortDigest(origin.digest)} · ${labels.documents(origin.documentCount)}`,
            size: "xs",
            tone: "muted"
          }} isLoading={loading} /></div>

        <Badge props={{
          content: origin.digest === null ? labels.unknownVersion : labels.current,
          tone: origin.digest === null ? "warning" : "success"
        }} isLoading={loading} /></div>)}</div></SurfaceCard>;
};

