"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AgentOSModuleCollectionPageBase } from "./component";
type AgentOSModuleCollectionPageProps = {
  readonly workspaceId: string;
};

/** Connect module-management copy and route navigation for one workspace. */
export const AgentOSModuleCollectionPage = (props: AgentOSModuleCollectionPageProps) => {
  const {
    workspaceId
  }: AgentOSModuleCollectionPageProps = props;
  const t = useTranslations("console.agentos.modules.page");
  const router = useRouter();
  return <AgentOSModuleCollectionPageBase workspaceId={workspaceId} labels={{
    path: t("path"),
    workspace: t("workspace"),
    title: t("title"),
    description: t("description"),
    eyebrow: t("eyebrow"),
    create: t("create")
  }} onBack={() => router.push(`/agentos/workspaces/${workspaceId}`)} onCreate={() => router.push(`/agentos/workspaces/${workspaceId}/modules/create`)} />;
};
