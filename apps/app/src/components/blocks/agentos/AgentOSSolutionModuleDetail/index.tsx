"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  nivoQueryData,
  useQueryMyAgentosModuleInstallationSwr,
} from "@/hooks/swr";
import type { AgentosModuleInstallationDetail } from "@/modules/api/console";
import { useSession } from "@/modules/auth/session";
import useProvisioningRealtime from "@/modules/realtime/provisioning";
import {
  AgentOSSolutionModuleDetailBase,
  type AgentOSSolutionModuleDetailState,
  type AgentOSSolutionModuleDetailLabels,
} from "./component";

/** Exact route identities required to read one owner-scoped installation. */
export type AgentOSSolutionModuleDetailProps = {
  readonly workspaceId: string;
  readonly installationId: string;
};

/** Settle the detail block state from what the snapshot returned. */
const detailStateOf = (
  installation: AgentosModuleInstallationDetail | null | undefined,
): AgentOSSolutionModuleDetailState => {
  if (installation === undefined) return "loading" as const;
  if (installation === null) return "refused" as const;
  if (installation.knowledgeState === "recovering")
    return "refreshing" as const;
  if (
    installation.knowledgeState === "refused" ||
    installation.status === "failed"
  )
    return "knowledge-refused" as const;
  return installation.knowledgeState === "current"
    ? ("current" as const)
    : ("ready" as const);
};

const installationForWorkspace = (
  installation: AgentosModuleInstallationDetail | null | undefined,
  workspaceId: string,
): AgentosModuleInstallationDetail | null | undefined => {
  if (installation === null || installation === undefined) return installation;
  return installation.agentWorkspaceId === workspaceId ? installation : null;
};

/** Own the canonical detail snapshot and refresh it on exact Saga updates or reconnect. */
export const AgentOSSolutionModuleDetail = ({
  workspaceId,
  installationId,
}: AgentOSSolutionModuleDetailProps) => {
  const t = useTranslations("console.agentos.workspace.solutions.detail");
  const router = useRouter();
  const session = useSession();
  const accessToken =
    session.state.status === "signed-in" ? session.state.accessToken : null;
  const query = useQueryMyAgentosModuleInstallationSwr(
    workspaceId,
    installationId,
  );
  const loadedInstallation = nivoQueryData(query.data);
  const installation = installationForWorkspace(loadedInstallation, workspaceId);
  const refreshInstallation = query.mutate;
  const realtime = useProvisioningRealtime({
    accessToken,
    target:
      accessToken === null
        ? null
        : { kind: "module-installation", id: installationId },
  });
  useEffect(() => {
    if (realtime.status !== "event" && realtime.status !== "connected") return;
    if (
      realtime.status === "event" &&
      realtime.event.kind !== "module-installation"
    )
      return;
    void refreshInstallation();
  }, [realtime, refreshInstallation]);

  const labels: AgentOSSolutionModuleDetailLabels = {
    title: t("title"),
    backToWorkspace: t("backToWorkspace"),
    loading: t("loading"),
    refused: t("refused"),
    openAiKnowledge: t("openAiKnowledge"),
    knowledgeCurrent: t("knowledgeCurrent"),
    knowledgeRefreshing: t("knowledgeRefreshing"),
    knowledgeRefused: t("knowledgeRefused"),
    summary: {
      section: t("summary.section"),
      module: t("summary.module"),
      version: t("summary.version"),
      status: t("summary.status"),
      failure: t("summary.failure"),
      modelProfile: t("summary.modelProfile"),
      manifest: t("summary.manifest"),
      empty: t("empty"),
    },
    bindings: {
      section: t("bindings.section"),
      agents: t("bindings.agents"),
      channels: t("bindings.channels"),
      sharedKnowledge: t("bindings.sharedKnowledge"),
      knowledgeVersions: t("bindings.knowledgeVersions"),
      artifact: t("bindings.artifact"),
      currentness: t("bindings.currentness"),
      embedding: t("bindings.embedding"),
      retrievalScope: t("bindings.retrievalScope"),
      empty: t("empty"),
    },
  };
  return (
    <AgentOSSolutionModuleDetailBase
      detailState={detailStateOf(installation)}
      installation={installation ?? undefined}
      labels={labels}
      onBack={() => router.push(`/agentos/workspaces/${workspaceId}`)}
      onOpenAiKnowledge={() =>
        router.push(`/agentos/workspaces/${workspaceId}?view=ai-knowledge`)
      }
    />
  );
};

/** Source-level tier marker for the connected module detail block. */
export const meta = { shape: "block", world: "connected" } as const;
