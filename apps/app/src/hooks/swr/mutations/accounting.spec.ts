import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  api: {
    approveAccountingCorrection: vi.fn(),
    approveAccountingDocument: vi.fn(),
    closeAccountingPeriod: vi.fn(),
    commandAccountingAdmitEvidence: vi.fn(),
    commandAccountingCorrect: vi.fn(),
    commandAccountingException: vi.fn(),
    commandAccountingRoutine: vi.fn(),
    ingestAccountingDocument: vi.fn(),
    initializeAccounting: vi.fn(),
    postAccountingDocument: vi.fn(),
    reconcileAccounting: vi.fn(),
    submitAccountingCorrection: vi.fn(),
    submitAccountingDocument: vi.fn()
  },
  useNivoMutation: vi.fn((key, mutation, options) => ({ key, mutation, options })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } }))
}));

vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/modules/auth/session", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/accounting", () => mocks.api);

import {
  useMutateAccountingAdmitEvidenceSwr,
  useMutateAccountingCorrectSwr,
  useMutateAccountingExceptionSwr,
  useMutateAccountingRoutineSwr,
  useMutateApproveAccountingCorrectionSwr,
  useMutateApproveAccountingDocumentSwr,
  useMutateCloseAccountingPeriodSwr,
  useMutateIngestAccountingDocumentSwr,
  useMutateInitializeAccountingSwr,
  useMutatePostAccountingDocumentSwr,
  useMutateReconcileAccountingSwr,
  useMutateSubmitAccountingCorrectionSwr,
  useMutateSubmitAccountingDocumentSwr
} from "./accounting";
import {
  accountingContextQueryKey, accountingEvidenceQueryKey, accountingResultDetailQueryKey,
  accountingRoutineResultQueryKey, accountingWorkbenchQueryKey
} from "../queries/accounting";

type MutationHook = {
  readonly key: unknown;
  readonly mutation: (input: Record<string, unknown>) => unknown;
  readonly options: { readonly shouldInvalidate: (answer: { readonly ok: boolean }) => boolean };
};

describe("useMutateInitializeAccountingSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalidates only current accounting projections after accepted initialize", () => {
    const hook = useMutateInitializeAccountingSwr("installation-1", "VND") as unknown as { readonly options: { readonly invalidates: Array<unknown>; readonly shouldInvalidate: (answer: { ok: boolean }) => boolean } };
    expect(hook.options.invalidates).toEqual([accountingContextQueryKey("installation-1"), accountingWorkbenchQueryKey("installation-1", "VND")]);
    expect(hook.options.shouldInvalidate({ ok: true })).toBe(true);
    expect(hook.options.shouldInvalidate({ ok: false })).toBe(false);
  });
});

describe("useMutateSubmitAccountingCorrectionSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps submit and approval as separate press-local mutation identities", () => {
    const submit = useMutateSubmitAccountingCorrectionSwr("installation-1", "VND") as unknown as { readonly key: unknown };
    const approve = useMutateApproveAccountingCorrectionSwr("installation-1", "VND") as unknown as { readonly key: unknown };
    expect(submit.key).toEqual(["accounting", "correction-submit", "installation-1"]);
    expect(approve.key).toEqual(["accounting", "correction-approve", "installation-1"]);
    expect(submit.key).not.toEqual(approve.key);
  });
});

describe("useMutateIngestAccountingDocumentSwr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes every command through its installation-scoped API binding", () => {
    const cases = [
      [useMutateInitializeAccountingSwr, mocks.api.initializeAccounting, { currency: "VND", openingBalance: 0 }],
      [useMutateIngestAccountingDocumentSwr, mocks.api.ingestAccountingDocument, { fileName: "invoice.pdf", contentType: "application/pdf", contentBase64: "AA==" }],
      [useMutateSubmitAccountingDocumentSwr, mocks.api.submitAccountingDocument, { documentId: "doc-1" }],
      [useMutateApproveAccountingDocumentSwr, mocks.api.approveAccountingDocument, { documentId: "doc-1" }],
      [useMutatePostAccountingDocumentSwr, mocks.api.postAccountingDocument, { documentId: "doc-1" }],
      [useMutateReconcileAccountingSwr, mocks.api.reconcileAccounting, { sourceAmount: 10, ledgerAmount: 10 }],
      [useMutateCloseAccountingPeriodSwr, mocks.api.closeAccountingPeriod, { periodEnd: "2026-09-30" }],
      [useMutateSubmitAccountingCorrectionSwr, mocks.api.submitAccountingCorrection, { documentId: "doc-1", reason: "Fix" }],
      [useMutateApproveAccountingCorrectionSwr, mocks.api.approveAccountingCorrection, { correctionId: "correction-1" }]
    ] as const;

    for (const [useHook, api, input] of cases) {
      const hook = useHook("installation-1", "VND") as unknown as MutationHook;
      hook.mutation(input);
      expect(api).toHaveBeenCalledWith({ installationId: "installation-1", ...input });
      expect(hook.options.shouldInvalidate({ ok: true })).toBe(true);
      expect(hook.options.shouldInvalidate({ ok: false })).toBe(false);
    }
    expect(mocks.useNivoMutation).toHaveBeenCalledTimes(cases.length);
  });
});

/* -------------------------------------------------------------------------------------------------
 * The installation-scoped Accounting commands.
 * ----------------------------------------------------------------------------------------------- */

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const INTENT = "b7b7c1f0-1f4a-4a3e-9a2b-3a1c5d6e7f80";

type CommandHook<TTrigger> = {
  readonly key: unknown;
  readonly mutation: (trigger: TTrigger) => unknown;
  readonly options: {
    readonly invalidates: (trigger: TTrigger, answer: unknown) => ReadonlyArray<unknown>;
    readonly shouldInvalidate: (answer: unknown) => boolean;
  };
};

type AdmitTrigger = { readonly requestId: string; readonly input: { readonly evidenceId: string } };
type RoutineTrigger = { readonly requestId: string; readonly input: { readonly action: "commit"; readonly itemId: string; readonly evidenceIds: ReadonlyArray<string>; readonly intentId: string; readonly policyRevision: string; readonly expectedItemRevision: number } };
type CorrectTrigger = { readonly requestId: string; readonly input: { readonly action: "propose"; readonly correctionId: string; readonly predecessorResultId: string; readonly correctedFacts: ReadonlyArray<never>; readonly reason: string; readonly evidenceRefs: ReadonlyArray<string>; readonly expectedResultRevision: number } };

const servedEvidence = { ok: true, data: { op: "evidence", payload: { evidenceId: "evidence-1", state: "admitted", revision: 1, missingFacts: [] } } };
const unknownOutcome = { ok: false, code: "outcome_unknown", operation: "accounting.admitEvidence@1", requestId: INTENT, reconciles: "accounting.evidence@1" };
const refused = { ok: false, code: "REFUSED", operation: "accounting.admitEvidence@1", requestId: INTENT, reason: "refused", reconciles: "accounting.evidence@1" };

describe("useMutateAccountingAdmitEvidenceSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends one press under its own intent identity and refreshes the evidence it names", () => {
    const hook = useMutateAccountingAdmitEvidenceSwr(SCOPE) as unknown as CommandHook<AdmitTrigger>;
    const trigger: AdmitTrigger = { requestId: INTENT, input: { evidenceId: "evidence-1" } };
    expect(hook.key).toEqual(["accounting", "admit-evidence", "workspace-1", "instance-1", "installation-1"]);
    hook.mutation(trigger);
    expect(mocks.api.commandAccountingAdmitEvidence).toHaveBeenCalledWith("access-token", SCOPE, { evidenceId: "evidence-1" }, INTENT);
    expect(hook.options.invalidates(trigger, servedEvidence)).toEqual([accountingEvidenceQueryKey(SCOPE, { evidenceId: "evidence-1" })]);
    expect(hook.options.shouldInvalidate(servedEvidence)).toBe(true);
    expect(hook.options.shouldInvalidate(unknownOutcome)).toBe(true);
    expect(hook.options.shouldInvalidate(refused)).toBe(false);
  });
});

describe("useMutateAccountingRoutineSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes the routine intent read rather than the statement the press did not touch", () => {
    const hook = useMutateAccountingRoutineSwr(SCOPE) as unknown as CommandHook<RoutineTrigger>;
    const trigger: RoutineTrigger = { requestId: INTENT, input: { action: "commit", itemId: "item-1", evidenceIds: ["evidence-1"], intentId: "intent-1", policyRevision: "policy-1", expectedItemRevision: 3 } };
    expect(hook.key).toEqual(["accounting", "routine", "workspace-1", "instance-1", "installation-1"]);
    hook.mutation(trigger);
    expect(mocks.api.commandAccountingRoutine).toHaveBeenCalledWith("access-token", SCOPE, trigger.input, INTENT);
    expect(hook.options.invalidates(trigger, servedEvidence)).toEqual([accountingRoutineResultQueryKey(SCOPE, { intentId: "intent-1" })]);
    expect(hook.options.shouldInvalidate(unknownOutcome)).toBe(true);
  });
});

describe("useMutateAccountingExceptionSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("owns no read of its own, so it invalidates nothing it cannot name", () => {
    const hook = useMutateAccountingExceptionSwr(SCOPE) as unknown as { readonly key: unknown; readonly mutation: (trigger: { readonly requestId: string; readonly input: unknown }) => unknown; readonly options: unknown };
    hook.mutation({ requestId: INTENT, input: { action: "defer", exceptionId: "exception-1", reason: "awaiting owner", expectedRevision: 4 } });
    expect(hook.key).toEqual(["accounting", "exception", "workspace-1", "instance-1", "installation-1"]);
    expect(mocks.api.commandAccountingException).toHaveBeenCalledWith("access-token", SCOPE, { action: "defer", exceptionId: "exception-1", reason: "awaiting owner", expectedRevision: 4 }, INTENT);
    expect(hook.options).toBeUndefined();
  });
});

describe("useMutateAccountingCorrectSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the result lineage the correction names, from the answer when it has one", () => {
    const hook = useMutateAccountingCorrectSwr(SCOPE) as unknown as CommandHook<CorrectTrigger>;
    const trigger: CorrectTrigger = { requestId: INTENT, input: { action: "propose", correctionId: "correction-1", predecessorResultId: "result-1", correctedFacts: [], reason: "wrong currency", evidenceRefs: ["evidence-1"], expectedResultRevision: 2 } };
    expect(hook.key).toEqual(["accounting", "correct", "workspace-1", "instance-1", "installation-1"]);
    hook.mutation(trigger);
    expect(mocks.api.commandAccountingCorrect).toHaveBeenCalledWith("access-token", SCOPE, trigger.input, INTENT);
    expect(hook.options.invalidates(trigger, { ok: true, data: { op: "correct", payload: { correctionId: "correction-1", attemptId: "attempt-1", state: "applied", resultId: "result-9", predecessorResultId: "result-1" } } })).toEqual([accountingResultDetailQueryKey(SCOPE, { action: "current", resultId: "result-9" })]);
    expect(hook.options.invalidates(trigger, unknownOutcome)).toEqual([accountingResultDetailQueryKey(SCOPE, { action: "current", resultId: "result-1" })]);
  });
});

describe("accounting", () => {
  beforeEach(() => vi.clearAllMocks());

  it("never lets two commands share one press-local identity", () => {
    const keys = [
      (useMutateAccountingAdmitEvidenceSwr(SCOPE) as unknown as CommandHook<AdmitTrigger>).key,
      (useMutateAccountingRoutineSwr(SCOPE) as unknown as CommandHook<RoutineTrigger>).key,
      (useMutateAccountingExceptionSwr(SCOPE) as unknown as { readonly key: unknown }).key,
      (useMutateAccountingCorrectSwr(SCOPE) as unknown as CommandHook<CorrectTrigger>).key
    ];
    expect(new Set(keys.map(key => JSON.stringify(key))).size).toBe(keys.length);
  });
});