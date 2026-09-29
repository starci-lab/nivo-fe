import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import en from "@/messages/en.json"

/*
 * The connected controller's load-bearing behaviours: no operation address exists before the
 * installation scope resolves, no press reports an effect the readback has not disclosed, an unknown
 * outcome is reconciled by re-reading the same identity, and a recovery door is the read's own.
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
        pipelineRead: vi.fn(),
        readinessRead: vi.fn(),
        policyRead: vi.fn(),
        opportunityRead: vi.fn(),
        commandRead: vi.fn(),
        actionRead: vi.fn(),
        configurePolicy: { value: { isMutating: false, trigger: vi.fn() } },
        submitCommand: { value: { isMutating: false, trigger: vi.fn() } },
        clarifyCommand: { value: { isMutating: false, trigger: vi.fn() } },
        closeOpportunity: { value: { isMutating: false, trigger: vi.fn() } },
        recoverAction: { value: { isMutating: false, trigger: vi.fn() } },
        query,
    }
})

vi.mock("next/navigation", () => ({ useParams: () => mocks.params.value }))
vi.mock("@/hooks/swr/queries/useQueryMyAgentWorkspaceControlCenterSwr", () => ({
    useQueryMyAgentWorkspaceControlCenterSwr: () => mocks.controlCenter.value,
}))

/** The transport answer the mocked control-center read unwraps. */
type ControlCenterAnswer = { readonly ok?: boolean; readonly data?: unknown }

vi.mock("@/modules/query", () => ({
    nivoQueryPayload: (answer: ControlCenterAnswer | undefined) => (answer?.ok === true ? answer.data : undefined),
}))
vi.mock("@/hooks/swr/queries/useQuerySalesPipelineSwr", () => ({
    useQuerySalesPipelineSwr: (...args: ReadonlyArray<unknown>) => mocks.pipelineRead(...args),
}))
vi.mock("@/hooks/swr/queries/useQuerySalesReadinessSwr", () => ({
    useQuerySalesReadinessSwr: (...args: ReadonlyArray<unknown>) => mocks.readinessRead(...args),
}))
vi.mock("@/hooks/swr/queries/useQuerySalesPolicySwr", () => ({
    useQuerySalesPolicySwr: (...args: ReadonlyArray<unknown>) => mocks.policyRead(...args),
}))
vi.mock("@/hooks/swr/queries/useQuerySalesOpportunitySwr", () => ({
    useQuerySalesOpportunitySwr: (...args: ReadonlyArray<unknown>) => mocks.opportunityRead(...args),
}))
vi.mock("@/hooks/swr/queries/useQuerySalesCommandSwr", () => ({
    useQuerySalesCommandSwr: (...args: ReadonlyArray<unknown>) => mocks.commandRead(...args),
}))
vi.mock("@/hooks/swr/queries/useQuerySalesActionSwr", () => ({
    useQuerySalesActionSwr: (...args: ReadonlyArray<unknown>) => mocks.actionRead(...args),
}))
vi.mock("@/hooks/swr/mutations/useMutateSalesConfigurePolicySwr", () => ({
    useMutateSalesConfigurePolicySwr: () => mocks.configurePolicy.value,
}))
vi.mock("@/hooks/swr/mutations/useMutateSalesSubmitCommandSwr", () => ({
    useMutateSalesSubmitCommandSwr: () => mocks.submitCommand.value,
}))
vi.mock("@/hooks/swr/mutations/useMutateSalesClarifyCommandSwr", () => ({
    useMutateSalesClarifyCommandSwr: () => mocks.clarifyCommand.value,
}))
vi.mock("@/hooks/swr/mutations/useMutateSalesCloseSwr", () => ({
    useMutateSalesCloseSwr: () => mocks.closeOpportunity.value,
}))
vi.mock("@/hooks/swr/mutations/useMutateSalesRecoverActionSwr", () => ({
    useMutateSalesRecoverActionSwr: () => mocks.recoverAction.value,
}))

import { useSalesWorkbench } from "./useSalesWorkbench"

const catalog = en.console.agentos.modules.runtime.workbench.salesWorkbench as Readonly<Record<string, unknown>>
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
const commandAnswer = (status: string) => ({
    ok: true,
    data: { commandId: "command-1", commandRevision: 2, status, clarification: null, actionIds: [], revision: 2 },
})
const render = () => renderHook(() => useSalesWorkbench("installation-1", "en", translate))

/** The rendered controller a press is driven through. */
type RenderedController = { readonly current: ReturnType<typeof useSalesWorkbench> }

const nameCommand = (result: RenderedController) =>
    act(() => {
        result.current.command.setCommandId("command-1")
        result.current.command.setFingerprint("sha256:1")
    })

describe("useSalesWorkbench settlement", () => {
    beforeEach(() => {
        mocks.pipelineRead.mockClear()
        mocks.readinessRead.mockClear()
        mocks.policyRead.mockClear()
        mocks.opportunityRead.mockClear()
        mocks.commandRead.mockClear()
        mocks.actionRead.mockClear()
        mocks.pipelineRead.mockReturnValue(mocks.query().value)
        mocks.readinessRead.mockReturnValue(mocks.query().value)
        mocks.policyRead.mockReturnValue(mocks.query().value)
        mocks.opportunityRead.mockReturnValue(mocks.query().value)
        mocks.commandRead.mockReturnValue(mocks.query().value)
        mocks.actionRead.mockReturnValue(mocks.query().value)
        mocks.params.value = { workspaceId: "workspace-1", installationId: "installation-1" }
        mocks.controlCenter.value = { data: { ok: true, data: { instance: { id: "instance-1" } } }, error: undefined }
        mocks.submitCommand.value = { isMutating: false, trigger: vi.fn() }
        mocks.recoverAction.value = { isMutating: false, trigger: vi.fn() }
    })

    it("addresses no operation until the installation scope is resolved", () => {
        mocks.controlCenter.value = { data: { ok: true, data: { instance: null } }, error: undefined }
        const { result } = render()
        expect(result.current.scopeReady).toBe(false)
        expect(mocks.pipelineRead.mock.calls[0]?.[2]).toBe(false)
        expect(mocks.readinessRead.mock.calls[0]?.[2]).toBe(false)
        expect(mocks.policyRead.mock.calls[0]?.[2]).toBe(false)
        expect(result.current.attention.standing).toBe("unavailable")
    })

    it("addresses the operation route with the route's workspace, the workspace's instance and the installation", () => {
        const { result } = render()
        expect(result.current.scopeReady).toBe(true)
        expect(mocks.pipelineRead.mock.calls[0]?.[0]).toEqual({
            workspaceId: "workspace-1",
            instanceId: "instance-1",
            installationId: "installation-1",
        })
        expect(mocks.pipelineRead.mock.calls[0]?.[2]).toBe(true)
        expect(mocks.pipelineRead.mock.calls[0]?.[1]).toMatchObject({
            scopeFingerprint: "workspace-1~instance-1~installation-1",
            statusFilter: null,
            after: null,
            limit: 20,
        })
    })

    it("holds a selector read until its own identity is named", () => {
        const { result } = render()
        expect(mocks.commandRead.mock.calls[0]?.[2]).toBe(false)
        expect(mocks.opportunityRead.mock.calls[0]?.[2]).toBe(false)
        act(() => result.current.wait.setOpportunityId("opportunity-1"))
        expect(mocks.opportunityRead.mock.calls.at(-1)?.[2]).toBe(true)
        nameCommand(result)
        expect(mocks.commandRead.mock.calls.at(-1)?.[2]).toBe(true)
    })

    it("reports a refusal as a refusal and never reads it back", async () => {
        const readback = vi.fn(async () => commandAnswer("accepted"))
        mocks.commandRead.mockReturnValue(mocks.query(undefined, readback).value)
        mocks.submitCommand.value = {
            isMutating: false,
            trigger: vi.fn(async () => ({ ok: false, code: "SALES_REFUSED_CONFLICT", reason: "moved on" })),
        }
        const { result } = render()
        nameCommand(result)
        await act(async () => {
            result.current.command.onSubmit()
        })
        expect(result.current.notice).toEqual({
            kind: "refused",
            message: translate("refusal.conflict", { reason: "moved on" }),
        })
        expect(readback).not.toHaveBeenCalled()
    })

    it("takes the success it shows from the readback, not from the press", async () => {
        mocks.submitCommand.value = {
            isMutating: false,
            trigger: vi.fn(async () => ({ ok: true, data: { status: "reading" } })),
        }
        mocks.commandRead.mockReturnValue(
            mocks.query(
                undefined,
                vi.fn(async () => commandAnswer("accepted")),
            ).value,
        )
        const { result } = render()
        nameCommand(result)
        await act(async () => {
            result.current.command.onSubmit()
        })
        expect(result.current.notice).toEqual({
            kind: "success",
            message: translate("command.settled", { status: translate("commandStatus.accepted") }),
        })
    })

    it("says a command did not settle when the readback discloses no new state", async () => {
        mocks.submitCommand.value = {
            isMutating: false,
            trigger: vi.fn(async () => ({ ok: true, data: { status: "accepted" } })),
        }
        mocks.commandRead.mockReturnValue(
            mocks.query(
                undefined,
                vi.fn(async () => ({ ok: true, data: undefined })),
            ).value,
        )
        const { result } = render()
        nameCommand(result)
        await act(async () => {
            result.current.command.onSubmit()
        })
        expect(result.current.notice).toEqual({ kind: "refused", message: translate("refusal.unsettled") })
    })

    it("reconciles an unknown outcome by reading the same command identity, never resubmitting it", async () => {
        const readback = vi.fn(async () => commandAnswer("accepted"))
        mocks.commandRead.mockReturnValue(mocks.query(undefined, readback).value)
        const trigger = vi.fn(async () => ({ ok: false, code: "outcome_unknown" }))
        mocks.submitCommand.value = { isMutating: false, trigger }
        const { result } = render()
        nameCommand(result)
        await act(async () => {
            result.current.command.onSubmit()
        })
        expect(trigger).toHaveBeenCalledTimes(1)
        expect(readback).toHaveBeenCalledTimes(1)
        expect(result.current.notice).toEqual({
            kind: "success",
            message: translate("command.settled", { status: translate("commandStatus.accepted") }),
        })
    })

    it("opens neither recovery door until the action read attests a no-start proof and a fence", () => {
        const { result } = render()
        expect(result.current.routine.door).toBe("hold")
        expect(result.current.routine.addressable).toBe(false)
        mocks.actionRead.mockReturnValue(
            mocks.query({
                ok: true,
                data: {
                    actionId: "action-1",
                    attemptGeneration: 1,
                    status: "not-started",
                    receiverReceipt: {
                        noStartProofRef: "proof-1",
                        writerFence: { claimTokenHash: "fence-1", fencedAt: "2026-09-25T00:00:00.000Z" },
                    },
                    observationGap: false,
                    revision: 2,
                },
            }).value,
        )
        const attested = render()
        act(() => attested.result.current.routine.setActionId("action-1"))
        expect(attested.result.current.routine.door).toBe("retry")
        expect(mocks.recoverAction.value.trigger).not.toHaveBeenCalled()
    })
})
