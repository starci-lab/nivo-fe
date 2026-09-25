import { describe, expect, it } from "vitest"
import AgentOSModuleCreateRoute from "./page"

describe("AgentOSModuleCreateRoute",
    () => {
        it("forwards workspace and module identities into the module pages",
            async () => {
                await expect(AgentOSModuleCreateRoute({
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