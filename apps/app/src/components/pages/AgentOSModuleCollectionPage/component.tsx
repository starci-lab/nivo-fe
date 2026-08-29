import { Breadcrumbs, Button, Heading, Text, TileIcon } from "@nivo/ui";
import { AgentOSCustomModuleCollection } from "@/components/blocks/agentos/AgentOSCustomModuleCollection";
import { AgentOSSolutionModuleCenter } from "@/components/blocks/agentos/AgentOSSolutionModuleCenter";
/** Public API role for AgentOSModuleCollectionPageProps. */
export type AgentOSModuleCollectionPageProps = AgentOSModuleCollectionPageViewProps;
type AgentOSModuleCollectionPageViewProps = {
  readonly workspaceId: string;
  readonly labels: {
    readonly path: string;
    readonly workspace: string;
    readonly title: string;
    readonly description: string;
    readonly eyebrow: string;
    readonly create: string;
  };
  readonly onBack: () => void;
  readonly onCreate: () => void;
};

/** Compose custom management and the immutable solution catalogue under one route identity. */
export const AgentOSModuleCollectionPageBase = (props: AgentOSModuleCollectionPageProps) => {
  const {
    workspaceId,
    labels,
    onBack,
    onCreate
  }: AgentOSModuleCollectionPageViewProps = props;
  return <div>

  <Breadcrumbs props={{
      mode: "trail",
      label: labels.path,
      steps: [{
        id: "workspace",
        label: labels.workspace
      }, {
        id: "modules",
        label: labels.title,
        isCurrent: true
      }]
    }} on={{
      activate: onBack
    }} /><div><div>


      <TileIcon props={{
          icon: "agentos",
          signal: "active"
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
          }} /></div></div>


    <Button props={{
        label: labels.create,
        size: "lg",
        variant: "primary"
      }} on={{
        press: onCreate
      }} /></div><>

    <AgentOSCustomModuleCollection workspaceId={workspaceId} /><AgentOSSolutionModuleCenter workspaceId={workspaceId} /></></div>;
};

