"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQueryMyAgentosCustomModulesSwr } from "@/hooks";
import { nivoQueryData } from "@/modules/query";
import type { AgentosCustomModule } from "@/modules/api/console";
import { AgentOSCustomModuleCollectionBase } from "./component";
type AgentOSCustomModuleCollectionProps = {
  readonly workspaceId: string;
};
const collectionState = (modules: ReadonlyArray<AgentosCustomModule> | null | undefined) => {
  if (modules === undefined) return "loading";
  if (modules === null) return "refused";
  return modules.length === 0 ? "empty" : "ready";
};

/** Own the workspace custom-module query and project each row's exact destination. */
export const AgentOSCustomModuleCollection = (props: AgentOSCustomModuleCollectionProps) => {
  const {
    workspaceId
  }: AgentOSCustomModuleCollectionProps = props;
  const t = useTranslations("console.agentos.modules");
  const locale = useLocale();
  const query = useQueryMyAgentosCustomModulesSwr(workspaceId);
  const modules = nivoQueryData(query.data);
  const hrefOf = (module: AgentosCustomModule) => module.installationId === null ? `/${locale}/agentos/workspaces/${workspaceId}/modules/studio/${module.id}` : `/${locale}/agentos/workspaces/${workspaceId}/modules/${module.installationId}`;
  return <AgentOSCustomModuleCollectionBase state={collectionState(modules)} title={t("collection.title")} refused={t("collection.refused")} empty={t("collection.empty")} rows={(modules ?? []).map(module => ({
    id: module.id,
    name: module.name,
    detail: t("collection.progress", {
      progress: module.progress
    }),
    kind: t("collection.custom"),
    status: t(`status.${module.status}`),
    active: module.status === "active",
    action: module.status === "active" ? t("collection.inspect") : t("collection.resume"),
    href: hrefOf(module)
  }))} />;
};
