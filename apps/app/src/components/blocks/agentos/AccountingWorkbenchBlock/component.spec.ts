import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import { accountingCorrectionAccess } from ".";

describe("AccountingWorkbenchBlock authority projection", () => {
  it("never offers owner self-approval even when a stale flag is optimistic", () => {
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "owner", canApproveCorrection: true })).toEqual({ submit: false, approve: false });
  });

  it("disables correction submission for every explicit historical view", () => {
    expect(accountingCorrectionAccess({ explicitLedgerVersion: true, role: "owner", canSubmitCorrection: true })).toEqual({ submit: false, approve: false });
  });

  it("offers approval only to the distinct approver while leaving final authorization to the mutation", () => {
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "approver", canApproveCorrection: true })).toEqual({ submit: false, approve: true });
    expect(accountingCorrectionAccess({ explicitLedgerVersion: false, role: "approver", canApproveCorrection: false })).toEqual({ submit: false, approve: false });
  });

  it("keeps Accounting message keys in English and Vietnamese in exact parity", () => {
    const english = en.console.agentos.modules.runtime.workbench.accountingWorkbench;
    const vietnamese = vi.console.agentos.modules.runtime.workbench.accountingWorkbench;
    expect(Object.keys(vietnamese).sort()).toEqual(Object.keys(english).sort());
    expect(Object.keys(vietnamese.role).sort()).toEqual(Object.keys(english.role).sort());
  });
});
