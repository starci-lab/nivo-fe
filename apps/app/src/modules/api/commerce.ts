/**
 * What a person pays for: registered domains, the wallet and its top-ups, invoices, the catalogue and its orders.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The document and response shapes come from the generated contract types.
 */

import type { Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import {
    CatalogItemsDocument,
    CreateWalletTopUpPayLinkDocument,
    MyCatalogOrdersDocument,
    MyDomainsDocument,
    MyInvoicesDocument,
    MyWalletDocument,
    MyWalletTransactionsDocument,
    OrderAgentOsDocument,
    PayInvoiceDocument,
} from "./__generated__/core"
import type {
    CatalogCategory,
    CatalogItemsQuery,
    CreateWalletTopUpPayLinkMutation,
    MyCatalogOrdersQuery,
    MyDomainsQuery,
    MyInvoicesQuery,
    MyWalletQuery,
    MyWalletTransactionsQuery,
    OrderAgentOsMutation,
    PayInvoiceMutation,
} from "./__generated__/core"
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

/**
 * The domains this account holds, soonest expiry first as the handler orders them.
 *
 * @returns Every domain, or why there is none.
 */
export const myDomains = (): Promise<
    Outcome<ReadonlyArray<NonNullable<MyDomainsQuery["myDomains"]["data"]>[number]>>
> => graphql(MyDomainsDocument, parseDomainRows)

/**
 * The account's balance.
 *
 * @returns The wallet, or why there is none.
 */
export const myWallet = (): Promise<Outcome<NonNullable<MyWalletQuery["myWallet"]["data"]>>> =>
    graphql(MyWalletDocument, parseWalletRow)

/**
 * Every movement of money, newest first.
 *
 * @returns The movements, or why there are none.
 */
export const myWalletTransactions = (): Promise<
    Outcome<ReadonlyArray<NonNullable<MyWalletTransactionsQuery["myWalletTransactions"]["data"]>[number]>>
> => graphql(MyWalletTransactionsDocument, parseWalletTransactionRows)

/** Create one real gateway checkout. Settlement remains owned by the provider IPN. */
export const createWalletTopUpPayLink = (
    amountVnd: number,
    returnUrl: string,
    cancelUrl: string,
): Promise<Outcome<NonNullable<CreateWalletTopUpPayLinkMutation["createWalletTopUpPayLink"]["data"]>>> =>
    graphql(CreateWalletTopUpPayLinkDocument, parseWalletTopUpPayLink, {
        input: {
            amountVnd,
            gateway: "sepay",
            returnUrl,
            cancelUrl,
        },
    })

/**
 * Every invoice, newest first.
 *
 * THE ONE HANDLER THAT LOADS BOTH ORDER RELATIONS, which is why an invoice is the only row on the
 * console that can legitimately name the product and the rung it was raised for.
 *
 * @returns The invoices, or why there are none.
 */
export const myInvoices = (): Promise<
    Outcome<ReadonlyArray<NonNullable<MyInvoicesQuery["myInvoices"]["data"]>[number]>>
> => graphql(MyInvoicesDocument, parseInvoiceRows)

/**
 * Settle one invoice owned by the current account.
 *
 * @param invoiceId - The unpaid invoice to settle from wallet balance.
 * @returns The canonical paid invoice, or why settlement was refused.
 */
export const payInvoice = (
    invoiceId: string,
): Promise<Outcome<NonNullable<PayInvoiceMutation["payInvoice"]["data"]>>> =>
    graphql(PayInvoiceDocument, parseInvoiceRowAnswer, {
        input: {
            invoiceId,
        },
    })

/**
 * Every order, including the ones paid for and not yet built.
 *
 * @returns The orders, or why there are none.
 */
export const myCatalogOrders = (): Promise<
    Outcome<ReadonlyArray<NonNullable<MyCatalogOrdersQuery["myCatalogOrders"]["data"]>[number]>>
> => graphql(MyCatalogOrdersDocument, parseCatalogOrderRows)

/**
 * The buyable products in one slice of the catalogue.
 *
 * THE ONE QUERY HERE THAT NEEDS NO CREDENTIAL. It answers for a signed-out reader too, which is why
 * a catalogue that returns nothing is a real answer rather than a sign of a lost session.
 *
 * @param category - Which slice to read.
 * @returns The products, or why there are none.
 */
export const catalogItems = (
    category: CatalogCategory,
): Promise<Outcome<ReadonlyArray<NonNullable<CatalogItemsQuery["catalogItems"]["data"]>[number]>>> =>
    graphql(CatalogItemsDocument, parseCatalogItemRows, {
        request: { category },
    })

/** Request a new AgentOS order; fulfillment/provisioning is asynchronous. */
export const orderAgentOs = (
    catalogItemSlug: string,
    catalogTierId?: string,
): Promise<Outcome<NonNullable<OrderAgentOsMutation["orderCatalogItem"]["data"]>>> =>
    graphql(OrderAgentOsDocument, parseCatalogOrderRowAnswer, {
        input: {
            catalogItemSlug,
            ...(catalogTierId === undefined
                ? {}
                : {
                      catalogTierId,
                  }),
        },
    })
