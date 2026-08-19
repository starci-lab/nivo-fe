"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import type { FleetStatus } from "@/components/blocks/provisioning/FleetRow"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { useSession } from "@/modules/auth/session"
import {
    catalogItems,
    myCatalogOrders,
    myExpertSites,
    myInstances,
    type CatalogItemRow,
    type CatalogOrderRow,
    type ExpertSiteRow,
    type InstanceRow,
} from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"
import {
    _AppsPage as AppsPageView,
    type CatalogueSectionView,
    type OwnedAppRow,
    type OwnedSectionView,
} from "./component"

/**
 * PAGE (connected half) - the app set asks the world, and settles a situation per section.
 *
 * ONE EFFECT RATHER THAN TWO, BECAUSE THE TWO SECTIONS SHARE A QUERY. The owned rows name the
 * template each app was built from, and that name comes from the same `catalogItems` response the
 * catalogue section draws - so a second effect would be a second identical request whose only effect
 * would be to let the two sections disagree about the catalogue for a moment.
 *
 * NOTHING FIRES UNTIL THE SESSION IS SETTLED, for the reason `OverviewPage` records: a query sent
 * during the refresh round trip carries no credential and comes back `Authentication required`, which
 * would draw a permanent false refusal on first paint.
 *
 * THE REFUSED SITUATION IS A TRANSPORT FAILURE HERE, AND IT IS RECORDED AS ONE. None of the three
 * queries this page reads throws a domain exception - `myExpertSites`, `catalogItems` and
 * `myCatalogOrders` are plain finds - so the only way into that arm is a network, document or
 * envelope failure, and it says `refusal.unknown` rather than a business sentence. Minting a backend
 * exception to justify a nicer sentence is exactly what this case exists not to do.
 *
 * NO COUNT. Neither section states how many apps or how many templates there are.
 */

/** The statuses the fleet vocabulary holds, read off the wire's own words rather than asserted. */
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

/** Where the host of an academy with no custom domain is rooted. */
const ACADEMY_HOST_SUFFIX = process.env.NEXT_PUBLIC_ACADEMY_HOST_SUFFIX ?? ".nivo.vn"

/** What this page asked for, once every one of its questions has come back. */
type AppsAnswer = {
    readonly sites: Result<ReadonlyArray<ExpertSiteRow>>
    readonly instances: Result<ReadonlyArray<InstanceRow>>
    readonly orders: Result<ReadonlyArray<CatalogOrderRow>>
    readonly catalogue: Result<ReadonlyArray<CatalogItemRow>>
}

/**
 * The cheapest rung of one template that publishes a monthly price.
 *
 * Rungs with no monthly price are skipped rather than read as free: a one-time rung publishes
 * `priceMonthlyVnd: null`, and sorting on that would put it first at zero dong.
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
 * The app set, and how a new one is started.
 *
 * @returns The page node.
 */
export const AppsPage = () => {
    const t = useTranslations("console")
    const format = useFormatter()
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const isSignedIn = session.state.status === "signed-in"
    const [answer, setAnswer] = useState<AppsAnswer | null>(null)

    useEffect(() => {
        if (!isSignedIn) {
            return
        }
        let cancelled = false
        const ask = async () => {
            const [sites, instances, orders, catalogue] = await Promise.all([
                myExpertSites(),
                myInstances(),
                myCatalogOrders(),
                catalogItems("site_from_template"),
            ])
            if (!cancelled) {
                setAnswer({ sites, instances, orders, catalogue })
            }
        }
        void ask()
        return () => {
            cancelled = true
        }
    }, [isSignedIn])

    const money = (amountVnd: number) =>
        format.number(amountVnd, { style: "currency", currency: "VND", maximumFractionDigits: 0 })

    const statusLabel = (wire: string) => {
        const status = WIRE_STATUS[wire]
        return status === undefined ? t("status.unknown") : t(STATUS_KEY[status])
    }

    /*
     * AN UNRECOGNISED STATE TAKES THE MOST NEUTRAL TONE AND ITS OWN WORD. `FleetRow` owns the tone map
     * and `not_provisioned` is its neutral entry, so the tone says nothing while the label says
     * plainly that the state is not known.
     */
    const statusTone = (wire: string): FleetStatus => WIRE_STATUS[wire] ?? "not_provisioned"

    const ownedView = (): OwnedSectionView => {
        const label = t("apps.listLabel")
        if (answer === null) {
            return { phase: "resting", label }
        }
        if (!answer.sites.ok) {
            return { phase: "refused", label, note: t("refusal.unknown") }
        }
        const catalogue = answer.catalogue.ok ? answer.catalogue.data : []
        const instances = answer.instances.ok ? answer.instances.data : []
        const apps: Array<OwnedAppRow> = answer.sites.data.map((site) => {
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
        })
        /*
         * THE ROW WITH NOTHING TO PRESS. An order paid for and not yet built has only one identity -
         * the rung that was bought - because `myCatalogOrders` carries no slug for the app that does
         * not exist yet. The kind badge names the product and the tier names the row, so neither
         * repeats the other, and reading `in_progress` as `provisioning` is the one interpretation
         * here: it is the same moment in the same lifecycle under two vocabularies.
         */
        const standingUp: Array<OwnedAppRow> = (answer.orders.ok ? answer.orders.data : [])
            .filter((order) => order.status === "in_progress")
            .map((order) => ({
                id: order.id,
                name: order.catalogTier?.name ?? t("kind.unknown"),
                detail: t("apps.orderInProgress"),
                kindLabel: order.catalogItem?.name ?? t("kind.unknown"),
                status: "provisioning",
                statusLabel: t("status.provisioning"),
            }))
        const rows = [...apps, ...standingUp]
        return rows.length === 0
            ? { phase: "empty", label, note: t("apps.emptyDescription") }
            : { phase: "answered", label, rows }
    }

    const catalogueView = (): CatalogueSectionView => {
        const label = t("apps.catalogueLabel")
        const fact = t("apps.catalogueFact")
        if (answer === null) {
            return { phase: "resting", label, fact }
        }
        if (!answer.catalogue.ok) {
            return { phase: "refused", label, note: t("refusal.unknown") }
        }
        if (answer.catalogue.data.length === 0) {
            return { phase: "empty", label, note: t("apps.emptyDescription") }
        }
        return {
            phase: "answered",
            label,
            fact,
            offers: answer.catalogue.data.flatMap((item) => {
                if (item.templateKey === null) {
                    return []
                }
                const tier = cheapestTier(item)
                return [{
                    id: item.id,
                    templateKey: item.templateKey,
                    name: item.name,
                    tagline: item.tagline ?? "",
                    kindLabel: t("apps.kindTemplateApp"),
                    priceLabel: tier === undefined
                        ? ""
                        : t("apps.priceTier", { tier: tier.name, price: money(tier.priceMonthlyVnd) }),
                    actionLabel: item.templateKey === "ai_academy" ? t("apps.build") : t("apps.unavailable"),
                    actionDisabled: item.templateKey !== "ai_academy",
                }]
            }),
        }
    }

    const buildTemplate = (templateKey: string) => {
        const route = `/apps/new/${encodeURIComponent(templateKey)}`
        router.push(locale === DEFAULT_LOCALE ? route : `/${locale}${route}`)
    }

    const openOwnedApp = (siteId: string) => {
        const route = `/apps/${encodeURIComponent(siteId)}`
        router.push(locale === DEFAULT_LOCALE ? route : `/${locale}${route}`)
    }

    return (
        <AppsPageView
            title={t("apps.title")}
            lede={t("apps.lede")}
            owned={ownedView()}
            catalogue={catalogueView()}
            onBuildTemplate={buildTemplate}
            onOpenOwnedApp={openOwnedApp}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "page", world: "connected" } as const
