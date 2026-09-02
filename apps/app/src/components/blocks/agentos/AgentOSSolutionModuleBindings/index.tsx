
import { SurfaceCard, Heading, Text } from "@starci/grammar/common";
import type { AgentosModuleInstallationDetail } from "@/modules/api/console";

/** Runtime bindings and resolved labels consumed by the module bindings block. */
type AgentOSSolutionModuleBindingsLabels = {
  readonly section: string;
  readonly agents: string;
  readonly channels: string;
  readonly sharedKnowledge: string;
  readonly knowledgeVersions: string;
  readonly artifact: string;
  readonly currentness: string;
  readonly embedding: string;
  readonly retrievalScope: string;
  readonly empty: string;
};

/** Closed pending and answered inputs for the generated binding inventory. */
export type AgentOSSolutionModuleBindingsProps = {
  readonly labels: { readonly [K in keyof AgentOSSolutionModuleBindingsLabels]: AgentOSSolutionModuleBindingsLabels[K] };
} & ({
  readonly state: "pending";
  readonly installation?: never;
} | {
  readonly state: "ready";
  readonly installation: AgentosModuleInstallationDetail;
});
const displayedBindings = (values: ReadonlyArray<string> | undefined, empty: string, isLoading: boolean): ReadonlyArray<string | undefined> => {
  if (isLoading) return [undefined, undefined];
  if (values?.length === 0) return [empty];
  return values ?? [];
};
const bindingGroup = (name: string, values: ReadonlyArray<string> | undefined, empty: string, isLoading: boolean) => <div>
  <Heading level={4}>{name}</Heading>{displayedBindings(values, empty, isLoading).map((value, index) => <Text key={`${name}-${index}`} size="sm" isSkeleton={isLoading}>{value}</Text>)}</div>;
const artifactValues = (installation: AgentosModuleInstallationDetail | undefined): ReadonlyArray<string> | undefined => {
  if (installation === undefined) return undefined;
  if (installation.knowledgeArtifact === null) return [];
  return [installation.knowledgeArtifact.id, installation.knowledgeArtifact.knowledgeVersion, installation.knowledgeArtifact.snapshotDigest, `${installation.knowledgeArtifact.pointCount} points`];
};
const embeddingValues = (installation: AgentosModuleInstallationDetail | undefined): ReadonlyArray<string> | undefined => {
  if (installation === undefined) return undefined;
  if (installation.knowledgeArtifact === null) return [];
  return [installation.knowledgeArtifact.embeddingProfile, `${installation.knowledgeArtifact.embeddingDimension} dimensions`];
};

/** Render generated agents, channels and common/private knowledge versions from the live snapshot. */
export const AgentOSSolutionModuleBindings = (props: AgentOSSolutionModuleBindingsProps) => {
  const isLoading = props.state === "pending";
  const installation = props.state === "ready" ? props.installation : undefined;
  const {
    labels
  } = props;
  return <SurfaceCard
    label={labels.section}
  ><div><>{bindingGroup(labels.agents, installation?.generatedAgentIds, labels.empty, isLoading)}{bindingGroup(labels.channels, installation?.channelAccountRefs, labels.empty, isLoading)}{bindingGroup(labels.sharedKnowledge, installation?.sharedKnowledgeSourceIds, labels.empty, isLoading)}{bindingGroup(labels.knowledgeVersions, installation === undefined ? undefined : [installation.commonKnowledgeVersion, installation.privateKnowledgeVersion], labels.empty, isLoading)}{bindingGroup(labels.artifact, artifactValues(installation), labels.empty, isLoading)}{bindingGroup(labels.currentness, installation === undefined ? undefined : [installation.knowledgeState, `${installation.desiredDigest ?? labels.empty} → ${installation.appliedDigest ?? labels.empty}`], labels.empty, isLoading)}{bindingGroup(labels.embedding, embeddingValues(installation), labels.empty, isLoading)}{bindingGroup(labels.retrievalScope, installation === undefined ? undefined : [installation.retrievalScope.installationId, installation.retrievalScope.moduleKey, installation.retrievalScope.knowledgeVersion], labels.empty, isLoading)}</></div></SurfaceCard>;
};
