"use client";

import { useCallback, useState } from "react";
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

/** Own the workspace custom-module query, project each row destination and recover its own read. */
export const AgentOSCustomModuleCollection = (props: AgentOSCustomModuleCollectionProps) => {
  const {
    workspaceId
  }: AgentOSCustomModuleCollectionProps = props;
  const t = useTranslations("console.agentos.modules");
  const locale = useLocale();
  const query = useQueryMyAgentosCustomModulesSwr(workspaceId);
  const modules = nivoQueryData(query.data);
  const [retrying, setRetrying] = useState(false);
  const revalidate = query.mutate;
  const onRetry = useCallback(() => {
    setRetrying(true);
    void Promise.resolve(revalidate()).finally(() => setRetrying(false));
  }, [revalidate]);
  const hrefOf = (module: AgentosCustomModule) => module.installationId === null ? `/${locale}/agentos/workspaces/${workspaceId}/modules/studio/${module.id}` : `/${locale}/agentos/workspaces/${workspaceId}/modules/${module.installationId}`;
  return <AgentOSCustomModuleCollectionBase loadingKind={t("collection.custom")} loadingStatus={t("status.draft")} state={collectionState(modules)} title={t("collection.title")} emptyTitle={t("collection.emptyTitle")} empty={t("collection.empty")} refusedTitle={t("collection.refusedTitle")} refused={t("collection.refused")} retry={t("collection.retry")} retrying={retrying} onRetry={onRetry} rows={(modules ?? []).map(module => ({
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
