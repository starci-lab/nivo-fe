"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useOverviewData } from "@/modules/overview/context";
import { OverviewRuntimeBase, type OverviewRuntimeFact } from "./component";
/** Public API role for OverviewRuntimeProps. */
export type OverviewRuntimeProps = Record<string, never>;
export type { OverviewRuntimeFact } from "./component";
const NAMED_REFUSALS = new Set(["AGENT_WORKSPACE_NOT_FOUND_EXCEPTION", "POD_REGISTRATION_MISSING_EXCEPTION"]);
const SKELETON_FACTS: ReadonlyArray<OverviewRuntimeFact> = [
  { id: "pending-1", label: "", value: "", isSkeleton: true },
  { id: "pending-2", label: "", value: "", isSkeleton: true },
  { id: "pending-3", label: "", value: "", isSkeleton: true },
  { id: "pending-4", label: "", value: "", isSkeleton: true }
];

/** Connect the pod's own status read to its own labelled runtime surface; absent when there is no
 * workspace to read a pod for. */
export const OverviewRuntime = (props: OverviewRuntimeProps) => {
  void props;
  const { workspaces, pod } = useOverviewData();
  const t = useTranslations("console");
  const format = useFormatter();
  const refusal = (code: string | undefined) => code !== undefined && NAMED_REFUSALS.has(code) ? t(`refusal.${code}`) : t("refusal.unknown");
  if (workspaces === null || pod === null) return <OverviewRuntimeBase label={t("overview.runtimeLabel")} facts={SKELETON_FACTS} />;
  if (!workspaces.ok || workspaces.data.length === 0) return null;
  if (!pod.ok) return <OverviewRuntimeBase
    label={t("overview.runtimeLabel")}
    state="unavailable"
    facts={[{
      id: "refusal",
      label: t("overview.runtime.podUnavailable"),
      value: refusal(pod.code)
    }]}
  />;
  const checked = format.dateTime(new Date(pod.data.checkedAt), {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  const token = !pod.data.tokenConfigured ? t("overview.runtime.tokenNotConfigured") : pod.data.tokenHint === null ? t("overview.runtime.tokenConfiguredNoHint") : t("overview.runtime.tokenConfigured", {
    hint: pod.data.tokenHint
  });
  const facts: ReadonlyArray<OverviewRuntimeFact> = [
    { id: "reachable", label: t("overview.runtime.podAnswered"), value: pod.data.reachable ? t("overview.runtime.yes") : t("overview.runtime.no") },
    { id: "httpStatus", label: t("overview.runtime.httpStatus"), value: pod.data.httpStatus === null ? "—" : String(pod.data.httpStatus) },
    { id: "token", label: t("overview.runtime.token"), value: token },
    { id: "checked", label: t("overview.runtime.checked"), value: checked }
  ];
  return <OverviewRuntimeBase label={t("overview.runtimeLabel")} fact={t("overview.runtimeFact")} facts={facts} />;
};

/** Registry identity for the connected overview runtime twin. */
