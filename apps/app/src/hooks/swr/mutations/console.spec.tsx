/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    api: {
        answerIntake: vi.fn(),
        configureChannel: vi.fn(),
        createExpertSite: vi.fn(),
        prepare: vi.fn(),
        upload: vi.fn(),
        finalize: vi.fn(),
        installSolution: vi.fn(),
        issueLaunch: vi.fn(),
        manageRuntime: vi.fn(),
        orderAgentos: vi.fn(),
        publishModule: vi.fn(),
        publishExpertSite: vi.fn(),
        refreshSession: vi.fn(),
        remove: vi.fn(),
        removeIntegration: vi.fn(),
        renewLaunch: vi.fn(),
        revokeLaunch: vi.fn(),
        readiness: vi.fn(),
        reindex: vi.fn(),
        runModuleTest: vi.fn(),
        saveIntegration: vi.fn(),
        startIntake: vi.fn(),
    },
    adoptSession: vi.fn(),
}))

vi.mock("@/modules/auth/session", () => ({
    useSession: () => ({ state: { status: "signed-in", accessToken: "hook-viewer" }, adopt: mocks.adoptSession }),
}))
vi.mock("@/modules/api/console", () => ({
    answerAgentosCustomModuleIntake: mocks.api.answerIntake,
    configureAgentWorkspaceChannel: mocks.api.configureChannel,
    createExpertSite: mocks.api.createExpertSite,
    finalizeAgentosModuleAttachment: mocks.api.finalize,
    installAgentosSolutionModule: mocks.api.installSolution,
    issueAgentWorkspaceAppLaunch: mocks.api.issueLaunch,
    manageAgentosModuleRuntime: mocks.api.manageRuntime,
    orderAgentOs: mocks.api.orderAgentos,
    prepareAgentosModuleAttachmentUpload: mocks.api.prepare,
    publishAgentosCustomModule: mocks.api.publishModule,
    publishExpertSite: mocks.api.publishExpertSite,
    reindexAgentWorkspaceKnowledge: mocks.api.reindex,
    removeAgentosModuleAttachment: mocks.api.remove,
    removeAgentosModuleIntegrationSecret: mocks.api.removeIntegration,
    renewAgentWorkspaceAppLaunch: mocks.api.renewLaunch,
    revokeAgentWorkspaceAppLaunch: mocks.api.revokeLaunch,
    runAgentosAiReadinessTest: mocks.api.readiness,
    runAgentosModuleTest: mocks.api.runModuleTest,
    saveAgentosModuleIntegrationSecret: mocks.api.saveIntegration,
    startAgentosCustomModuleIntake: mocks.api.startIntake,
    uploadAgentosModuleAttachment: mocks.api.upload,
}))
vi.mock("@/modules/api/auth", () => ({ refreshSession: mocks.api.refreshSession }))

import {
    useMutateAgentosModuleAttachmentUploadSwr,
    useMutateReindexAgentWorkspaceKnowledgeSwr,
    useMutateRenewAgentWorkspaceAppLaunchSwr,
    useMutateRunAgentosAiReadinessTestSwr,
    useMutateStartAgentosCustomModuleIntakeSwr,
} from "./console"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.api.prepare.mockResolvedValue({
        ok: true,
        data: { attachmentId: "attachment-1", uploadUrl: "/upload", uploadMethod: "PUT" },
    })
    mocks.api.upload.mockResolvedValue({ ok: true, data: true })
    mocks.api.finalize.mockResolvedValue({ ok: true, data: { id: "studio" } })
    mocks.api.readiness.mockResolvedValue({ ok: true, data: { operationId: "readiness-1" } })
    mocks.api.reindex.mockResolvedValue({ ok: true, data: { operationId: "reindex-1" } })
    mocks.api.startIntake.mockResolvedValue({ ok: true, data: { module: { id: "module-1" } } })
    mocks.api.refreshSession.mockResolvedValue({ ok: true, data: { accessToken: "renewed", requiresTwoFactor: false } })
    mocks.api.renewLaunch.mockResolvedValue({ ok: true, data: { launchId: "launch-1", expiresAt: "soon" } })
})

describe("named console mutations", () => {
    it("owns the complete attachment capability sequence", async () => {
        const file = new File(["knowledge"], "support.md", { type: "text/markdown" })
        const { result } = renderHook(() => useMutateAgentosModuleAttachmentUploadSwr("workspace-1", "module-1"))

        await act(async () => {
            await expect(result.current.trigger({ file, mediaType: "text/markdown" })).resolves.toEqual({
                ok: true,
                data: { id: "studio" },
            })
        })

        expect(mocks.api.prepare).toHaveBeenCalledWith(expect.objectContaining({
            agentWorkspaceId: "workspace-1",
            moduleId: "module-1",
            fileName: "support.md",
            sizeBytes: file.size,
        }))
        expect(mocks.api.upload).toHaveBeenCalledWith(expect.objectContaining({ attachmentId: "attachment-1" }), "text/markdown", file)
        expect(mocks.api.finalize).toHaveBeenCalledWith({ agentWorkspaceId: "workspace-1", moduleId: "module-1", attachmentId: "attachment-1" })
    })

    it("stops before byte transfer when capability preparation is refused", async () => {
        mocks.api.prepare.mockResolvedValue({ ok: false, reason: "refused" })
        const file = new File(["knowledge"], "support.md")
        const { result } = renderHook(() => useMutateAgentosModuleAttachmentUploadSwr("workspace-1", "module-1"))

        await act(async () => {
            await expect(result.current.trigger({ file, mediaType: "text/markdown" })).resolves.toEqual({ ok: false, reason: "refused" })
        })

        expect(mocks.api.upload).not.toHaveBeenCalled()
        expect(mocks.api.finalize).not.toHaveBeenCalled()
    })

    it("binds readiness and reindex commands to the exact workspace", async () => {
        const { result } = renderHook(() => ({
            readiness: useMutateRunAgentosAiReadinessTestSwr("workspace-1"),
            reindex: useMutateReindexAgentWorkspaceKnowledgeSwr("workspace-1"),
        }))

        await act(async () => {
            await result.current.readiness.trigger("request-1")
            await result.current.reindex.trigger("request-2")
        })

        expect(mocks.api.readiness).toHaveBeenCalledWith({ workspaceId: "workspace-1", idempotencyKey: "request-1" })
        expect(mocks.api.reindex).toHaveBeenCalledWith({ workspaceId: "workspace-1", idempotencyKey: "request-2" })
    })

    it("binds a custom-module intake command to its workspace", async () => {
        const { result } = renderHook(() => useMutateStartAgentosCustomModuleIntakeSwr("workspace-1"))

        await act(async () => {
            await result.current.trigger({
                goal: "Build a support bot",
                idempotencyKey: "request-1",
            })
        })

        expect(mocks.api.startIntake).toHaveBeenCalledWith({
            agentWorkspaceId: "workspace-1",
            goal: "Build a support bot",
            idempotencyKey: "request-1",
        })
    })

    it("refreshes and adopts the session before renewing a workspace launch", async () => {
        const { result } = renderHook(() => useMutateRenewAgentWorkspaceAppLaunchSwr("workspace-1"))

        await act(async () => {
            await result.current.trigger("launch-1")
        })

        expect(mocks.api.refreshSession).toHaveBeenCalledTimes(1)
        expect(mocks.adoptSession).toHaveBeenCalledWith({ accessToken: "renewed", requiresTwoFactor: false })
        expect(mocks.api.renewLaunch).toHaveBeenCalledWith("launch-1")
    })
})