"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import type { FleetStatus } from "@/components/blocks/provisioning/FleetRow"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { useSession } from "@/modules/auth/session"
import {
    catalogItems,
    myAgentWorkspace,
    myDomains,
    myExpertSites,
    myInstances,
    myInvoices,
    myPodOpenclawStatus,
    myWallet,
    type AgentWorkspaceRow,
    type CatalogItemRow,
    type DomainRow,
    type ExpertSiteRow,
    type InstanceRow,
    type InvoiceRow,
    type PodStatusRow,
    type WalletRow,
} from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"
import {
    _OverviewPage,
    type AgentOsSectionView,
    type AppsSectionView,
    type ConsoleFactRow,
    type DomainsSectionView,
    type ServersSectionView,
    type WalletSectionView,
} from "./component"

/**
 * PAGE (connected half) - the console's home asks the world, and settles a situation per section.
 *
 * FOUR REQUESTS, NOT ONE, AND THAT IS THE POINT. Each section owns its own effect, so each settles at
 * its own moment: the apps can be answered while the pod read is still out, and the domains can be
 * refused without the wallet above them going grey. One effect for the whole page would collapse
 * five independent subjects into one spinner and one failure, which is exactly the reading
 * `titled-section-stack-page`'s own `why` refuses.
 *
 * NOTHING FIRES UNTIL THE SESSION IS SETTLED. `SessionProvider` starts in `restoring` while it trades
 * the HttpOnly refresh cookie for a token, and a query sent during that round trip goes out with no
 * credential and comes back `Authentication required` - which would paint a permanent false refusal
 * on first paint for every reader who was in fact signed in.
 *
 * A REFUSAL IS KEYED OFF THE CODE, NEVER OFF THE MESSAGE. `AbstractException` sets `name` to the
 * SCREAMING_SNAKE code and the transform interceptor copies it into `error`, so `code` is exactly the
 * catalogue key. `reason` is the server's own English operator sentence, and printing it would put
 * English on a Vietnamese screen for the reader least able to work around it.
 *
 * IT DRAWS NOTHING. Every tree, every contract key and every slot belongs to `component.tsx`; this
 * file resolves words, formats figures and settles which situation each section is in.
 */

/** Where the host of an academy with no custom domain is rooted. */
const ACADEMY_HOST_SUFFIX = process.env.NEXT_PUBLIC_ACADEMY_HOST_SUFFIX ?? ".nivo.vn"

/**
 * The refusal codes this screen has a written sentence for.
 *
 * Anything else - a transport failure, a document error, an unauthenticated call - falls to
 * `refusal.unknown`, which says the rest of the screen is still correct. Minting a catalogue key per
 * transport code would promise a business explanation for something that is not one.
 */
const NAMED_REFUSALS: ReadonlyArray<string> = [
    "EXPERT_SITE_NOT_FOUND_EXCEPTION",
    "EXPERT_SITE_AMBIGUOUS_FOR_VIEWER_EXCEPTION",
    "AGENT_WORKSPACE_NOT_FOUND_EXCEPTION",
    "POD_REGISTRATION_MISSING_EXCEPTION",
]

/**
 * The statuses the fleet vocabulary actually holds, read off the wire's own words.
 *
 * A LOOKUP RATHER THAN A CAST, because two of the status fields are plain `String!` on the wire.
 * Narrowing them with an assertion would let an unrecognised value reach the catalogue as an
 * undefined key, and `useTranslations` throws on one of those.
 */
const WIRE_STATUS: Readonly<Record<string, FleetStatus | undefined>> = {
    not_provisioned: "not_provisioned",
    provisioning: "provisioning",
    awaiting_dns: "awaiting_dns",
    ready: "ready",
    failed: "failed",
    active: "active",
    suspended: "suspended",
}

/** Fleet status to catalogue key. The union is nivo-backend's, so there is nothing to invent. */
const STATUS_KEY: Readonly<Record<FleetStatus, string>> = {
    not_provisioned: "status.notProvisioned",
    provisioning: "status.provisioning",
    awaiting_dns: "status.awaitingDns",
    ready: "status.ready",
    failed: "status.failed",
    active: "status.active",
    suspended: "status.suspended",
}

/** What the apps section asked for, once every one of its questions has come back. */
type AppsAnswer = {
    readonly sites: Result<ReadonlyArray<ExpertSiteRow>>
    readonly instances: Result<ReadonlyArray<InstanceRow>>
    readonly catalogue: Result<ReadonlyArray<CatalogItemRow>>
}

/** What the AgentOS section asked for. */
type AgentOsAnswer = {
    readonly workspaces: Result<ReadonlyArray<AgentWorkspaceRow>>
    readonly pod: Result<PodStatusRow>
}

/** What the wallet section asked for. */
type WalletAnswer = {
    readonly wallet: Result<WalletRow>
    readonly invoices: Result<ReadonlyArray<InvoiceRow>>
}

/**
 * The cheapest rung of one template that publishes a monthly price.
 *
 * Reading the minimum of a returned list is not a count: it names one member the response already
 * carried, and says nothing about how many there are. Rungs with no monthly price are skipped rather
 * than read as free - a one-time rung publishes `priceMonthlyVnd: null`, and sorting on that would
 * put it first at zero dong.
 *
 * @param item - The catalogue item.
 * @returns The cheapest priced rung, or undefined when it publishes none.
 */
const cheapestTier = (item: CatalogItemRow) => {
    let cheapest: { readonly name: string, readonly priceMonthlyVnd: number } | undefined
    for (const tier of item.tiers ?? []) {
        const price = tier.priceMonthlyVnd
        if (price === null) {
            continue
        }
        if (cheapest === undefined || price < cheapest.priceMonthlyVnd) {
            cheapest = { name: tier.name, priceMonthlyVnd: price }
        }
    }
    return cheapest
}

/**
 * The console's home.
 *
 * @returns The page node.
 */
export const OverviewPage = () => {
    const t = useTranslations("console")
    const format = useFormatter()
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const isSignedIn = session.state.status === "signed-in"

    const [apps, setApps] = useState<AppsAnswer | null>(null)
    const [agentOs, setAgentOs] = useState<AgentOsAnswer | null>(null)
    const [domains, setDomains] = useState<Result<ReadonlyArray<DomainRow>> | null>(null)
    const [wallet, setWallet] = useState<WalletAnswer | null>(null)

    useEffect(() => {
        if (!isSignedIn) {
            return
        }
        let cancelled = false
        const ask = async () => {
            const [sites, instances, catalogue] = await Promise.all([
                myExpertSites(),
                myInstances(),
                catalogItems("site_from_template"),
            ])
            if (!cancelled) {
                setApps({ sites, instances, catalogue })
            }
        }
        void ask()
        return () => {
            cancelled = true
        }
    }, [isSignedIn])

    useEffect(() => {
        if (!isSignedIn) {
            return
        }
        let cancelled = false
        const ask = async () => {
            const [workspaces, pod] = await Promise.all([myAgentWorkspace(), myPodOpenclawStatus()])
            if (!cancelled) {
                setAgentOs({ workspaces, pod })
            }
        }
        void ask()
        return () => {
            cancelled = true
        }
    }, [isSignedIn])

    useEffect(() => {
        if (!isSignedIn) {
            return
        }
        let cancelled = false
        const ask = async () => {
            const answer = await myDomains()
            if (!cancelled) {
                setDomains(answer)
            }
        }
        void ask()
        return () => {
            cancelled = true
        }
    }, [isSignedIn])

    useEffect(() => {
        if (!isSignedIn) {
            return
        }
        let cancelled = false
        const ask = async () => {
            const [balance, invoices] = await Promise.all([myWallet(), myInvoices()])
            if (!cancelled) {
                setWallet({ wallet: balance, invoices })
            }
        }
        void ask()
        return () => {
            cancelled = true
        }
    }, [isSignedIn])

    const refusalNote = (code: string | undefined) =>
        code !== undefined && NAMED_REFUSALS.includes(code) ? t(`refusal.${code}`) : t("refusal.unknown")

    const money = (amountVnd: number) =>
        format.number(amountVnd, { style: "currency", currency: "VND", maximumFractionDigits: 0 })

    const day = (iso: string) => format.dateTime(new Date(iso), { day: "2-digit", month: "2-digit" })

    const open = (route: string) => () =>
        router.push(locale === DEFAULT_LOCALE ? route : `/${locale}${route}`)

    const statusLabel = (wire: string) => {
        const status = WIRE_STATUS[wire]
        return status === undefined ? t("status.unknown") : t(STATUS_KEY[status])
    }

    /*
     * AN UNRECOGNISED STATE TAKES THE MOST NEUTRAL TONE AND ITS OWN WORD, rather than a guessed
     * member of the union. `FleetRow` owns the tone map and `not_provisioned` is its neutral entry, so
     * the tone says nothing while the label says plainly that the state is not known.
     */
    const statusTone = (wire: string): FleetStatus => WIRE_STATUS[wire] ?? "not_provisioned"

    const appsView = (): AppsSectionView => {
        const label = t("apps.title")
        if (apps === null) {
            return { phase: "resting", label, openSetLabel: t("apps.openSet") }
        }
        if (!apps.sites.ok) {
            return { phase: "refused", label, note: refusalNote(apps.sites.code) }
        }
        const catalogue = apps.catalogue.ok ? apps.catalogue.data : []
        if (apps.sites.data.length === 0) {
            return {
                phase: "empty",
                label,
                fact: t("apps.empty"),
                offers: catalogue.map((item) => {
                    const tier = cheapestTier(item)
                    return {
                        id: item.id,
                        name: item.name,
                        tagline: item.tagline ?? "",
                        kindLabel: t("apps.kindTemplateApp"),
                        priceLabel: tier === undefined
                            ? ""
                            : t("apps.priceTier", { tier: tier.name, price: money(tier.priceMonthlyVnd) }),
                        actionLabel: t("apps.build"),
                    }
                }),
            }
        }
        const instances = apps.instances.ok ? apps.instances.data : []
        return {
            phase: "answered",
            label,
            openSetLabel: t("apps.openSet"),
            rows: apps.sites.data.map((site) => {
                /*
                 * A REAL TWO-QUERY JOIN, NOT AN ASSERTION. `myInstances.appKey` and
                 * `catalogItems[].templateKey` are the same published key, so the badge names the
                 * template this app was built from. When either join finds nothing the badge says the
                 * generic word rather than guessing a product name.
                 */
                const instance = instances.find((one) => one.detailId === site.id)
                const template = instance === undefined
                    ? undefined
                    : catalogue.find((item) => item.templateKey === instance.appKey)
                return {
                    id: site.id,
                    name: site.slug,
                    detail: site.customDomain ?? `${site.slug}${ACADEMY_HOST_SUFFIX}`,
                    kindLabel: template?.name ?? t("kind.unknown"),
                    status: statusTone(site.provisionStatus),
                    statusLabel: statusLabel(site.provisionStatus),
                    actionLabel: site.provisionStatus === "awaiting_dns" ? t("apps.viewDns") : t("apps.open"),
                }
            }),
        }
    }

    const agentOsView = (): AgentOsSectionView => {
        const label = t("agentos.title")
        const openLabel = t("agentos.openService")
        if (agentOs === null) {
            return { phase: "resting", label, openLabel }
        }
        if (!agentOs.workspaces.ok) {
            return { phase: "refused", label, openLabel, note: refusalNote(agentOs.workspaces.code), rows: [] }
        }
        if (agentOs.workspaces.data.length === 0) {
            return {
                phase: "empty",
                label,
                plansLabel: t("agentos.viewPlans"),
                message: t("agentos.emptyDescription"),
            }
        }
        const rows = agentOs.workspaces.data.map((workspace) => ({
            id: workspace.id,
            name: workspace.name ?? t("agentos.kindWorkspace"),
            kindLabel: t("agentos.kindWorkspace"),
            status: statusTone(workspace.status),
            statusLabel: statusLabel(workspace.status),
        }))
        /*
         * THE ONE REFUSAL THIS SCREEN MEETS IN THE ORDINARY COURSE OF BUSINESS. The workspace answered
         * and the pod read did not, so the sentence sits BESIDE the rows that came back rather than
         * replacing them.
         */
        if (!agentOs.pod.ok) {
            return { phase: "refused", label, openLabel, note: refusalNote(agentOs.pod.code), rows }
        }
        return { phase: "answered", label, openLabel, rows }
    }

    const domainsView = (): DomainsSectionView => {
        const label = t("domains.title")
        if (domains === null) {
            return { phase: "resting", label }
        }
        if (!domains.ok) {
            return { phase: "refused", label, note: refusalNote(domains.code) }
        }
        if (domains.data.length === 0) {
            return { phase: "empty", label, note: t("domains.empty") }
        }
        return {
            phase: "answered",
            label,
            facts: domains.data.map((domain) => ({
                id: domain.id,
                label: domain.name,
                /*
                 * `expiresAt` IS NULLABLE ON THE WIRE, so the line falls back to what the account did
                 * settle about the domain rather than formatting a null into `Invalid Date`.
                 */
                value: domain.expiresAt === null
                    ? (domain.autoRenew ? t("domains.autoRenewOn") : t("domains.autoRenewOff"))
                    : t("domains.expiresAt", { date: day(domain.expiresAt) }),
            })),
        }
    }

    const walletView = (): WalletSectionView => {
        const label = t("wallet.title")
        if (wallet === null) {
            return { phase: "resting", label, actionLabel: t("wallet.viewTransactions") }
        }
        if (!wallet.wallet.ok) {
            return { phase: "refused", label, note: refusalNote(wallet.wallet.code) }
        }
        const balanceVnd = wallet.wallet.data.balanceVnd
        const facts: Array<ConsoleFactRow> = [
            { id: "balance", label: t("wallet.balanceLabel"), value: money(balanceVnd) },
        ]
        /*
         * THE UNPAID LINE IS DRAWN ONLY WHEN THE INVOICES ANSWERED. A "none owed" written while that
         * query was refused would be a claim this screen cannot support, and the balance above it is
         * still correct - which is the whole reason a section settles per query rather than per page.
         */
        if (wallet.invoices.ok) {
            const unpaid = wallet.invoices.data.find((invoice) => invoice.status === "unpaid")
            facts.push({
                id: "unpaid",
                label: t("wallet.unpaidLabel"),
                value: unpaid === undefined
                    ? t("wallet.noUnpaid")
                    : `${money(unpaid.amountVnd)} · ${t("wallet.dueAt", { date: day(unpaid.dueAt) })}`,
            })
        }
        return balanceVnd === 0
            ? { phase: "empty", label, actionLabel: t("wallet.topUp"), facts }
            : { phase: "answered", label, actionLabel: t("wallet.viewTransactions"), facts }
    }

    /*
     * THE SERVERS SECTION HAS NO QUERY OF ITS OWN, so it reads the two sections that do: it is the
     * infrastructure view of what they hold. Its sentence changes only once both have settled with
     * nothing, because nivo sells no standalone server and an account with nothing provisioned has
     * genuinely nothing here rather than something still arriving.
     */
    const hasProvisioned =
        (apps?.sites.ok === true && apps.sites.data.length > 0)
        || (agentOs?.workspaces.ok === true && agentOs.workspaces.data.length > 0)
    const isSettled = apps !== null && agentOs !== null
    const serversView: ServersSectionView = {
        label: t("servers.title"),
        note: isSettled && !hasProvisioned ? t("servers.empty") : t("servers.lede"),
    }

    return (
        <_OverviewPage
            title={t("overview.title")}
            apps={appsView()}
            agentOs={agentOsView()}
            servers={serversView}
            domains={domainsView()}
            wallet={walletView()}
            on={{ openApps: open("/apps"), openAgentOs: open("/agentos"), openWallet: open("/wallet") }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "page", world: "connected" } as const
