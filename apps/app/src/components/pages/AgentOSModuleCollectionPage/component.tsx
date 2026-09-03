import { Breadcrumbs, TileIcon } from "@nivo/ui";
import { Button, Heading, PageContainer, Text } from "@starci/grammar/core";
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
  return <PageContainer measure="product">

  <main className="gap-6" data-contract="GAP-5"><div>

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

        <Text size="sm" tone="accent" weight="semibold">{labels.eyebrow}</Text>
        <Heading level={1} scale="display">{labels.title}</Heading>
        <Text size="md" tone="muted">{labels.description}</Text></div></div>


    <Button
      size="lg"
      variant="primary"
      onPress={onCreate}
    >{labels.create}</Button></div><>

    <section aria-label={labels.title} data-region="module-collection"><div className="gap-4" data-contract="GAP-4">
      <AgentOSCustomModuleCollection workspaceId={workspaceId} />
      <AgentOSSolutionModuleCenter workspaceId={workspaceId} />
    </div></section></></main></PageContainer>;
};

