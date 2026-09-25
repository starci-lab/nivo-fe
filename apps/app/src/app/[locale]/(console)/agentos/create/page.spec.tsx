import { beforeEach, describe, expect, it, vi } from "vitest"
import { redirect } from "next/navigation"
import AgentOSCreateRoute from "./page"

vi.mock("next/navigation",
    () => ({
        redirect: vi.fn(),
    }))

describe("AgentOSCreateRoute",
    () => {
        beforeEach(() => {
            vi.clearAllMocks()
        })

        it("redirects the retired creation route to the accepted purchase entry",
            async () => {
                await AgentOSCreateRoute({
                    params: Promise.resolve({
                        locale: "vi",
                    }),
                })
                await AgentOSCreateRoute({
                    params: Promise.resolve({
                        locale: "en",
                    }),
                })
                expect(redirect).toHaveBeenNthCalledWith(1,
                    "/agentos/workspaces/new")
                expect(redirect).toHaveBeenNthCalledWith(2,
                    "/en/agentos/workspaces/new")
            })
    })