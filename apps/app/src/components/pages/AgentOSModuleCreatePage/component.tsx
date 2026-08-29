import { Breadcrumbs, Heading, Text, TileIcon } from "@nivo/ui";
import { AgentOSModuleIntake } from "@/components/blocks/agentos/AgentOSModuleIntake";
/** Public API role for AgentOSModuleCreatePageProps. */
export type AgentOSModuleCreatePageProps = AgentOSModuleCreatePageViewProps;
type AgentOSModuleCreatePageViewProps = {
  readonly workspaceId: string;
  readonly labels: {
    readonly path: string;
    readonly modules: string;
    readonly title: string;
    readonly description: string;
    readonly eyebrow: string;
  };
  readonly onBack: () => void;
};

/** Compose the pre-persistence intake route with a reliable modules breadcrumb. */
export const AgentOSModuleCreatePageBase = (props: AgentOSModuleCreatePageProps) => {
  const {
    workspaceId,
    labels,
    onBack
  }: AgentOSModuleCreatePageViewProps = props;
  return <div>

  <Breadcrumbs props={{
      mode: "back",
      label: labels.path,
      backLabel: labels.modules
    }} on={{
      back: onBack
    }} /><div><div>

      <TileIcon props={{
          icon: "agentos"
        }} /><div>

        <Text props={{
            content: labels.eyebrow,
            size: "sm",
            tone: "accent",
            weight: "semibold"
          }} />
        <Heading props={{
            content: labels.title,
            level: 1,
            scale: "display"
          }} />
        <Text props={{
            content: labels.description,
            size: "md",
            tone: "muted"
          }} /></div></div></div><>


    <AgentOSModuleIntake workspaceId={workspaceId} /></></div>;
};

