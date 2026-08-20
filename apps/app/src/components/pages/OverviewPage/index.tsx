"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import type { BadgeTone } from "@nivo/ui"
import type { AgentOSSummaryState } from "@/components/blocks/console/AgentOSSummary"
import type { AppsSummaryState } from "@/components/blocks/console/AppsSummary"
import type { InfrastructureDomainsState } from "@/components/blocks/console/InfrastructureSummary"
import type { WalletSummaryState } from "@/components/blocks/console/WalletSummary"
import { DEFAULT_LOCALE } from "@/i18n/config"
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
import { OverviewPageBase } from "./component"

const ACADEMY_HOST_SUFFIX = process.env.NEXT_PUBLIC_ACADEMY_HOST_SUFFIX ?? ".nivo.vn"

const NAMED_REFUSALS: ReadonlySet<string> = new Set([
    "EXPERT_SITE_NOT_FOUND_EXCEPTION",
    "EXPERT_SITE_AMBIGUOUS_FOR_VIEWER_EXCEPTION",
    "AGENT_WORKSPACE_NOT_FOUND_EXCEPTION",
    "POD_REGISTRATION_MISSING_EXCEPTION",
])

const STATUS_KEY: Readonly<Record<string, string | undefined>> = {
    not_provisioned: "status.notProvisioned",
    provisioning: "status.provisioning",
    awaiting_dns: "status.awaitingDns",
    ready: "status.ready",
    failed: "status.failed",
    active: "status.active",
    suspended: "status.suspended",
}

const STATUS_TONE: Readonly<Record<string, BadgeTone | undefined>> = {
    not_provisioned: "neutral",
    provisioning: "accent",
    awaiting_dns: "warning",
    ready: "success",
    failed: "danger",
    active: "success",
    suspended: "neutral",
}

type AgentOsAnswer = {
    readonly workspaces: Result<ReadonlyArray<AgentWorkspaceRow>>
    readonly pod: Result<PodStatusRow>
}

type WalletAnswer = {
    readonly wallet: Result<WalletRow>
    readonly invoices: Result<ReadonlyArray<InvoiceRow>>
}

/** Connect the accepted overview summaries to independently settling account queries. */
export const OverviewPage = () => {
    const t = useTranslations("console")
    const format = useFormatter()
    const locale = useLocale()
    const router = useRouter()
    const isSignedIn = useSession().state.status === "signed-in"
    const [apps, setApps] = useState<Result<ReadonlyArray<ExpertSiteRow>> | null>(null)
    const [agentOs, setAgentOs] = useState<AgentOsAnswer | null>(null)
    const [domains, setDomains] = useState<Result<ReadonlyArray<DomainRow>> | null>(null)
    const [wallet, setWallet] = useState<WalletAnswer | null>(null)

    useEffect(() => {
        if (!isSignedIn) return
        let cancelled = false
        void myExpertSites().then((answer) => { if (!cancelled) setApps(answer) })
        return () => { cancelled = true }
    }, [isSignedIn])

    useEffect(() => {
        if (!isSignedIn) return
        let cancelled = false
        void Promise.all([myAgentWorkspace(), myPodOpenclawStatus()]).then(([workspaces, pod]) => {
            if (!cancelled) setAgentOs({ workspaces, pod })
        })
        return () => { cancelled = true }
    }, [isSignedIn])

    useEffect(() => {
        if (!isSignedIn) return
        let cancelled = false
        void myDomains().then((answer) => { if (!cancelled) setDomains(answer) })
        return () => { cancelled = true }
    }, [isSignedIn])

    useEffect(() => {
        if (!isSignedIn) return
        let cancelled = false
        void Promise.all([myWallet(), myInvoices()]).then(([balance, invoices]) => {
            if (!cancelled) setWallet({ wallet: balance, invoices })
        })
        return () => { cancelled = true }
    }, [isSignedIn])

    const refusal = (code: string | undefined) =>
        code !== undefined && NAMED_REFUSALS.has(code) ? t(`refusal.${code}`) : t("refusal.unknown")
    const statusLabel = (status: string) => {
        const key = STATUS_KEY[status]
        return key === undefined ? t("status.unknown") : t(key)
    }
    const money = (amountVnd: number) =>
        format.number(amountVnd, { style: "currency", currency: "VND", maximumFractionDigits: 0 })
    const day = (iso: string) => format.dateTime(new Date(iso), { day: "2-digit", month: "2-digit" })
    const open = (route: string) => router.push(locale === DEFAULT_LOCALE ? route : `/${locale}${route}`)

    const appsState = (): AppsSummaryState => {
        if (apps === null) return { phase: "pending" }
        if (!apps.ok) return { phase: "forbidden", message: refusal(apps.code) }
        if (apps.data.length === 0) return { phase: "empty", message: t("apps.emptyDescription") }
        return {
            phase: "populated",
            items: apps.data.map((site) => ({
                id: site.id,
                name: site.slug,
                detail: site.customDomain ?? `${site.slug}${ACADEMY_HOST_SUFFIX}`,
                statusLabel: statusLabel(site.provisionStatus),
                statusTone: STATUS_TONE[site.provisionStatus] ?? "neutral",
                actionLabel: site.provisionStatus === "awaiting_dns" ? t("apps.viewDns") : t("apps.open"),
            })),
        }
    }

    const agentOsState = (): AgentOSSummaryState => {
        if (agentOs === null) return { phase: "pending" }
        if (!agentOs.workspaces.ok || agentOs.workspaces.data.length === 0) {
            return { phase: "empty", message: agentOs.workspaces.ok ? t("agentos.emptyDescription") : refusal(agentOs.workspaces.code) }
        }
        const workspace = agentOs.workspaces.data[0]
        const display = {
            id: workspace.id,
            name: workspace.name ?? t("agentos.kindWorkspace"),
            description: t("agentos.workspaceDescription"),
            statusLabel: statusLabel(workspace.status),
            statusTone: STATUS_TONE[workspace.status] ?? "neutral",
            actionLabel: t("agentos.openService"),
            detail: agentOs.pod.ok ? t("agentos.podReachable") : refusal(agentOs.pod.code),
        }
        return agentOs.pod.ok ? { phase: "populated", workspace: display } : { phase: "partial", workspace: display }
    }

    const domainsState = (): InfrastructureDomainsState => {
        if (domains === null) return { phase: "pending" }
        if (!domains.ok) return { phase: "failed", note: refusal(domains.code) }
        if (domains.data.length === 0) return { phase: "empty", note: t("domains.empty") }
        return {
            phase: "populated",
            facts: domains.data.map((domain) => ({
                id: domain.id,
                label: domain.name,
                value: domain.expiresAt === null
                    ? (domain.autoRenew ? t("domains.autoRenewOn") : t("domains.autoRenewOff"))
                    : t("domains.expiresAt", { date: day(domain.expiresAt) }),
            })),
        }
    }

    const walletState = (): WalletSummaryState => {
        if (wallet === null) return { phase: "pending" }
        if (!wallet.wallet.ok) return { phase: "failed", note: refusal(wallet.wallet.code) }
        const facts = [{ id: "balance", label: t("wallet.balanceLabel"), value: money(wallet.wallet.data.balanceVnd) }]
        if (wallet.invoices.ok) {
            const unpaid = wallet.invoices.data.find((invoice) => invoice.status === "unpaid")
            facts.push({
                id: "unpaid",
                label: t("wallet.unpaidLabel"),
                value: unpaid === undefined ? t("wallet.noUnpaid") : `${money(unpaid.amountVnd)} · ${t("wallet.dueAt", { date: day(unpaid.dueAt) })}`,
            })
        }
        if (!wallet.invoices.ok) return { phase: "partial", facts, note: refusal(wallet.invoices.code) }
        return wallet.wallet.data.balanceVnd === 0 ? { phase: "empty", facts } : { phase: "populated", facts }
    }

    const hasBuiltService = (apps?.ok === true && apps.data.length > 0)
        || (agentOs?.workspaces.ok === true && agentOs.workspaces.data.length > 0)
    const infrastructureContext = apps !== null && agentOs !== null && !hasBuiltService
        ? t("infrastructure.empty")
        : t("infrastructure.context")

    return (
        <OverviewPageBase
            title={t("overview.title")}
            apps={{ label: t("apps.title"), state: appsState(), onOpenApp: () => open("/apps") }}
            agentOs={{ label: t("agentos.title"), state: agentOsState(), onOpenService: () => open("/agentos") }}
            infrastructure={{ label: t("infrastructure.title"), context: infrastructureContext, domains: domainsState() }}
            wallet={{ label: t("wallet.title"), actionLabel: wallet?.wallet.ok === true && wallet.wallet.data.balanceVnd === 0 ? t("wallet.topUp") : t("wallet.viewTransactions"), state: walletState(), onOpenWallet: () => open("/wallet") }}
        />
    )
}

/** Source-level tier marker for the connected overview page. */
export const meta = { shape: "page", world: "connected" } as const
