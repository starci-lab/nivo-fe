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
    /** Catalog order this workspace fulfills; the stable bridge from order events to workspace events. */
    readonly catalogOrder: { readonly id: string } | null
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

/** Gateway-supported evidence returned when a wallet top-up checkout is created. */
export type WalletTopUpPayLink = {
    readonly paymentId: string
    readonly gateway: "payos" | "sepay"
    readonly referenceId: string
    readonly checkoutUrl: string
    readonly qrCode: string | null
    readonly checkoutFields: string | null
    readonly amountVnd: number
    readonly chargedAmountVnd: number
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

/** One customer-safe application capability inside an AgentOS workspace. */
export type AgentWorkspaceAppCapability = {
    readonly app: "OPENCLAW" | "N8N"
    readonly accessMode: "NIVO_CONSOLE" | "EXTERNAL_LAUNCH" | "UNAVAILABLE"
    readonly available: boolean
    readonly reason: string | null
    readonly observedVersion: string | null
}

/** Resource values and health reported for one Helm component. */
export type AgentWorkspaceRuntimeComponent = {
    readonly key: string
    readonly kind: string
    readonly status: string
    readonly desiredReplicas: number | null
    readonly readyReplicas: number | null
    readonly image: string | null
    readonly pvcSize: string | null
    readonly storagePolicy: string | null
    readonly cpuUsageMillicores: number | null
    readonly cpuRequestMillicores: number | null
    readonly cpuLimitMillicores: number | null
    readonly memoryUsageBytes: number | null
    readonly memoryRequestBytes: number | null
    readonly memoryLimitBytes: number | null
    readonly restartCount: number
    readonly lastTerminationReason: string | null
    readonly oomKilled: boolean
    readonly throttled: boolean | null
}

/** Persistent volume projected from the workspace Helm release. */
export type AgentWorkspaceRuntimeStorage = {
    readonly key: string
    readonly kind: string
    readonly size: string | null
    readonly policy: string | null
    readonly status: string
}

/** Aggregate usage, requests and limits across the workspace. */
export type AgentWorkspaceRuntimeTotals = {
    readonly cpuUsageMillicores: number | null
    readonly cpuRequestMillicores: number
    readonly cpuLimitMillicores: number
    readonly memoryUsageBytes: number | null
    readonly memoryRequestBytes: number
    readonly memoryLimitBytes: number
    readonly restartCount: number
    readonly oomKilled: boolean
    readonly throttled: boolean | null
}

/** Latest persisted probe of one AgentOS Helm release. */
export type AgentWorkspaceRuntime = {
    readonly instanceId: string
    readonly appKey: string
    readonly status: string
    readonly releaseName: string | null
    readonly chartName: string | null
    readonly chartVersion: string | null
    readonly components: ReadonlyArray<AgentWorkspaceRuntimeComponent>
    readonly storage: ReadonlyArray<AgentWorkspaceRuntimeStorage>
    readonly totals: AgentWorkspaceRuntimeTotals
    readonly probeStatus: "available" | "partial" | "unavailable"
    readonly fingerprint: string
    readonly lastError: string | null
    readonly observedAt: string
    readonly stale: boolean
}

/** Owner-scoped aggregate used by the AgentOS workspace control center. */
export type AgentWorkspaceControlCenter = {
    readonly workspace: {
        readonly id: string
        readonly name: string | null
        readonly status: string
        readonly externalWorkspaceRef: string | null
    }
    readonly instance: {
        readonly id: string
        readonly name: string
        readonly hostname: string
        readonly status: string
        readonly chartVersion: string
        readonly ramMb: number
        readonly vcpu: number
        readonly planCode: string | null
        readonly planRamGb: number | null
        readonly planVcpu: number | null
    }
    readonly apps: ReadonlyArray<AgentWorkspaceAppCapability>
    readonly runtime: AgentWorkspaceRuntime | null
}

/** Immutable AgentOS solution package offered by the Nivo catalog. */
export type AgentosSolutionModule = {
    readonly key: "multichannel-chatbot" | "sales-copilot"
    readonly version: string
    readonly name: string
    readonly summary: string
    readonly agentRoles: ReadonlyArray<string>
    readonly channelRoles: ReadonlyArray<string>
    readonly safetyMode: string
}

/** Owner-scoped lifecycle row for one installed solution package. */
export type AgentosModuleInstallation = {
    readonly id: string
    readonly agentWorkspaceId: string
    readonly moduleKey: string
    readonly moduleVersion: string
    readonly status: string
    readonly failureCode: string | null
    readonly createdAt: string
    readonly updatedAt: string
}

/** Canonical detail snapshot for one installed AgentOS solution package. */
export type AgentosModuleInstallationDetail = {
    readonly id: string
    readonly agentWorkspaceId: string
    readonly moduleKey: string
    readonly moduleVersion: string
    readonly status: string
    readonly sagaId: string | null
    readonly generatedAgentIds: ReadonlyArray<string>
    readonly sharedKnowledgeSourceIds: ReadonlyArray<string>
    readonly channelAccountRefs: ReadonlyArray<string>
    readonly commonKnowledgeVersion: string
    readonly privateKnowledgeVersion: string
    readonly failureCode: string | null
}

/** Customer choice required to start one immutable solution-module installation. */
export type InstallAgentosSolutionModuleInput = {
    readonly agentWorkspaceId: string
    readonly moduleKey: AgentosSolutionModule["key"]
    readonly idempotencyKey: string
}

/** One credential-free callback grant for opening a workspace application. */
export type AgentWorkspaceAppLaunch = {
    readonly launchId: string
    readonly redirectUrl: string
    readonly expiresAt: string
}

/** Updated expiry returned after the main Nivo window renews a launch lease. */
export type RenewedAgentWorkspaceAppLaunch = {
    readonly launchId: string
    readonly expiresAt: string
}

/** Which slice of the catalogue a caller wants. */
export type CatalogCategory =
    | "ai_agent" | "digital_identity" | "launch_ai" | "migration"
    | "ready_made_site" | "site_from_template"

/** The fields an app row needs, and no relation it would have to load. */
const EXPERT_SITE = "{ id slug customDomain provisionStatus status }"

/** The fields a workspace row needs. */
const AGENT_WORKSPACE = "{ id name status catalogOrder { id } }"

/** The fields an instance row needs, including the shape the plan record wrongly called absent. */
const INSTANCE = "{ id appKey detailId name plan ram vcpu status }"

/** The fields a domain row needs. */
const DOMAIN = "{ id name status expiresAt autoRenew }"

/** The wallet, which is one figure and its identity. */
const WALLET = "{ id balanceVnd }"

/** One movement of money. */
const WALLET_TRANSACTION = "{ id amountVnd type note createdAt }"
const WALLET_TOP_UP_PAY_LINK = "{ paymentId gateway referenceId checkoutUrl qrCode checkoutFields amountVnd chargedAmountVnd }"

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

/** Create one real gateway checkout. Settlement remains owned by the provider IPN. */
export const createWalletTopUpPayLink = (
    amountVnd: number,
    returnUrl: string,
    cancelUrl: string,
): Promise<Result<WalletTopUpPayLink>> =>
    graphql(
        `mutation CreateWalletTopUpPayLink($input: CreateWalletTopUpPayLinkInput!) {
            createWalletTopUpPayLink(input: $input) { data ${WALLET_TOP_UP_PAY_LINK} message success error }
        }`,
        { input: { amountVnd, gateway: "sepay", returnUrl, cancelUrl } },
    )

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
 * Settle one invoice owned by the current account.
 *
 * @param invoiceId - The unpaid invoice to settle from wallet balance.
 * @returns The canonical paid invoice, or why settlement was refused.
 */
export const payInvoice = (invoiceId: string): Promise<Result<InvoiceRow>> =>
    graphql(
        `mutation PayInvoice($input: PayInvoiceInput!) { payInvoice(input: $input) { data ${INVOICE} message success error } }`,
        { input: { invoiceId } },
    )

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

/** Fetch one exact workspace control center; the backend enforces viewer ownership. */
export const myAgentWorkspaceControlCenter = (workspaceId: string): Promise<Result<AgentWorkspaceControlCenter>> =>
    graphql(
        `query MyAgentWorkspaceControlCenter($workspaceId: ID!) {
            myAgentWorkspaceControlCenter(workspaceId: $workspaceId) {
                data {
                    workspace { id name status externalWorkspaceRef }
                    instance { id name hostname status chartVersion ramMb vcpu planCode planRamGb planVcpu }
                    apps { app accessMode available reason observedVersion }
                    runtime {
                        instanceId appKey status releaseName chartName chartVersion probeStatus fingerprint lastError observedAt stale
                        components {
                            key kind status desiredReplicas readyReplicas image pvcSize storagePolicy
                            cpuUsageMillicores cpuRequestMillicores cpuLimitMillicores
                            memoryUsageBytes memoryRequestBytes memoryLimitBytes
                            restartCount lastTerminationReason oomKilled throttled
                        }
                        storage { key kind size policy status }
                        totals {
                            cpuUsageMillicores cpuRequestMillicores cpuLimitMillicores
                            memoryUsageBytes memoryRequestBytes memoryLimitBytes
                            restartCount oomKilled throttled
                        }
                    }
                }
                message success error
            }
        }`,
        { workspaceId },
    )

/** Read the immutable AgentOS solution-module catalog. */
export const myAgentosSolutionModules = (): Promise<Result<ReadonlyArray<AgentosSolutionModule>>> =>
    graphql(`query MyAgentosSolutionModules {
        myAgentosSolutionModules {
            data { key version name summary agentRoles channelRoles safetyMode }
            message success error
        }
    }`)

/** Read installations belonging to one exact owner-scoped AgentOS workspace. */
export const myAgentosModuleInstallations = (agentWorkspaceId: string): Promise<Result<ReadonlyArray<AgentosModuleInstallation>>> =>
    graphql(
        `query MyAgentosModuleInstallations($agentWorkspaceId: ID!) {
            myAgentosModuleInstallations(agentWorkspaceId: $agentWorkspaceId) {
                data { id agentWorkspaceId moduleKey moduleVersion status failureCode createdAt updatedAt }
                message success error
            }
        }`,
        { agentWorkspaceId },
    )

/** Read the canonical owner-scoped snapshot for one module installation. */
export const myAgentosModuleInstallation = (installationId: string): Promise<Result<AgentosModuleInstallationDetail>> =>
    graphql(
        `query MyAgentosModuleInstallation($installationId: ID!) {
            myAgentosModuleInstallation(installationId: $installationId) {
                data {
                    id agentWorkspaceId moduleKey moduleVersion status sagaId failureCode
                    generatedAgentIds sharedKnowledgeSourceIds channelAccountRefs
                    commonKnowledgeVersion privateKnowledgeVersion
                }
                message success error
            }
        }`,
        { installationId },
    )

/** Install one immutable solution package using one browser-generated idempotency identity. */
export const installAgentosSolutionModule = (input: InstallAgentosSolutionModuleInput): Promise<Result<AgentosModuleInstallation>> =>
    graphql(
        `mutation InstallAgentosSolutionModule($input: InstallAgentosSolutionModuleInput!) {
            installAgentosSolutionModule(input: $input) {
                data { id agentWorkspaceId moduleKey moduleVersion status failureCode createdAt updatedAt }
                message success error
            }
        }`,
        { input: { ...input, modelProfileRef: "nivo-default", channelAccountRefs: [], sharedKnowledgeSourceIds: [] } },
    )

/** Issue one owner-scoped OpenClaw launch without exposing a gateway credential. */
export const issueAgentWorkspaceAppLaunch = (workspaceId: string): Promise<Result<AgentWorkspaceAppLaunch>> =>
    graphql(
        `mutation IssueAgentWorkspaceAppLaunch($input: IssueAgentWorkspaceAppLaunchInput!) {
            issueAgentWorkspaceAppLaunch(input: $input) {
                data { launchId redirectUrl expiresAt } message success error
            }
        }`,
        { input: { workspaceId, app: "Openclaw" } },
    )

/** Keep one redeemed workspace launch alive while the Nivo owner remains present. */
export const renewAgentWorkspaceAppLaunch = (launchId: string): Promise<Result<RenewedAgentWorkspaceAppLaunch>> =>
    graphql(
        `mutation RenewAgentWorkspaceAppLaunch($input: RenewAgentWorkspaceAppLaunchInput!) {
            renewAgentWorkspaceAppLaunch(input: $input) {
                data { launchId expiresAt } message success error
            }
        }`,
        { input: { launchId } },
    )

/** Revoke a workspace launch when its owner closes the popup or leaves Nivo. */
export const revokeAgentWorkspaceAppLaunch = (launchId: string): Promise<Result<{ readonly launchId: string, readonly revoked: boolean }>> =>
    graphql(
        `mutation RevokeAgentWorkspaceAppLaunch($input: RevokeAgentWorkspaceAppLaunchInput!) {
            revokeAgentWorkspaceAppLaunch(input: $input) {
                data { launchId revoked } message success error
            }
        }`,
        { input: { launchId } },
    )

/** Backend-owned lifecycle for one workspace custom module. */
export type AgentosCustomModuleStatus = "draft" | "ready_for_review" | "publishing" | "active" | "publish_failed"

/** One workspace-owned custom module summary returned to the collection. */
export type AgentosCustomModule = {
    readonly id: string
    readonly agentWorkspaceId: string
    readonly name: string
    readonly status: AgentosCustomModuleStatus
    readonly progress: number
    readonly missingFields: ReadonlyArray<string>
    readonly currentQuestion: string | null
    readonly specificationVersion: number | null
    readonly installationId: string | null
    readonly failureCode: string | null
}

/** Complete resumable studio projection for one owned custom module. */
export type AgentosModuleStudio = {
    readonly module: AgentosCustomModule
    readonly profileFacts: ReadonlyArray<{ readonly key: string, readonly value: string }>
    readonly messages: ReadonlyArray<{ readonly id: string, readonly role: "assistant" | "user", readonly content: string, readonly sequence: number }>
    readonly attachments: ReadonlyArray<{
        readonly id: string
        readonly fileName: string
        readonly mediaType: string
        readonly sizeBytes: number
        readonly status: "uploading" | "scanning" | "ready" | "refused"
        readonly ingestionStatus: "pending" | "scanning" | "extracting" | "embedding" | "indexing" | "indexed" | "refused" | "removed"
        readonly detectedMediaType: string | null
        readonly sha256: string | null
        readonly chunkCount: number
        readonly indexedAt: string | null
        readonly retrievalRemovedAt: string | null
        readonly objectDeletionStatus: "retained" | "pending" | "deleted" | "failed"
        readonly objectDeletionDueAt: string | null
        readonly failureCode: string | null
    }>
    readonly integrations: ReadonlyArray<{ readonly id: string, readonly providerKey: string, readonly maskedHint: string, readonly status: "configured" | "refused" }>
    readonly specification: { readonly id: string, readonly version: number, readonly status: "ready" | "published" | "publish_failed" } | null
}

const MODULE_STUDIO_FIELDS = `
    module { id agentWorkspaceId name status progress missingFields currentQuestion specificationVersion installationId failureCode }
    profileFacts { key value }
    messages { id role content sequence }
    attachments { id fileName mediaType sizeBytes status ingestionStatus detectedMediaType sha256 chunkCount indexedAt retrievalRemovedAt objectDeletionStatus objectDeletionDueAt failureCode }
    integrations { id providerKey maskedHint status }
    specification { id version status }
`

/** Read custom drafts and active custom modules belonging to one exact workspace. */
export const myAgentosCustomModules = (agentWorkspaceId: string): Promise<Result<ReadonlyArray<AgentosCustomModule>>> =>
    graphql(
        `query MyAgentosCustomModules($agentWorkspaceId: ID!) {
            myAgentosCustomModules(agentWorkspaceId: $agentWorkspaceId) {
                data { id agentWorkspaceId name status progress missingFields currentQuestion specificationVersion installationId failureCode }
                message success error
            }
        }`,
        { agentWorkspaceId },
    )

/** Resume the durable module studio for one owner-scoped module. */
export const myAgentosCustomModuleStudio = (agentWorkspaceId: string, moduleId: string): Promise<Result<AgentosModuleStudio>> =>
    graphql(
        `query MyAgentosCustomModuleStudio($agentWorkspaceId: ID!, $moduleId: ID!) {
            myAgentosCustomModuleStudio(agentWorkspaceId: $agentWorkspaceId, moduleId: $moduleId) {
                data { ${MODULE_STUDIO_FIELDS} }
                message success error
            }
        }`,
        { agentWorkspaceId, moduleId },
    )

const studioMutation = (name: string, inputType: string, input: Readonly<Record<string, unknown>>): Promise<Result<AgentosModuleStudio>> =>
    graphql(
        `mutation ${name}($input: ${inputType}!) {
            ${name[0]?.toLowerCase()}${name.slice(1)}(input: $input) {
                data { ${MODULE_STUDIO_FIELDS} }
                message success error
            }
        }`,
        { input },
    )

type StartAgentosCustomModuleIntakeInput = { readonly agentWorkspaceId: string, readonly goal: string, readonly idempotencyKey: string }
type AnswerAgentosCustomModuleIntakeInput = { readonly agentWorkspaceId: string, readonly moduleId: string, readonly answer: string }
type PrepareAgentosModuleAttachmentUploadInput = { readonly agentWorkspaceId: string, readonly moduleId: string, readonly fileName: string, readonly mediaType: string, readonly sizeBytes: number }
type AgentosModuleAttachmentIdentityInput = { readonly agentWorkspaceId: string, readonly moduleId: string, readonly attachmentId: string }
type SaveAgentosModuleIntegrationSecretInput = { readonly agentWorkspaceId: string, readonly moduleId: string, readonly providerKey: string, readonly secret: string }
type AgentosModuleIntegrationIdentityInput = { readonly agentWorkspaceId: string, readonly moduleId: string, readonly providerKey: string }
type PublishAgentosCustomModuleInput = { readonly agentWorkspaceId: string, readonly moduleId: string, readonly acknowledgedVersion: number, readonly idempotencyKey: string }

/** Create the durable draft only after its first meaningful goal is submitted. */
export const startAgentosCustomModuleIntake = (input: StartAgentosCustomModuleIntakeInput) =>
    studioMutation("StartAgentosCustomModuleIntake", "StartAgentosCustomModuleIntakeInput", input)

/** Persist one accepted answer before asking the backend for the next unresolved question. */
export const answerAgentosCustomModuleIntake = (input: AnswerAgentosCustomModuleIntakeInput) =>
    studioMutation("AnswerAgentosCustomModuleIntake", "AnswerAgentosCustomModuleIntakeInput", input)

/** Browser upload contract: studio state plus one short-lived PUT-only capability. */
export type AgentosModuleUploadCapability = AgentosModuleStudio & {
    readonly attachmentId: string
    readonly uploadUrl: string
    readonly uploadMethod: "PUT"
    readonly uploadExpiresAt: string
}

/** Resolve a backend-issued relative capability without exposing internal object-storage hosts. */
export const resolveCoreApiCapabilityUrl = (capabilityUrl: string): string => {
    const configuredApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql"
    const apiUrl = new URL(configuredApiUrl,
        typeof window === "undefined" ? "http://localhost:3068" : window.location.origin)
    return new URL(capabilityUrl,
        `${apiUrl.origin}/`).toString()
}

/** Register one quarantined file identity and return its bounded byte-transfer capability. */
export const prepareAgentosModuleAttachmentUpload = (input: PrepareAgentosModuleAttachmentUploadInput): Promise<Result<AgentosModuleUploadCapability>> =>
    graphql(
        `mutation PrepareAgentosModuleAttachmentUpload($input: PrepareAgentosModuleAttachmentUploadInput!) {
            prepareAgentosModuleAttachmentUpload(input: $input) {
                data { ${MODULE_STUDIO_FIELDS} attachmentId uploadUrl uploadMethod uploadExpiresAt }
                message success error
            }
        }`,
        { input },
    )

/** Mark the prepared attachment ready for external scanner processing. */
export const finalizeAgentosModuleAttachment = (input: AgentosModuleAttachmentIdentityInput) =>
    studioMutation("FinalizeAgentosModuleAttachment", "FinalizeAgentosModuleAttachmentInput", input)

/** Replace one write-only integration secret and receive only masked configuration status. */
export const saveAgentosModuleIntegrationSecret = (input: SaveAgentosModuleIntegrationSecretInput) =>
    studioMutation("SaveAgentosModuleIntegrationSecret", "SaveAgentosModuleIntegrationSecretInput", input)

/** Publish only the exact specification version the owner acknowledged. */
export const publishAgentosCustomModule = (input: PublishAgentosCustomModuleInput) =>
    studioMutation("PublishAgentosCustomModule", "PublishAgentosCustomModuleInput", input)

/** Remove one owner-scoped attachment from the current module draft. */
export const removeAgentosModuleAttachment = (input: AgentosModuleAttachmentIdentityInput): Promise<Result<boolean>> =>
    graphql(`mutation RemoveAgentosModuleAttachment($input: RemoveAgentosModuleAttachmentInput!) { removeAgentosModuleAttachment(input: $input) { data message success error } }`, { input })

/** Remove one configured provider without ever reading its encrypted secret back. */
export const removeAgentosModuleIntegrationSecret = (input: AgentosModuleIntegrationIdentityInput): Promise<Result<boolean>> =>
    graphql(`mutation RemoveAgentosModuleIntegrationSecret($input: RemoveAgentosModuleIntegrationSecretInput!) { removeAgentosModuleIntegrationSecret(input: $input) { data message success error } }`, { input })

/** The draft site returned by the expert academy create mutation. */
export interface CreatedExpertSite {
    readonly id: string
    readonly slug: string
}

/** The academy site after its single publication/deployment door has accepted it. */
export interface PublishedExpertSite extends CreatedExpertSite {
    readonly status: ExpertSiteStatus
}

/** Handles returned when expert academy provisioning is queued. */
export interface ProvisionedExpertSite {
    readonly jobId: string
    readonly expertDeploymentId: string
    readonly publicHost: string
}

/** Create a draft expert academy site owned by the signed-in viewer. */
export const createExpertSite = (slug: string): Promise<Result<CreatedExpertSite>> =>
    graphql(
        `mutation CreateExpertSite($input: CreateExpertSiteInput!) {
            createExpertSite(input: $input) { data { id slug } message success error }
        }`,
        { input: { slug } },
    )

/** Publish the academy and dispatch its deployment through the live academy owner. */
export const publishExpertSite = (siteId: string): Promise<Result<PublishedExpertSite>> =>
    graphql(
        `mutation PublishExpertSite($input: PublishExpertSiteInput!) {
            publishExpertSite(input: $input) { data { id slug status } message success error }
        }`,
        { input: { siteId, published: true } },
    )

/** Queue expert academy provisioning; readiness arrives through the deployment stream/read model. */
export const provisionExpertSite = (siteId: string): Promise<Result<ProvisionedExpertSite>> =>
    graphql(
        `mutation ProvisionExpertSite($input: ProvisionExpertSiteInput!) {
            provisionExpertSite(input: $input) { data { jobId expertDeploymentId publicHost } message success error }
        }`,
        { input: { siteId } },
    )

/** Request a new AgentOS order; fulfillment/provisioning is asynchronous. */
export const orderAgentOs = (catalogItemSlug: string, catalogTierId?: string): Promise<Result<CatalogOrderRow>> =>
    graphql(
        `mutation OrderAgentOs($input: OrderCatalogItemInput!) {
            orderCatalogItem(input: $input) { data { id status ${ORDER_PRODUCT} } message success error }
        }`,
        {
            input: {
                catalogItemSlug,
                ...(catalogTierId === undefined ? {} : { catalogTierId }),
            },
        },
    )

/** Read the latest expert deployment for re-entry/readiness reconciliation. */
export interface ExpertDeploymentSnapshot {
    readonly id: string
    readonly status: string
    readonly publicHost: string | null
}

/** Read the latest deployment snapshot for one owned expert site so a resumed flow starts from persisted truth. */
export const myExpertSiteDeployment = (siteId: string): Promise<Result<ExpertDeploymentSnapshot | null>> =>
    graphql(
        `query MyExpertSiteDeployment($siteId: ID!) {
            myExpertSiteDeployment(siteId: $siteId) { data { id status publicHost } message success error }
        }`,
        { siteId },
    )

/** Aggregate growth facts projected from one Academy owned by the viewer. */
export type AcademyGrowthSnapshot = {
    readonly revenueVnd: number
    readonly paidOrders: number
    readonly totalMembers: number
    readonly activeMembers: number
    readonly totalCompletions: number
}

/** One student row in the Academy control center. */
export type AcademyStudent = {
    readonly id: string
    readonly name: string
    readonly email: string
    readonly role: string
    readonly status: string
    readonly xp: number
}

/** A bounded student page returned by the owner-scoped bridge. */
export type AcademyStudentsPage = { readonly items: ReadonlyArray<AcademyStudent>, readonly total: number }

/** Purchase history carried by a student detail. */
export type AcademyStudentOrder = {
    readonly id: string
    readonly courseSlug: string
    readonly status: string
    readonly amountVnd: number
}

/** Progress through one course. */
export type AcademyStudentCourseProgress = {
    readonly slug: string
    readonly title: string
    readonly completed: number
    readonly total: number
}

/** Owner-only student detail. */
export type AcademyStudentDetail = {
    readonly member: Omit<AcademyStudent, "xp">
    readonly orders: ReadonlyArray<AcademyStudentOrder>
    readonly courses: ReadonlyArray<AcademyStudentCourseProgress>
}

/** Safe status of one write-only Academy credential. */
export type AcademyCredentialStatus = {
    readonly key: string
    readonly configured: boolean
    readonly hint: string | null
    readonly syncedAt: string | null
    readonly verification: string
    readonly verificationReason: string | null
    readonly verifiedAt: string | null
}

/** Custom domain state, including the DNS target the customer must publish. */
export type AcademyCustomDomainState = {
    readonly domain: string | null
    readonly target: string
    readonly dnsReady: boolean
    readonly delivery: string
    readonly detail: string
}

/** Safe provider status. Secret values are deliberately absent. */
export type AcademyProviderStatus = {
    readonly provider: string
    readonly status: string
    readonly clientId: string | null
    readonly identifier: string | null
    readonly consentMode: string | null
    readonly reason: string | null
    readonly deliveredAt: string | null
    readonly verifiedAt: string | null
}

/** Safe webhook status. */
export type AcademyWebhookStatus = {
    readonly id: string
    readonly endpoint: string
    readonly events: ReadonlyArray<string>
    readonly enabled: boolean
    readonly version: number
    readonly lastDeliveryStatus: string | null
    readonly lastDeliveredAt: string | null
}

/** Complete Integration Center read model with no credential material. */
export type AcademyIntegrations = {
    readonly credentials: ReadonlyArray<AcademyCredentialStatus>
    readonly customDomain: AcademyCustomDomainState | null
    readonly google: AcademyProviderStatus
    readonly zalo: AcademyProviderStatus
    readonly analytics: ReadonlyArray<AcademyProviderStatus>
    readonly webhooks: ReadonlyArray<AcademyWebhookStatus>
}

/** One lead submitted through an Academy public site. */
export type ExpertSiteLead = {
    readonly id: string
    readonly name: string
    readonly contact: string
    readonly message: string | null
    readonly status: string
    readonly note: string | null
}

/** Filters and pagination accepted by the Academy student list. */
export type MyAcademyStudentsInput = { readonly siteId: string, readonly offset?: number, readonly limit?: number, readonly search?: string, readonly status?: string }
/** Identity and optional bootstrap credentials for a new student. */
export type CreateAcademyStudentInput = { readonly siteId: string, readonly name: string, readonly email: string, readonly password?: string, readonly role?: string }
/** Editable identity fields of one existing student. */
export type UpdateAcademyStudentInput = { readonly siteId: string, readonly memberId: string, readonly name?: string, readonly email?: string }
/** Targeted active/banned transition for one student. */
export type SetAcademyStudentStatusInput = { readonly siteId: string, readonly memberId: string, readonly status: "active" | "banned", readonly reason?: string }
/** Student and course identity used to grant access. */
export type AcademyCourseAccessInput = { readonly siteId: string, readonly email: string, readonly courseSlug: string, readonly note?: string }
/** Student and course identity used to revoke gifted access. */
export type RevokeAcademyCourseAccessInput = { readonly siteId: string, readonly email: string, readonly courseSlug: string }
/** Resulting course-access row. */
export type AcademyCourseAccess = { readonly id: string, readonly email: string, readonly courseSlug: string, readonly status: string }
/** Safe result of revoking gifted access. */
export type RevokedAcademyCourseAccess = { readonly revoked: number, readonly keptPaidPurchase: boolean }
/** Follow-up fields editable on an Academy lead. */
export type UpdateExpertSiteLeadInput = { readonly leadId: string, readonly status?: string, readonly note?: string }
/** Lead and locale used to ask for an unsent draft. */
export type DraftLeadReplyInput = { readonly leadId: string, readonly locale?: "vi" | "en" }
/** AI-authored reply that remains unsent. */
export type DraftedLeadReply = { readonly reply: string }
/** Write-only Academy credential submission. */
export type SaveAcademyCredentialInput = { readonly siteId: string, readonly key: string, readonly value: string }
/** Safe status returned after storing and delivering a credential. */
export type AcademyCredentialSaveResult = { readonly credential: AcademyCredentialStatus, readonly delivery: string, readonly detail: string }
/** Domain replacement or explicit clear for one Academy. */
export type SetAcademyCustomDomainInput = { readonly siteId: string, readonly domain: string | null }
/** Write-only Google OAuth client configuration. */
export type SaveAcademyGoogleOAuthInput = { readonly siteId: string, readonly clientId: string, readonly clientSecret: string }
/** Analytics identifier and consent policy for one provider. */
export type SaveAcademyAnalyticsInput = { readonly siteId: string, readonly provider: "ga4" | "meta_pixel", readonly identifier: string | null, readonly consentMode: "required" | "granted" | "denied" }
/** Signed webhook destination and subscribed Academy events. */
export type CreateAcademyWebhookInput = { readonly siteId: string, readonly endpoint: string, readonly events: ReadonlyArray<string> }
/** Optimistically fenced webhook-secret rotation. */
export type RotateAcademyWebhookSecretInput = { readonly siteId: string, readonly webhookId: string, readonly expectedVersion: number }
/** One-time webhook secret returned only by create or rotate. */
export type AcademyWebhookSecretResult = AcademyWebhookStatus & { readonly signingSecret: string }
/** Short-lived Zalo authorization destination. */
export type AcademyZaloAuthorization = { readonly authorizationUrl: string, readonly expiresAt: string }

/** Read Academy growth through the owner-scoped Nivo bridge. */
export const myAcademyGrowthSnapshot = (siteId: string): Promise<Result<AcademyGrowthSnapshot>> =>
    graphql(
        `query MyAcademyGrowthSnapshot($siteId: String!) {
            myAcademyGrowthSnapshot(siteId: $siteId) { data { revenueVnd paidOrders totalMembers activeMembers totalCompletions } message success error }
        }`,
        { siteId },
    )

/** Read one bounded student page through the owner-scoped Nivo bridge. */
export const myAcademyStudents = (input: MyAcademyStudentsInput): Promise<Result<AcademyStudentsPage>> =>
    graphql(
        `query MyAcademyStudents($input: MyAcademyStudentsInput!) {
            myAcademyStudents(input: $input) { data { items { id name email role status xp } total } message success error }
        }`,
        { input },
    )

/** Read one student detail after ownership is checked by Core. */
export const myAcademyStudentDetail = (siteId: string, memberId: string): Promise<Result<AcademyStudentDetail>> =>
    graphql(
        `query MyAcademyStudentDetail($siteId: String!, $memberId: String!) {
            myAcademyStudentDetail(siteId: $siteId, memberId: $memberId) {
                data { member { id name email role status } orders { id courseSlug status amountVnd } courses { slug title completed total } }
                message success error
            }
        }`,
        { siteId, memberId },
    )

/** Read all safe provider states for one owned Academy. */
export const myAcademyIntegrations = (siteId: string): Promise<Result<AcademyIntegrations>> =>
    graphql(
        `query MyAcademyIntegrations($siteId: String!) {
            myAcademyIntegrations(siteId: $siteId) {
                data {
                    credentials { key configured hint syncedAt verification verificationReason verifiedAt }
                    customDomain { domain target dnsReady delivery detail }
                    google { provider status clientId identifier consentMode reason deliveredAt verifiedAt }
                    zalo { provider status clientId identifier consentMode reason deliveredAt verifiedAt }
                    analytics { provider status clientId identifier consentMode reason deliveredAt verifiedAt }
                    webhooks { id endpoint events enabled version lastDeliveryStatus lastDeliveredAt }
                }
                message success error
            }
        }`,
        { siteId },
    )

/** Read leads received by one owned Academy. */
export const myExpertSiteLeads = (siteId: string, limit = 20, offset = 0): Promise<Result<ReadonlyArray<ExpertSiteLead>>> =>
    graphql(
        `query MyExpertSiteLeads($siteId: ID!, $limit: Int, $offset: Int) {
            myExpertSiteLeads(siteId: $siteId, limit: $limit, offset: $offset) { data { id name contact message status note } message success error }
        }`,
        { siteId, limit, offset },
    )

/** Create a student in one owned Academy. */
export const createAcademyStudent = (input: CreateAcademyStudentInput): Promise<Result<AcademyStudent>> =>
    graphql(
        `mutation CreateAcademyStudent($input: CreateAcademyStudentInput!) {
            createAcademyStudent(input: $input) { data { id name email role status xp } message success error }
        }`,
        { input },
    )

/** Update one student's identity fields. */
export const updateAcademyStudent = (input: UpdateAcademyStudentInput): Promise<Result<AcademyStudent>> =>
    graphql(
        `mutation UpdateAcademyStudent($input: UpdateAcademyStudentInput!) {
            updateAcademyStudent(input: $input) { data { id name email role status xp } message success error }
        }`,
        { input },
    )

/** Change one student's active/banned state. */
export const setAcademyStudentStatus = (input: SetAcademyStudentStatusInput): Promise<Result<AcademyStudent>> =>
    graphql(
        `mutation SetAcademyStudentStatus($input: SetAcademyStudentStatusInput!) {
            setAcademyStudentStatus(input: $input) { data { id name email role status xp } message success error }
        }`,
        { input },
    )

/** Grant one course to a student. */
export const grantAcademyCourseAccess = (input: AcademyCourseAccessInput): Promise<Result<AcademyCourseAccess>> =>
    graphql(
        `mutation GrantAcademyCourseAccess($input: GrantAcademyCourseAccessInput!) {
            grantAcademyCourseAccess(input: $input) { data { id email courseSlug status } message success error }
        }`,
        { input },
    )

/** Revoke gifted course access from a student. */
export const revokeAcademyCourseAccess = (input: RevokeAcademyCourseAccessInput): Promise<Result<RevokedAcademyCourseAccess>> =>
    graphql(
        `mutation RevokeAcademyCourseAccess($input: RevokeAcademyCourseAccessInput!) {
            revokeAcademyCourseAccess(input: $input) { data { revoked keptPaidPurchase } message success error }
        }`,
        { input },
    )

/** Update the follow-up state of one Academy lead. */
export const updateExpertSiteLead = (input: UpdateExpertSiteLeadInput): Promise<Result<ExpertSiteLead>> =>
    graphql(
        `mutation UpdateExpertSiteLead($input: UpdateExpertSiteLeadInput!) {
            updateExpertSiteLead(input: $input) { data { id name contact message status note } message success error }
        }`,
        { input },
    )

/** Draft a reply for one Academy lead without sending it. */
export const draftLeadReply = (input: DraftLeadReplyInput): Promise<Result<DraftedLeadReply>> =>
    graphql(
        `mutation DraftLeadReply($input: DraftLeadReplyInput!) {
            draftLeadReply(input: $input) { data { reply } message success error }
        }`,
        { input },
    )

/** Store one Academy credential and return delivery status, never its value. */
export const saveAcademyCredential = (input: SaveAcademyCredentialInput): Promise<Result<AcademyCredentialSaveResult>> =>
    graphql(
        `mutation SaveAcademyCredential($input: SaveAcademyCredentialInput!) {
            saveAcademyCredential(input: $input) { data { credential { key configured hint syncedAt verification verificationReason verifiedAt } delivery detail } message success error }
        }`,
        { input },
    )

/** Store or clear one Academy custom domain. */
export const setAcademyCustomDomain = (input: SetAcademyCustomDomainInput): Promise<Result<AcademyCustomDomainState>> =>
    graphql(
        `mutation SetAcademyCustomDomain($input: SetAcademyCustomDomainInput!) {
            setAcademyCustomDomain(input: $input) { data { domain target dnsReady delivery detail } message success error }
        }`,
        { input },
    )

/** Save write-only Google OAuth credentials. */
export const saveAcademyGoogleOAuth = (input: SaveAcademyGoogleOAuthInput): Promise<Result<AcademyProviderStatus>> =>
    graphql(
        `mutation SaveAcademyGoogleOAuth($input: SaveAcademyGoogleOAuthInput!) {
            saveAcademyGoogleOAuth(input: $input) { data { provider status clientId identifier consentMode reason deliveredAt verifiedAt } message success error }
        }`,
        { input },
    )

/** Disconnect the Academy Google login provider. */
export const disconnectAcademyGoogleOAuth = (siteId: string): Promise<Result<AcademyProviderStatus>> =>
    graphql(
        `mutation DisconnectAcademyGoogleOAuth($input: DisconnectAcademyGoogleOAuthInput!) {
            disconnectAcademyGoogleOAuth(input: $input) { data { provider status clientId identifier consentMode reason deliveredAt verifiedAt } message success error }
        }`,
        { input: { siteId } },
    )

/** Begin a short-lived Zalo OA authorization flow. */
export const beginAcademyZaloAuthorization = (siteId: string): Promise<Result<AcademyZaloAuthorization>> =>
    graphql(
        `mutation BeginAcademyZaloAuthorization($input: BeginAcademyZaloAuthorizationInput!) {
            beginAcademyZaloAuthorization(input: $input) { data { authorizationUrl expiresAt } message success error }
        }`,
        { input: { siteId } },
    )

/** Save one analytics identifier and consent mode. */
export const saveAcademyAnalytics = (input: SaveAcademyAnalyticsInput): Promise<Result<AcademyProviderStatus>> =>
    graphql(
        `mutation SaveAcademyAnalytics($input: SaveAcademyAnalyticsInput!) {
            saveAcademyAnalytics(input: $input) { data { provider status clientId identifier consentMode reason deliveredAt verifiedAt } message success error }
        }`,
        { input },
    )

/** Create a signed Academy webhook and reveal its signing secret once. */
export const createAcademyWebhook = (input: CreateAcademyWebhookInput): Promise<Result<AcademyWebhookSecretResult>> =>
    graphql(
        `mutation CreateAcademyWebhook($input: CreateAcademyWebhookInput!) {
            createAcademyWebhook(input: $input) { data { id endpoint events enabled version lastDeliveryStatus lastDeliveredAt signingSecret } message success error }
        }`,
        { input },
    )

/** Rotate a webhook secret with optimistic version fencing. */
export const rotateAcademyWebhookSecret = (input: RotateAcademyWebhookSecretInput): Promise<Result<AcademyWebhookSecretResult>> =>
    graphql(
        `mutation RotateAcademyWebhookSecret($input: RotateAcademyWebhookSecretInput!) {
            rotateAcademyWebhookSecret(input: $input) { data { id endpoint events enabled version lastDeliveryStatus lastDeliveredAt signingSecret } message success error }
        }`,
        { input },
    )

/** Disable one Academy webhook. */
export const disableAcademyWebhook = (siteId: string, webhookId: string): Promise<Result<AcademyWebhookStatus>> =>
    graphql(
        `mutation DisableAcademyWebhook($input: DisableAcademyWebhookInput!) {
            disableAcademyWebhook(input: $input) { data { id endpoint events enabled version lastDeliveryStatus lastDeliveredAt } message success error }
        }`,
        { input: { siteId, webhookId } },
    )
