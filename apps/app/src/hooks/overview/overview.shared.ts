import { createContext, createElement, useMemo } from "react"
import type { ComponentType, Context, ReactElement } from "react"
import { useQueryMyAgentWorkspacesSwr } from "../swr/queries/useQueryMyAgentWorkspacesSwr"
import { useQueryMyDomainsSwr } from "../swr/queries/useQueryMyDomainsSwr"
import { useQueryMyExpertSitesSwr } from "../swr/queries/useQueryMyExpertSitesSwr"
import { useQueryMyInvoicesSwr } from "../swr/queries/useQueryMyInvoicesSwr"
import { useQueryMyPodOpenclawStatusSwr } from "../swr/queries/useQueryMyPodOpenclawStatusSwr"
import { useQueryMyWalletSwr } from "../swr/queries/useQueryMyWalletSwr"
import { type AgentWorkspaceRow } from "@/modules/api/agentos-workspaces"
import { type DomainRow, type InvoiceRow, type WalletRow } from "@/modules/api/commerce"
import { type ExpertSiteRow } from "@/modules/api/expert-sites"
import { type PodStatusRow } from "@/modules/api/instances"
import { type Outcome } from "@nivo/api"

/** One independently settling answer in the account operations briefing. */
export type OverviewAnswer<T> = Outcome<T> | null

/** Source-owned answers shared by the connected overview blocks. */
export type OverviewDataProviderData = {
    readonly apps: OverviewAnswer<ReadonlyArray<ExpertSiteRow>>
    readonly workspaces: OverviewAnswer<ReadonlyArray<AgentWorkspaceRow>>
    readonly pod: OverviewAnswer<PodStatusRow>
    readonly domains: OverviewAnswer<ReadonlyArray<DomainRow>>
    readonly wallet: OverviewAnswer<WalletRow>
    readonly invoices: OverviewAnswer<ReadonlyArray<InvoiceRow>>
}

const EMPTY_OVERVIEW: OverviewDataProviderData = {
    apps: null,
    workspaces: null,
    pod: null,
    domains: null,
    wallet: null,
    invoices: null,
}

/** Shared context for the connected overview's independent source answers. */
export const OverviewDataContext: Context<OverviewDataProviderData | null> =
    createContext<OverviewDataProviderData | null>(null)

/** Props for the one owner of overview network settlement. */
export type OverviewDataProviderProps<P extends object> = {
    readonly content: ComponentType<P>
    readonly contentProps: P
}

/** Ask every overview operation once and keep each answer independent. */
export const OverviewDataProvider = <P extends object>({
    content: Content,
    contentProps,
}: OverviewDataProviderProps<P>): ReactElement => {
    const apps = useQueryMyExpertSitesSwr()
    const workspaces = useQueryMyAgentWorkspacesSwr()
    const pod = useQueryMyPodOpenclawStatusSwr()
    const domains = useQueryMyDomainsSwr()
    const wallet = useQueryMyWalletSwr()
    const invoices = useQueryMyInvoicesSwr()
    const value = useMemo<OverviewDataProviderData>(
        () => ({
            apps: apps.data ?? EMPTY_OVERVIEW.apps,
            workspaces: workspaces.data ?? EMPTY_OVERVIEW.workspaces,
            pod: pod.data ?? EMPTY_OVERVIEW.pod,
            domains: domains.data ?? EMPTY_OVERVIEW.domains,
            wallet: wallet.data ?? EMPTY_OVERVIEW.wallet,
            invoices: invoices.data ?? EMPTY_OVERVIEW.invoices,
        }),
        [apps.data, domains.data, invoices.data, pod.data, wallet.data, workspaces.data],
    )

    return createElement(
        OverviewDataContext.Provider,
        { value },
        createElement(Content, contentProps),
    )
}
