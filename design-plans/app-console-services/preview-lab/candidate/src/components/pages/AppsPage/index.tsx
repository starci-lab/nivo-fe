"use client"

import { useFormatter, useTranslations } from "next-intl"
import { Badge, Button, Heading, Text, TextLink } from "@nivo/ui"
import {
    FleetRow,
    type FleetStatus,
} from "../../../../../../../../apps/app/src/components/blocks/provisioning/FleetRow"
import { SurfaceCard } from "@/branches/SurfaceCard"
import { Tree } from "@/branches/Tree"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/contracts/props"
import expertSites from "@/resources/my-expert-sites.fixture.json"
import instances from "@/resources/my-instances.fixture.json"
import catalogue from "@/resources/catalog-items.fixture.json"
import catalogOrders from "@/resources/my-catalog-orders.fixture.json"

/**
 * PAGE - `page-apps`: the middle level, and the reason the academy is a ROW rather than a destination.
 *
 * TARGET PATH: `apps/app/src/components/pages/AppsPage/index.tsx`.
 * ROUTE ON MATERIALIZATION: `apps/app/src/app/[locale]/apps/page.tsx`.
 *
 * WHY THIS LEVEL EXISTS ON DAY ONE, when the catalogue has exactly one template. It does three
 * things neither the overview nor a single-app page can: it puts every app built from the same
 * template side by side, it holds an app that is PAID FOR AND NOT YET BUILT, and it opens the
 * catalogue. A destination per template would force a fifth rail entry when template #2 ships, by
 * which time `/hoc-vien` is a published address nobody can move.
 *
 * THE SET COUNTS APPS, NOT TEMPLATES. `myExpertSites` has been plural since today, so one customer
 * can already own two academies - which is what makes this a set rather than a folder with one thing
 * in it.
 *
 * ONE ROW SHAPE IN BOTH SECTIONS, AND THAT IS THE ARGUMENT FOR THE EXTEND. The owned apps and the
 * catalogue share one joined surface, so a newcomer meets exactly the list they will come back to for
 * their second app. What differs is the RELATIONSHIP each row expresses, which is why the catalogue
 * row is its own key: a thing that can be bought carries a price and one press, a thing already owned
 * carries a lifecycle whose tone changes underneath it.
 *
 * THE ROW WITH NO BUTTON NEEDS NO NEW SHAPE. `identity-kind-status-action-row.action` is already
 * optional, and its own `why` states the reason verbatim: a resource mid-provision has nothing
 * anybody may do to it, and an always-present button drawn disabled promises a control that does not
 * exist rather than admitting there is none.
 *
 * THE REFUSED STATE IS A RECORDED GAP RATHER THAN AN INVENTED EXCEPTION. The plan record marks
 * `refused` REQUIRED here, but no query this page reads can throw: `myExpertSites`, `catalogItems`
 * and `myCatalogOrders` are plain finds. So the state is drawn from the GENERIC envelope failure with
 * no named code, and the design record carries the finding - either the transport can fail for
 * reasons that are not a domain exception, or the state inventory is wrong. It is NOT resolved by
 * minting an exception the backend does not throw.
 *
 * NO COUNT. Neither section states how many apps or how many templates there are.
 */

/** Which shape the app set is in. */
export type AppsState = "listed" | "standingUp" | "emptyWithCatalogue" | "refused"

/** Props for {@link AppsPage}. */
export interface AppsPageProps {
    /** The settled situation this route seals. */
    readonly state: AppsState
}

/** One app, narrowed to the fields `myExpertSites` actually puts on the wire. */
type ExpertSiteRow = {
    readonly id: string
    readonly slug: string
    readonly customDomain: string | null
    readonly provisionStatus: FleetStatus
}

/** One instance row, read only for the template identity it publishes. */
type InstanceRow = {
    readonly appKey: string
    readonly detailId: string | null
}

/** One catalogue tier, as the catalog query publishes it. */
type CatalogTierRow = {
    readonly tierKey: string
    readonly name: string
    readonly priceMonthlyVnd: number
}

/** One buyable template, as `catalogItems(category: site_from_template)` publishes it. */
type CatalogItemRow = {
    readonly slug: string
    readonly name: string
    /** The seller's own sentence about the template. A published field, not a line written here. */
    readonly tagline: string
    readonly templateKey: string
    readonly tiers: ReadonlyArray<CatalogTierRow>
}

/** A paid order that has not become an app yet, with the two relations the handler loads. */
type CatalogOrderRow = {
    readonly id: string
    readonly status: string
    readonly catalogItem: { readonly name: string } | null
    readonly catalogTier: { readonly name: string } | null
}

/** Status to catalogue key. The union is nivo-backend's own, so there is nothing to invent. */
const STATUS_KEY: Readonly<Record<FleetStatus, string>> = {
    not_provisioned: "status.notProvisioned",
    provisioning: "status.provisioning",
    awaiting_dns: "status.awaitingDns",
    ready: "status.ready",
    failed: "status.failed",
    active: "status.active",
    suspended: "status.suspended",
}

/**
 * The host an academy runs on when it has no custom domain of its own.
 *
 * The same open question `OverviewPage` records: nothing in the schema resolves `slug` into a host,
 * and no base-domain constant exists in `apps/` or `packages/`. Written once per candidate page so
 * the row can show the address a customer would type, and named in the design record as a decision
 * Apply must settle. Never written into a fixture.
 */
const ACADEMY_HOST_SUFFIX = ".nivo.vn"

/** The apps this account owns. */
const EXPERT_SITES = expertSites.answered.data as ReadonlyArray<ExpertSiteRow>

/** The instance spine, read only to name each app's template. */
const INSTANCES = instances.answered.data as ReadonlyArray<InstanceRow>

/** The buyable templates. */
const CATALOGUE = catalogue.answered.data as ReadonlyArray<CatalogItemRow>

/** The orders that have been paid for and have not become apps yet. */
const ORDERS = catalogOrders.answered.data as ReadonlyArray<CatalogOrderRow>

/**
 * The cheapest rung of one template, which is the figure an offer leads with.
 *
 * @param item - The catalogue item.
 * @returns Its cheapest tier, or undefined when it publishes none.
 */
const cheapestTier = (item: CatalogItemRow): CatalogTierRow | undefined =>
    [...item.tiers].sort((left, right) => left.priceMonthlyVnd - right.priceMonthlyVnd)[0]

/**
 * The app set, and how a new one is started.
 *
 * @param input - {@link AppsPageProps}
 * @returns The page node.
 */
export const AppsPage = ({ state }: AppsPageProps) => {
    const t = useTranslations("console")
    const format = useFormatter()
    const isEmpty = state === "emptyWithCatalogue"

    const money = (amountVnd: number) =>
        format.number(amountVnd, { style: "currency", currency: "VND", maximumFractionDigits: 0 })

    const templateName = (appKey: string) =>
        CATALOGUE.find((item) => item.templateKey === appKey)?.name ?? t("kind.unknown")

    const appRow = (site: ExpertSiteRow) => {
        const instance = INSTANCES.find((one) => one.detailId === site.id)
        const status = site.provisionStatus
        return defineCompositeComponent("fleet-row", {}, () => (
            <FleetRow
                props={{
                    id: site.id,
                    name: site.slug,
                    detail: site.customDomain ?? `${site.slug}${ACADEMY_HOST_SUFFIX}`,
                    kind: "site",
                    kindLabel: instance === undefined ? t("kind.unknown") : templateName(instance.appKey),
                    status,
                    statusLabel: t(STATUS_KEY[status]),
                    actionLabel: status === "awaiting_dns" ? t("apps.viewDns") : t("apps.open"),
                }}
                on={{ open: () => undefined, act: () => undefined }}
            />
        ))
    }

    /*
     * THE ROW WITH NOTHING TO PRESS. Its identity is the only identity an unfulfilled order HAS - the
     * rung that was bought - because `myCatalogOrders` carries no slug for the app that does not
     * exist yet. The kind badge names the product and the tier names the row, so neither repeats the
     * other, and reading `in_progress` as `provisioning` is the one interpretation here: it is the
     * same moment in the same lifecycle under two vocabularies.
     */
    const orderRow = (order: CatalogOrderRow) => defineCompositeComponent("fleet-row", {}, () => (
        <FleetRow
            props={{
                id: order.id,
                name: order.catalogTier?.name ?? t("kind.unknown"),
                detail: t("apps.orderInProgress"),
                kind: "site",
                kindLabel: order.catalogItem?.name ?? t("kind.unknown"),
                status: "provisioning",
                statusLabel: t("status.provisioning"),
            }}
        />
    ))

    /*
     * THE CATALOGUE ROW.
     *
     * TARGET ON MATERIALIZATION: `apps/app/src/components/blocks/provisioning/TemplateOfferRow/`.
     * Written inline in the candidate because a Preview owner writes only the files its task names;
     * Apply extracts it and both pages that draw it collapse onto the one block.
     *
     * IT ASSERTS THE SHAPE AND REFUSES TO ASSERT A FIELD. The kind badge says a template app is what
     * this is; it does not claim WHICH template an existing site was built from, because that is
     * reachable only through the nullable `catalogOrder -> catalogItem` relation with
     * `ON DELETE SET NULL`. Here it is the catalogue's own row, so the product name is its own.
     */
    const offerRow = (item: CatalogItemRow) => {
        const tier = cheapestTier(item)
        return defineCompositeComponent("template-offer-row", {}, () => (
            <Tree
                contract="template-offer-row"
                render={defineContractComponent("template-offer-row", {
                    identity: defineContractComponent("name-over-handle", {
                        name: defineLeafComponent("text-link", { size: "sm" }, () => (
                            <TextLink props={{ label: item.name, size: "sm" }} on={{ press: () => undefined }} />
                        )),
                        handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: item.tagline, size: "xs", tone: "muted" }} />
                        )),
                    }),
                    kind: defineLeafComponent("badge", { tone: "neutral" }, () => (
                        <Badge props={{ content: t("apps.kindTemplateApp"), tone: "neutral" }} />
                    )),
                    price: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text
                            props={{
                                content: tier === undefined
                                    ? ""
                                    : t("apps.priceTier", { tier: tier.name, price: money(tier.priceMonthlyVnd) }),
                                size: "sm",
                            }}
                        />
                    )),
                    action: defineLeafComponent("button", {}, () => (
                        <Button props={{ label: t("apps.build"), size: "sm", variant: "primary" }} on={{ press: () => undefined }} />
                    )),
                })}
            />
        ))
    }

    const titleRow = (label: string, level: 1 | 3) => defineContractComponent("title-with-end-action", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: label, level }} />),
    })

    const ownedRows = state === "standingUp"
        ? [...EXPERT_SITES.map(appRow), ...ORDERS.map(orderRow)]
        : EXPERT_SITES.map(appRow)

    /*
     * SECTION 1 - the apps this account owns, in every state the set can be in.
     *
     * THE EMPTY SENTENCE CHANGES SUBJECT. Not "you have no academy" but "there is no app yet": the
     * first sentence ages the day template #2 ships, the second does not.
     */
    const ownedSection = () => {
        if (isEmpty) {
            return defineContractComponent("label-row-over-card", {
                label: titleRow(t("apps.listLabel"), 3),
                body: defineLeafComponent("text", {}, () => (
                    <Text props={{ content: t("apps.emptyDescription"), size: "sm", tone: "muted" }} />
                )),
            })
        }
        if (state === "refused") {
            return defineContractProjection("label-row-over-card", () => (
                <SurfaceCard
                    props={{ label: t("apps.listLabel") }}
                    contract="body-with-refusal-note"
                    render={defineContractComponent("body-with-refusal-note", {
                        /*
                         * NO `answered` SLOT AND NO NAMED CODE. Nothing on this page answered, and no
                         * query it reads throws a domain exception - so the sentence is the generic
                         * one and the design record carries the finding rather than this file
                         * inventing an exception to justify the state.
                         */
                        note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text props={{ content: t("refusal.unknown"), size: "sm", tone: "muted" }} />
                        )),
                    })}
                />
            ))
        }
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: t("apps.listLabel") }}
                contract="fleet-resource-list"
                render={defineContractComponent("fleet-resource-list", { resource: ownedRows })}
            />
        ))
    }

    /*
     * SECTION 2 - the catalogue, which is how a new app is started. It is a LIST because
     * `catalogItems` returns one, filtered to `site_from_template` - not because a second template
     * has been promised. Today the filter yields exactly one, and template #2 appears here with no
     * new screen, no new route and no change to the rail.
     */
    const catalogueSection = defineContractProjection("label-row-over-card", () => (
        <SurfaceCard
            props={{ label: t("apps.catalogueLabel"), fact: t("apps.catalogueFact") }}
            contract="fleet-resource-list"
            render={defineContractComponent("fleet-resource-list", { resource: CATALOGUE.map(offerRow) })}
        />
    ))

    return (
        <Tree
            contract="titled-section-stack-page"
            render={defineContractComponent("titled-section-stack-page", {
                heading: titleRow(t("apps.title"), 1),
                /*
                 * THE LEDE IS WHAT `title-with-baseline-fact` CANNOT HOLD. A baseline fact is a short
                 * phrase beside a title; this is a sentence about what an app IS and why the set is
                 * open, which is the claim the whole middle level rests on.
                 */
                lede: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: t("apps.lede"), size: "sm", tone: "muted" }} />
                )),
                section: [ownedSection(), catalogueSection],
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "page", world: "connected" } as const
