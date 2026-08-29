"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useOverviewData } from "@/modules/overview/context";
import type { DomainRow } from "@/modules/api/console";
import { OverviewPulseBase, type OverviewPulseSignal } from "./component";
/** Public API role for OverviewPulseProps. */
export type OverviewPulseProps = Record<string, never>;
export type { OverviewPulseSignal } from "./component";
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

/** Connect the account signal strip to the shared overview answers. */
export const OverviewPulse = (props: OverviewPulseProps) => {
  void props;
  const data = useOverviewData();
  const t = useTranslations("console");
  const format = useFormatter();
  const status = (value: string) => STATUS_KEY[value] === undefined ? t("status.unknown") : t(STATUS_KEY[value]!);
  const refusal = (code: string | undefined) => code !== undefined && NAMED_REFUSALS.has(code) ? t(`refusal.${code}`) : t("refusal.unknown");
  const money = (value: number) => format.number(value, {
    style: "currency",
    currency: "VND",
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
    caption: t("state.loading")
  });
  const failed = (id: string, icon: OverviewPulseSignal["icon"], label: string, code: string | undefined): OverviewPulseSignal => ({
    id,
    icon,
    label,
    phase: "failed",
    value: "—",
    caption: refusal(code)
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
      caption: t("apps.emptyDescription")
    } : {
      id: "apps",
      icon: "apps" as const,
      label: t("apps.title"),
      phase: "answered" as const,
      value: first.slug,
      caption: status(first.provisionStatus),
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
      caption: t("agentos.emptyDescription")
    };
    let caption: string;
    if (data.pod.ok) caption = data.pod.data.reachable ? t("agentos.podReachable") : t("agentos.podUnreachable");else caption = refusal(data.pod.code);
    return {
      id: "agentos",
      icon: "agentos" as const,
      label: t("agentos.title"),
      phase: "answered" as const,
      value: first.name ?? t("agentos.kindWorkspace"),
      caption
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
      caption: t("domains.empty")
    } : {
      id: "domains",
      icon: "domains" as const,
      label: t("domains.title"),
      phase: "answered" as const,
      value: first.name,
      caption: domainCaption(first)
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
      emphasis: "accent" as const
    };
  })();
  return <OverviewPulseBase signals={[apps, agent, domains, wallet]} />;
};

/** Registry identity for the connected overview pulse twin. */
