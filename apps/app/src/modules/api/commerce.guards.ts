/** Runtime parsers for each commerce document's generated payload shape. */

import { isBoolean, isNullableNumber, isNullableString, isNumber, isOneOf, isRecord, isString, parseEach } from "@nivo/api"
import type {
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

const parseDomainRow = (
    value: unknown,
): NonNullable<MyDomainsQuery["myDomains"]["data"]>[number] | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isOneOf(value.status, ["active", "expiring", "expired"]) &&
    isNullableString(value.expiresAt) &&
    isBoolean(value.autoRenew)
        ? {
              id: value.id,
              name: value.name,
              status: value.status,
              expiresAt: value.expiresAt,
              autoRenew: value.autoRenew,
          }
        : null

/** Parse the `data` of `myDomains`. */
export const parseDomainRows = (
    input: unknown,
): ReadonlyArray<NonNullable<MyDomainsQuery["myDomains"]["data"]>[number]> | null =>
    parseEach(input, parseDomainRow)

/** Parse the `data` of `myWallet`. */
export const parseWalletRow = (input: unknown): NonNullable<MyWalletQuery["myWallet"]["data"]> | null =>
    isRecord(input) && isString(input.id) && isNumber(input.balanceVnd)
        ? { id: input.id, balanceVnd: input.balanceVnd }
        : null

const parseWalletTransactionRow = (
    value: unknown,
): NonNullable<MyWalletTransactionsQuery["myWalletTransactions"]["data"]>[number] | null =>
    isRecord(value) &&
    isString(value.id) &&
    isNumber(value.amountVnd) &&
    isOneOf(value.type, ["deposit", "spend"]) &&
    isNullableString(value.note) &&
    isString(value.createdAt)
        ? {
              id: value.id,
              amountVnd: value.amountVnd,
              type: value.type,
              note: value.note,
              createdAt: value.createdAt,
          }
        : null

/** Parse the `data` of `myWalletTransactions`. */
export const parseWalletTransactionRows = (
    input: unknown,
): ReadonlyArray<NonNullable<MyWalletTransactionsQuery["myWalletTransactions"]["data"]>[number]> | null =>
    parseEach(input, parseWalletTransactionRow)

/** Parse the `data` of `createWalletTopUpPayLink`. */
export const parseWalletTopUpPayLink = (
    input: unknown,
): NonNullable<CreateWalletTopUpPayLinkMutation["createWalletTopUpPayLink"]["data"]> | null =>
    isRecord(input) &&
    isString(input.paymentId) &&
    isOneOf(input.gateway, ["payos", "sepay"]) &&
    isString(input.referenceId) &&
    isNullableString(input.checkoutUrl) &&
    isNullableString(input.qrCode) &&
    isNullableString(input.checkoutFields) &&
    isNumber(input.amountVnd) &&
    isNumber(input.chargedAmountVnd)
        ? {
              paymentId: input.paymentId,
              gateway: input.gateway,
              referenceId: input.referenceId,
              checkoutUrl: input.checkoutUrl,
              qrCode: input.qrCode,
              checkoutFields: input.checkoutFields,
              amountVnd: input.amountVnd,
              chargedAmountVnd: input.chargedAmountVnd,
          }
        : null

const parseOrderProductItem = (value: unknown) => {
    if (
        !isRecord(value) ||
        !isString(value.id) ||
        !isString(value.name) ||
        !isOneOf(value.billingModel, ["one_time", "recurring", "setup_plus_recurring"])
    ) {
        return null
    }
    return { id: value.id, name: value.name, billingModel: value.billingModel }
}

const parseOrderProductTier = (value: unknown) =>
    isRecord(value) && isString(value.id) && isString(value.name) ? { id: value.id, name: value.name } : null

const parseOrderProduct = (value: Record<string, unknown>) => {
    const catalogItem = value.catalogItem === null ? null : parseOrderProductItem(value.catalogItem)
    const catalogTier = value.catalogTier === null ? null : parseOrderProductTier(value.catalogTier)
    if (value.catalogItem !== null && catalogItem === null) return null
    if (value.catalogTier !== null && catalogTier === null) return null
    return { catalogItem, catalogTier }
}

const parseInvoiceCatalogOrder = (
    value: unknown,
): NonNullable<MyInvoicesQuery["myInvoices"]["data"]>[number]["catalogOrder"] | null => {
    if (value === null) return null
    if (
        !isRecord(value) ||
        !isString(value.id) ||
        !isNullableString(value.renewsAt) ||
        !isBoolean(value.autoRenew)
    ) {
        return null
    }
    const product = parseOrderProduct(value)
    if (product === null) return null
    return { id: value.id, renewsAt: value.renewsAt, autoRenew: value.autoRenew, ...product }
}

const parseInvoiceRow = (
    value: unknown,
): NonNullable<MyInvoicesQuery["myInvoices"]["data"]>[number] | null => {
    if (
        !isRecord(value) ||
        !isString(value.id) ||
        !isNumber(value.amountVnd) ||
        !isOneOf(value.status, ["unpaid", "paid", "cancelled"]) ||
        !isString(value.dueAt) ||
        !isNullableString(value.paidAt)
    ) {
        return null
    }
    const catalogOrder = parseInvoiceCatalogOrder(value.catalogOrder)
    if (value.catalogOrder !== null && catalogOrder === null) return null
    return {
        id: value.id,
        amountVnd: value.amountVnd,
        status: value.status,
        dueAt: value.dueAt,
        paidAt: value.paidAt,
        catalogOrder,
    }
}

/** Parse the `data` of `myInvoices`. */
export const parseInvoiceRows = (
    input: unknown,
): ReadonlyArray<NonNullable<MyInvoicesQuery["myInvoices"]["data"]>[number]> | null =>
    parseEach(input, parseInvoiceRow)

/** Parse the `data` of `payInvoice`. */
export const parseInvoiceRowAnswer = (
    input: unknown,
): NonNullable<PayInvoiceMutation["payInvoice"]["data"]> | null => parseInvoiceRow(input)

const parseCatalogOrderRow = (
    value: unknown,
): NonNullable<MyCatalogOrdersQuery["myCatalogOrders"]["data"]>[number] | null => {
    if (
        !isRecord(value) ||
        !isString(value.id) ||
        !isOneOf(value.status, ["active", "cancelled", "completed", "in_progress", "pending_payment", "suspended"]) ||
        !isNullableString(value.renewsAt) ||
        !isBoolean(value.autoRenew)
    ) {
        return null
    }
    const product = parseOrderProduct(value)
    if (product === null) return null
    return { id: value.id, status: value.status, renewsAt: value.renewsAt, autoRenew: value.autoRenew, ...product }
}

/** Parse the `data` of `myCatalogOrders`. */
export const parseCatalogOrderRows = (
    input: unknown,
): ReadonlyArray<NonNullable<MyCatalogOrdersQuery["myCatalogOrders"]["data"]>[number]> | null =>
    parseEach(input, parseCatalogOrderRow)

/** Parse the `data` of `orderCatalogItem`, which selects only the order's identity and product. */
export const parseCatalogOrderRowAnswer = (
    input: unknown,
): NonNullable<OrderAgentOsMutation["orderCatalogItem"]["data"]> | null => {
    if (
        !isRecord(input) ||
        !isString(input.id) ||
        !isOneOf(input.status, ["active", "cancelled", "completed", "in_progress", "pending_payment", "suspended"])
    ) {
        return null
    }
    const product = parseOrderProduct(input)
    if (product === null) return null
    return { id: input.id, status: input.status, ...product }
}

const parseCatalogTierRow = (
    value: unknown,
): NonNullable<NonNullable<CatalogItemsQuery["catalogItems"]["data"]>[number]["tiers"]>[number] | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.tierKey) &&
    isString(value.name) &&
    isNullableNumber(value.priceMonthlyVnd) &&
    isNumber(value.orderIndex)
        ? {
              id: value.id,
              tierKey: value.tierKey,
              name: value.name,
              priceMonthlyVnd: value.priceMonthlyVnd,
              orderIndex: value.orderIndex,
          }
        : null

const parseCatalogItemRow = (
    value: unknown,
): NonNullable<CatalogItemsQuery["catalogItems"]["data"]>[number] | null => {
    if (
        !isRecord(value) ||
        !isString(value.id) ||
        !isString(value.slug) ||
        !isString(value.name) ||
        !isNullableString(value.tagline) ||
        !isNullableString(value.templateKey) ||
        !(value.tiers === null || Array.isArray(value.tiers))
    ) {
        return null
    }
    const tiers = value.tiers === null ? null : parseEach(value.tiers, parseCatalogTierRow)
    if (value.tiers !== null && tiers === null) return null
    return {
        id: value.id,
        slug: value.slug,
        name: value.name,
        tagline: value.tagline,
        templateKey: value.templateKey,
        tiers,
    }
}

/** Parse the `data` of `catalogItems`. */
export const parseCatalogItemRows = (
    input: unknown,
): ReadonlyArray<NonNullable<CatalogItemsQuery["catalogItems"]["data"]>[number]> | null =>
    parseEach(input, parseCatalogItemRow)
