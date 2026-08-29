"use client";

import { useTranslations } from "next-intl";
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component";
import { AgentOSModuleProfileBase } from "./component";
type AgentOSModuleProfileProps = {
  readonly workspaceId: string;
  readonly moduleId: string;
};

/** Read the page-owned live profile without starting a duplicate studio request. */
export const AgentOSModuleProfile = (props: AgentOSModuleProfileProps) => {
  const {
    workspaceId,
    moduleId
  }: AgentOSModuleProfileProps = props;
  const t = useTranslations("console.agentos.modules.studio.profile");
  const {
    studio
  } = useAgentOSModuleStudioProjection();
  const routeMismatch = studio !== undefined && studio !== null && (studio.module.id !== moduleId || studio.module.agentWorkspaceId !== workspaceId);
  return <AgentOSModuleProfileBase studio={studio ?? undefined} loading={studio === undefined} refused={studio === null || routeMismatch} labels={{
    title: t("title"),
    progress: t("progress"),
    missing: t.raw("missing") as string,
    refused: t("refused")
  }} />;
};
