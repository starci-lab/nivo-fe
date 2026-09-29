/**
 * The parsers of every commerce document's payload.
 *
 * One parser per shape the commerce operations select, beside the wire types they name. Each
 * returns the freshly built value or null; `graphql` turns null into an `unavailable` outcome, so a
 * malformed payload is never a thrown error and never a domain value under a borrowed name.
 *
 * ADDITIVE SEAM FIELDS (`billingModel`, `renewsAt`, `autoRenew`, `provisioningOrderRef`) are absent
 * on a pre-billing schema: they check when present and are omitted when absent, exactly as the
 * declared optionality means.
 */

import {
    isBoolean, isNullableNumber, isNullableString, isNumber, isOneOf, isRecord, isString, parseEach,
} from "./wire"
import type {
    CatalogItemRow,
    CatalogOrderRow,
    CatalogTierRow,
    DomainRow,
    InvoiceRow,
    OrderProduct,
    WalletRow,
    WalletTopUpPayLink,
    WalletTransactionRow,
} from "./commerce"

const parseDomainRow = (value: unknown): DomainRow | null =>
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
export const parseDomainRows = (input: unknown): ReadonlyArray<DomainRow> | null =>
    parseEach(input, parseDomainRow)

/** Parse the `data` of `myWallet`. */
export const parseWalletRow = (input: unknown): WalletRow | null =>
    isRecord(input) && isString(input.id) && isNumber(input.balanceVnd)
        ? { id: input.id, balanceVnd: input.balanceVnd }
        : null

const parseWalletTransactionRow = (value: unknown): WalletTransactionRow | null =>
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
export const parseWalletTransactionRows = (input: unknown): ReadonlyArray<WalletTransactionRow> | null =>
    parseEach(input, parseWalletTransactionRow)

/** Parse the `data` of `createWalletTopUpPayLink`. */
export const parseWalletTopUpPayLink = (input: unknown): WalletTopUpPayLink | null =>
    isRecord(input) &&
    isString(input.paymentId) &&
    isOneOf(input.gateway, ["payos", "sepay"]) &&
    isString(input.referenceId) &&
    isString(input.checkoutUrl) &&
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

const parseOrderProductItem = (value: unknown): NonNullable<OrderProduct["catalogItem"]> | null => {
    if (!isRecord(value) || !isString(value.id) || !isString(value.name)) return null
    const billingModel = value.billingModel
    if (billingModel === undefined) return { id: value.id, name: value.name }
    if (!(billingModel === null || isOneOf(billingModel, ["one_time", "recurring", "setup_plus_recurring"])))
        return null
    return { id: value.id, name: value.name, billingModel }
}

const parseOrderProductTier = (value: unknown): NonNullable<OrderProduct["catalogTier"]> | null =>
    isRecord(value) && isString(value.id) && isString(value.name) ? { id: value.id, name: value.name } : null

const parseOrderProduct = (value: Record<string, unknown>): OrderProduct | null => {
    const catalogItem =
        value.catalogItem === null || value.catalogItem === undefined
            ? null
            : parseOrderProductItem(value.catalogItem)
    const catalogTier =
        value.catalogTier === null || value.catalogTier === undefined
            ? null
            : parseOrderProductTier(value.catalogTier)
    if (value.catalogItem !== null && catalogItem === null) return null
    if (value.catalogTier !== null && catalogTier === null) return null
    return { catalogItem, catalogTier }
}

/** The additive order-cycle fields, checked when present and omitted when absent. */
const parseOrderCycleFields = (
    value: Record<string, unknown>,
): Pick<CatalogOrderRow, "renewsAt" | "autoRenew" | "provisioningOrderRef"> | null => {
    const fields: {
        renewsAt?: string | null
        autoRenew?: boolean
        provisioningOrderRef?: string | null
    } = {}
    if (value.renewsAt !== undefined) {
        if (!isNullableString(value.renewsAt)) return null
        fields.renewsAt = value.renewsAt
    }
    if (value.autoRenew !== undefined) {
        if (!isBoolean(value.autoRenew)) return null
        fields.autoRenew = value.autoRenew
    }
    if (value.provisioningOrderRef !== undefined) {
        if (!isNullableString(value.provisioningOrderRef)) return null
        fields.provisioningOrderRef = value.provisioningOrderRef
    }
    return fields
}

const parseInvoiceCatalogOrder = (value: unknown): InvoiceRow["catalogOrder"] | null => {
    if (value === null) return null
    if (!isRecord(value) || !isString(value.id)) return null
    const product = parseOrderProduct(value)
    const cycle = parseOrderCycleFields(value)
    if (product === null || cycle === null) return null
    return { id: value.id, ...cycle, ...product }
}

const parseInvoiceRow = (value: unknown): InvoiceRow | null => {
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
export const parseInvoiceRows = (input: unknown): ReadonlyArray<InvoiceRow> | null => parseEach(input, parseInvoiceRow)

/** Parse the `data` of `payInvoice`. */
export const parseInvoiceRowAnswer = (input: unknown): InvoiceRow | null => parseInvoiceRow(input)

const parseCatalogOrderRow = (value: unknown): CatalogOrderRow | null => {
    if (!isRecord(value) || !isString(value.id)) return null
    if (
        !isOneOf(value.status, ["active", "cancelled", "completed", "in_progress", "pending_payment", "suspended"])
    ) {
        return null
    }
    const product = parseOrderProduct(value)
    const cycle = parseOrderCycleFields(value)
    if (product === null || cycle === null) return null
    return { id: value.id, status: value.status, ...cycle, ...product }
}

/** Parse the `data` of `myCatalogOrders`. */
export const parseCatalogOrderRows = (input: unknown): ReadonlyArray<CatalogOrderRow> | null =>
    parseEach(input, parseCatalogOrderRow)

/** Parse the `data` of `orderCatalogItem`, which selects only the order's identity and product. */
export const parseCatalogOrderRowAnswer = (input: unknown): CatalogOrderRow | null => parseCatalogOrderRow(input)

const parseCatalogTierRow = (value: unknown): CatalogTierRow | null =>
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

const parseCatalogItemRow = (value: unknown): CatalogItemRow | null => {
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
export const parseCatalogItemRows = (input: unknown): ReadonlyArray<CatalogItemRow> | null =>
    parseEach(input, parseCatalogItemRow)
