import { Breadcrumbs } from "@nivo/ui";
import { Button, EmptyNotice, Heading, Text } from "@starci/grammar/core";
import { AgentOSSolutionModuleBindings } from "@/components/blocks/agentos/AgentOSSolutionModuleBindings";
import { AgentOSSolutionModuleSummary } from "@/components/blocks/agentos/AgentOSSolutionModuleSummary";
import type { AgentosModuleInstallationDetail } from "@/modules/api/console";

/** Detail-block states for one module installation snapshot. */
export type AgentOSSolutionModuleDetailProps = AgentOSSolutionModuleDetailViewProps;
/** Public API role for AgentOSSolutionModuleDetailState. */
export type AgentOSSolutionModuleDetailState = "loading" | "refused" | "ready" | "refreshing" | "current" | "knowledge-refused";

/** Resolved labels for one module installation detail route. */
export type AgentOSSolutionModuleDetailLabels = {
  readonly title: string;
  readonly backToWorkspace: string;
  readonly loading: string;
  readonly refused: string;
  readonly openAiKnowledge?: string;
  readonly knowledgeCurrent?: string;
  readonly knowledgeRefreshing?: string;
  readonly knowledgeRefused?: string;
  readonly summary: Parameters<typeof AgentOSSolutionModuleSummary>[0]["labels"];
  readonly bindings: Parameters<typeof AgentOSSolutionModuleBindings>[0]["labels"];
};

/** Fixed module page anatomy with an independently settled detail block. */
export type AgentOSSolutionModuleDetailViewProps = {
  readonly detailState: AgentOSSolutionModuleDetailState;
  readonly installation?: AgentosModuleInstallationDetail;
  readonly labels: AgentOSSolutionModuleDetailLabels;
  readonly onBack: () => void;
  readonly onOpenAiKnowledge?: () => void;
};
const ledeContent = (detailState: AgentOSSolutionModuleDetailState, installation: AgentosModuleInstallationDetail | undefined, labels: AgentOSSolutionModuleDetailLabels): string => {
  if (detailState === "loading") return labels.loading;
  if (detailState === "current") return labels.knowledgeCurrent ?? installation?.moduleKey ?? labels.title;
  if (detailState === "refreshing") return labels.knowledgeRefreshing ?? installation?.moduleKey ?? labels.title;
  if (detailState === "knowledge-refused") return labels.knowledgeRefused ?? labels.refused;
  return installation?.moduleKey ?? labels.title;
};

/** Compose one exact installation snapshot without owning API or realtime mechanics. */
export const AgentOSSolutionModuleDetailBase = (props: AgentOSSolutionModuleDetailProps) => {
  const {
    detailState,
    installation,
    labels,
    onBack,
    onOpenAiKnowledge
  }: AgentOSSolutionModuleDetailViewProps = props;
  // A refusal and a missing installation are the same page: there is nothing to lay out, so the
  // stack carries the one notice rather than two empty cards.
  const settledSections = detailState === "refused" || installation === undefined ? [<EmptyNotice key="empty" message={labels.refused} />] : [<AgentOSSolutionModuleSummary key="summary" state="ready" installation={installation} labels={labels.summary} />, <AgentOSSolutionModuleBindings key="bindings" state="ready" installation={installation} labels={labels.bindings} />];
  const sections = detailState === "loading" ? [<AgentOSSolutionModuleSummary key="summary-loading" state="pending" labels={labels.summary} />, <AgentOSSolutionModuleBindings key="bindings-loading" state="pending" labels={labels.bindings} />] : settledSections;
  const knowledgeAction = onOpenAiKnowledge === undefined ? undefined : <Button
    variant="primary"
    onPress={onOpenAiKnowledge}
  >{labels.openAiKnowledge ?? "Open AI & Knowledge"}</Button>;
  return <div>



    <Breadcrumbs props={{
      mode: "back",
      label: labels.title,
      backLabel: labels.backToWorkspace
    }} on={{
      back: onBack
    }} /><div>

      <Heading level={1}>{labels.title}</Heading>{knowledgeAction}</div>


    <Text size="sm" tone={detailState === "knowledge-refused" ? "accent" : "muted"}>{ledeContent(detailState, installation, labels)}</Text>{sections}</div>;
};

