import { describe, expect, it } from "vitest"
import AgentOSModulesRoute from "./page"

describe("AgentOSModulesRoute",
    () => {
        it("forwards workspace and module identities into the module pages",
            async () => {
                await expect(AgentOSModulesRoute({
                    params: Promise.resolve({
                        workspaceId: "workspace-1",
                    }),
                })).resolves.toEqual(expect.objectContaining({
                    props: expect.objectContaining({
                        workspaceId: "workspace-1",
                    }),
                }))
            })
    })