import { describe, expect, it, vi } from "vitest"
import { redirect } from "next/navigation"
import AgentOSCreateRoute from "./agentos/create/page"
import AgentOSRoute from "./agentos/page"
import AgentOSModuleCreateRoute from "./agentos/workspaces/[workspaceId]/modules/create/page"
import AgentOSModulesRoute from "./agentos/workspaces/[workspaceId]/modules/page"
import AgentOSModuleStudioRoute from "./agentos/workspaces/[workspaceId]/modules/studio/[moduleId]/page"
import TemplateAppCreateRoute from "./apps/create/[templateKey]/page"
import LegacyTemplateRoute from "./apps/new/[templateKey]/page"

vi.mock("next/navigation",
    () => ({
        redirect: vi.fn(),
    }))

describe("console route entrypoints",
    () => {
        it("mounts AgentOS dashboard and creation routes with their exact modes",
            () => {
                expect(AgentOSRoute()).toEqual(expect.objectContaining({
                    props: expect.objectContaining({
                        mode: "dashboard",
                    }),
                }))
                expect(AgentOSCreateRoute()).toEqual(expect.objectContaining({
                    props: expect.objectContaining({
                        mode: "create",
                    }),
                }))
            })

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
                await expect(AgentOSModuleCreateRoute({
                    params: Promise.resolve({
                        workspaceId: "workspace-1",
                    }),
                })).resolves.toEqual(expect.objectContaining({
                    props: expect.objectContaining({
                        workspaceId: "workspace-1",
                    }),
                }))
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

        it("keeps the canonical template route and both localized legacy redirects",
            async () => {
                await expect(TemplateAppCreateRoute({
                    params: Promise.resolve({
                        templateKey: "academy starter",
                    }),
                })).resolves.toEqual(expect.objectContaining({
                    props: expect.objectContaining({
                        mode: "new",
                        templateKey: "academy starter",
                    }),
                }))
                await LegacyTemplateRoute({
                    params: Promise.resolve({
                        locale: "vi",
                        templateKey: "academy starter",
                    }),
                })
                await LegacyTemplateRoute({
                    params: Promise.resolve({
                        locale: "en",
                        templateKey: "academy starter",
                    }),
                })
                expect(redirect).toHaveBeenNthCalledWith(1,
                    "/apps/create/academy%20starter")
                expect(redirect).toHaveBeenNthCalledWith(2,
                    "/en/apps/create/academy%20starter")
            })
    })
