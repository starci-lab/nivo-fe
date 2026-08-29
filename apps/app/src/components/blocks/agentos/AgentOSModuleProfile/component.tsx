import { LabelledProgressRow, SurfaceCard, Text } from "@nivo/ui";
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
  if (refused) return <SurfaceCard props={{
    label: labels.title
  }}><div><Text props={{
        content: labels.refused,
        size: "sm",
        tone: "muted"
      }} /></div></SurfaceCard>;
  const facts = loading ? [{
    key: labels.title,
    value: ""
  }] : studio?.profileFacts ?? [];
  return <SurfaceCard props={{
    label: labels.title
  }}><div>
      <LabelledProgressRow props={{
        id: "module-progress",
        title: labels.progress,
        percent: studio?.module.progress ?? 0,
        percentText: `${studio?.module.progress ?? 0}%`
      }} isLoading={loading} /><div>{facts.map((fact, index) => <div key={index}><Text props={{
            content: fact.key,
            size: "sm"
          }} isLoading={loading} /><Text props={{
            content: fact.value,
            size: "sm",
            weight: "semibold"
          }} isLoading={loading} /></div>)}</div></div></SurfaceCard>;
};

