import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import type { SalesHandoffValue } from "@/modules/api/sales";
import type { SalesNotice, SalesSurfaceStanding, SalesTranslation } from "@/modules/sales/sales-workbench";

/*
 * The connected handoff controller's load-bearing behaviours: no operation address exists before the
 * installation scope resolves, nothing is submitted before the handoff identity is named, only a
 * prepared handoff may leave, no press reports an effect the readback has not disclosed, and a status
 * whose attempt may have started leaves only a lookup of the same identity open.
 */

const mocks = vi.hoisted(() => {
  const query = (data?: unknown, mutate?: unknown) => ({ value: { data, error: undefined, isLoading: false, isValidating: false, mutate: mutate ?? vi.fn(async () => undefined) } });
  return {
    controlCenter: { value: {} as unknown },
    handoffRead: vi.fn(),
    submitHandoff: { value: { isMutating: false, trigger: vi.fn() } },
    query
  };
});

vi.mock("@/hooks/swr/queries/console", () => ({ useQueryMyAgentWorkspaceControlCenterSwr: () => mocks.controlCenter.value }));

/** The transport answer the mocked control-center read unwraps. */
type ControlCenterAnswer = { readonly ok?: boolean; readonly data?: unknown };

vi.mock("@/modules/query", () => ({ nivoQueryData: (answer: ControlCenterAnswer | undefined) => answer?.ok === true ? answer.data : null }));
vi.mock("@/hooks/swr/queries/useQuerySalesHandoffSwr", () => ({ useQuerySalesHandoffSwr: (...args: ReadonlyArray<unknown>) => mocks.handoffRead(...args) }));
vi.mock("@/hooks/swr/mutations/useMutateSalesSubmitHandoffSwr", () => ({ useMutateSalesSubmitHandoffSwr: () => mocks.submitHandoff.value }));

import { useSalesHandoff } from "./useSalesHandoff";

const catalog = en.agentos.sales.handoff as Readonly<Record<string, unknown>>;
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
const handoffAnswer = (status: string, revision = 2) => ({ ok: true, data: { handoffId: "handoff-1", status, orderRevision: 4, actionId: null, revision } });
const render = () => renderHook(() => useSalesHandoff("workspace-1", "installation-1", translate));

/** The rendered controller one submission is driven through. */
type RenderedController = { readonly current: ReturnType<typeof useSalesHandoff> };
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
    readonly handoff: {
        readonly standing: SalesSurfaceStanding;
        readonly model: SalesHandoffValue | null;
        readonly handoffId: string;
        readonly setHandoffId: (value: string) => void;
        readonly isLoading: boolean;
        readonly reload: () => void;
    };
    readonly submission: {
        readonly standing: SalesSurfaceStanding;
        readonly fingerprint: string;
        readonly setFingerprint: (value: string) => void;
        readonly expectedRevision: string;
        readonly setExpectedRevision: (value: string) => void;
        readonly isSubmitting: boolean;
        readonly addressable: boolean;
        readonly lookupOnly: boolean;
        readonly onSubmit: () => void;
    };
};
/** The view its render half draws; asking for it here is what keeps the two halves in step. */
const drawable = (view: DrawableView): DrawableView => view;

const nameHandoff = (result: RenderedController) => {
  act(() => { result.current.handoff.setHandoffId("handoff-1"); });
};
const nameSubmission = (result: RenderedController) => {
  act(() => {
    result.current.submission.setFingerprint("sha256:handoff-1");
    result.current.submission.setExpectedRevision("2");
  });
};

describe("useSalesHandoff", () => {
  beforeEach(() => {
    mocks.handoffRead.mockClear();
    mocks.handoffRead.mockReturnValue(mocks.query().value);
    mocks.controlCenter.value = { data: { ok: true, data: { instance: { id: "instance-1" } } }, error: undefined };
    mocks.submitHandoff.value = { isMutating: false, trigger: vi.fn() };
  });

  it("addresses no operation until the installation scope is resolved", () => {
    mocks.controlCenter.value = { data: { ok: true, data: { instance: null } }, error: undefined };
    const { result } = render();
    expect(result.current.scopeReady).toBe(false);
    expect(mocks.handoffRead.mock.calls[0]?.[2]).toBe(false);
    expect(result.current.handoff.standing).toBe("unavailable");
    expect(result.current.submission.addressable).toBe(false);
  });

  it("addresses the operation route with the route's workspace, the workspace's instance and the installation", () => {
    const { result } = render();
    expect(result.current.scopeReady).toBe(true);
    nameHandoff(result);
    expect(mocks.handoffRead.mock.calls.at(-1)?.[0]).toEqual({ workspaceId: "workspace-1", instanceId: "instance-1", installationId: "installation-1" });
    expect(mocks.handoffRead.mock.calls.at(-1)?.[1]).toEqual({ handoffId: "handoff-1" });
    expect(mocks.handoffRead.mock.calls.at(-1)?.[2]).toBe(true);
  });

  it("holds the handoff read until its own identity is named", () => {
    const { result } = render();
    expect(mocks.handoffRead.mock.calls[0]?.[2]).toBe(false);
    nameHandoff(result);
    expect(mocks.handoffRead.mock.calls.at(-1)?.[2]).toBe(true);
  });

  it("lets the handoff leave only from prepared, and only with its claimed content", () => {
    const { result } = render();
    nameHandoff(result);
    expect(result.current.submission.addressable).toBe(false);
    nameSubmission(result);
    expect(result.current.submission.addressable).toBe(false);
    mocks.handoffRead.mockReturnValue(mocks.query(handoffAnswer("prepared")).value);
    const prepared = render();
    nameHandoff(prepared.result);
    nameSubmission(prepared.result);
    expect(prepared.result.current.submission.addressable).toBe(true);
  });

  it("leaves only a lookup open once the attempt may have started", () => {
    mocks.handoffRead.mockReturnValue(mocks.query(handoffAnswer("outcome-unknown")).value);
    const { result } = render();
    nameHandoff(result);
    nameSubmission(result);
    expect(result.current.submission.lookupOnly).toBe(true);
    expect(result.current.submission.addressable).toBe(false);
    mocks.handoffRead.mockReturnValue(mocks.query(handoffAnswer("possible-start")).value);
    const started = render();
    nameHandoff(started.result);
    nameSubmission(started.result);
    expect(started.result.current.submission.lookupOnly).toBe(true);
    expect(started.result.current.submission.addressable).toBe(false);
  });

  it("reports a refusal as a refusal and never reads it back", async () => {
    const readback = vi.fn(async () => handoffAnswer("prepared"));
    mocks.handoffRead.mockReturnValue(mocks.query(handoffAnswer("prepared"), readback).value);
    mocks.submitHandoff.value = { isMutating: false, trigger: vi.fn(async () => ({ ok: false, code: "SALES_REFUSED_CONFLICT", reason: "moved on" })) };
    const { result } = render();
    nameHandoff(result);
    nameSubmission(result);
    await act(async () => { result.current.submission.onSubmit(); });
    expect(result.current.notice).toEqual({ kind: "refused", message: translate("refusal.conflict", { reason: "moved on" }) });
    expect(readback).not.toHaveBeenCalled();
  });

  it("takes the outcome it shows from the readback, not from the press", async () => {
    mocks.submitHandoff.value = { isMutating: false, trigger: vi.fn(async () => ({ ok: true, data: { status: "prepared" } })) };
    mocks.handoffRead.mockReturnValue(mocks.query(handoffAnswer("prepared"), vi.fn(async () => handoffAnswer("accounting-admitted", 3))).value);
    const { result } = render();
    nameHandoff(result);
    nameSubmission(result);
    await act(async () => { result.current.submission.onSubmit(); });
    expect(result.current.notice).toEqual({ kind: "success", message: translate("submission.settled", { status: "accounting-admitted" }) });
  });

  it("says a submission did not settle while the handoff still reads as prepared", async () => {
    mocks.submitHandoff.value = { isMutating: false, trigger: vi.fn(async () => ({ ok: true, data: { status: "prepared" } })) };
    mocks.handoffRead.mockReturnValue(mocks.query(handoffAnswer("prepared"), vi.fn(async () => handoffAnswer("prepared"))).value);
    const { result } = render();
    nameHandoff(result);
    nameSubmission(result);
    await act(async () => { result.current.submission.onSubmit(); });
    expect(result.current.notice).toEqual({ kind: "refused", message: translate("refusal.unsettled") });
  });

  it("reconciles an unknown outcome by looking the same handoff identity up, never submitting twice", async () => {
    const readback = vi.fn(async () => handoffAnswer("accounting-admitted", 3));
    mocks.handoffRead.mockReturnValue(mocks.query(handoffAnswer("prepared"), readback).value);
    const trigger = vi.fn(async () => ({ ok: false, code: "outcome_unknown" }));
    mocks.submitHandoff.value = { isMutating: false, trigger };
    const { result } = render();
    nameHandoff(result);
    nameSubmission(result);
    await act(async () => { result.current.submission.onSubmit(); });
    expect(trigger).toHaveBeenCalledTimes(1);
    expect(readback).toHaveBeenCalledTimes(1);
    expect(result.current.notice).toEqual({ kind: "success", message: translate("submission.settled", { status: "accounting-admitted" }) });
  });

  it("returns a view its render half can draw", () => {
    const { result } = render();
    expect(drawable(result.current)).toBe(result.current);
  });
});