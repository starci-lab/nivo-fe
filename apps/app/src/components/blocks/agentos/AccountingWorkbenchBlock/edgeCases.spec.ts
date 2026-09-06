import { describe, expect, it } from "vitest";
import {
  accountingCorrectionAccess,
  accountingDocumentAction,
  canonicalMonthKey,
  currencyAmountToMinor,
  formatMinorCurrency,
  maskParticipantId
} from "./useAccountingWorkbench";

const pending = { status: "pending", effectivePeriodKey: "2026-09-01", submittedByUserId: "owner-1", approverUserId: "approver-1" } as const;
const periods = [{ periodKey: "2026-09-01", status: "open" }] as const;

describe("Accounting semantic edge cases", () => {
  it("denies missing, settled, and unassigned correction authority", () => {
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "approver", canApproveCorrection: true, periods })).toMatchObject({ approvalReason: "not-pending" });
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "approver", canApproveCorrection: true, correction: { ...pending, status: "approved" }, periods })).toMatchObject({ approvalReason: "not-pending" });
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, canApproveCorrection: true, correction: pending, periods })).toMatchObject({ approvalReason: "not-approver" });
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "owner", canSubmitCorrection: true })).toMatchObject({ submit: true, approvalReason: "not-owner" });
  });

  it("rejects ambiguous amount and month input without silently rounding", () => {
    expect(currencyAmountToMinor("not-an-amount", "USD", "en")).toBeNull();
    expect(currencyAmountToMinor("1.001", "USD", "en")).toBeNull();
    expect(currencyAmountToMinor(" 1 234,5 ", "EUR", "fr")).toBe("123450");
    expect(canonicalMonthKey("")).toBeNull();
  });

  it("falls back safely for malformed stored amounts and masks short identities", () => {
    expect(formatMinorCurrency("not-minor", "VND", "vi")).toBe("not-minor VND");
    expect(formatMinorCurrency("-000", "USD", "en")).not.toContain("-");
    expect(maskParticipantId("12345678")).toBe("12…78");
  });

  it("does not invent document actions for unknown roles or states", () => {
    expect(accountingDocumentAction("draft")).toBeNull();
    expect(accountingDocumentAction("unknown", "approver")).toBeNull();
  });
});
