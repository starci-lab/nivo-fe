"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useOverviewData } from "@/modules/overview/context";
import { InfrastructureSummaryBase, type InfrastructureDomainsState } from "./component";
/** Public API role for InfrastructureSummaryProps. */
export type InfrastructureSummaryProps = Record<string, never>;
export type { InfrastructureDomainFact, InfrastructureDomainsState } from "./component";

/** Connect service presence and exact held domains to the supporting rail. */
export const InfrastructureSummary = (props: InfrastructureSummaryProps) => {
  void props;
  const {
    apps,
    workspaces,
    domains
  } = useOverviewData();
  const t = useTranslations("console");
  const format = useFormatter();
  const day = (value: string) => format.dateTime(new Date(value), {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const hasBuiltService = apps?.ok === true && apps.data.length > 0 || workspaces?.ok === true && workspaces.data.length > 0;
  const context = apps !== null && workspaces !== null && !hasBuiltService ? t("infrastructure.empty") : t("infrastructure.context");
  let state: InfrastructureDomainsState;
  if (domains === null) state = {
    phase: "pending"
  };else if (!domains.ok) state = {
    phase: "failed",
    note: t("refusal.unknown")
  };else if (domains.data.length === 0) state = {
    phase: "empty",
    note: t("domains.empty")
  };else state = {
    phase: "populated",
    facts: domains.data.map(domain => {
      let renewal = domain.autoRenew ? t("domains.autoRenewOn") : t("domains.autoRenewOff");
      if (domain.expiresAt !== null) renewal = t("domains.expiresAt", {
        date: day(domain.expiresAt)
      });
      const statusLabel = t(`domains.status.${domain.status}`);
      return {
        id: domain.id,
        label: domain.name,
        value: `${statusLabel} · ${renewal}`
      };
    })
  };
  return <InfrastructureSummaryBase label={t("infrastructure.title")} context={context} domains={state} />;
};

/** Registry identity for the connected infrastructure summary twin. */
