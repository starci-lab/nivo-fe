import { LabelledProgressRow } from "@nivo/ui";
import { SurfaceCard, Text } from "@starci/grammar/core";
import type { AgentosModuleStudio } from "@/modules/api/console";
/** Public API role for AgentOSModuleProfileProps. */
export type AgentOSModuleProfileProps = AgentOSModuleProfileViewProps;
type AgentOSModuleProfileViewProps = {
  readonly studio?: AgentosModuleStudio;
  readonly loading: boolean;
  readonly refused: boolean;
  readonly labels: {
    readonly title: string;
    readonly progress: string;
    readonly missing: string;
    readonly refused: string;
  };
};

/** Draw backend-owned completeness, accepted facts and unresolved profile fields. */
export const AgentOSModuleProfileBase = (props: AgentOSModuleProfileProps) => {
  const {
    studio,
    loading,
    refused,
    labels
  }: AgentOSModuleProfileViewProps = props;
  if (refused) return <SurfaceCard
    label={labels.title}
  ><div><Text size="sm" tone="muted">{labels.refused}</Text></div></SurfaceCard>;
  const facts = loading ? [{
    key: labels.title,
    value: ""
  }] : studio?.profileFacts ?? [];
  return <SurfaceCard
    label={labels.title}
  ><div>
      <LabelledProgressRow props={{
        id: "module-progress",
        title: labels.progress,
        percent: studio?.module.progress ?? 0,
        percentText: `${studio?.module.progress ?? 0}%`
      }} isLoading={loading} /><div>{facts.map((fact, index) => <div key={index}><Text size="sm" isSkeleton={loading}>{fact.key}</Text><Text size="sm" weight="semibold" isSkeleton={loading}>{fact.value}</Text></div>)}</div></div></SurfaceCard>;
};

