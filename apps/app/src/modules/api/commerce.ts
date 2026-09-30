/**
 * What a person pays for: registered domains, the wallet and its top-ups, invoices, the catalogue and its orders.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import { type Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import {
    parseCatalogItemRows,
    parseCatalogOrderRowAnswer,
    parseCatalogOrderRows,
    parseDomainRows,
    parseInvoiceRowAnswer,
    parseInvoiceRows,
    parseWalletRow,
    parseWalletTopUpPayLink,
    parseWalletTransactionRows,
} from "./commerce.guards"

/** How a held domain stands. */
type DomainStatus = "active" | "expiring" | "expired"

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
type WalletTransactionType = "deposit" | "spend"

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

/** How a catalog item bills its buyer; additive seam field, absent on a pre-billing schema. */
type CatalogBillingModel = "one_time" | "recurring" | "setup_plus_recurring"

/** What an order bought, as the two relations an order carries. */
export type OrderProduct = {
    /** The product. Nullable: the relation is `ON DELETE SET NULL`. */
    readonly catalogItem: {
        readonly id: string
        readonly name: string
        /** How this item generates invoices. Optional: the field is additive. */
        readonly billingModel?: CatalogBillingModel | null
    } | null
    /** The rung of that product. Nullable for the same reason. */
    readonly catalogTier: {
        readonly id: string
        readonly name: string
    } | null
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
    readonly catalogOrder:
        | ({
              readonly id: string
              /** When the order next renews; additive seam field. */
              readonly renewsAt?: string | null
              /** Whether the order auto-renews; additive seam field. */
              readonly autoRenew?: boolean
              /** The durable provisioning order this purchase admitted, distinct from the order id; additive seam field - not yet published. */
              readonly provisioningOrderRef?: string | null
          } & OrderProduct)
        | null
}

/** How far an order has got. */
export type CatalogOrderStatus = "active" | "cancelled" | "completed" | "in_progress" | "pending_payment" | "suspended"

/** One order, which is a thing paid for that may not have become a resource yet. */
export type CatalogOrderRow = {
    /** The order's identity. */
    readonly id: string
    /** How far it has got. */
    readonly status: CatalogOrderStatus
    /** When the order next renews/expires (set when its invoice settles); additive seam field. */
    readonly renewsAt?: string | null
    /** Whether the order auto-renews at cycle end; additive seam field. */
    readonly autoRenew?: boolean
    /** The durable provisioning order this purchase admitted, distinct from the purchase/order id;
      additive seam field - not yet published, so the Provisioning order fact stays withheld. */
    readonly provisioningOrderRef?: string | null
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

/** Which slice of the catalogue a caller wants. */
export type CatalogCategory =
    "ai_agent" | "digital_identity" | "launch_ai" | "migration" | "ready_made_site" | "site_from_template"

/** The fields a domain row needs. */
const DOMAIN = "{ id name status expiresAt autoRenew }"

/** The wallet, which is one figure and its identity. */
const WALLET = "{ id balanceVnd }"

/** One movement of money. */
const WALLET_TRANSACTION = "{ id amountVnd type note createdAt }"

const WALLET_TOP_UP_PAY_LINK =
    "{ paymentId gateway referenceId checkoutUrl qrCode checkoutFields amountVnd chargedAmountVnd }"

/**
 * What an order bought. Shared, because an invoice reaches the same two relations through it.
 *
 * IT CARRIES NO BRACES OF ITS OWN, and the omission is the whole reason it is written out here. Every
 * other fragment on this page is a complete selection SET spliced in where a set is expected; this
 * one is spliced INSIDE one, beside `id`. Wrapped in braces it would read as a selection on the field
 * before it - `id { catalogItem ... }` - and the server refuses that with "Field `id` must not have a
 * selection", which is a document error rather than anything a caller could see coming.
 */
const ORDER_PRODUCT = "catalogItem { id name billingModel } catalogTier { id name }"

/** One invoice, with the order it was raised for. */
const INVOICE = `{ id amountVnd status dueAt paidAt catalogOrder { id renewsAt autoRenew ${ORDER_PRODUCT} } }`

/** One order, with the billing-cycle fields the purchase-status surface reports. */
const CATALOG_ORDER = `{ id status renewsAt autoRenew ${ORDER_PRODUCT} }`

/** One buyable product and its rungs. */
const CATALOG_ITEM = "{ id slug name tagline templateKey tiers { id tierKey name priceMonthlyVnd orderIndex } }"

/**
 * The domains this account holds, soonest expiry first as the handler orders them.
 *
 * @returns Every domain, or why there is none.
 */
export const myDomains = (): Promise<Outcome<ReadonlyArray<DomainRow>>> =>
    graphql(`query MyDomains { myDomains { data ${DOMAIN} message success error } }`, parseDomainRows)

/**
 * The account's balance.
 *
 * @returns The wallet, or why there is none.
 */
export const myWallet = (): Promise<Outcome<WalletRow>> =>
    graphql(`query MyWallet { myWallet { data ${WALLET} message success error } }`, parseWalletRow)

/**
 * Every movement of money, newest first.
 *
 * @returns The movements, or why there are none.
 */
export const myWalletTransactions = (): Promise<Outcome<ReadonlyArray<WalletTransactionRow>>> =>
    graphql(
        `query MyWalletTransactions { myWalletTransactions { data ${WALLET_TRANSACTION} message success error } }`,
        parseWalletTransactionRows,
    )

/** Create one real gateway checkout. Settlement remains owned by the provider IPN. */
export const createWalletTopUpPayLink = (
    amountVnd: number,
    returnUrl: string,
    cancelUrl: string,
): Promise<Outcome<WalletTopUpPayLink>> =>
    graphql(
        `mutation CreateWalletTopUpPayLink($input: CreateWalletTopUpPayLinkInput!) {
            createWalletTopUpPayLink(request: $input) { data ${WALLET_TOP_UP_PAY_LINK} message success error }
        }`,
        parseWalletTopUpPayLink,
        {
            input: {
                amountVnd,
                gateway: "sepay",
                returnUrl,
                cancelUrl,
            },
        },
    )

/**
 * Every invoice, newest first.
 *
 * THE ONE HANDLER THAT LOADS BOTH ORDER RELATIONS, which is why an invoice is the only row on the
 * console that can legitimately name the product and the rung it was raised for.
 *
 * @returns The invoices, or why there are none.
 */
export const myInvoices = (): Promise<Outcome<ReadonlyArray<InvoiceRow>>> =>
    graphql(`query MyInvoices { myInvoices { data ${INVOICE} message success error } }`, parseInvoiceRows)

/**
 * Settle one invoice owned by the current account.
 *
 * @param invoiceId - The unpaid invoice to settle from wallet balance.
 * @returns The canonical paid invoice, or why settlement was refused.
 */
export const payInvoice = (invoiceId: string): Promise<Outcome<InvoiceRow>> =>
    graphql(
        `mutation PayInvoice($input: PayInvoiceInput!) { payInvoice(request: $input) { data ${INVOICE} message success error } }`,
        parseInvoiceRowAnswer,
        {
            input: {
                invoiceId,
            },
        },
    )

/**
 * Every order, including the ones paid for and not yet built.
 *
 * @returns The orders, or why there are none.
 */
export const myCatalogOrders = (): Promise<Outcome<ReadonlyArray<CatalogOrderRow>>> =>
    graphql(
        `query MyCatalogOrders { myCatalogOrders { data ${CATALOG_ORDER} message success error } }`,
        parseCatalogOrderRows,
    )

/**
 * The buyable products in one slice of the catalogue.
 *
 * THE ONE QUERY HERE THAT NEEDS NO CREDENTIAL. It answers for a signed-out reader too, which is why
 * a catalogue that returns nothing is a real answer rather than a sign of a lost session.
 *
 * @param category - Which slice to read.
 * @returns The products, or why there are none.
 */
export const catalogItems = (category: CatalogCategory): Promise<Outcome<ReadonlyArray<CatalogItemRow>>> =>
    graphql(
        `query CatalogItems($request: CatalogItemsRequest!) { catalogItems(request: $request) { data ${CATALOG_ITEM} message success error } }`,
        parseCatalogItemRows,
        {
            request: { category },
        },
    )

/** Request a new AgentOS order; fulfillment/provisioning is asynchronous. */
export const orderAgentOs = (catalogItemSlug: string, catalogTierId?: string): Promise<Outcome<CatalogOrderRow>> =>
    graphql(
        `mutation OrderAgentOs($input: OrderCatalogItemInput!) {
            orderCatalogItem(request: $input) { data { id status ${ORDER_PRODUCT} } message success error }
        }`,
        parseCatalogOrderRowAnswer,
        {
            input: {
                catalogItemSlug,
                ...(catalogTierId === undefined
                    ? {}
                    : {
                          catalogTierId,
                      }),
            },
        },
    )
