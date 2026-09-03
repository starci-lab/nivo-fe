"use client";

import { useLocale, useTranslations } from "next-intl";
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
  const locale = useLocale();
  const router = useRouter();
  return <AgentOSModuleCollectionPageBase workspaceId={workspaceId} labels={{
    path: t("path"),
    workspace: t("workspace"),
    title: t("title"),
    description: t("description"),
    eyebrow: t("eyebrow"),
    create: t("create")
  }} createHref={`/${locale}/agentos/workspaces/${workspaceId}/modules/create`} onBack={() => router.push(`/agentos/workspaces/${workspaceId}`)} />;
};
