"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { BadgeTone } from "@starci/grammar/common";
import { useOverviewData } from "@/modules/overview/context";
import { AgentOSSummaryBase, type AgentOSSummaryState } from "./component";
/** Public API role for AgentOSSummaryProps. */
export type AgentOSSummaryProps = Record<string, never>;
export type { AgentOSSummaryState, AgentOSSummaryWorkspace } from "./component";
const STATUS_KEY: Readonly<Record<string, string | undefined>> = {
  provisioning: "status.provisioning",
  waiting_capacity: "status.provisioning",
  installing: "status.provisioning",
  starting: "status.provisioning",
  active: "status.active",
  suspended: "status.suspended",
  failed: "status.failed"
};
const STATUS_TONE: Readonly<Record<string, BadgeTone | undefined>> = {
  provisioning: "accent",
  waiting_capacity: "warning",
  installing: "accent",
  starting: "accent",
  active: "success",
  suspended: "neutral",
  failed: "danger"
};
const NAMED_REFUSALS = new Set(["AGENT_WORKSPACE_NOT_FOUND_EXCEPTION", "POD_REGISTRATION_MISSING_EXCEPTION"]);
type OverviewData = ReturnType<typeof useOverviewData>;
type ConsoleCopy = ReturnType<typeof useTranslations>;
type ConsoleFormat = ReturnType<typeof useFormatter>;
const accessLabel = (pod: OverviewData["pod"], t: ConsoleCopy): string | undefined => {
  if (pod?.ok !== true) return undefined;
  if (!pod.data.tokenConfigured) return t("agentos.workspace.applications.unavailable");
  const available = t("agentos.workspace.applications.available");
  return pod.data.tokenHint === null ? available : `${available} · ${pod.data.tokenHint}`;
};
const resolveSummaryState = ({
  workspaces,
  pod
}: OverviewData, t: ConsoleCopy, format: ConsoleFormat): AgentOSSummaryState => {
  const refusal = (code: string | undefined) => code !== undefined && NAMED_REFUSALS.has(code) ? t(`refusal.${code}`) : t("refusal.unknown");
  const statusLabel = (status: string) => STATUS_KEY[status] === undefined ? t("status.unknown") : t(STATUS_KEY[status]!);
  if (workspaces === null || pod === null) return {
    phase: "pending"
  };
  if (!workspaces.ok || workspaces.data.length === 0) return {
    phase: "empty",
    message: workspaces.ok ? t("agentos.emptyDescription") : refusal(workspaces.code)
  };
  const workspace = workspaces.data[0]!;
  let runtime: string;
  if (pod.ok) runtime = pod.data.reachable ? t("agentos.podReachable") : t("agentos.podUnreachable");else runtime = refusal(pod.code);
  const checked = pod.ok ? t("agentos.checkedAt", {
    time: format.dateTime(new Date(pod.data.checkedAt), {
      hour: "2-digit",
      minute: "2-digit"
    })
  }) : undefined;
  const access = accessLabel(pod, t);
  const display = {
    id: workspace.id,
    name: workspace.name ?? t("agentos.kindWorkspace"),
    description: t("agentos.workspaceDescription"),
    statusLabel: statusLabel(workspace.status),
    statusTone: STATUS_TONE[workspace.status] ?? "neutral" as BadgeTone,
    actionLabel: t("agentos.openService"),
    detail: [runtime, access, checked].filter(Boolean).join(" · ")
  };
  return pod.ok ? {
    phase: "populated",
    workspace: display
  } : {
    phase: "partial",
    workspace: display
  };
};

/** Connect one workspace surface to workspace and pod answers. */
export const AgentOSSummary = (props: AgentOSSummaryProps) => {
  void props;
  const overview = useOverviewData();
  const t = useTranslations("console");
  const format = useFormatter();
  const router = useRouter();
  const open = (route: string) => router.push(route);
  const state = resolveSummaryState(overview, t, format);
  return <AgentOSSummaryBase label={t("agentos.title")} state={state} onOpenService={id => open(`/agentos/workspaces/${id}`)} />;
};

/** Registry identity for the connected AgentOS summary twin. */
