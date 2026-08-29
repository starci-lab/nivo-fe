"use client";

import { createContext, useContext, useMemo } from "react";
import type { ComponentType } from "react";
import { useQueryMyAgentWorkspacesSwr, useQueryMyDomainsSwr, useQueryMyExpertSitesSwr, useQueryMyInvoicesSwr, useQueryMyPodOpenclawStatusSwr, useQueryMyWalletSwr } from "@/hooks/swr";
import { type AgentWorkspaceRow, type DomainRow, type ExpertSiteRow, type InvoiceRow, type PodStatusRow, type WalletRow } from "@/modules/api/console";
import type { Result } from "@/modules/api/graphql";

/** One independently settling answer in the account operations briefing. */
export type OverviewAnswer<T> = Result<T> | null;

/** Source-owned answers shared by the connected overview blocks. */
export type OverviewData = {
  readonly apps: OverviewAnswer<ReadonlyArray<ExpertSiteRow>>;
  readonly workspaces: OverviewAnswer<ReadonlyArray<AgentWorkspaceRow>>;
  readonly pod: OverviewAnswer<PodStatusRow>;
  readonly domains: OverviewAnswer<ReadonlyArray<DomainRow>>;
  readonly wallet: OverviewAnswer<WalletRow>;
  readonly invoices: OverviewAnswer<ReadonlyArray<InvoiceRow>>;
};
const EMPTY_OVERVIEW: OverviewData = {
  apps: null,
  workspaces: null,
  pod: null,
  domains: null,
  wallet: null,
  invoices: null
};
const OverviewDataContext = createContext<OverviewData | null>(null);

/** Props for the one owner of overview network settlement. */
export type OverviewDataProviderProps<P extends object> = {
  readonly content: ComponentType<P>;
  readonly contentProps: P;
};

/** Ask every overview operation once and keep each answer independent. */
export const OverviewDataProvider = <P extends object,>({
  content: Content,
  contentProps
}: OverviewDataProviderProps<P>) => {
  const apps = useQueryMyExpertSitesSwr();
  const workspaces = useQueryMyAgentWorkspacesSwr();
  const pod = useQueryMyPodOpenclawStatusSwr();
  const domains = useQueryMyDomainsSwr();
  const wallet = useQueryMyWalletSwr();
  const invoices = useQueryMyInvoicesSwr();
  const value = useMemo<OverviewData>(() => ({
    apps: apps.data ?? EMPTY_OVERVIEW.apps,
    workspaces: workspaces.data ?? EMPTY_OVERVIEW.workspaces,
    pod: pod.data ?? EMPTY_OVERVIEW.pod,
    domains: domains.data ?? EMPTY_OVERVIEW.domains,
    wallet: wallet.data ?? EMPTY_OVERVIEW.wallet,
    invoices: invoices.data ?? EMPTY_OVERVIEW.invoices
  }), [apps.data, domains.data, invoices.data, pod.data, wallet.data, workspaces.data]);
  return <OverviewDataContext.Provider value={value}><Content {...contentProps} /></OverviewDataContext.Provider>;
};

/** Read the shared account answers from a connected overview block. */
export const useOverviewData = (): OverviewData => {
  const value = useContext(OverviewDataContext);
  if (value === null) throw new Error("useOverviewData must be used inside OverviewDataProvider");
  return value;
};
