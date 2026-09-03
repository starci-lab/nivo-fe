"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { BadgeTone } from "@starci/grammar/core";
import { useOverviewData } from "@/modules/overview/context";
import { ACADEMY_HOST_SUFFIX } from "@/modules/config";
import { AppsSummaryBase, type AppsSummaryState } from "./component";
/** Public API role for AppsSummaryProps. */
export type AppsSummaryProps = Record<string, never>;
export type { AppsSummaryItem, AppsSummaryState } from "./component";
const STATUS_KEY: Readonly<Record<string, string | undefined>> = {
  not_provisioned: "status.notProvisioned",
  provisioning: "status.provisioning",
  awaiting_dns: "status.awaitingDns",
  ready: "status.ready",
  failed: "status.failed",
  active: "status.active",
  suspended: "status.suspended"
};
const STATUS_TONE: Readonly<Record<string, BadgeTone | undefined>> = {
  not_provisioned: "neutral",
  provisioning: "accent",
  awaiting_dns: "warning",
  ready: "success",
  failed: "danger",
  active: "success",
  suspended: "neutral"
};
const NAMED_REFUSALS = new Set(["EXPERT_SITE_NOT_FOUND_EXCEPTION", "EXPERT_SITE_AMBIGUOUS_FOR_VIEWER_EXCEPTION"]);

/** Connect the joined Apps collection to its one source-owned slice. */
export const AppsSummary = (props: AppsSummaryProps) => {
  void props;
  const {
    apps
  } = useOverviewData();
  const t = useTranslations("console");
  const router = useRouter();
  const open = (route: string) => router.push(route);
  const refusal = (code: string | undefined) => code !== undefined && NAMED_REFUSALS.has(code) ? t(`refusal.${code}`) : t("refusal.unknown");
  const statusLabel = (status: string) => STATUS_KEY[status] === undefined ? t("status.unknown") : t(STATUS_KEY[status]!);
  let state: AppsSummaryState;
  if (apps === null) state = {
    phase: "pending"
  };else if (!apps.ok) state = {
    phase: "forbidden",
    message: refusal(apps.code)
  };else if (apps.data.length === 0) state = {
    phase: "empty",
    message: t("apps.emptyDescription")
  };else state = {
    phase: "populated",
    items: apps.data.map(site => ({
      id: site.id,
      name: site.slug,
      detail: site.customDomain ?? `${site.slug}${ACADEMY_HOST_SUFFIX}`,
      statusLabel: statusLabel(site.provisionStatus),
      statusTone: STATUS_TONE[site.provisionStatus] ?? "neutral",
      actionLabel: site.provisionStatus === "awaiting_dns" ? t("apps.viewDns") : t("apps.open")
    }))
  };
  return <AppsSummaryBase label={t("apps.title")} openAllLabel={t("apps.openSet")} state={state} onOpenAll={() => open("/apps")} onOpenApp={id => open(`/apps/${id}`)} />;
};

/** Registry identity for the connected Apps summary twin. */
