import { graphql, type Result } from "./graphql"

/**
 * Every console READ nivo-core publishes, typed once.
 *
 * WHY THIS FILE EXISTS AT ALL, when `auth.ts` next door already speaks to the same endpoint. That
 * file holds the credential exchange - nine mutations a person triggers. This one holds the screen's
 * questions: ten queries that run because a route was opened. They are separate for the reason the
 * transport is separate from both: a mutation is spent once and reported to the reader, a read is
 * repeated and drawn, and mixing them puts a submit handler and a page render in one module whose
 * failure modes do not resemble each other.
 *
 * ONE ROOT FIELD PER DOCUMENT, AND IT IS NOT A STYLE CHOICE. `graphql.ts` unwraps the envelope with
 * `Object.values(body.data)[0]`, so a document naming two `my*` fields silently discards the second -
 * a query that appears to have answered `undefined` rather than one that reported an error. Every
 * operation below therefore selects exactly one root field, and a caller that wants two makes two
 * calls.
 *
 * NOTHING HERE COUNTS ANYTHING, because nothing can. No `my*` query takes a limit or an offset except
 * `myExpertSiteLeads`, no response type declares a `total`, a `cursor` or a `hasMore`, and the
 * `metadata` every response carries is dropped by the transport before a caller sees it. A screen
 * that stated how many of something there are would be stating a number the browser computed over a
 * list it happens to hold, which is a different claim from the one it would appear to make.
 *
 * REFUSAL IS A RESULT, NOT AN EXCEPTION. `graphql` never throws; a refused operation comes back as
 * `{ ok: false, reason, code }`. Two of the queries below refuse in the ordinary course of business
 * rather than by accident - `myAcademySettings` throws when the account owns no app or more than one,
 * `myPodOpenclawStatus` throws when a workspace has no pod registered - and both are drawn beside
 * whatever else answered. A caller keys its sentence off `code`, which is the exception's
 * SCREAMING_SNAKE name, and never off `reason`, which is the server's own English operator sentence.
 *
 * THE NULLABILITY BELOW IS THE SCHEMA'S, NOT A GUESS. `DomainEntity.expiresAt`,
 * `AgentWorkspaceEntity.name`, `CatalogTierEntity.priceMonthlyVnd`, `CatalogItemEntity.tagline` and
 * `templateKey` are all nullable on the wire, and `InvoiceEntity.dueAt` is not. Two of the fields a
 * screen would naturally format - a date and an amount - are among the nullable ones, so a type that
 * flattered them would produce `Invalid Date` and `NaN ₫` rather than a type error.
 *
 * TWO STATUS FIELDS ARE NOT ENUMS. `AgentWorkspaceEntity.status` and `MyInstance.status` are plain
 * `String!` on the wire, so they are typed as `string` here rather than narrowed to a union this
 * module invented. Narrowing them would move the lie one layer up: a value outside the guessed union
 * would type-check and then reach a catalogue lookup as an undefined key.
 */

/** How far a provisioned expert site has got. A real enum with exactly five members. */
export type ExpertProvisionStatus =
    | "not_provisioned" | "provisioning" | "awaiting_dns" | "ready" | "failed"

/** Which lifecycle state an expert site is published in. */
export type ExpertSiteStatus = "draft" | "live" | "suspended"

/** One app this account owns, as `myExpertSites` puts it on the wire. */
export type ExpertSiteRow = {
    /** The row's identity, and the join key `MyInstance.detailId` carries. */
    readonly id: string
    /** The address fragment the app answers on. */
    readonly slug: string
    /** The address the customer bought, when they bought one. */
    readonly customDomain: string | null
    /** How far the build has got. */
    readonly provisionStatus: ExpertProvisionStatus
    /** Whether the site is published, apart from whether it is built. */
    readonly status: ExpertSiteStatus
}

/** One agent workspace. `myAgentWorkspace` returns a LIST despite the singular name. */
export type AgentWorkspaceRow = {
    /** The workspace's identity. */
    readonly id: string
    /** What the customer called it, when they called it anything. */
    readonly name: string | null
    /** Free-form on the wire: `String!`, not an enum. */
    readonly status: string
}

/** One running instance, which is the infrastructure view of an app or a workspace. */
export type InstanceRow = {
    /** The instance row's identity. */
    readonly id: string
    /** The template key this instance was built from; joins to `CatalogItemEntity.templateKey`. */
    readonly appKey: string
    /** The provisioned resource this instance belongs to; joins to `ExpertSiteRow.id`. */
    readonly detailId: string | null
    /** What the instance is called, when it is called anything. */
    readonly name: string | null
    /** The commercial plan it runs under. */
    readonly plan: string | null
    /** Memory, as the backend words it. */
    readonly ram: string | null
    /** Virtual cores. */
    readonly vcpu: number | null
    /** Free-form on the wire: `String!`, not an enum. */
    readonly status: string
}

/** How a held domain stands. */
export type DomainStatus = "active" | "expiring" | "expired"

/** One domain this account holds. */
export type DomainRow = {
    /** The row's identity. */
    readonly id: string
    /** The domain itself. */
    readonly name: string
    /** How it stands. */
    readonly status: DomainStatus
    /** When it lapses. NULLABLE on the wire, so a caller must not format it unguarded. */
    readonly expiresAt: string | null
    /** Whether it renews without anybody acting. */
    readonly autoRenew: boolean
}

/** The account's money. A single object rather than a list. */
export type WalletRow = {
    /** The wallet's identity. */
    readonly id: string
    /** The balance, in dong, as an integer. */
    readonly balanceVnd: number
}

/** Which direction money moved. */
export type WalletTransactionType = "deposit" | "spend"

/** One movement of money. */
export type WalletTransactionRow = {
    /** The movement's identity. */
    readonly id: string
    /** How much moved, in dong. The sign lives in {@link WalletTransactionRow.type}. */
    readonly amountVnd: number
    /** Which direction it went. */
    readonly type: WalletTransactionType
    /** What it was for, when the backend recorded anything. */
    readonly note: string | null
    /** When it happened. */
    readonly createdAt: string
}

/** What an order bought, as the two relations an order carries. */
export type OrderProduct = {
    /** The product. Nullable: the relation is `ON DELETE SET NULL`. */
    readonly catalogItem: { readonly id: string, readonly name: string } | null
    /** The rung of that product. Nullable for the same reason. */
    readonly catalogTier: { readonly id: string, readonly name: string } | null
}

/** How an invoice stands. */
export type InvoiceStatus = "unpaid" | "paid" | "cancelled"

/** One invoice raised against this account. */
export type InvoiceRow = {
    /** The invoice's identity. */
    readonly id: string
    /** How much is owed, in dong. */
    readonly amountVnd: number
    /** Whether it is settled. */
    readonly status: InvoiceStatus
    /** When it falls due. NON-null on the wire. */
    readonly dueAt: string
    /** When it was settled, when it was. */
    readonly paidAt: string | null
    /** What it was raised for, when the order still exists. */
    readonly catalogOrder: ({ readonly id: string } & OrderProduct) | null
}

/** How far an order has got. */
export type CatalogOrderStatus =
    | "active" | "cancelled" | "completed" | "in_progress" | "pending_payment" | "suspended"

/** One order, which is a thing paid for that may not have become a resource yet. */
export type CatalogOrderRow = {
    /** The order's identity. */
    readonly id: string
    /** How far it has got. */
    readonly status: CatalogOrderStatus
} & OrderProduct

/** One rung of a buyable product. */
export type CatalogTierRow = {
    /** The rung's identity. */
    readonly id: string
    /** The machine name of the rung. */
    readonly tierKey: string
    /** What the seller calls it. */
    readonly name: string
    /** The monthly price in dong. NULLABLE - a one-time rung publishes none. */
    readonly priceMonthlyVnd: number | null
    /** Where the rung sits in the seller's own order. */
    readonly orderIndex: number
}

/** One buyable product, as the public catalogue publishes it. */
export type CatalogItemRow = {
    /** The product's identity. */
    readonly id: string
    /** Its address fragment. */
    readonly slug: string
    /** What the seller calls it. */
    readonly name: string
    /** The seller's own sentence about it. */
    readonly tagline: string | null
    /** The template an app built from this product runs; joins to `InstanceRow.appKey`. */
    readonly templateKey: string | null
    /** Its rungs, when it is tiered. */
    readonly tiers: ReadonlyArray<CatalogTierRow> | null
}

/** Whether an agent workspace's pod is answering. The query that refuses when there is no pod. */
export type PodStatusRow = {
    /** Whether the pod answered at all. */
    readonly reachable: boolean
    /** What it answered with, when it answered. */
    readonly httpStatus: number | null
    /** Whether a token is configured for it. */
    readonly tokenConfigured: boolean
    /** Enough of the token to recognise it, never the token. */
    readonly tokenHint: string | null
    /** When the check ran. */
    readonly checkedAt: string
}

/** Which slice of the catalogue a caller wants. */
export type CatalogCategory =
    | "ai_agent" | "digital_identity" | "launch_ai" | "migration"
    | "ready_made_site" | "site_from_template"

/** The fields an app row needs, and no relation it would have to load. */
const EXPERT_SITE = "{ id slug customDomain provisionStatus status }"

/** The fields a workspace row needs. */
const AGENT_WORKSPACE = "{ id name status }"

/** The fields an instance row needs, including the shape the plan record wrongly called absent. */
const INSTANCE = "{ id appKey detailId name plan ram vcpu status }"

/** The fields a domain row needs. */
const DOMAIN = "{ id name status expiresAt autoRenew }"

/** The wallet, which is one figure and its identity. */
const WALLET = "{ id balanceVnd }"

/** One movement of money. */
const WALLET_TRANSACTION = "{ id amountVnd type note createdAt }"

/**
 * What an order bought. Shared, because an invoice reaches the same two relations through it.
 *
 * IT CARRIES NO BRACES OF ITS OWN, and the omission is the whole reason it is written out here. Every
 * other fragment on this page is a complete selection SET spliced in where a set is expected; this
 * one is spliced INSIDE one, beside `id`. Wrapped in braces it would read as a selection on the field
 * before it - `id { catalogItem ... }` - and the server refuses that with "Field `id` must not have a
 * selection", which is a document error rather than anything a caller could see coming.
 */
const ORDER_PRODUCT = "catalogItem { id name } catalogTier { id name }"

/** One invoice, with the order it was raised for. */
const INVOICE = `{ id amountVnd status dueAt paidAt catalogOrder { id ${ORDER_PRODUCT} } }`

/** One order. */
const CATALOG_ORDER = `{ id status ${ORDER_PRODUCT} }`

/** One buyable product and its rungs. */
const CATALOG_ITEM = "{ id slug name tagline templateKey tiers { id tierKey name priceMonthlyVnd orderIndex } }"

/** The pod check. */
const POD_STATUS = "{ reachable httpStatus tokenConfigured tokenHint checkedAt }"

/**
 * The apps this account owns.
 *
 * PLURAL SINCE TODAY, which is what makes the app set a set rather than a folder with one thing in
 * it: one customer can already own two academies.
 *
 * @returns Every app, or why there is none.
 */
export const myExpertSites = (): Promise<Result<ReadonlyArray<ExpertSiteRow>>> =>
    graphql(`query MyExpertSites { myExpertSites { data ${EXPERT_SITE} message success error } }`)

/**
 * The agent workspaces this account owns.
 *
 * SINGULAR NAME, LIST PAYLOAD. The field is `myAgentWorkspace` and it answers `[AgentWorkspaceEntity!]`.
 * A caller that typed it as one object would read `undefined` off an array on the first account that
 * owns one.
 *
 * @returns Every workspace, or why there is none.
 */
export const myAgentWorkspace = (): Promise<Result<ReadonlyArray<AgentWorkspaceRow>>> =>
    graphql(`query MyAgentWorkspace { myAgentWorkspace { data ${AGENT_WORKSPACE} message success error } }`)

/**
 * The running instances behind this account's apps and workspaces.
 *
 * @returns Every instance, or why there is none.
 */
export const myInstances = (): Promise<Result<ReadonlyArray<InstanceRow>>> =>
    graphql(`query MyInstances { myInstances { data ${INSTANCE} message success error } }`)

/**
 * The domains this account holds, soonest expiry first as the handler orders them.
 *
 * @returns Every domain, or why there is none.
 */
export const myDomains = (): Promise<Result<ReadonlyArray<DomainRow>>> =>
    graphql(`query MyDomains { myDomains { data ${DOMAIN} message success error } }`)

/**
 * The account's balance.
 *
 * @returns The wallet, or why there is none.
 */
export const myWallet = (): Promise<Result<WalletRow>> =>
    graphql(`query MyWallet { myWallet { data ${WALLET} message success error } }`)

/**
 * Every movement of money, newest first.
 *
 * @returns The movements, or why there are none.
 */
export const myWalletTransactions = (): Promise<Result<ReadonlyArray<WalletTransactionRow>>> =>
    graphql(`query MyWalletTransactions { myWalletTransactions { data ${WALLET_TRANSACTION} message success error } }`)

/**
 * Every invoice, newest first.
 *
 * THE ONE HANDLER THAT LOADS BOTH ORDER RELATIONS, which is why an invoice is the only row on the
 * console that can legitimately name the product and the rung it was raised for.
 *
 * @returns The invoices, or why there are none.
 */
export const myInvoices = (): Promise<Result<ReadonlyArray<InvoiceRow>>> =>
    graphql(`query MyInvoices { myInvoices { data ${INVOICE} message success error } }`)

/**
 * Every order, including the ones paid for and not yet built.
 *
 * @returns The orders, or why there are none.
 */
export const myCatalogOrders = (): Promise<Result<ReadonlyArray<CatalogOrderRow>>> =>
    graphql(`query MyCatalogOrders { myCatalogOrders { data ${CATALOG_ORDER} message success error } }`)

/**
 * The buyable products in one slice of the catalogue.
 *
 * THE ONE QUERY HERE THAT NEEDS NO CREDENTIAL. It answers for a signed-out reader too, which is why
 * a catalogue that returns nothing is a real answer rather than a sign of a lost session.
 *
 * @param category - Which slice to read.
 * @returns The products, or why there are none.
 */
export const catalogItems = (category: CatalogCategory): Promise<Result<ReadonlyArray<CatalogItemRow>>> =>
    graphql(
        `query CatalogItems($category: CatalogCategory) { catalogItems(category: $category) { data ${CATALOG_ITEM} message success error } }`,
        { category },
    )

/**
 * Whether the agent workspace's pod is answering.
 *
 * IT REFUSES IN THE ORDINARY COURSE OF BUSINESS. An account with no workspace, or a workspace with
 * no pod registered, gets `AGENT_WORKSPACE_NOT_FOUND_EXCEPTION` or `POD_REGISTRATION_MISSING_EXCEPTION`
 * rather than a payload - which is the fourth state the console draws beside the part that answered,
 * not a fault to retry.
 *
 * @returns The pod check, or why it could not be made.
 */
export const myPodOpenclawStatus = (): Promise<Result<PodStatusRow>> =>
    graphql(`query MyPodOpenclawStatus { myPodOpenclawStatus { data ${POD_STATUS} message success error } }`)
