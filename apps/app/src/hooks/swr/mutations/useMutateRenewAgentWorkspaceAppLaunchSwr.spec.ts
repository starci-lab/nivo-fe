import type { MutationMockOptions, QueryMockCallback } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback, options?: MutationMockOptions) => ({
        key,
        mutation,
        options,
    })),
    adoptSession: vi.fn(),
    refreshSession: vi.fn(),
    renewLaunch: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("../../auth/useSession", () => ({
    useSession: () => ({ state: { status: "signed-in", accessToken: "hook-viewer" }, adopt: mocks.adoptSession }),
}))
vi.mock("@/modules/api/auth", () => ({ refreshSession: mocks.refreshSession }))
vi.mock("@/modules/api/agentos-workspaces", () => ({ renewAgentWorkspaceAppLaunch: mocks.renewLaunch }))

import { useMutateRenewAgentWorkspaceAppLaunchSwr } from "./useMutateRenewAgentWorkspaceAppLaunchSwr"

describe("useMutateRenewAgentWorkspaceAppLaunchSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.refreshSession.mockResolvedValue({ ok: true, data: { accessToken: "renewed", requiresTwoFactor: false } })
        mocks.renewLaunch.mockResolvedValue({ ok: true, data: { launchId: "launch-1", expiresAt: "soon" } })
    })

    it("refreshes and adopts the session before renewing one workspace launch", async () => {
        const hook = runAndReadMock(
            () => useMutateRenewAgentWorkspaceAppLaunchSwr("workspace-1"),
            mocks.useNivoMutation,
        )
        await hook.mutation("launch-1")
        expect(mocks.refreshSession).toHaveBeenCalledTimes(1)
        expect(mocks.adoptSession).toHaveBeenCalledWith({ accessToken: "renewed", requiresTwoFactor: false })
        expect(mocks.renewLaunch).toHaveBeenCalledWith("launch-1")
    })
})

