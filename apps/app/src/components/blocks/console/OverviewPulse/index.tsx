"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useOverviewData } from "@/modules/overview/context";
import type { DomainRow } from "@/modules/api/console";
import { BILLING_CURRENCY } from "@/modules/config";
import { OverviewPulseBase, type OverviewPulseSignal, type OverviewPulseTone } from "./component";
/** Public API role for OverviewPulseProps. */
export type OverviewPulseProps = {
  readonly label: string;
  readonly summary: string;
};
export type { OverviewPulseSignal, OverviewPulseTone } from "./component";
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
const STATUS_TONE: Readonly<Record<string, OverviewPulseTone | undefined>> = {
  awaiting_dns: "warning",
  suspended: "warning",
  failed: "danger"
};
const EXPIRY_NOTICE_DAYS = 30;
const DAY_IN_MS = 86400000;
const expiryTone = (expiresAt: string | null): OverviewPulseTone => {
  if (expiresAt === null) return "default";
  const remainingDays = (new Date(expiresAt).getTime() - Date.now()) / DAY_IN_MS;
  return remainingDays <= EXPIRY_NOTICE_DAYS ? "warning" : "default";
};
const dueTone = (dueAt: string): OverviewPulseTone => new Date(dueAt).getTime() < Date.now() ? "danger" : "default";

/** Connect the account signal strip to the shared overview answers. */
export const OverviewPulse = (props: OverviewPulseProps) => {
  const { label, summary } = props;
  const data = useOverviewData();
  const t = useTranslations("console");
  const format = useFormatter();
  const status = (value: string) => STATUS_KEY[value] === undefined ? t("status.unknown") : t(STATUS_KEY[value]!);
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
  const domainCaption = (domain: DomainRow) => {
    if (domain.expiresAt !== null) return t("domains.expiresAt", {
      date: day(domain.expiresAt)
    });
    return domain.autoRenew ? t("domains.autoRenewOn") : t("domains.autoRenewOff");
  };
  const pending = (id: string, icon: OverviewPulseSignal["icon"], label: string): OverviewPulseSignal => ({
    id,
    icon,
    label,
    phase: "pending",
    value: "",
    caption: t("state.loading"),
    tone: "default"
  });
  const failed = (id: string, icon: OverviewPulseSignal["icon"], label: string, code: string | undefined): OverviewPulseSignal => ({
    id,
    icon,
    label,
    phase: "failed",
    value: "—",
    caption: refusal(code),
    tone: "default"
  });
  const apps = (() => {
    if (data.apps === null) return pending("apps", "apps", t("apps.title"));
    if (!data.apps.ok) return failed("apps", "apps", t("apps.title"), data.apps.code);
    const first = data.apps.data.find(site => ["awaiting_dns", "failed", "suspended"].includes(site.provisionStatus)) ?? data.apps.data[0];
    return first === undefined ? {
      id: "apps",
      icon: "apps" as const,
      label: t("apps.title"),
      phase: "answered" as const,
      value: t("overview.none"),
      caption: t("apps.emptyDescription"),
      tone: "default" as const
    } : {
      id: "apps",
      icon: "apps" as const,
      label: t("apps.title"),
      phase: "answered" as const,
      value: first.slug,
      caption: status(first.provisionStatus),
      tone: STATUS_TONE[first.provisionStatus] ?? "default",
      emphasis: "accent" as const
    };
  })();
  const agent = (() => {
    if (data.workspaces === null || data.pod === null) return pending("agentos", "agentos", t("agentos.title"));
    if (!data.workspaces.ok) return failed("agentos", "agentos", t("agentos.title"), data.workspaces.code);
    const first = data.workspaces.data[0];
    if (first === undefined) return {
      id: "agentos",
      icon: "agentos" as const,
      label: t("agentos.title"),
      phase: "answered" as const,
      value: t("overview.none"),
      caption: t("agentos.emptyDescription"),
      tone: "default" as const
    };
    let caption: string;
    let tone: OverviewPulseTone = "default";
    if (data.pod.ok) {
      caption = data.pod.data.reachable ? t("agentos.podReachable") : t("agentos.podUnreachable");
      tone = data.pod.data.reachable ? "default" : "danger";
    } else caption = refusal(data.pod.code);
    return {
      id: "agentos",
      icon: "agentos" as const,
      label: t("agentos.title"),
      phase: "answered" as const,
      value: first.name ?? t("agentos.kindWorkspace"),
      caption,
      tone
    };
  })();
  const domains = (() => {
    if (data.domains === null) return pending("domains", "domains", t("domains.title"));
    if (!data.domains.ok) return failed("domains", "domains", t("domains.title"), data.domains.code);
    const first = data.domains.data[0];
    return first === undefined ? {
      id: "domains",
      icon: "domains" as const,
      label: t("domains.title"),
      phase: "answered" as const,
      value: t("overview.none"),
      caption: t("domains.empty"),
      tone: "default" as const
    } : {
      id: "domains",
      icon: "domains" as const,
      label: t("domains.title"),
      phase: "answered" as const,
      value: first.name,
      caption: domainCaption(first),
      tone: expiryTone(first.expiresAt)
    };
  })();
  const wallet = (() => {
    if (data.wallet === null || data.invoices === null) return pending("wallet", "wallet", t("wallet.title"));
    if (!data.wallet.ok) return failed("wallet", "wallet", t("wallet.title"), data.wallet.code);
    const unpaid = data.invoices.ok ? data.invoices.data.find(invoice => invoice.status === "unpaid") : undefined;
    return {
      id: "wallet",
      icon: "wallet" as const,
      label: t("wallet.title"),
      phase: "answered" as const,
      value: money(data.wallet.data.balanceVnd),
      caption: unpaid === undefined ? t("wallet.noUnpaid") : `${money(unpaid.amountVnd)} · ${t("wallet.dueAt", {
        date: day(unpaid.dueAt)
      })}`,
      tone: unpaid === undefined ? "default" as const : dueTone(unpaid.dueAt),
      emphasis: "accent" as const
    };
  })();
  return <OverviewPulseBase label={label} summary={summary} signals={[apps, agent, domains, wallet]} />;
};

/** Registry identity for the connected overview pulse twin. */
