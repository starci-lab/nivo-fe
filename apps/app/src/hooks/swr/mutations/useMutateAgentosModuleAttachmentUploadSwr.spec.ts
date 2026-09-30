import type { MutationMockOptions, QueryMockCallback } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback, options?: MutationMockOptions) => ({
        key,
        mutation,
        options,
    })),
    api: { prepare: vi.fn(), upload: vi.fn(), finalize: vi.fn() },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/modules/api/agentos-module-studio", () => ({
    finalizeAgentosModuleAttachment: mocks.api.finalize,
    prepareAgentosModuleAttachmentUpload: mocks.api.prepare,
    uploadAgentosModuleAttachment: mocks.api.upload,
}))

import { useMutateAgentosModuleAttachmentUploadSwr } from "./useMutateAgentosModuleAttachmentUploadSwr"

describe("useMutateAgentosModuleAttachmentUploadSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.api.prepare.mockResolvedValue({
            ok: true,
            data: { attachmentId: "attachment-1", uploadUrl: "/upload", uploadMethod: "PUT" },
        })
        mocks.api.upload.mockResolvedValue({ ok: true, data: true })
        mocks.api.finalize.mockResolvedValue({ ok: true, data: { id: "studio" } })
    })

    it("owns the complete attachment capability sequence", async () => {
        const hook = runAndReadMock(
            () => useMutateAgentosModuleAttachmentUploadSwr("workspace-1", "module-1"),
            mocks.useNivoMutation,
        )
        const file = new File(["knowledge"], "support.md", { type: "text/markdown" })
        await act(async () => {
            await expect(hook.mutation({ file, mediaType: "text/markdown" })).resolves.toEqual({
                ok: true,
                data: { id: "studio" },
            })
        })
        expect(mocks.api.prepare).toHaveBeenCalledWith(
            expect.objectContaining({
                agentWorkspaceId: "workspace-1",
                moduleId: "module-1",
                fileName: "support.md",
                sizeBytes: file.size,
            }),
        )
        expect(mocks.api.upload).toHaveBeenCalledWith(
            expect.objectContaining({ attachmentId: "attachment-1" }),
            "text/markdown",
            file,
        )
        expect(mocks.api.finalize).toHaveBeenCalledWith({
            agentWorkspaceId: "workspace-1",
            moduleId: "module-1",
            attachmentId: "attachment-1",
        })
    })

    it("stops before byte transfer when capability preparation is refused", async () => {
        mocks.api.prepare.mockResolvedValue({ ok: false, reason: "refused" })
        const hook = runAndReadMock(
            () => useMutateAgentosModuleAttachmentUploadSwr("workspace-1", "module-1"),
            mocks.useNivoMutation,
        )
        const file = new File(["knowledge"], "support.md")
        await act(async () => {
            await expect(hook.mutation({ file, mediaType: "text/markdown" })).resolves.toEqual({
                ok: false,
                reason: "refused",
            })
        })
        expect(mocks.api.upload).not.toHaveBeenCalled()
        expect(mocks.api.finalize).not.toHaveBeenCalled()
    })
})

