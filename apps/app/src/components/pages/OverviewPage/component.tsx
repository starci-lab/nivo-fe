import {
    Badge,
    Button,
    Heading,
    SurfaceCard,
    Text,
    TextLink,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import { FleetRow, type FleetStatus } from "@/components/blocks/provisioning/FleetRow"

/**
 * PAGE (drawing half) - the console's home, five sections, one per service.
 *
 * IT ORDERS THE SECTIONS AND NOTHING ELSE. Each section asks its own query and answers at its own
 * moment, so they are read straight down at one seam and none is nested inside another - a section
 * drawn inside its neighbour makes one refusal look like the whole page failing.
 *
 * FOUR SITUATIONS PER SECTION, AND THE FOURTH IS REAL. A screen wired to real queries is not one
 * screen with a spinner: it is resting, empty, answered and refused, independently per subject.
 * `myPodOpenclawStatus` throws rather than answers when a workspace has no pod, and the transport
 * turns that throw into a successful field carrying a failed envelope - so the refusal is a RESULT
 * drawn beside whatever did answer, not an incident.
 *
 * IT RESOLVES NOTHING AND FORMATS NOTHING. Every word and every figure arrives finished.
 * `presentational-purity` refuses `useTranslations`, `useLocale` AND `useFormatter` here, and the
 * last one is the reason the split is larger than it looks: money is an Int and a date is an ISO
 * string on the wire, so whoever formats them is the half that knows the served locale and time zone
 * - `index.tsx`, one file away.
 *
 * IT WRITES NO LAYOUT CLASS. `titled-section-stack-page` owns the measure and the seam,
 * `label-row-over-card` owns the label sitting outside the surface, and `SurfaceCard` owns the
 * ground. This file types keys.
 *
 * NO COUNT ANYWHERE. No count query exists in the schema and no `my*` response declares a total, so
 * the apps section names its first members and says nothing about the rest. The way out - the link
 * into the app set - is what carries that, rather than a number.
 *
 * A DELIBERATE ABSENCE IS DRAWN DIFFERENTLY FROM AN UNBOUGHT ONE. The servers and domains sections
 * say one sentence in the column their rows would have used - no ground, no mark, no centring, no
 * press - because an absence drawn like an empty notice reads as an invitation, and neither of these
 * is one. That is exactly the leaf `text` body `label-row-over-card` admits.
 */

/** One app the account owns, with every word already chosen. */
export type ConsoleAppRow = {
    /** The row's identity, and its React key. */
    readonly id: string
    /** What the app is called. */
    readonly name: string
    /** The address a customer would type. */
    readonly detail: string
    /** Which template it was built from, or the generic word when the join found nothing. */
    readonly kindLabel: string
    /** How far the build has got. Drives the tone `FleetRow` owns. */
    readonly status: FleetStatus
    /** That state in the reader's words. */
    readonly statusLabel: string
    /** The one thing this row's state permits. */
    readonly actionLabel: string
}

/** One buyable template, with every word and every figure already chosen. */
export type ConsoleOfferRow = {
    /** The row's identity, and its React key. */
    readonly id: string
    /** What the seller calls the template. */
    readonly name: string
    /** The seller's own sentence about it. */
    readonly tagline: string
    /** The word for what kind of thing this is. */
    readonly kindLabel: string
    /** The cheapest rung, already formatted as money in the reader's locale. */
    readonly priceLabel: string
    /** The words on the one press an offer carries. */
    readonly actionLabel: string
}

/** One agent workspace, with every word already chosen. */
export type ConsoleWorkspaceRow = {
    /** The row's identity, and its React key. */
    readonly id: string
    /** What the workspace is called. */
    readonly name: string
    /** The word for what kind of thing this is. */
    readonly kindLabel: string
    /** How it stands. Drives the tone `FleetRow` owns. */
    readonly status: FleetStatus
    /** That state in the reader's words. */
    readonly statusLabel: string
}

/** One label-and-figure line about one object. */
export type ConsoleFactRow = {
    /** The line's identity, and its React key. */
    readonly id: string
    /** What the figure is. */
    readonly label: string
    /** The figure, already formatted. */
    readonly value: string
}

/**
 * The apps section: the only one that summarises a SET rather than one subject.
 *
 * The empty arm carries the catalogue rather than a button, so a newcomer meets exactly the list they
 * will come back to for their second app.
 */
export type AppsSectionView =
    | { readonly phase: "resting", readonly label: string, readonly openSetLabel: string }
    | {
        readonly phase: "empty"
        readonly label: string
        readonly fact: string
        readonly offers: ReadonlyArray<ConsoleOfferRow>
    }
    | {
        readonly phase: "answered"
        readonly label: string
        readonly openSetLabel: string
        readonly rows: ReadonlyArray<ConsoleAppRow>
    }
    | { readonly phase: "refused", readonly label: string, readonly note: string }

/**
 * The AgentOS section: the one that draws a refusal beside an answer.
 *
 * The refused arm carries rows as well as a note, because the workspace can answer while the pod read
 * does not - which is the whole reason `body-with-refusal-note` has an optional `answered` slot.
 */
export type AgentOsSectionView =
    | { readonly phase: "resting", readonly label: string, readonly openLabel: string }
    | {
        readonly phase: "empty"
        readonly label: string
        readonly plansLabel: string
        readonly message: string
    }
    | {
        readonly phase: "answered"
        readonly label: string
        readonly openLabel: string
        readonly rows: ReadonlyArray<ConsoleWorkspaceRow>
    }
    | {
        readonly phase: "refused"
        readonly label: string
        readonly openLabel: string
        readonly note: string
        readonly rows: ReadonlyArray<ConsoleWorkspaceRow>
    }

/**
 * The servers section, which has one shape in every situation.
 *
 * There is no query behind it to be waiting on: nivo sells no standalone server, and this is the
 * infrastructure view of the apps and workspaces above.
 */
export type ServersSectionView = {
    /** The section's name. */
    readonly label: string
    /** The one sentence it says. */
    readonly note: string
}

/** The domains section: a name and a date, drawn as label-and-figure lines rather than as rows. */
export type DomainsSectionView =
    | { readonly phase: "resting", readonly label: string }
    | { readonly phase: "empty", readonly label: string, readonly note: string }
    | {
        readonly phase: "answered"
        readonly label: string
        readonly facts: ReadonlyArray<ConsoleFactRow>
    }
    | { readonly phase: "refused", readonly label: string, readonly note: string }

/**
 * The wallet section: one account's money across all four services.
 *
 * The empty arm is a real zero rather than an absence - `myWallet` creates the row on first read - so
 * it differs from the answered arm only in where its way out leads.
 */
export type WalletSectionView =
    | { readonly phase: "resting", readonly label: string, readonly actionLabel: string }
    | {
        readonly phase: "empty"
        readonly label: string
        readonly actionLabel: string
        readonly facts: ReadonlyArray<ConsoleFactRow>
    }
    | {
        readonly phase: "answered"
        readonly label: string
        readonly actionLabel: string
        readonly facts: ReadonlyArray<ConsoleFactRow>
    }
    | { readonly phase: "refused", readonly label: string, readonly note: string }

/** The journeys this page reports back to the half that owns the router. */
export type OverviewPageActions = {
    /** Called when the reader follows the way out of the apps section. */
    readonly openApps?: () => void
    /** Called when the reader follows the way out of the wallet section. */
    readonly openWallet?: () => void
}

/** Props for {@link _OverviewPage}. */
export interface OverviewPageViewProps {
    /** The page's own name. */
    readonly title: string
    /** The apps section's settled situation. */
    readonly apps: AppsSectionView
    /** The AgentOS section's settled situation. */
    readonly agentOs: AgentOsSectionView
    /** The servers section, which has only one. */
    readonly servers: ServersSectionView
    /** The domains section's settled situation. */
    readonly domains: DomainsSectionView
    /** The wallet section's settled situation. */
    readonly wallet: WalletSectionView
    /** Where the two ways out lead. */
    readonly on?: OverviewPageActions
}

/**
 * One resting row, which is the real row asked to rest as itself.
 *
 * KNOWN RESTING GAP, RECORDED RATHER THAN PATCHED: `FleetRow` threads `isLoading` to the handle and
 * the action only - neither badge takes it - so a resting row paints two empty chips. That is
 * `FleetRow`'s own gap rather than this page's, and folding the flag into its badges is a fidelity
 * fix outside this case's boundary.
 *
 * @param index - Which resting row this is, so the run has stable keys.
 * @returns The resting row, bound to the slot's composite identity.
 */
const restingRow = (index: number) => defineCompositeComponent("fleet-row", {}, () => (
    <FleetRow props={{ id: `resting-${index}`, kind: "site", kindLabel: "", status: "provisioning" }} isLoading />
))

/**
 * One app the account owns.
 *
 * @param row - The already-worded row.
 * @returns The row, bound to the slot's composite identity.
 */
const appRow = (row: ConsoleAppRow) => defineCompositeComponent("fleet-row", {}, () => (
    <FleetRow
        props={{
            id: row.id,
            name: row.name,
            detail: row.detail,
            kind: "site",
            kindLabel: row.kindLabel,
            status: row.status,
            statusLabel: row.statusLabel,
            actionLabel: row.actionLabel,
        }}
    />
))

/**
 * One agent workspace.
 *
 * @param row - The already-worded row.
 * @returns The row, bound to the slot's composite identity.
 */
const workspaceRow = (row: ConsoleWorkspaceRow) => defineCompositeComponent("fleet-row", {}, () => (
    <FleetRow
        props={{
            id: row.id,
            name: row.name,
            kind: "workspace",
            kindLabel: row.kindLabel,
            status: row.status,
            statusLabel: row.statusLabel,
        }}
    />
))

/**
 * One buyable template, drawn in the same joined surface as the apps already owned.
 *
 * WHY IT IS NOT `identity-kind-status-action-row`. A thing that can be BOUGHT carries a price and
 * exactly one press; a thing already owned carries a lifecycle whose tone changes underneath it.
 * Putting an amount of money in the status slot would make it read as a state a resource can be in,
 * which is the relationship that row's own `why` exists to protect.
 *
 * KNOWN DUPLICATION, RECORDED RATHER THAN HIDDEN. The identical tree is written again in
 * `AppsPage/component.tsx`. Its home is a block of its own - `components/blocks/console/TemplateOfferRow/`
 * - and that path is outside this case's approved write boundary, so the extraction is reported
 * rather than taken.
 *
 * @param row - The already-worded offer.
 * @returns The row, bound to the slot's composite identity.
 */
const offerRow = (row: ConsoleOfferRow) => defineCompositeComponent("template-offer-row", {}, () => (
    <Tree
        contract="template-offer-row"
        render={defineContractComponent("template-offer-row", {
            identity: defineContractComponent("name-over-handle", {
                name: defineLeafComponent("text-link", { size: "sm" }, () => (
                    <TextLink props={{ label: row.name, size: "sm" }} />
                )),
                handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: row.tagline, size: "xs", tone: "muted" }} />
                )),
            }),
            kind: defineLeafComponent("badge", { tone: "neutral" }, () => (
                <Badge props={{ content: row.kindLabel, tone: "neutral" }} />
            )),
            price: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: row.priceLabel, size: "sm" }} />
            )),
            action: defineLeafComponent("button", {}, () => (
                <Button props={{ label: row.actionLabel, size: "sm", variant: "primary" }} />
            )),
        })}
    />
))

/**
 * One label-and-figure line.
 *
 * @param row - The already-formatted line.
 * @param isLoading - Whether the figure is still being waited on.
 * @returns The line, bound to its contract identity.
 */
const factRow = (row: ConsoleFactRow, isLoading: boolean) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => (
        <Text props={{ content: row.label, size: "sm" }} isLoading={isLoading} />
    )),
    value: defineLeafComponent("text", { size: "sm" }, () => (
        <Text props={{ content: row.value, size: "sm" }} isLoading={isLoading} />
    )),
})

/** The two lines a resting fact stack draws before it knows what it holds. */
const RESTING_FACTS: ReadonlyArray<ConsoleFactRow> = [
    { id: "resting-1", label: "", value: "" },
    { id: "resting-2", label: "", value: "" },
]

/**
 * A section that says one sentence in the column its content would have used.
 *
 * @param label - The section's name.
 * @param note - The sentence.
 * @returns The section, bound to its contract identity.
 */
const sentenceSection = (label: string, note: string) => defineContractComponent("label-row-over-card", {
    label: defineContractComponent("title-with-end-action", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: label, level: 3 }} />),
    }),
    body: defineLeafComponent("text", {}, () => (
        <Text props={{ content: note, size: "sm", tone: "muted" }} />
    )),
})

/**
 * A section whose subject was REFUSED rather than empty.
 *
 * The server's own already-translated sentence sits left-aligned on the section's ground, because a
 * refusal is prose the reader is meant to act on rather than a centred absence.
 *
 * @param label - The section's name.
 * @param note - The refusal, in the reader's words.
 * @returns The section, bound to its contract identity.
 */
const refusedSection = (label: string, note: string) => defineContractProjection("label-row-over-card", () => (
    <SurfaceCard
        props={{ label }}
        contract="body-with-refusal-note"
        render={defineContractComponent("body-with-refusal-note", {
            note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: note, size: "sm", tone: "muted" }} />
            )),
        })}
    />
))

/**
 * The console's home, drawn from a settled situation per section.
 *
 * @param input - {@link OverviewPageViewProps}
 * @returns The page node.
 */
export const _OverviewPage = ({ title, apps, agentOs, servers, domains, wallet, on }: OverviewPageViewProps) => {
    /*
     * SECTION 1 - the apps. The only section that summarises a SET rather than one subject, which is
     * why its way out is a destination and not a detail.
     */
    const appsSection = () => {
        if (apps.phase === "refused") {
            return refusedSection(apps.label, apps.note)
        }
        if (apps.phase === "empty") {
            return defineContractProjection("label-row-over-card", () => (
                <SurfaceCard
                    props={{ label: apps.label, fact: apps.fact }}
                    contract="fleet-resource-list"
                    render={defineContractComponent("fleet-resource-list", {
                        /*
                         * THE OFFER IS THE CATALOGUE, NOT A HARDCODED BUTTON. A newcomer meets exactly
                         * the list they will come back to for their second app, so the middle level is
                         * not a thing they have to learn twice - and template #2 appears here with no
                         * screen, route or rail change.
                         */
                        resource: apps.offers.map(offerRow),
                    })}
                />
            ))
        }
        const isResting = apps.phase === "resting"
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: apps.label, seeMoreLabel: apps.openSetLabel }}
                on={{ seeMore: on?.openApps }}
                contract="fleet-resource-list"
                render={defineContractComponent("fleet-resource-list", {
                    resource: apps.phase === "answered"
                        ? apps.rows.map(appRow)
                        : [restingRow(1), restingRow(2)],
                })}
                isLoading={isResting}
            />
        ))
    }

    /*
     * SECTION 2 - AgentOS. The one section that draws a refusal, because `myPodOpenclawStatus` is the
     * query that throws: the workspace answered, the pod read did not, and the refusal sits BESIDE
     * the part that answered rather than replacing it with a centred apology.
     */
    const agentOsSection = () => {
        if (agentOs.phase === "empty") {
            return defineContractProjection("label-row-over-card", () => (
                <SurfaceCard
                    props={{ label: agentOs.label, seeMoreLabel: agentOs.plansLabel }}
                    on={{ seeMore: undefined }}
                    contract="centred-empty-notice"
                    render={defineContractComponent("centred-empty-notice", {
                        notice: defineCompositeComponent("empty-notice", {}, () => (
                            <EmptyNotice props={{ message: agentOs.message }} />
                        )),
                    })}
                />
            ))
        }
        if (agentOs.phase === "refused") {
            const rows = agentOs.rows
            return defineContractProjection("label-row-over-card", () => (
                <SurfaceCard
                    props={{ label: agentOs.label }}
                    contract="body-with-refusal-note"
                    render={defineContractComponent("body-with-refusal-note", {
                        /*
                         * THE ANSWERED HALF IS OMITTED WHEN THERE IS NONE. A refusal that reached the
                         * whole section draws its sentence alone; a refusal that reached one query of
                         * two draws it beside the rows that came back.
                         */
                        ...(rows.length === 0 ? {} : {
                            answered: defineContractComponent("fleet-resource-list", {
                                resource: rows.map(workspaceRow),
                            }),
                        }),
                        note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text props={{ content: agentOs.note, size: "sm", tone: "muted" }} />
                        )),
                    })}
                />
            ))
        }
        const isResting = agentOs.phase === "resting"
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: agentOs.label, seeMoreLabel: agentOs.openLabel }}
                on={{ seeMore: undefined }}
                contract="fleet-resource-list"
                render={defineContractComponent("fleet-resource-list", {
                    resource: agentOs.phase === "answered"
                        ? agentOs.rows.map(workspaceRow)
                        : [restingRow(3)],
                })}
                isLoading={isResting}
            />
        ))
    }

    /*
     * SECTION 3 - the servers. It answers the same way in every situation, because there is no query
     * behind it to be waiting on. One sentence, no ground, no press.
     */
    const serversSection = sentenceSection(servers.label, servers.note)

    /*
     * SECTION 4 - the domains. Drawn as label-and-figure lines rather than as fleet rows: a domain is
     * a name and a date, not a provisioned resource with a lifecycle anybody can act on, and
     * `FleetRow`'s kind union has no member for one.
     */
    const domainsSection = () => {
        if (domains.phase === "empty") {
            return sentenceSection(domains.label, domains.note)
        }
        if (domains.phase === "refused") {
            return refusedSection(domains.label, domains.note)
        }
        const isResting = domains.phase === "resting"
        const facts = domains.phase === "answered" ? domains.facts : RESTING_FACTS
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: domains.label }}
                contract="labelled-fact-stack"
                render={defineContractComponent("labelled-fact-stack", {
                    fact: facts.map((row) => factRow(row, isResting)),
                })}
                isLoading={isResting}
            />
        ))
    }

    /*
     * SECTION 5 - the wallet. It always answers: `myWallet` creates the row on first read, so a new
     * account shows a real zero and there is no "not created yet" state to draw. The unpaid line
     * states the AMOUNT and the date it is owed by, never how many invoices there are.
     */
    const walletSection = () => {
        if (wallet.phase === "refused") {
            return refusedSection(wallet.label, wallet.note)
        }
        const isResting = wallet.phase === "resting"
        const facts = wallet.phase === "resting" ? RESTING_FACTS : wallet.facts
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: wallet.label, seeMoreLabel: wallet.actionLabel }}
                on={{ seeMore: on?.openWallet }}
                contract="labelled-fact-stack"
                render={defineContractComponent("labelled-fact-stack", {
                    fact: facts.map((row) => factRow(row, isResting)),
                })}
                isLoading={isResting}
            />
        ))
    }

    return (
        <Tree
            contract="titled-section-stack-page"
            render={defineContractComponent("titled-section-stack-page", {
                heading: defineContractComponent("title-with-end-action", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 1 }} />),
                }),
                /*
                 * READING ORDER IS THE PAGE'S ONE DECISION. The apps first because they are what the
                 * account is for; the wallet last because it talks about the four above it rather
                 * than standing beside them.
                 */
                section: [
                    appsSection(),
                    agentOsSection(),
                    serversSection,
                    domainsSection(),
                    walletSection(),
                ],
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "page", world: "pure" } as const
