import { describe, expect, it } from "vitest"
import { createFormatter } from "next-intl"
import {
    accountingIntakePolicy,
    accountingCorrectionAccess,
    accountingDocumentAction,
    canonicalMonthKey,
    currencyAmountToMinor,
    formatAccountingInstant,
    formatMinorCurrency,
    maskParticipantId,
} from "./accounting-workbench"

const formatter = (locale: string) => createFormatter({ locale })

const pending = {
    status: "pending",
    effectivePeriodKey: "2026-09-01",
    submittedByUserId: "owner-1",
    approverUserId: "approver-1",
} as const
const periods = [{ periodKey: "2026-09-01", status: "open" }] as const

describe("accountingCorrectionAccess", () => {
    it("denies missing, settled, and unassigned correction authority", () => {
        expect(
            accountingCorrectionAccess({
                explicitLedgerVersion: false,
                role: "approver",
                canApproveCorrection: true,
                periods,
            }),
        ).toMatchObject({ approvalReason: "not-pending" })
        expect(
            accountingCorrectionAccess({
                explicitLedgerVersion: false,
                role: "approver",
                canApproveCorrection: true,
                correction: { ...pending, status: "approved" },
                periods,
            }),
        ).toMatchObject({ approvalReason: "not-pending" })
        expect(
            accountingCorrectionAccess({
                explicitLedgerVersion: false,
                canApproveCorrection: true,
                correction: pending,
                periods,
            }),
        ).toMatchObject({ approvalReason: "not-approver" })
        expect(
            accountingCorrectionAccess({ explicitLedgerVersion: false, role: "owner", canSubmitCorrection: true }),
        ).toMatchObject({ submit: true, approvalReason: "not-owner" })
    })
})

describe("accountingIntakePolicy", () => {
    it("keeps malformed Setup values on the existing no-policy fallback", () => {
        expect(
            accountingIntakePolicy({
                accountingScope: { classifications: ["income", "expense"] },
                currencyAndLocale: { functionalCurrency: "USD" },
            }),
        ).toEqual({ currency: "USD", classifications: ["income", "expense"] })
        expect(
            accountingIntakePolicy({
                accountingScope: { classifications: ["income", "unknown"] },
                currencyAndLocale: { functionalCurrency: "USD" },
            }),
        ).toBeNull()
        expect(
            accountingIntakePolicy({
                accountingScope: { classifications: ["income", "income"] },
                currencyAndLocale: { functionalCurrency: "USD" },
            }),
        ).toBeNull()
        expect(accountingIntakePolicy(null)).toBeNull()
        expect(accountingIntakePolicy([])).toBeNull()
        expect(
            accountingIntakePolicy({
                accountingScope: [],
                currencyAndLocale: { functionalCurrency: "USD" },
            }),
        ).toBeNull()
    })
})

describe("currencyAmountToMinor", () => {
    it("rejects ambiguous amount and month input without silently rounding", () => {
        expect(currencyAmountToMinor("not-an-amount", "USD", formatter("en"))).toBeNull()
        expect(currencyAmountToMinor("1.001", "USD", formatter("en"))).toBeNull()
        expect(currencyAmountToMinor("1,234.5", "USD", formatter("en"))).toBe("123450")
        expect(currencyAmountToMinor(" 1 234,5 ", "EUR", formatter("fr"))).toBe("123450")
        expect(canonicalMonthKey("")).toBeNull()
    })
})

describe("formatMinorCurrency", () => {
    it("falls back safely for malformed stored amounts and masks short identities", () => {
        expect(formatMinorCurrency("not-minor", "VND", formatter("vi"))).toBe("not-minor VND")
        expect(formatMinorCurrency("-000", "USD", formatter("en"))).not.toContain("-")
        expect(formatMinorCurrency("12345", "USD", formatter("en"))).toBe("$123.45")
        expect(maskParticipantId("12345678")).toBe("12…78")
    })

    it("formats instants with the injected next-intl formatter and keeps invalid input readable", () => {
        const format = formatter("en")
        expect(formatAccountingInstant("not-a-date", format)).toBe("not-a-date")
        expect(formatAccountingInstant("2026-09-30T12:00:00Z", format)).toBe(
            format.dateTime(new Date("2026-09-30T12:00:00Z"), {
                dateStyle: "short",
                timeStyle: "short",
                timeZone: "UTC",
            }),
        )
    })
})

describe("accountingDocumentAction", () => {
    it("does not invent document actions for unknown roles or states", () => {
        expect(accountingDocumentAction("draft")).toBeNull()
        expect(accountingDocumentAction("unknown", "approver")).toBeNull()
    })
})
