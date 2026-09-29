import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { myAgentosModuleTestRun } = vi.hoisted(() => ({ myAgentosModuleTestRun: vi.fn() }))
vi.mock("@/modules/api/agentos-module-tests", () => ({ myAgentosModuleTestRun }))

import { useReadMyAgentosModuleTestRun } from "./useReadMyAgentosModuleTestRun"

describe("useReadMyAgentosModuleTestRun", () => {
    beforeEach(() => vi.clearAllMocks())

    it("reads the exact run in the installation scope", async () => {
        myAgentosModuleTestRun.mockResolvedValue({ ok: true, data: { runId: "run-1" } })
        const { result } = renderHook(() => useReadMyAgentosModuleTestRun("installation-1"))

        await result.current("run-1")

        expect(myAgentosModuleTestRun).toHaveBeenCalledWith("installation-1", "run-1")
    })
})
