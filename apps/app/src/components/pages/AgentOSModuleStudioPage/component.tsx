"use client";

import { Heading, Text } from "@starci/grammar/common";
import { createContext, useContext, type ComponentType } from "react";
import { Breadcrumbs, TileIcon } from "@nivo/ui";
import type { AgentosModuleStudio } from "@/modules/api/console";
import { AgentOSModuleAttachments } from "@/components/blocks/agentos/AgentOSModuleAttachments";
import { AgentOSModuleIntegrations } from "@/components/blocks/agentos/AgentOSModuleIntegrations";
import { AgentOSModuleInterview } from "@/components/blocks/agentos/AgentOSModuleInterview";
import { AgentOSModuleProfile } from "@/components/blocks/agentos/AgentOSModuleProfile";
import { AgentOSModuleSpecification } from "@/components/blocks/agentos/AgentOSModuleSpecification";
/** Public API role for AgentOSModuleStudioPageProps. */
export type AgentOSModuleStudioPageProps = AgentOSModuleStudioPageViewProps;
type AgentOSModuleStudioPageViewProps = {
  readonly workspaceId: string;
  readonly moduleId: string;
  readonly labels: {
    readonly path: string;
    readonly modules: string;
    readonly title: string;
    readonly description: string;
    readonly eyebrow: string;
    readonly sections: string;
  };
  readonly onBack: () => void;
};
type AgentOSModuleStudioProjection = {
  readonly studio: AgentosModuleStudio | null | undefined;
  readonly refresh: () => Promise<void>;
};
type AgentOSModuleStudioProjectionProviderProps<P extends object> = {
  readonly value: AgentOSModuleStudioProjection;
  readonly render: ComponentType<P>;
  readonly renderProps: P;
};
const AgentOSModuleStudioProjectionContext = createContext<AgentOSModuleStudioProjection | null>(null);

/** Share one page-owned studio read while child blocks keep their own mutation and pending state. */
export const AgentOSModuleStudioProjectionProvider = <P extends object,>(props: AgentOSModuleStudioProjectionProviderProps<P>) => {
  const {
    value,
    render: Content,
    renderProps
  }: AgentOSModuleStudioProjectionProviderProps<P> = props;
  return <AgentOSModuleStudioProjectionContext.Provider value={value}><Content {...renderProps} /></AgentOSModuleStudioProjectionContext.Provider>;
};

/** Read the page-owned projection without repeating the module-studio request in sibling blocks. */
export const useAgentOSModuleStudioProjection = () => {
  const projection = useContext(AgentOSModuleStudioProjectionContext);
  if (projection === null) throw new Error("AgentOSModuleStudioProjectionProvider is required");
  return projection;
};

/** Compose independently-owned interview, profile, file, integration and review sections. */
export const AgentOSModuleStudioPageBase = (props: AgentOSModuleStudioPageProps) => {
  const {
    workspaceId,
    moduleId,
    labels,
    onBack
  }: AgentOSModuleStudioPageViewProps = props;
  return <div>

  <Breadcrumbs props={{
      mode: "back",
      label: labels.path,
      backLabel: labels.modules
    }} on={{
      back: onBack
    }} /><div><div>

      <TileIcon props={{
          icon: "agentos",
          signal: "attention"
        }} /><div>

        <Text size="sm" tone="accent" weight="semibold">{labels.eyebrow}</Text>
        <Heading level={1} scale="display">{labels.title}</Heading>
        <Text size="md" tone="muted">{labels.description}</Text></div></div></div>


  <Heading level={2}>{labels.sections}</Heading><>
    <div>{<div>{[<AgentOSModuleInterview key="item-0" workspaceId={workspaceId} moduleId={moduleId} />, <AgentOSModuleSpecification key="item-1" workspaceId={workspaceId} moduleId={moduleId} />]}</div>}{<div>{[<AgentOSModuleProfile key="item-0" workspaceId={workspaceId} moduleId={moduleId} />, <AgentOSModuleAttachments key="item-1" workspaceId={workspaceId} moduleId={moduleId} />, <AgentOSModuleIntegrations key="item-2" workspaceId={workspaceId} moduleId={moduleId} />]}</div>}</div>
  </></div>;
};

