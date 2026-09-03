
import { SurfaceCard, Text, Badge } from "@starci/grammar/core";
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
  return <SurfaceCard
    label={labels.title}
  ><div>{rows.map((origin, index) => <div key={index}><div>

          <Text size="sm" weight="semibold" isSkeleton={loading}>{origin.origin}</Text>
          <Text size="xs" tone="muted" isSkeleton={loading}>{`${origin.version ?? labels.unknownVersion} · ${shortDigest(origin.digest)} · ${labels.documents(origin.documentCount)}`}</Text></div>

        <Badge tone={origin.digest === null ? "warning" : "success"} isSkeleton={loading}>{origin.digest === null ? labels.unknownVersion : labels.current}</Badge></div>)}</div></SurfaceCard>;
};

