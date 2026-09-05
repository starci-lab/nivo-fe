import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import { accountingCorrectionAccess, accountingDocumentAction, bytesToBase64, canonicalMonthKey, currencyAmountToMinor, eligibleCorrectionSourceEntries, formatMinorCurrency, maskParticipantId } from ".";

const pending = { status: "pending", effectivePeriodKey: "2026-09-01", submittedByUserId: "owner-1", approverUserId: "approver-1" } as const;
const periods = [{ periodKey: "2026-09-01", status: "open" }] as const;

describe("AccountingWorkbenchBlock authority projection", () => {
  it("uses the backend-exact closed document statuses", () => {
    expect(accountingDocumentAction("draft", "owner")).toBe("submit");
    expect(accountingDocumentAction("submitted", "approver")).toBe("approve");
    expect(accountingDocumentAction("approved", "owner")).toBe("post");
    expect(accountingDocumentAction("posted", "owner")).toBeNull();
    expect(accountingDocumentAction("submitted", "owner")).toBeNull();
  });

  it("never offers owner self-approval even when a stale flag is optimistic", () => {
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "owner", canApproveCorrection: true, correction: pending, periods })).toMatchObject({ submit: false, approve: false, approvalReason: "not-owner" });
  });

  it("disables both correction mutations for every explicit historical view", () => {
    expect(accountingCorrectionAccess({ explicitLedgerVersion: true, role: "owner", canSubmitCorrection: true, canApproveCorrection: true, correction: pending, periods })).toEqual({ submit: false, approve: false, approvalReason: "historical" });
    expect(accountingCorrectionAccess({ explicitLedgerVersion: true, role: "approver", canApproveCorrection: true, correction: pending, periods })).toEqual({ submit: false, approve: false, approvalReason: "historical" });
  });

  it("evaluates approval for each pending row against assignment distinction and open period", () => {
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "approver", canApproveCorrection: true, correction: pending, periods })).toEqual({ submit: false, approve: true, approvalReason: "allowed" });
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "approver", canApproveCorrection: true, correction: pending, periods: [{ periodKey: "2026-09-01", status: "closed" }] })).toMatchObject({ approve: false, approvalReason: "period-not-open" });
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "approver", canApproveCorrection: true, correction: { ...pending, approverUserId: "owner-1" }, periods })).toMatchObject({ approve: false, approvalReason: "self-assigned" });
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "approver", canApproveCorrection: false, correction: pending, periods })).toMatchObject({ approve: false, approvalReason: "advisory-denied" });
  });

  it("offers only ledger tips without an existing correction proposal", () => {
    const entry = (id: string, correctionOfId: string | null) => ({ id, correctionOfId, documentId: null, ledgerVersion: "1", periodKey: "2026-09-01", signedAmountMinor: "100", currency: "VND", kind: "document", reason: null, createdAt: "2026-09-06T00:00:00Z" }) as const;
    const ledger = [entry("original", null), entry("corrected", "original"), entry("already-proposed", null), entry("eligible", null)];
    expect(eligibleCorrectionSourceEntries(ledger, [{ sourceEntryId: "already-proposed" }]).map(item => item.id)).toEqual(["corrected", "eligible"]);
  });

  it("adapts business month, currency and file values to the backend primitives", () => {
    expect(canonicalMonthKey("2026-09")).toBe("2026-09-01");
    expect(canonicalMonthKey("2026-13")).toBeNull();
    expect(currencyAmountToMinor("1,234.56", "USD", "en")).toBe("123456");
    expect(currencyAmountToMinor("-1.234", "VND", "vi")).toBe("-1234");
    expect(currencyAmountToMinor("0", "VND", "vi")).toBe("0");
    expect(formatMinorCurrency("1234567", "VND", "vi")).toContain("1.234.567");
    expect(bytesToBase64(new Uint8Array([100, 97, 116, 97]))).toBe("ZGF0YQ==");
    expect(maskParticipantId("participant-user-1234")).toBe("part…1234");
  });

  it("keeps Accounting message keys in English and Vietnamese in exact parity", () => {
    const english = en.console.agentos.modules.runtime.workbench.accountingWorkbench;
    const vietnamese = vi.console.agentos.modules.runtime.workbench.accountingWorkbench;
    expect(Object.keys(vietnamese).sort()).toEqual(Object.keys(english).sort());
    expect(Object.keys(vietnamese.role).sort()).toEqual(Object.keys(english.role).sort());
  });
});
