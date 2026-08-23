"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useSession } from "@/modules/auth/session"
import {
    myAgentWorkspace,
    myDomains,
    myExpertSites,
    myInvoices,
    myPodOpenclawStatus,
    myWallet,
    type AgentWorkspaceRow,
    type DomainRow,
    type ExpertSiteRow,
    type InvoiceRow,
    type PodStatusRow,
    type WalletRow,
} from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"

/** One independently settling answer in the account operations briefing. */
export type OverviewAnswer<T> = Result<T> | null

/** Source-owned answers shared by the connected overview blocks. */
export type OverviewData = {
    readonly apps: OverviewAnswer<ReadonlyArray<ExpertSiteRow>>
    readonly workspaces: OverviewAnswer<ReadonlyArray<AgentWorkspaceRow>>
    readonly pod: OverviewAnswer<PodStatusRow>
    readonly domains: OverviewAnswer<ReadonlyArray<DomainRow>>
    readonly wallet: OverviewAnswer<WalletRow>
    readonly invoices: OverviewAnswer<ReadonlyArray<InvoiceRow>>
}

const EMPTY_OVERVIEW: OverviewData = {
    apps: null,
    workspaces: null,
    pod: null,
    domains: null,
    wallet: null,
    invoices: null,
}

const OverviewDataContext = createContext<OverviewData | null>(null)

/** Props for the one owner of overview network settlement. */
export type OverviewDataProviderProps = { readonly children: ReactNode }

/** Ask every overview operation once and keep each answer independent. */
export const OverviewDataProvider = ({ children }: OverviewDataProviderProps) => {
    const isSignedIn = useSession().state.status === "signed-in"
    const [data, setData] = useState<OverviewData>(EMPTY_OVERVIEW)

    useEffect(() => {
        if (!isSignedIn) {
            setData(EMPTY_OVERVIEW)
            return
        }
        let active = true
        const settle = <K extends keyof OverviewData>(key: K, request: () => Promise<Exclude<OverviewData[K], null>>) => {
            void request().then((answer) => {
                if (active) setData((current) => ({ ...current, [key]: answer }))
            })
        }
        settle("apps", myExpertSites)
        settle("workspaces", myAgentWorkspace)
        settle("pod", myPodOpenclawStatus)
        settle("domains", myDomains)
        settle("wallet", myWallet)
        settle("invoices", myInvoices)
        return () => { active = false }
    }, [isSignedIn])

    const value = useMemo(() => data, [data])
    return <OverviewDataContext.Provider value={value}>{children}</OverviewDataContext.Provider>
}

/** Read the shared account answers from a connected overview block. */
export const useOverviewData = (): OverviewData => {
    const value = useContext(OverviewDataContext)
    if (value === null) throw new Error("useOverviewData must be used inside OverviewDataProvider")
    return value
}

/** Source-level tier marker for the overview data owner. */
export const meta = { shape: "provider", world: "connected" } as const
