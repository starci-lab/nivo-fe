import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import en from "@/messages/en.json"

/*
 * The connected controller's load-bearing behaviours: no operation address exists before the
 * installation scope resolves, and no press reports an effect the readback has not disclosed.
 */

const mocks = vi.hoisted(() => {
    const query = (data?: unknown, mutate?: unknown) => ({
        value: {
            data,
            error: undefined,
            isLoading: false,
            isValidating: false,
            mutate: mutate ?? vi.fn(async () => undefined),
        },
    })
    return {
        params: { value: { workspaceId: "workspace-1", installationId: "installation-1" } },
        controlCenter: { value: {} as unknown },
        summaryRead: vi.fn(),
        evidenceRead: vi.fn(),
        routineRead: vi.fn(),
        detailRead: vi.fn(),
        admit: { value: { isMutating: false, trigger: vi.fn() } },
        routineCommand: { value: { isMutating: false, trigger: vi.fn() } },
        exceptionCommand: { value: { isMutating: false, trigger: vi.fn() } },
        correct: { value: { isMutating: false, trigger: vi.fn() } },
        query,
    }
})

vi.mock("next/navigation", () => ({ useParams: () => mocks.params.value }))
vi.mock("@/hooks/swr/queries/useQueryMyAgentWorkspaceControlCenterSwr", () => ({
    useQueryMyAgentWorkspaceControlCenterSwr: () => mocks.controlCenter.value,
}))
vi.mock("@/modules/query", () => ({
    nivoQueryData: (answer: { readonly ok?: boolean; readonly data?: unknown } | undefined) =>
        answer?.ok === true ? answer.data : null,
}))
vi.mock("@/hooks/swr/queries/useQueryAccountingSummarySwr", () => ({
    useQueryAccountingSummarySwr: (...args: ReadonlyArray<unknown>) => mocks.summaryRead(...args),
}))
vi.mock("@/hooks/swr/queries/useQueryAccountingEvidenceSwr", () => ({
    useQueryAccountingEvidenceSwr: (...args: ReadonlyArray<unknown>) => mocks.evidenceRead(...args),
}))
vi.mock("@/hooks/swr/queries/useQueryAccountingRoutineResultSwr", () => ({
    useQueryAccountingRoutineResultSwr: (...args: ReadonlyArray<unknown>) => mocks.routineRead(...args),
}))
vi.mock("@/hooks/swr/queries/useQueryAccountingResultDetailSwr", () => ({
    useQueryAccountingResultDetailSwr: (...args: ReadonlyArray<unknown>) => mocks.detailRead(...args),
}))
vi.mock("@/hooks/swr/mutations/useMutateAccountingAdmitEvidenceSwr", () => ({
    useMutateAccountingAdmitEvidenceSwr: () => mocks.admit.value,
}))
vi.mock("@/hooks/swr/mutations/useMutateAccountingRoutineSwr", () => ({
    useMutateAccountingRoutineSwr: () => mocks.routineCommand.value,
}))
vi.mock("@/hooks/swr/mutations/useMutateAccountingExceptionSwr", () => ({
    useMutateAccountingExceptionSwr: () => mocks.exceptionCommand.value,
}))
vi.mock("@/hooks/swr/mutations/useMutateAccountingCorrectSwr", () => ({
    useMutateAccountingCorrectSwr: () => mocks.correct.value,
}))

import { useAccountingWorkbench } from "./useAccountingWorkbench"

const catalog = en.console.agentos.modules.runtime.workbench.accountingWorkbench as Readonly<Record<string, unknown>>
const messageFor = (key: string): string => {
    let node: unknown = catalog
    for (const part of key.split(".")) {
        if (node === null || typeof node !== "object") return key
        node = (node as Record<string, unknown>)[part]
    }
    return typeof node === "string" ? node : key
}
const translate = (key: string, values?: Readonly<Record<string, string | number | undefined>>): string =>
    Object.entries(values ?? {}).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        messageFor(key),
    )
const evidenceAnswer = (state: string) => ({
    ok: true,
    data: { op: "evidence", payload: { evidenceId: "evidence-1", state, revision: 1, missingFacts: [] } },
})
const render = () => renderHook(() => useAccountingWorkbench("installation-1", "en", translate))

describe("useAccountingWorkbench settlement", () => {
    beforeEach(() => {
        mocks.summaryRead.mockClear()
        mocks.evidenceRead.mockClear()
        mocks.routineRead.mockClear()
        mocks.detailRead.mockClear()
        mocks.summaryRead.mockReturnValue(mocks.query().value)
        mocks.evidenceRead.mockReturnValue(mocks.query().value)
        mocks.routineRead.mockReturnValue(mocks.query().value)
        mocks.detailRead.mockReturnValue(mocks.query().value)
        mocks.params.value = { workspaceId: "workspace-1", installationId: "installation-1" }
        mocks.controlCenter.value = { data: { ok: true, data: { instance: { id: "instance-1" } } }, error: undefined }
    })

    it("addresses no operation until the installation scope is resolved", () => {
        mocks.controlCenter.value = { data: { ok: true, data: { instance: null } }, error: undefined }
        const { result } = render()
        expect(result.current.scopeReady).toBe(false)
        expect(mocks.summaryRead.mock.calls[0]?.[2]).toBe(false)
        expect(mocks.evidenceRead.mock.calls[0]?.[2]).toBe(false)
        expect(mocks.routineRead.mock.calls[0]?.[2]).toBe(false)
        expect(result.current.overview.standing).toBe("unavailable")
    })

    it("addresses the operation route with the route's workspace, the workspace's instance and the installation", () => {
        const { result } = render()
        expect(result.current.scopeReady).toBe(true)
        expect(mocks.summaryRead.mock.calls[0]?.[0]).toEqual({
            workspaceId: "workspace-1",
            instanceId: "instance-1",
            installationId: "installation-1",
        })
        expect(mocks.summaryRead.mock.calls[0]?.[2]).toBe(true)
        expect(mocks.summaryRead.mock.calls[0]?.[1]).toMatchObject({ periodStart: result.current.periodLabel })
    })

    it("holds the evidence read until an evidence identity is named", () => {
        const { result } = render()
        expect(mocks.evidenceRead.mock.calls[0]?.[2]).toBe(false)
        act(() => result.current.intake.setEvidenceId("evidence-1"))
        expect(mocks.evidenceRead.mock.calls.at(-1)?.[2]).toBe(true)
    })

    it("reports a refusal as a refusal and never reads it back", async () => {
        const readback = vi.fn(async () => evidenceAnswer("admitted"))
        mocks.evidenceRead.mockReturnValue(mocks.query(undefined, readback).value)
        mocks.admit.value = {
            isMutating: false,
            trigger: vi.fn(async () => ({ ok: false, code: "stale-authority", reason: "moved on" })),
        }
        const { result } = render()
        act(() => {
            result.current.intake.setEvidenceId("evidence-1")
            result.current.intake.setSourceKind("invoice")
            result.current.intake.setSourceRef("ref-1")
            result.current.intake.setSourceRevision("rev-1")
            result.current.intake.setFingerprint("sha256:1")
        })
        await act(async () => {
            result.current.intake.onAdmit()
        })
        expect(result.current.notice).toEqual({ kind: "refused", message: translate("refusal.staleAuthority") })
        expect(readback).not.toHaveBeenCalled()
    })

    it("takes the success it shows from the readback payload, not from the press", async () => {
        mocks.evidenceRead.mockReturnValue(
            mocks.query(
                undefined,
                vi.fn(async () => evidenceAnswer("admitted")),
            ).value,
        )
        mocks.admit.value = {
            isMutating: false,
            trigger: vi.fn(async () => ({
                ok: true,
                data: {
                    op: "admitEvidence",
                    payload: { evidenceId: "evidence-1", state: "reading", revision: 1, missingFacts: [] },
                },
            })),
        }
        const { result } = render()
        act(() => {
            result.current.intake.setEvidenceId("evidence-1")
            result.current.intake.setSourceKind("invoice")
            result.current.intake.setSourceRef("ref-1")
            result.current.intake.setSourceRevision("rev-1")
            result.current.intake.setFingerprint("sha256:1")
        })
        await act(async () => {
            result.current.intake.onAdmit()
        })
        expect(result.current.notice).toEqual({
            kind: "success",
            message: translate("intake.settled", { state: translate("evidenceState.admitted") }),
        })
    })

    it("says a command did not settle when the readback discloses no new state", async () => {
        mocks.evidenceRead.mockReturnValue(
            mocks.query(
                undefined,
                vi.fn(async () => ({ ok: true, data: { op: "evidence", payload: undefined } })),
            ).value,
        )
        mocks.admit.value = {
            isMutating: false,
            trigger: vi.fn(async () => ({
                ok: true,
                data: {
                    op: "admitEvidence",
                    payload: { evidenceId: "evidence-1", state: "admitted", revision: 1, missingFacts: [] },
                },
            })),
        }
        const { result } = render()
        act(() => {
            result.current.intake.setEvidenceId("evidence-1")
            result.current.intake.setSourceKind("invoice")
            result.current.intake.setSourceRef("ref-1")
            result.current.intake.setSourceRevision("rev-1")
            result.current.intake.setFingerprint("sha256:1")
        })
        await act(async () => {
            result.current.intake.onAdmit()
        })
        expect(result.current.notice).toEqual({ kind: "refused", message: translate("refusal.unsettled") })
    })

    it("replays one request identity for one unchanged press and mints a new one after it settles", async () => {
        type Press = { readonly requestId: string; readonly input: unknown }
        type Answer = { readonly ok: boolean; readonly code?: string; readonly data?: unknown }
        const trigger = vi.fn<(press: Press) => Promise<Answer>>()
        trigger.mockResolvedValue({
            ok: true,
            data: {
                op: "admitEvidence",
                payload: { evidenceId: "evidence-1", state: "admitted", revision: 1, missingFacts: [] },
            },
        })
        mocks.admit.value = { isMutating: false, trigger }
        mocks.evidenceRead.mockReturnValue(
            mocks.query(
                undefined,
                vi.fn(async () => evidenceAnswer("admitted")),
            ).value,
        )
        const { result } = render()
        act(() => {
            result.current.intake.setEvidenceId("evidence-1")
            result.current.intake.setSourceKind("invoice")
            result.current.intake.setSourceRef("ref-1")
            result.current.intake.setSourceRevision("rev-1")
            result.current.intake.setFingerprint("sha256:1")
        })
        await act(async () => {
            result.current.intake.onAdmit()
        })
        const settled = trigger.mock.calls[0]?.[0]
        expect(typeof settled?.requestId).toBe("string")
        trigger.mockResolvedValueOnce({ ok: false, code: "UNREACHABLE" })
        await act(async () => {
            result.current.intake.onAdmit()
        })
        expect(trigger.mock.calls[1]?.[0].requestId).not.toBe(settled?.requestId)
    })
})
