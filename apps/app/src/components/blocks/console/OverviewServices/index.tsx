"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { BadgeTone } from "@starci/grammar/common";
import { useOverviewData } from "@/modules/overview/context";
import { ACADEMY_HOST_SUFFIX } from "@/modules/config";
import { OverviewServicesBase, type OverviewServicesRow } from "./component";
/** Public API role for OverviewServicesProps. */
export type OverviewServicesProps = {
  readonly label: string;
};
export type { OverviewServicesRow } from "./component";
const APPS_STATUS_KEY: Readonly<Record<string, string | undefined>> = {
  not_provisioned: "status.notProvisioned",
  provisioning: "status.provisioning",
  awaiting_dns: "status.awaitingDns",
  ready: "status.ready",
  failed: "status.failed",
  active: "status.active",
  suspended: "status.suspended"
};
const APPS_STATUS_TONE: Readonly<Record<string, BadgeTone | undefined>> = {
  not_provisioned: "neutral",
  provisioning: "accent",
  awaiting_dns: "warning",
  ready: "success",
  failed: "danger",
  active: "success",
  suspended: "neutral"
};
const WORKSPACE_STATUS_KEY: Readonly<Record<string, string | undefined>> = {
  provisioning: "status.provisioning",
  waiting_capacity: "status.provisioning",
  installing: "status.provisioning",
  starting: "status.provisioning",
  active: "status.active",
  suspended: "status.suspended",
  failed: "status.failed"
};
const WORKSPACE_STATUS_TONE: Readonly<Record<string, BadgeTone | undefined>> = {
  provisioning: "accent",
  waiting_capacity: "warning",
  installing: "accent",
  starting: "accent",
  active: "success",
  suspended: "neutral",
  failed: "danger"
};
const DEGRADED_TONES = new Set<BadgeTone>(["warning", "danger"]);

/** Connect the merged services list to the owned applications and the one agent workspace. */
export const OverviewServices = (props: OverviewServicesProps) => {
  const { label } = props;
  const { apps, workspaces } = useOverviewData();
  const t = useTranslations("console");
  const router = useRouter();
  const open = (route: string) => router.push(route);
  const isLoading = apps === null || workspaces === null;
  const appRows: Array<OverviewServicesRow> = apps !== null && apps.ok ? apps.data.map(site => {
    const isUnavailable = site.provisionStatus === "not_provisioned";
    return {
      id: site.id,
      name: site.slug,
      detail: site.customDomain ?? `${site.slug}${ACADEMY_HOST_SUFFIX}`,
      statusLabel: APPS_STATUS_KEY[site.provisionStatus] === undefined ? t("status.unknown") : t(APPS_STATUS_KEY[site.provisionStatus]!),
      statusTone: APPS_STATUS_TONE[site.provisionStatus] ?? "neutral",
      actionLabel: isUnavailable ? t("apps.unavailable") : site.provisionStatus === "awaiting_dns" ? t("apps.viewDns") : t("apps.open"),
      isDisabled: isUnavailable,
      onOpen: () => open(`/apps/${site.id}`)
    };
  }) : [];
  const workspace = workspaces !== null && workspaces.ok ? workspaces.data[0] : undefined;
  const workspaceRows: Array<OverviewServicesRow> = workspace === undefined ? [] : [{
    id: workspace.id,
    name: workspace.name ?? t("agentos.kindWorkspace"),
    detail: workspace.catalogOrder === null ? t("overview.services.workspaceDetailNoOrder") : t("overview.services.workspaceDetailWithOrder", {
      orderId: workspace.catalogOrder.id
    }),
    statusLabel: WORKSPACE_STATUS_KEY[workspace.status] === undefined ? t("status.unknown") : t(WORKSPACE_STATUS_KEY[workspace.status]!),
    statusTone: WORKSPACE_STATUS_TONE[workspace.status] ?? "neutral",
    actionLabel: t("overview.services.openWorkspace"),
    onOpen: () => open(`/agentos/workspaces/${workspace.id}`)
  }];
  const rows: ReadonlyArray<OverviewServicesRow> = isLoading ? [{
    id: "pending-1",
    name: "",
    detail: "",
    statusLabel: "",
    statusTone: "neutral",
    actionLabel: "",
    onOpen: () => undefined,
    isSkeleton: true
  }, {
    id: "pending-2",
    name: "",
    detail: "",
    statusLabel: "",
    statusTone: "neutral",
    actionLabel: "",
    onOpen: () => undefined,
    isSkeleton: true
  }] : [...appRows, ...workspaceRows];
  const degraded = isLoading ? 0 : rows.filter(item => DEGRADED_TONES.has(item.statusTone)).length;
  const fact = isLoading ? undefined : `${t("overview.services.factAnswered", {
    count: rows.length
  })} · ${degraded === 0 ? t("overview.services.factDegradedNone") : t("overview.services.factDegraded", {
    count: degraded
  })}`;
  return <OverviewServicesBase label={label} fact={fact} isLoading={isLoading} rows={rows} />;
};

/** Registry identity for the connected overview services twin. */
