import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  api: {
    commandSalesClarifyCommand: vi.fn(),
    commandSalesClose: vi.fn(),
    commandSalesConfigurePolicy: vi.fn(),
    commandSalesDecideProposal: vi.fn(),
    commandSalesPrepareHandoff: vi.fn(),
    commandSalesRecoverAction: vi.fn(),
    commandSalesSubmitCommand: vi.fn(),
    commandSalesSubmitHandoff: vi.fn()
  },
  useNivoMutation: vi.fn((key, mutation, options) => ({ key, mutation, options })),
  useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "access-token" } }))
}));

vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }));
vi.mock("@/modules/auth/session", () => ({ useSession: mocks.useSession }));
vi.mock("@/modules/api/sales", () => mocks.api);

import {
  useMutateSalesClarifyCommandSwr, useMutateSalesCloseSwr, useMutateSalesConfigurePolicySwr,
  useMutateSalesDecideProposalSwr, useMutateSalesPrepareHandoffSwr, useMutateSalesRecoverActionSwr,
  useMutateSalesSubmitCommandSwr, useMutateSalesSubmitHandoffSwr
} from "./sales";
import {
  salesActionQueryKey, salesCommandQueryKey, salesDecisionRequestQueryKey, salesHandoffQueryKey,
  salesOpportunityQueryKey, salesPolicyQueryKey
} from "../queries/sales";

const SCOPE = { workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" };
const INTENT = "b7b7c1f0-1f4a-4a3e-9a2b-3a1c5d6e7f80";
const FINGERPRINT = "a".repeat(64);
const FENCE = { claimTokenHash: FINGERPRINT, fencedAt: "2026-09-25T00:00:00.000Z" };

type CommandHook<TInput> = {
  readonly key: unknown;
  readonly mutation: (trigger: { readonly requestId: string; readonly input: TInput }) => unknown;
  readonly options: {
    readonly invalidates: (trigger: { readonly requestId: string; readonly input: TInput }, answer: unknown) => ReadonlyArray<unknown>;
    readonly shouldInvalidate: (answer: unknown) => boolean;
  };
};
type AnswerHook = { readonly options: { readonly shouldInvalidate: (answer: { readonly ok: boolean; readonly code?: string }) => boolean } };

const CONFIGURE_POLICY_INPUT = { requestId: INTENT, salesInstallationId: "installation-1", expectedPolicyRevision: null, values: {} };
const SUBMIT_COMMAND_INPUT = { commandId: "command-1", commandRevision: 1, scope: { customerRefs: [], opportunityIds: [], offerRefs: [] }, requestedActions: [] as Array<"qualify">, fingerprint: FINGERPRINT, expectedOpportunityRevisions: {} };
const CLARIFY_COMMAND_INPUT = { commandId: "command-1", clarificationRevision: 1, permittedFact: { customerRef: "customer-1" } };
const DECIDE_PROPOSAL_INPUT = { decisionRequestId: "decision-1", proposalVersion: 1, proposalFingerprint: FINGERPRINT, answer: "reject" as const, expectedDecisionRevision: 1 };
const CLOSE_INPUT = { intentId: INTENT, opportunityId: "opportunity-1", outcome: "won" as const, evidenceRefs: [], confirmedOrder: { orderId: "order-1" }, expectedRevision: 2 };
const PREPARE_HANDOFF_INPUT = { handoffId: "handoff-1", opportunityId: "opportunity-1", orderRevision: 3, destinationAccountingInstallationId: "installation-2", consentRef: "consent-1", fingerprint: FINGERPRINT, expectedRevision: 4 };
const SUBMIT_HANDOFF_INPUT = { handoffId: "handoff-1", confirmedOrderRevision: 3, fingerprint: FINGERPRINT, expectedHandoffRevision: 1 };
const RETRY_ACTION_INPUT = { operation: "retryNoStart" as const, actionId: "action-1", attemptGeneration: 1, receiverIntentId: "receiver-intent-1", receiverAttemptId: "receiver-attempt-1", receiverNoStartProofRef: "proof-1", oldWriterFence: FENCE, fingerprint: FINGERPRINT, expectedRevision: 2 };

const served = { ok: true, operation: "sales.close@1", variant: "sales_opportunity", value: { opportunityId: "opportunity-1" } };
const unknownOutcome = { ok: false, code: "outcome_unknown", operation: "sales.close@1", requestId: INTENT, reconciles: "sales.opportunity@1", refusal: null, reason: null };
const deadline = { ok: false, code: "DEADLINE_EXCEEDED", operation: "sales.close@1", requestId: INTENT, reconciles: "sales.opportunity@1", refusal: null, reason: "receiver-deadline" };
const refused = { ok: false, code: "SALES_REFUSED_CONFLICT", operation: "sales.close@1", requestId: INTENT, reconciles: "sales.opportunity@1", refusal: { reason: "CONFLICT", code: "SALES_OPPORTUNITY_REVISION_CONFLICT", item: null, currentRevision: 4 }, reason: null };

describe("useMutateSalesConfigurePolicySwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends one press under its own identity and refreshes the revision that identity stored", () => {
    const hook = useMutateSalesConfigurePolicySwr(SCOPE) as unknown as CommandHook<typeof CONFIGURE_POLICY_INPUT>;
    const trigger = { requestId: INTENT, input: CONFIGURE_POLICY_INPUT };
    expect(hook.key).toEqual(["sales", "configure-policy", "workspace-1", "instance-1", "installation-1"]);
    hook.mutation(trigger);
    expect(mocks.api.commandSalesConfigurePolicy).toHaveBeenCalledWith("access-token", SCOPE, CONFIGURE_POLICY_INPUT, INTENT);
    expect(hook.options.invalidates(trigger, served)).toEqual([salesPolicyQueryKey(SCOPE, { salesInstallationId: "installation-1", requestId: INTENT })]);
  });
});

describe("useMutateSalesSubmitCommandSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes the command plan the press named rather than the whole board", () => {
    const hook = useMutateSalesSubmitCommandSwr(SCOPE) as unknown as CommandHook<typeof SUBMIT_COMMAND_INPUT>;
    const trigger = { requestId: INTENT, input: SUBMIT_COMMAND_INPUT };
    expect(hook.key).toEqual(["sales", "submit-command", "workspace-1", "instance-1", "installation-1"]);
    hook.mutation(trigger);
    expect(mocks.api.commandSalesSubmitCommand).toHaveBeenCalledWith("access-token", SCOPE, SUBMIT_COMMAND_INPUT, INTENT);
    expect(hook.options.invalidates(trigger, served)).toEqual([salesCommandQueryKey(SCOPE, { commandId: "command-1" })]);
  });
});

describe("useMutateSalesClarifyCommandSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes the same command plan a clarification refined", () => {
    const hook = useMutateSalesClarifyCommandSwr(SCOPE) as unknown as CommandHook<typeof CLARIFY_COMMAND_INPUT>;
    const trigger = { requestId: INTENT, input: CLARIFY_COMMAND_INPUT };
    hook.mutation(trigger);
    expect(mocks.api.commandSalesClarifyCommand).toHaveBeenCalledWith("access-token", SCOPE, CLARIFY_COMMAND_INPUT, INTENT);
    expect(hook.options.invalidates(trigger, served)).toEqual([salesCommandQueryKey(SCOPE, { commandId: "command-1" })]);
  });
});

describe("useMutateSalesDecideProposalSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes the decision request the press answered", () => {
    const hook = useMutateSalesDecideProposalSwr(SCOPE) as unknown as CommandHook<typeof DECIDE_PROPOSAL_INPUT>;
    const trigger = { requestId: INTENT, input: DECIDE_PROPOSAL_INPUT };
    hook.mutation(trigger);
    expect(mocks.api.commandSalesDecideProposal).toHaveBeenCalledWith("access-token", SCOPE, DECIDE_PROPOSAL_INPUT, INTENT);
    expect(hook.options.invalidates(trigger, served)).toEqual([salesDecisionRequestQueryKey(SCOPE, { decisionRequestId: "decision-1" })]);
  });
});

describe("useMutateSalesCloseSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes the opportunity it closed and reads a refusal as needing no read", () => {
    const hook = useMutateSalesCloseSwr(SCOPE) as unknown as CommandHook<typeof CLOSE_INPUT>;
    const trigger = { requestId: INTENT, input: CLOSE_INPUT };
    hook.mutation(trigger);
    expect(mocks.api.commandSalesClose).toHaveBeenCalledWith("access-token", SCOPE, CLOSE_INPUT, INTENT);
    expect(hook.options.invalidates(trigger, served)).toEqual([salesOpportunityQueryKey(SCOPE, { opportunityId: "opportunity-1" })]);
    expect(hook.options.shouldInvalidate(served)).toBe(true);
    expect(hook.options.shouldInvalidate(unknownOutcome)).toBe(true);
    expect(hook.options.shouldInvalidate(deadline)).toBe(true);
    expect(hook.options.shouldInvalidate(refused)).toBe(false);
  });
});

describe("useMutateSalesPrepareHandoffSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes the handoff it prepared", () => {
    const hook = useMutateSalesPrepareHandoffSwr(SCOPE) as unknown as CommandHook<typeof PREPARE_HANDOFF_INPUT>;
    const trigger = { requestId: INTENT, input: PREPARE_HANDOFF_INPUT };
    hook.mutation(trigger);
    expect(mocks.api.commandSalesPrepareHandoff).toHaveBeenCalledWith("access-token", SCOPE, PREPARE_HANDOFF_INPUT, INTENT);
    expect(hook.options.invalidates(trigger, served)).toEqual([salesHandoffQueryKey(SCOPE, { handoffId: "handoff-1" })]);
  });
});

describe("useMutateSalesSubmitHandoffSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes the same handoff it admitted", () => {
    const hook = useMutateSalesSubmitHandoffSwr(SCOPE) as unknown as CommandHook<typeof SUBMIT_HANDOFF_INPUT>;
    const trigger = { requestId: INTENT, input: SUBMIT_HANDOFF_INPUT };
    hook.mutation(trigger);
    expect(mocks.api.commandSalesSubmitHandoff).toHaveBeenCalledWith("access-token", SCOPE, SUBMIT_HANDOFF_INPUT, INTENT);
    expect(hook.options.invalidates(trigger, served)).toEqual([salesHandoffQueryKey(SCOPE, { handoffId: "handoff-1" })]);
  });
});

describe("useMutateSalesRecoverActionSwr", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes the action a retry or a stop named, and reads a refusal as needing no read", () => {
    const hook = useMutateSalesRecoverActionSwr(SCOPE) as unknown as CommandHook<typeof RETRY_ACTION_INPUT>;
    const trigger = { requestId: INTENT, input: RETRY_ACTION_INPUT };
    expect(hook.key).toEqual(["sales", "recover-action", "workspace-1", "instance-1", "installation-1"]);
    hook.mutation(trigger);
    expect(mocks.api.commandSalesRecoverAction).toHaveBeenCalledWith("access-token", SCOPE, RETRY_ACTION_INPUT, INTENT);
    expect(hook.options.invalidates(trigger, served)).toEqual([salesActionQueryKey(SCOPE, { actionId: "action-1" })]);
    expect((hook as unknown as AnswerHook).options.shouldInvalidate(refused)).toBe(false);
  });
});

describe("sales", () => {
  beforeEach(() => vi.clearAllMocks());

  it("never lets two commands share one press-local identity, and one predicate governs every read they owe", () => {
    const keys = [
      (useMutateSalesConfigurePolicySwr(SCOPE) as unknown as CommandHook<typeof CONFIGURE_POLICY_INPUT>).key,
      (useMutateSalesSubmitCommandSwr(SCOPE) as unknown as CommandHook<typeof SUBMIT_COMMAND_INPUT>).key,
      (useMutateSalesClarifyCommandSwr(SCOPE) as unknown as CommandHook<typeof CLARIFY_COMMAND_INPUT>).key,
      (useMutateSalesDecideProposalSwr(SCOPE) as unknown as CommandHook<typeof DECIDE_PROPOSAL_INPUT>).key,
      (useMutateSalesCloseSwr(SCOPE) as unknown as CommandHook<typeof CLOSE_INPUT>).key,
      (useMutateSalesPrepareHandoffSwr(SCOPE) as unknown as CommandHook<typeof PREPARE_HANDOFF_INPUT>).key,
      (useMutateSalesSubmitHandoffSwr(SCOPE) as unknown as CommandHook<typeof SUBMIT_HANDOFF_INPUT>).key,
      (useMutateSalesRecoverActionSwr(SCOPE) as unknown as CommandHook<typeof RETRY_ACTION_INPUT>).key
    ];
    expect(new Set(keys.map(key => JSON.stringify(key))).size).toBe(keys.length);
    expect(mocks.useNivoMutation).toHaveBeenCalledTimes(keys.length);
    for (const hook of [useMutateSalesConfigurePolicySwr(SCOPE), useMutateSalesCloseSwr(SCOPE)] as unknown as Array<AnswerHook>) {
      expect(hook.options.shouldInvalidate({ ok: true })).toBe(true);
      expect(hook.options.shouldInvalidate({ ok: false, code: "SALES_REFUSED_DENIED" })).toBe(false);
    }
  });
});