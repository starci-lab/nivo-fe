import { describe, expect, it } from "vitest"
import AgentOSModuleStudioRoute from "./page"

describe("AgentOSModuleStudioRoute",
    () => {
        it("forwards workspace and module identities into the module pages",
            async () => {
                await expect(AgentOSModuleStudioRoute({
                    params: Promise.resolve({
                        workspaceId: "workspace-1",
                        moduleId: "module-1",
                    }),
                })).resolves.toEqual(expect.objectContaining({
                    props: expect.objectContaining({
                        workspaceId: "workspace-1",
                        moduleId: "module-1",
                    }),
                }))
            })
    })