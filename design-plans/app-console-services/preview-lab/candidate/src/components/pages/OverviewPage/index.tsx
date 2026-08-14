"use client"

import { useFormatter, useTranslations } from "next-intl"
import { Badge, Button, Heading, Text, TextLink } from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
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
import agentWorkspace from "@/resources/my-agent-workspace.fixture.json"
import podStatus from "@/resources/my-pod-openclaw-status.fixture.json"
import domains from "@/resources/my-domains.fixture.json"
import wallet from "@/resources/my-wallet.fixture.json"
import invoices from "@/resources/my-invoices.fixture.json"

/**
 * PAGE - `page-overview`: the console's home, five sections, one per service.
 *
 * TARGET PATH: `apps/app/src/components/pages/OverviewPage/index.tsx`.
 * ROUTE ON MATERIALIZATION: `apps/app/src/app/[locale]/page.tsx`, which mounts it and nothing else.
 *
 * IT ORDERS THE SECTIONS AND NOTHING ELSE. Each section asks its own query and answers at its own
 * moment, so they are read straight down at one seam and none is nested inside another - a section
 * drawn inside its neighbour makes one refusal look like the whole page failing.
 *
 * FOUR NETWORK STATES PER SECTION, WHICH IS THE POINT OF THE CASE. The shipped `/provisioning`
 * renders a fixture and therefore has one state; a screen wired to real queries has four. The fourth
 * is not padding: `myAcademySettings` and `myPodOpenclawStatus` THROW rather than answer, and the
 * transport turns a throw into a successful field carrying a failed envelope, so a refusal is a
 * RESULT this page draws beside whatever did answer.
 *
 * IT WRITES NO LAYOUT CLASS. `titled-section-stack-page` owns the measure and the seam,
 * `label-row-over-card` owns the label sitting outside the surface, and `SurfaceCard` owns the
 * ground. The page types keys.
 *
 * NO COUNT ANYWHERE. No count query exists in the schema and no `my*` response declares a total, so
 * the apps section names its first members and says nothing about the rest. The way out - the
 * link into the app set - is what carries that, rather than a number.
 *
 * WHERE THE COPY IS RESOLVED, AND WHY HERE. The page is the drawing half in this candidate: `state`
 * is the settled situation a route hands it, and the page turns that into words and formats. That is
 * lawful at this tier - `presentational-purity` scopes to `component.tsx`, and the twin rule to
 * `blocks/` - and it is the only place a figure can be formatted at all, because money and dates
 * arrive from the schema as an Int and an ISO string and `useFormatter` is what makes them readable
 * under the served locale and time zone. On materialization this file keeps that role and the query
 * layer above it settles the same `state`.
 *
 * A DELIBERATE ABSENCE IS DRAWN DIFFERENTLY FROM AN UNBOUGHT ONE. The servers and domains sections say one
 * sentence in the column their rows would have used - no ground, no mark, no centring, no press -
 * because an absence drawn like an empty notice reads as an invitation, and neither of these is one.
 * That is exactly the leaf `text` body `label-row-over-card` admits.
 *
 * THREE DIVERGENCES FROM THE DIRECTION LAB, ALL DELIBERATE AND ALL FOR REVIEW:
 *
 *  1. The lab drew a paragraph under the app rows saying the section names members rather than
 *     counting them. `label-row-over-card` holds ONE body, and the only shape that could hold rows
 *     and a sentence together is `body-with-refusal-note` - whose name and whose `why` are about a
 *     REFUSAL. Borrowing it for an editorial note would make the key stop fixing what goes inside
 *     it, so the sentence is not drawn and the claim is carried by the absence of any number.
 *  2. The lab's servers sentence said the customer API cannot return machine shape. That is no
 *     longer true - `MyInstance.ram` and `vcpu` are read from `ramMb`/`vcpu` today - so the honest
 *     sentence is the scene-3 one: nivo does not sell a standalone server, and this is the
 *     infrastructure view of what is above it.
 *  3. The lab's empty AgentOS notice carried a price and a button. `EmptyNotice` hardcodes
 *     `icon: "retry"` on its action, so an offer to BUY drawn there reads as "try again"; and the
 *     AgentOS rung is not in the catalogue slice this candidate reads, so a figure typed here would
 *     be the invented number this case exists to stop drawing. The way out moved to the label line.
 */

/** How far the five queries have got. Every section owns all four independently. */
export type OverviewState = "resting" | "empty" | "answered" | "refused"

/** Props for {@link OverviewPage}. */
export interface OverviewPageProps {
    /** The settled situation this route seals. */
    readonly state: OverviewState
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

/** The agent workspace, narrowed to what `myAgentWorkspace` loads one level deep. */
type WorkspaceRow = {
    readonly id: string
    readonly name: string
    readonly status: FleetStatus
}

/** One held domain, ordered soonest-expiry first by the handler itself. */
type DomainRow = {
    readonly id: string
    readonly name: string
    readonly expiresAt: string
}

/** One invoice, narrowed to the amount, the state and the date it is owed by. */
type InvoiceRow = {
    readonly id: string
    readonly amountVnd: number
    readonly status: string
    readonly dueAt: string | null
}

/**
 * Status to catalogue key.
 *
 * The union is nivo-backend's two vocabularies concatenated, so there is nothing to map and nothing
 * to invent - only a word per member. `awaiting_dns` keeps its own word for the same reason
 * `FleetRow` keeps it in the warning tone: it looks like a fault and is not one.
 */
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
 * OPEN QUESTION, RECORDED RATHER THAN HIDDEN. `myExpertSites` publishes `slug` and `customDomain`
 * and nothing resolves the two into a host; no constant for the base domain exists anywhere in
 * `apps/` or `packages/`. It is written here, once, as a candidate constant so the row can show the
 * address a customer would type - and it is named in the design record as a decision Apply must
 * settle rather than a string that quietly became true by being drawn. It is deliberately NOT in the
 * fixture, because a fixture may hold only what the schema can answer.
 */
const ACADEMY_HOST_SUFFIX = ".nivo.vn"

/** The app rows, as the wire hands them over. */
const EXPERT_SITES = expertSites.answered.data as ReadonlyArray<ExpertSiteRow>

/** The instance spine, read only to name each app's template. */
const INSTANCES = instances.answered.data as ReadonlyArray<InstanceRow>

/** The buyable templates. A catalogue that answers nothing is not a state this product has. */
const CATALOGUE = catalogue.answered.data as ReadonlyArray<CatalogItemRow>

/** The one agent workspace this account owns. */
const WORKSPACES = agentWorkspace.answered.data as ReadonlyArray<WorkspaceRow>

/** The held domains, soonest expiry first. */
const DOMAINS = domains.answered.data as ReadonlyArray<DomainRow>

/** The invoices, newest first. */
const INVOICES = invoices.answered.data as ReadonlyArray<InvoiceRow>

/**
 * The cheapest rung of one template, which is the figure an offer leads with.
 *
 * Reading the minimum of a returned list is not a count: it names one member the response already
 * carried, and says nothing about how many there are.
 *
 * @param item - The catalogue item.
 * @returns Its cheapest tier, or undefined when it publishes none.
 */
const cheapestTier = (item: CatalogItemRow): CatalogTierRow | undefined =>
    [...item.tiers].sort((left, right) => left.priceMonthlyVnd - right.priceMonthlyVnd)[0]

/**
 * The console's home.
 *
 * @param input - {@link OverviewPageProps}
 * @returns The page node.
 */
export const OverviewPage = ({ state }: OverviewPageProps) => {
    const t = useTranslations("console")
    const format = useFormatter()
    const isResting = state === "resting"
    const isEmpty = state === "empty"

    const money = (amountVnd: number) =>
        format.number(amountVnd, { style: "currency", currency: "VND", maximumFractionDigits: 0 })

    const day = (iso: string) => format.dateTime(new Date(iso), { day: "2-digit", month: "2-digit" })

    const templateName = (appKey: string) =>
        CATALOGUE.find((item) => item.templateKey === appKey)?.name ?? t("kind.unknown")

    /*
     * ONE ROW SHAPE, WHATEVER STATE IT IS IN. Resting passes the waiting flag down and lets the row
     * rest as ITSELF rather than picking a second tree written here.
     *
     * KNOWN RESTING GAP, RECORDED FOR THE DESIGN RECORD: `FleetRow` threads `isLoading` to the handle
     * and the action only - neither badge takes it - so a resting row paints two empty chips. That is
     * `FleetRow`'s own gap rather than this page's, and folding the flag into its badges is a
     * fidelity fix outside this phase's boundary.
     */
    const restingRow = (index: number) => defineCompositeComponent("fleet-row", {}, () => (
        <FleetRow props={{ id: `resting-${index}`, kind: "site", kindLabel: "", status: "provisioning" }} isLoading />
    ))

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
                    /*
                     * A REAL TWO-QUERY JOIN, NOT AN ASSERTION. `myInstances.appKey` and
                     * `catalogItems[].templateKey` are the same published key, so the badge names the
                     * template this app was built from. When the join finds nothing the badge says
                     * the generic word rather than guessing a product name.
                     */
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
     * THE CATALOGUE ROW, drawn in the same joined surface as the owned apps.
     *
     * TARGET ON MATERIALIZATION: `apps/app/src/components/blocks/provisioning/TemplateOfferRow/`.
     * It is written inline in the candidate because a Preview owner writes only the files its task
     * names; Apply extracts it, and both pages that draw it collapse onto the one block.
     *
     * WHY IT IS NOT `identity-kind-status-action-row`. A thing that can be BOUGHT carries a price and
     * exactly one press; a thing already owned carries a lifecycle whose tone changes underneath it.
     * Putting an amount of money in the status slot would make it read as a state a resource can be
     * in, which is the relationship that row's own `why` exists to protect.
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

    const workspaceRow = (workspace: WorkspaceRow) => defineCompositeComponent("fleet-row", {}, () => (
        <FleetRow
            props={{
                id: workspace.id,
                name: workspace.name,
                kind: "workspace",
                kindLabel: t("agentos.kindWorkspace"),
                status: workspace.status,
                statusLabel: t(STATUS_KEY[workspace.status]),
            }}
        />
    ))

    const factRow = (label: string, value: string) => defineContractComponent("label-value-row", {
        label: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: label, size: "sm" }} isLoading={isResting} />
        )),
        value: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: value, size: "sm" }} isLoading={isResting} />
        )),
    })

    const sentence = (content: string) => defineLeafComponent("text", {}, () => (
        <Text props={{ content, size: "sm", tone: "muted" }} />
    ))

    /*
     * A SECTION NAME AND THE PAGE NAME ARE THE SAME NODE AT TWO OUTLINE LEVELS. `SurfaceCard` fixes
     * level 3 for the sections it draws, so the two sections that carry a bare sentence instead of a
     * ground have to say the same level here rather than picking one of their own.
     */
    const titleRow = (label: string, level: 1 | 3) => defineContractComponent("title-with-end-action", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: label, level }} />),
    })

    /*
     * SECTION 1 - the apps. The only section that summarises a SET rather than one subject, which is
     * why its way out is a destination and not a detail.
     */
    const appsSection = defineContractProjection("label-row-over-card", () => {
        if (isEmpty) {
            return (
                <SurfaceCard
                    props={{ label: t("apps.title"), fact: t("apps.empty") }}
                    contract="fleet-resource-list"
                    render={defineContractComponent("fleet-resource-list", {
                        /*
                         * THE OFFER IS THE CATALOGUE, NOT A HARDCODED BUTTON. A newcomer meets exactly
                         * the list they will come back to for their second app, so the middle level is
                         * not a thing they have to learn twice - and template #2 appears here with no
                         * screen, route or rail change.
                         */
                        resource: CATALOGUE.map(offerRow),
                    })}
                />
            )
        }
        return (
            <SurfaceCard
                props={{ label: t("apps.title"), seeMoreLabel: t("apps.openSet") }}
                on={{ seeMore: () => undefined }}
                contract="fleet-resource-list"
                render={defineContractComponent("fleet-resource-list", {
                    resource: isResting ? [restingRow(1), restingRow(2)] : EXPERT_SITES.map(appRow),
                })}
                isLoading={isResting}
            />
        )
    })

    /*
     * SECTION 2 - AgentOS. The one section that draws a refusal, because `myPodOpenclawStatus` is the
     * query that throws: the workspace answered, the pod read did not, and the refusal sits BESIDE
     * the part that answered rather than replacing it with a centred apology.
     */
    const agentOsSection = defineContractProjection("label-row-over-card", () => {
        if (isEmpty) {
            return (
                <SurfaceCard
                    props={{ label: t("agentos.title"), seeMoreLabel: t("agentos.viewPlans") }}
                    on={{ seeMore: () => undefined }}
                    contract="centred-empty-notice"
                    render={defineContractComponent("centred-empty-notice", {
                        notice: defineCompositeComponent("empty-notice", {}, () => (
                            <EmptyNotice props={{ message: t("agentos.emptyDescription") }} />
                        )),
                    })}
                />
            )
        }
        if (state === "refused") {
            return (
                <SurfaceCard
                    props={{ label: t("agentos.title"), seeMoreLabel: t("agentos.openService") }}
                    on={{ seeMore: () => undefined }}
                    contract="body-with-refusal-note"
                    render={defineContractComponent("body-with-refusal-note", {
                        answered: defineContractComponent("fleet-resource-list", {
                            resource: WORKSPACES.map(workspaceRow),
                        }),
                        note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            /*
                             * KEYED OFF `error`, NEVER OFF `message`. The envelope's `message` is the
                             * server's own English sentence - `AbstractException` sets `name` to the
                             * SCREAMING_SNAKE code and the transform interceptor copies it into
                             * `error`. Printing `message` would put English on a Vietnamese screen for
                             * the reader least able to work around it.
                             */
                            <Text
                                props={{ content: t(`refusal.${podStatus.refused.error}`), size: "sm", tone: "muted" }}
                            />
                        )),
                    })}
                />
            )
        }
        return (
            <SurfaceCard
                props={{ label: t("agentos.title"), seeMoreLabel: t("agentos.openService") }}
                on={{ seeMore: () => undefined }}
                contract="fleet-resource-list"
                render={defineContractComponent("fleet-resource-list", {
                    resource: isResting ? [restingRow(3)] : WORKSPACES.map(workspaceRow),
                })}
                isLoading={isResting}
            />
        )
    })

    /*
     * SECTION 3 - the servers. It answers the same way in every state, because there is no query behind
     * it to be waiting on: nivo sells no standalone server, and this is the infrastructure view of
     * the apps and workspaces above. One sentence, no ground, no press.
     */
    const serversSection = defineContractComponent("label-row-over-card", {
        label: titleRow(t("servers.title"), 3),
        body: sentence(isEmpty ? t("servers.empty") : t("servers.lede")),
    })

    /*
     * SECTION 4 - the domains. Drawn as label-and-figure lines rather than as fleet rows: a domain is a
     * name and a date, not a provisioned resource with a lifecycle anybody can act on, and
     * `FleetRow`'s kind union has no member for one.
     */
    const domainsSection = isEmpty
        ? defineContractComponent("label-row-over-card", {
            label: titleRow(t("domains.title"), 3),
            body: sentence(t("domains.empty")),
        })
        : defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: t("domains.title") }}
                contract="labelled-fact-stack"
                render={defineContractComponent("labelled-fact-stack", {
                    fact: isResting
                        ? [factRow("", ""), factRow("", "")]
                        : DOMAINS.map((domain) => factRow(
                            domain.name,
                            t("domains.expiresAt", { date: day(domain.expiresAt) }),
                        )),
                })}
                isLoading={isResting}
            />
        ))

    /*
     * SECTION 5 - the wallet. It always answers: `myWallet` creates the row on first read, so a new account
     * shows a real zero and there is no "not created yet" state to draw. The unpaid line states the
     * AMOUNT and the date it is owed by, never how many invoices there are.
     */
    const unpaid = INVOICES.find((invoice) => invoice.status === "unpaid")
    const balanceVnd = isEmpty ? wallet.new.data.balanceVnd : wallet.answered.data.balanceVnd

    const walletSection = defineContractProjection("label-row-over-card", () => (
        <SurfaceCard
            props={{
                label: t("wallet.title"),
                seeMoreLabel: isEmpty ? t("wallet.topUp") : t("wallet.viewTransactions"),
            }}
            on={{ seeMore: () => undefined }}
            contract="labelled-fact-stack"
            render={defineContractComponent("labelled-fact-stack", {
                fact: [
                    factRow(t("wallet.balanceLabel"), money(balanceVnd)),
                    factRow(
                        t("wallet.unpaidLabel"),
                        isEmpty || unpaid === undefined || unpaid.dueAt === null
                            ? t("wallet.noUnpaid")
                            : `${money(unpaid.amountVnd)} · ${t("wallet.dueAt", { date: day(unpaid.dueAt) })}`,
                    ),
                ],
            })}
            isLoading={isResting}
        />
    ))

    return (
        <Tree
            contract="titled-section-stack-page"
            render={defineContractComponent("titled-section-stack-page", {
                heading: titleRow(t("overview.title"), 1),
                /*
                 * READING ORDER IS THE PAGE'S ONE DECISION. The apps first because they are what the
                 * account is for; the wallet last because it talks about the four above it rather
                 * than standing beside them.
                 */
                section: [appsSection, agentOsSection, serversSection, domainsSection, walletSection],
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "page", world: "connected" } as const
