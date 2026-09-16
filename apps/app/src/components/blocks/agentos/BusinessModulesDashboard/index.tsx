"use client";

import { useTranslations } from "next-intl";
import { useQueryMyAgentWorkspacesSwr } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { AgentOSSolutionModuleCenter } from "@/components/blocks/agentos/AgentOSSolutionModuleCenter";
import { BusinessModulesDashboardBase, type BusinessModulesDashboardLabels } from "./component";

/** This dashboard has no caller-controlled state. */
export type BusinessModulesDashboardProps = Record<string, never>;

/** Resolve exactly one workspace; zero and ambiguity remain explicit product states. */
export const BusinessModulesDashboard = (props: BusinessModulesDashboardProps) => {
  void props;
  const t = useTranslations("console.agentos.businessDashboard");
  const router = useRouter();
  const query = useQueryMyAgentWorkspacesSwr();
  const labels: BusinessModulesDashboardLabels = {
    workspaceLabel: t("workspaceLabel"),
    workspaceReference: id => t("workspaceReference", { id }),
    loading: t("loading"),
    empty: t("empty"),
    create: t("create"),
    unavailable: t("unavailable"),
    unavailableHint: t("unavailableHint"),
    retry: t("retry")
  };
  const answer = query.data;
  if (answer === undefined && query.error === undefined) return <BusinessModulesDashboardBase state="resting" labels={labels} />;
  if (query.error !== undefined || answer?.ok !== true || answer.data.length > 1) return <BusinessModulesDashboardBase
    state="refused"
    labels={labels}
    isRetrying={query.isValidating}
    onRetry={() => void query.mutate()}
  />;
  const workspace = answer.data[0];
  if (workspace === undefined) return <BusinessModulesDashboardBase state="empty" labels={labels} onCreate={() => router.push("/agentos/create")} />;
  return <BusinessModulesDashboardBase
    state="ready"
    labels={labels}
    workspace={{ id: workspace.id, name: workspace.name ?? t("workspaceFallback"), status: workspace.status }}
    moduleCenter={AgentOSSolutionModuleCenter}
  />;
};
