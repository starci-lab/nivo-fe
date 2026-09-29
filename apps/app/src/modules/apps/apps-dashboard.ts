import type { FleetStatus } from "@/components/blocks/provisioning/FleetRow"
import type { CatalogItemRow, CatalogOrderRow } from "@/modules/api/commerce"
import type { ExpertSiteRow } from "@/modules/api/expert-sites"
import type { InstanceRow } from "@/modules/api/instances"
import type { Outcome } from "@/modules/api/outcome"

/** Public API role for one owned app or unbuilt order row. */
export type OwnedAppRow = {
    readonly id: string
    readonly name: string
    readonly detail: string
    readonly kindLabel: string
    readonly status: FleetStatus
    readonly statusLabel: string
    readonly actionLabel?: string
}

/** One buyable template, with every word and price already resolved. */
export type TemplateOfferRowView = {
    readonly id: string
    readonly templateKey: string
    readonly name: string
    readonly tagline: string
    readonly kindLabel: string
    readonly priceLabel: string
    readonly actionLabel: string
    readonly actionDisabled: boolean
}

export type OwnedSectionView =
    | { readonly phase: "resting"; readonly label: string }
    | { readonly phase: "empty"; readonly label: string; readonly note: string }
    | { readonly phase: "answered"; readonly label: string; readonly rows: ReadonlyArray<OwnedAppRow> }
    | { readonly phase: "refused"; readonly label: string; readonly note: string }

export type CatalogueSectionView =
    | { readonly phase: "resting"; readonly label: string; readonly fact: string }
    | { readonly phase: "empty"; readonly label: string; readonly note: string }
    | {
          readonly phase: "answered"
          readonly label: string
          readonly fact: string
          readonly offers: ReadonlyArray<TemplateOfferRowView>
      }
    | { readonly phase: "refused"; readonly label: string; readonly note: string }

/** Plain values already resolved by the connected owner. */
export type AppsDashboardData = {
    readonly title: string
    readonly lede: string
    readonly buildAppLabel?: string
    readonly attentionGroupLabel?: string
    readonly steadyGroupLabel?: string
    readonly owned: OwnedSectionView
    readonly catalogue: CatalogueSectionView
}

/** Actions emitted by the pure dashboard. */
export type AppsDashboardActions = {
    readonly onBuildTemplate: (templateKey: string) => void
    readonly onOpenOwnedApp: (siteId: string) => void
}

/** Text values the query projection needs to name source facts. */
export type AppsDashboardCopy = {
    readonly listLabel: string
    readonly catalogueLabel: string
    readonly catalogueFact: string
    readonly unknownKind: string
    readonly refusalUnknown: string
    readonly emptyDescription: string
    readonly orderInProgress: string
    readonly provisioningStatus: string
    readonly viewDns: string
    readonly open: string
    readonly kindTemplateApp: string
    readonly build: string
    readonly unavailable: string
    readonly statusLabel: (status: FleetStatus) => string
    readonly priceTier: (values: { readonly tier: string; readonly price: string }) => string
}

/** Cheapest rung that actually publishes a monthly price. */
export const cheapestTier = (item: CatalogItemRow) => {
    let cheapest: { readonly name: string; readonly priceMonthlyVnd: number } | undefined
    for (const tier of item.tiers ?? []) {
        const price = tier.priceMonthlyVnd
        if (price === null) continue
        if (cheapest === undefined || price < cheapest.priceMonthlyVnd)
            cheapest = { name: tier.name, priceMonthlyVnd: price }
    }
    return cheapest
}

const wireStatuses: Readonly<Record<string, FleetStatus | undefined>> = {
    not_provisioned: "not_provisioned",
    provisioning: "provisioning",
    awaiting_dns: "awaiting_dns",
    ready: "ready",
    failed: "failed",
    active: "active",
    suspended: "suspended",
}
/** Preserve a recognized fleet state, with an unknown state kept neutral. */
export const fleetStatusOf = (wire: string): FleetStatus => wireStatuses[wire] ?? "not_provisioned"

/** Derive the owned section from the three answered sources it joins. */
export const ownedSectionFor = (
    sites: Outcome<ReadonlyArray<ExpertSiteRow>> | undefined,
    instances: Outcome<ReadonlyArray<InstanceRow>> | undefined,
    orders: Outcome<ReadonlyArray<CatalogOrderRow>> | undefined,
    catalogue: Outcome<ReadonlyArray<CatalogItemRow>> | undefined,
    academyHostSuffix: string,
    copy: AppsDashboardCopy,
): OwnedSectionView => {
    const label = copy.listLabel
    if (sites === undefined) return { phase: "resting", label }
    if (!sites.ok) return { phase: "refused", label, note: copy.refusalUnknown }
    const catalogueRows = catalogue?.ok === true ? catalogue.data : []
    const instanceRows = instances?.ok === true ? instances.data : []
    const apps = sites.data.map((site) => {
        const instance = instanceRows.find((one) => one.detailId === site.id)
        const template =
            instance === undefined ? undefined : catalogueRows.find((item) => item.templateKey === instance.appKey)
        const status = fleetStatusOf(site.provisionStatus)
        return {
            id: site.id,
            name: site.slug,
            detail: site.customDomain ?? `${site.slug}${academyHostSuffix}`,
            kindLabel: template?.name ?? copy.unknownKind,
            status,
            statusLabel: copy.statusLabel(status),
            actionLabel: site.provisionStatus === "awaiting_dns" ? copy.viewDns : copy.open,
        }
    })
    const standingUp = (orders?.ok === true ? orders.data : [])
        .filter((order) => order.status === "in_progress")
        .map((order) => ({
            id: order.id,
            name: order.catalogTier?.name ?? copy.unknownKind,
            detail: copy.orderInProgress,
            kindLabel: order.catalogItem?.name ?? copy.unknownKind,
            status: "provisioning" as const,
            statusLabel: copy.provisioningStatus,
        }))
    const rows = [...apps, ...standingUp]
    return rows.length === 0
        ? { phase: "empty", label, note: copy.emptyDescription }
        : { phase: "answered", label, rows }
}

/** Derive catalogue rows from its exact current query answer. */
export const catalogueSectionFor = (
    catalogue: Outcome<ReadonlyArray<CatalogItemRow>> | undefined,
    money: (amountVnd: number) => string,
    copy: AppsDashboardCopy,
): CatalogueSectionView => {
    const label = copy.catalogueLabel
    const fact = copy.catalogueFact
    if (catalogue === undefined) return { phase: "resting", label, fact }
    if (!catalogue.ok) return { phase: "refused", label, note: copy.refusalUnknown }
    if (catalogue.data.length === 0) return { phase: "empty", label, note: copy.emptyDescription }
    return {
        phase: "answered",
        label,
        fact,
        offers: catalogue.data.flatMap((item) => {
            if (item.templateKey === null) return []
            const tier = cheapestTier(item)
            return [
                {
                    id: item.id,
                    templateKey: item.templateKey,
                    name: item.name,
                    tagline: item.tagline ?? "",
                    kindLabel: copy.kindTemplateApp,
                    priceLabel:
                        tier === undefined
                            ? ""
                            : copy.priceTier({ tier: tier.name, price: money(tier.priceMonthlyVnd) }),
                    actionLabel: item.templateKey === "ai_academy" ? copy.build : copy.unavailable,
                    actionDisabled: item.templateKey !== "ai_academy",
                },
            ]
        }),
    }
}

/** The first supported offer controls both continuation buttons. */
export const supportedTemplateOffer = (catalogue: CatalogueSectionView): TemplateOfferRowView | undefined =>
    catalogue.phase === "answered" ? catalogue.offers.find((offer) => !offer.actionDisabled) : undefined
