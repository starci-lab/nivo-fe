import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import type { SalesDecideProposalRequest, SalesDecisionValue } from "@/modules/api/sales";
import type { SalesNotice, SalesSurfaceStanding, SalesTranslation } from "@/modules/sales/sales-workbench";

/*
 * The connected decision controller's load-bearing behaviours: no operation address exists before the
 * installation scope resolves, no answer is sent before the request identity is named, no press
 * reports an effect the readback has not disclosed, an unknown outcome is reconciled by re-reading the
 * same identity, and an answer is refused once the read on screen is no longer the proposal the
 * surface opened it on.
 */

const mocks = vi.hoisted(() => {
  const query = (data?: unknown, mutate?: unknown) => ({ value: { data, error: undefined, isLoading: false, isValidating: false, mutate: mutate ?? vi.fn(async () => undefined) } });
  return {
    controlCenter: { value: {} as unknown },
    decisionRead: vi.fn(),
    decideProposal: { value: { isMutating: false, trigger: vi.fn() } },
    query
  };
});

vi.mock("@/hooks/swr/queries/console", () => ({ useQueryMyAgentWorkspaceControlCenterSwr: () => mocks.controlCenter.value }));

/** The transport answer the mocked control-center read unwraps. */
type ControlCenterAnswer = { readonly ok?: boolean; readonly data?: unknown };

vi.mock("@/modules/query", () => ({ nivoQueryData: (answer: ControlCenterAnswer | undefined) => answer?.ok === true ? answer.data : null }));
vi.mock("@/hooks/swr/queries/useQuerySalesDecisionRequestSwr", () => ({ useQuerySalesDecisionRequestSwr: (...args: ReadonlyArray<unknown>) => mocks.decisionRead(...args) }));
vi.mock("@/hooks/swr/mutations/useMutateSalesDecideProposalSwr", () => ({ useMutateSalesDecideProposalSwr: () => mocks.decideProposal.value }));

import { useSalesDecision } from "./useSalesDecision";

const catalog = en.agentos.sales.decision as Readonly<Record<string, unknown>>;
const messageFor = (key: string): string => {
  let node: unknown = catalog;
  for (const part of key.split(".")) {
    if (node === null || typeof node !== "object") return key;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : key;
};
const translate = (key: string, values?: Readonly<Record<string, string | number | undefined>>): string =>
  Object.entries(values ?? {}).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), messageFor(key));
const proposalAnswer = (status: string, revision: number, version = 3) => ({ ok: true, data: { decisionRequestId: "decision-request-1", opportunityId: "opportunity-1", proposalVersion: version, proposalFingerprint: "sha256:proposal", status, revision } });
const render = () => renderHook(() => useSalesDecision("workspace-1", "installation-1", translate));

/** The rendered controller one answer is driven through. */
type RenderedController = { readonly current: ReturnType<typeof useSalesDecision> };
/*
 * The settled view the render half draws, mirrored structurally: the drawing file's own contract is
 * private to its surface, so this spec restates the members it draws rather than importing them.
 */
type DrawableView = {
    readonly t: SalesTranslation;
    readonly scopeWorkspace: string;
    readonly scopeInstallation: string;
    readonly scopeReady: boolean;
    readonly scopeStanding: SalesSurfaceStanding;
    readonly notice: SalesNotice | null;
    readonly proposal: {
        readonly standing: SalesSurfaceStanding;
        readonly model: SalesDecisionValue | null;
        readonly decisionRequestId: string;
        readonly setDecisionRequestId: (value: string) => void;
        readonly isLoading: boolean;
        readonly reload: () => void;
    };
    readonly answer: {
        readonly standing: SalesSurfaceStanding;
        readonly choice: SalesDecideProposalRequest["answer"];
        readonly setChoice: (choice: SalesDecideProposalRequest["answer"]) => void;
        readonly expectedRevision: string;
        readonly setExpectedRevision: (value: string) => void;
        readonly isAnswering: boolean;
        readonly addressable: boolean;
        readonly stale: boolean;
        readonly onSubmit: () => void;
    };
};
/** The view its render half draws; asking for it here is what keeps the two halves in step. */
const drawable = (view: DrawableView): DrawableView => view;

const nameRequest = (result: RenderedController) => {
  act(() => { result.current.proposal.setDecisionRequestId("decision-request-1"); });
};
const nameAnswer = (result: RenderedController) => {
  act(() => { result.current.answer.setExpectedRevision("7"); });
};

describe("useSalesDecision", () => {
  beforeEach(() => {
    mocks.decisionRead.mockClear();
    mocks.decisionRead.mockReturnValue(mocks.query().value);
    mocks.controlCenter.value = { data: { ok: true, data: { instance: { id: "instance-1" } } }, error: undefined };
    mocks.decideProposal.value = { isMutating: false, trigger: vi.fn() };
  });

  it("addresses no operation until the installation scope is resolved", () => {
    mocks.controlCenter.value = { data: { ok: true, data: { instance: null } }, error: undefined };
    const { result } = render();
    expect(result.current.scopeReady).toBe(false);
    expect(mocks.decisionRead.mock.calls[0]?.[2]).toBe(false);
    expect(result.current.proposal.standing).toBe("unavailable");
    expect(result.current.answer.addressable).toBe(false);
  });

  it("addresses the operation route with the route's workspace, the workspace's instance and the installation", () => {
    const { result } = render();
    expect(result.current.scopeReady).toBe(true);
    expect(result.current.scopeWorkspace).toBe("workspace-1");
    expect(result.current.scopeInstallation).toBe("installation-1");
    nameRequest(result);
    expect(mocks.decisionRead.mock.calls.at(-1)?.[0]).toEqual({ workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" });
    expect(mocks.decisionRead.mock.calls.at(-1)?.[1]).toEqual({ decisionRequestId: "decision-request-1" });
    expect(mocks.decisionRead.mock.calls.at(-1)?.[2]).toBe(true);
  });

  it("holds the request read until its own identity is named", () => {
    const { result } = render();
    expect(mocks.decisionRead.mock.calls[0]?.[2]).toBe(false);
    nameRequest(result);
    expect(mocks.decisionRead.mock.calls.at(-1)?.[2]).toBe(true);
  });

  it("offers the answer only for a pending proposal the read disclosed", () => {
    const { result } = render();
    nameRequest(result);
    nameAnswer(result);
    expect(result.current.answer.addressable).toBe(false);
    mocks.decisionRead.mockReturnValue(mocks.query(proposalAnswer("pending", 7)).value);
    const pending = render();
    nameRequest(pending.result);
    nameAnswer(pending.result);
    expect(pending.result.current.answer.addressable).toBe(true);
    mocks.decisionRead.mockReturnValue(mocks.query(proposalAnswer("approved", 8)).value);
    const answered = render();
    nameRequest(answered.result);
    nameAnswer(answered.result);
    expect(answered.result.current.answer.addressable).toBe(false);
  });

  it("reports a refusal as a refusal and never reads it back", async () => {
    const readback = vi.fn(async () => proposalAnswer("pending", 7));
    mocks.decisionRead.mockReturnValue(mocks.query(proposalAnswer("pending", 7), readback).value);
    mocks.decideProposal.value = { isMutating: false, trigger: vi.fn(async () => ({ ok: false, code: "SALES_REFUSED_CONFLICT", reason: "moved on" })) };
    const { result } = render();
    nameRequest(result);
    nameAnswer(result);
    await act(async () => { result.current.answer.onSubmit(); });
    expect(result.current.notice).toEqual({ kind: "refused", message: translate("refusal.conflict", { reason: "moved on" }) });
    expect(readback).not.toHaveBeenCalled();
  });

  it("takes the answer it shows from the readback, not from the press", async () => {
    mocks.decideProposal.value = { isMutating: false, trigger: vi.fn(async () => ({ ok: true, data: { status: "pending" } })) };
    mocks.decisionRead.mockReturnValue(mocks.query(proposalAnswer("pending", 7), vi.fn(async () => proposalAnswer("approved", 8))).value);
    const { result } = render();
    nameRequest(result);
    nameAnswer(result);
    await act(async () => { result.current.answer.onSubmit(); });
    expect(result.current.notice).toEqual({ kind: "success", message: translate("answer.recorded", { status: "approved" }) });
  });

  it("says an answer did not settle when the readback discloses no state", async () => {
    mocks.decideProposal.value = { isMutating: false, trigger: vi.fn(async () => ({ ok: true, data: { status: "pending" } })) };
    mocks.decisionRead.mockReturnValue(mocks.query(proposalAnswer("pending", 7), vi.fn(async () => ({ ok: true, data: undefined }))).value);
    const { result } = render();
    nameRequest(result);
    nameAnswer(result);
    await act(async () => { result.current.answer.onSubmit(); });
    expect(result.current.notice).toEqual({ kind: "refused", message: translate("refusal.unsettled") });
  });

  it("refuses an answer the readback shows was sent against a proposal that moved", async () => {
    mocks.decideProposal.value = { isMutating: false, trigger: vi.fn(async () => ({ ok: true, data: { status: "pending" } })) };
    mocks.decisionRead.mockReturnValue(mocks.query(proposalAnswer("pending", 7), vi.fn(async () => proposalAnswer("pending", 9, 4))).value);
    const { result } = render();
    nameRequest(result);
    nameAnswer(result);
    await act(async () => { result.current.answer.onSubmit(); });
    expect(result.current.notice).toEqual({ kind: "refused", message: translate("refusal.conflict") });
  });

  it("holds the answer once the read on screen is no longer the proposal it opened on", async () => {
    mocks.decideProposal.value = { isMutating: false, trigger: vi.fn(async () => ({ ok: true, data: { status: "pending" } })) };
    mocks.decisionRead.mockReturnValue(mocks.query(proposalAnswer("pending", 7), vi.fn(async () => proposalAnswer("pending", 9, 4))).value);
    const { result } = render();
    nameRequest(result);
    nameAnswer(result);
    await act(async () => { result.current.answer.onSubmit(); });
    expect(result.current.notice).toEqual({ kind: "refused", message: translate("refusal.conflict") });
    mocks.decisionRead.mockReturnValue(mocks.query(proposalAnswer("pending", 9, 4)).value);
    act(() => { result.current.answer.setExpectedRevision("9"); });
    expect(result.current.answer.stale).toBe(true);
    expect(result.current.answer.addressable).toBe(false);
  });

  it("reconciles an unknown outcome by reading the same request identity, never answering twice", async () => {
    const readback = vi.fn(async () => proposalAnswer("approved", 8));
    mocks.decisionRead.mockReturnValue(mocks.query(proposalAnswer("pending", 7), readback).value);
    const trigger = vi.fn(async () => ({ ok: false, code: "outcome_unknown" }));
    mocks.decideProposal.value = { isMutating: false, trigger };
    const { result } = render();
    nameRequest(result);
    nameAnswer(result);
    await act(async () => { result.current.answer.onSubmit(); });
    expect(trigger).toHaveBeenCalledTimes(1);
    expect(readback).toHaveBeenCalledTimes(1);
    expect(result.current.notice).toEqual({ kind: "success", message: translate("answer.recorded", { status: "approved" }) });
  });

  it("returns a view its render half can draw", () => {
    const { result } = render();
    expect(drawable(result.current)).toBe(result.current);
  });
});