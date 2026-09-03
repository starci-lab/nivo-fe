"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useOverviewData } from "@/modules/overview/context";
import type { DomainRow } from "@/modules/api/console";
import { BILLING_CURRENCY } from "@/modules/config";
import { OverviewSignalsBase, type OverviewSignalsCell } from "./component";
/** Public API role for OverviewSignalsProps. */
export type OverviewSignalsProps = {
  readonly label: string;
};
export type { OverviewSignalsCell } from "./component";
const STATUS_KEY: Readonly<Record<string, string | undefined>> = {
  not_provisioned: "status.notProvisioned",
  provisioning: "status.provisioning",
  awaiting_dns: "status.awaitingDns",
  ready: "status.ready",
  failed: "status.failed",
  active: "status.active",
  suspended: "status.suspended"
};
const NAMED_REFUSALS = new Set(["EXPERT_SITE_NOT_FOUND_EXCEPTION", "EXPERT_SITE_AMBIGUOUS_FOR_VIEWER_EXCEPTION", "AGENT_WORKSPACE_NOT_FOUND_EXCEPTION", "POD_REGISTRATION_MISSING_EXCEPTION"]);
const STATUS_TONE: Readonly<Record<string, "warning" | "danger" | undefined>> = {
  awaiting_dns: "warning",
  suspended: "warning",
  failed: "danger"
};
const EXPIRY_NOTICE_DAYS = 30;
const DAY_IN_MS = 86400000;
const expiryTone = (expiresAt: string | null): "warning" | undefined => {
  if (expiresAt === null) return undefined;
  const remainingDays = (new Date(expiresAt).getTime() - Date.now()) / DAY_IN_MS;
  return remainingDays <= EXPIRY_NOTICE_DAYS ? "warning" : undefined;
};
const dueTone = (dueAt: string): "danger" | undefined => new Date(dueAt).getTime() < Date.now() ? "danger" : undefined;

/** Connect the account signal band to the shared overview answers. */
export const OverviewSignals = (props: OverviewSignalsProps) => {
  const { label } = props;
  const data = useOverviewData();
  const t = useTranslations("console");
  const format = useFormatter();
  const statusLabel = (value: string) => STATUS_KEY[value] === undefined ? t("status.unknown") : t(STATUS_KEY[value]!);
  const refusal = (code: string | undefined) => code !== undefined && NAMED_REFUSALS.has(code) ? t(`refusal.${code}`) : t("refusal.unknown");
  const money = (value: number) => format.number(value, {
    style: "currency",
    currency: BILLING_CURRENCY,
    maximumFractionDigits: 0
  });
  const day = (value: string) => format.dateTime(new Date(value), {
    day: "2-digit",
    month: "2-digit"
  });
  const domainStatus = (domain: DomainRow) => {
    if (domain.expiresAt !== null) return t("domains.expiresAt", {
      date: day(domain.expiresAt)
    });
    return domain.autoRenew ? t("domains.autoRenewOn") : t("domains.autoRenewOff");
  };
  const pending = (id: string, cellLabel: string): OverviewSignalsCell => ({
    id,
    label: cellLabel,
    value: "",
    status: t("state.loading"),
    isSkeleton: true
  });
  const failed = (id: string, cellLabel: string, code: string | undefined): OverviewSignalsCell => ({
    id,
    label: cellLabel,
    value: "—",
    status: refusal(code)
  });
  const apps = (() => {
    if (data.apps === null) return pending("apps", t("apps.title"));
    if (!data.apps.ok) return failed("apps", t("apps.title"), data.apps.code);
    const first = data.apps.data.find(site => ["awaiting_dns", "failed", "suspended"].includes(site.provisionStatus)) ?? data.apps.data[0];
    return first === undefined ? {
      id: "apps",
      label: t("apps.title"),
      value: t("overview.none"),
      status: t("apps.emptyDescription")
    } : {
      id: "apps",
      label: t("apps.title"),
      value: first.slug,
      status: statusLabel(first.provisionStatus),
      badgeTone: STATUS_TONE[first.provisionStatus],
      emphasis: "accent" as const
    };
  })();
  const agent = (() => {
    if (data.workspaces === null || data.pod === null) return pending("agentos", t("agentos.title"));
    if (!data.workspaces.ok) return failed("agentos", t("agentos.title"), data.workspaces.code);
    const first = data.workspaces.data[0];
    if (first === undefined) return {
      id: "agentos",
      label: t("agentos.title"),
      value: t("overview.none"),
      status: t("agentos.emptyDescription")
    };
    let status: string;
    let badgeTone: "warning" | "danger" | undefined;
    if (data.pod.ok) {
      status = data.pod.data.reachable ? t("agentos.podReachable") : t("agentos.podUnreachable");
      badgeTone = data.pod.data.reachable ? undefined : "danger";
    } else status = refusal(data.pod.code);
    return {
      id: "agentos",
      label: t("agentos.title"),
      value: first.name ?? t("agentos.kindWorkspace"),
      status,
      badgeTone
    };
  })();
  const domains = (() => {
    if (data.domains === null) return pending("domains", t("domains.title"));
    if (!data.domains.ok) return failed("domains", t("domains.title"), data.domains.code);
    const first = data.domains.data[0];
    return first === undefined ? {
      id: "domains",
      label: t("domains.title"),
      value: t("overview.none"),
      status: t("overview.signals.nothingToOpen")
    } : {
      id: "domains",
      label: t("domains.title"),
      value: first.name,
      status: domainStatus(first),
      badgeTone: expiryTone(first.expiresAt)
    };
  })();
  const wallet = (() => {
    if (data.wallet === null || data.invoices === null) return pending("wallet", t("wallet.title"));
    if (!data.wallet.ok) return failed("wallet", t("wallet.title"), data.wallet.code);
    const unpaid = data.invoices.ok ? data.invoices.data.find(invoice => invoice.status === "unpaid") : undefined;
    return {
      id: "wallet",
      label: t("wallet.title"),
      value: money(data.wallet.data.balanceVnd),
      status: unpaid === undefined ? t("wallet.noUnpaid") : `${money(unpaid.amountVnd)} · ${t("wallet.dueAt", {
        date: day(unpaid.dueAt)
      })}`,
      badgeTone: unpaid === undefined ? undefined : dueTone(unpaid.dueAt),
      emphasis: "accent" as const
    };
  })();
  const cells = [apps, agent, domains, wallet];
  const attention = cells.filter(cell => cell.badgeTone !== undefined).length;
  const fact = cells.some(cell => cell.isSkeleton === true) ? undefined : attention === 0 ? t("overview.signals.factNone") : t("overview.signals.fact", {
    count: attention
  });
  return <OverviewSignalsBase label={label} fact={fact} cells={cells} />;
};

/** Registry identity for the connected overview signals twin. */
