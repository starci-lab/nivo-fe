"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useQueryMyAgentosCustomModulesSwr } from "@/hooks";
import type { AgentosCustomModule } from "@/modules/api/console";
import { nivoQueryData } from "@/modules/api/graphql";
import { AgentOSCustomModuleCollectionBase } from "./component";
type AgentOSCustomModuleCollectionProps = {
  readonly workspaceId: string;
};
const collectionState = (modules: ReadonlyArray<AgentosCustomModule> | null | undefined) => {
  if (modules === undefined) return "loading";
  if (modules === null) return "refused";
  return modules.length === 0 ? "empty" : "ready";
};

/** Own the workspace custom-module query and route each exact continuation. */
export const AgentOSCustomModuleCollection = (props: AgentOSCustomModuleCollectionProps) => {
  const {
    workspaceId
  }: AgentOSCustomModuleCollectionProps = props;
  const t = useTranslations("console.agentos.modules");
  const router = useRouter();
  const query = useQueryMyAgentosCustomModulesSwr(workspaceId);
  const modules = nivoQueryData(query.data);
  const open = (module: AgentosCustomModule) => {
    const route = module.installationId === null ? `/agentos/workspaces/${workspaceId}/modules/studio/${module.id}` : `/agentos/workspaces/${workspaceId}/modules/${module.installationId}`;
    router.push(route);
  };
  return <AgentOSCustomModuleCollectionBase state={collectionState(modules)} title={t("collection.title")} refused={t("collection.refused")} empty={t("collection.empty")} createLabel={t("collection.create")} rows={(modules ?? []).map(module => ({
    id: module.id,
    name: module.name,
    detail: t("collection.progress", {
      progress: module.progress
    }),
    kind: t("collection.custom"),
    status: t(`status.${module.status}`),
    action: module.status === "active" ? t("collection.inspect") : t("collection.resume")
  }))} onOpen={id => {
    const module = modules?.find(item => item.id === id);
    if (module !== undefined) open(module);
  }} onCreate={() => router.push(`/agentos/workspaces/${workspaceId}/modules/create`)} />;
};
