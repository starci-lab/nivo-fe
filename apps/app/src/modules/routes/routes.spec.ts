import { describe, expect, it } from "vitest"
import {
    agentosHome,
    app,
    appFromTemplate,
    appProvisioning,
    apps,
    installation,
    moduleCreate,
    moduleStudio,
    newWorkspace,
    newWorkspaceCheckout,
    overview,
    purchase,
    purchaseProvisioning,
    workspace,
    workspaceModules,
    workspaces,
} from "./routes"

describe("routes", () => {
    it("builds every console destination without a locale prefix", () => {
        expect(agentosHome()).toBe("/agentos")
        expect(workspaces()).toBe("/agentos/workspaces")
        expect(newWorkspace()).toBe("/agentos/workspaces/new")
        expect(workspace("workspace-1")).toBe("/agentos/workspaces/workspace-1")
        expect(workspaceModules("workspace-1")).toBe("/agentos/workspaces/workspace-1/modules")
        expect(moduleCreate("workspace-1")).toBe("/agentos/workspaces/workspace-1/modules/create")
        expect(moduleStudio("workspace-1", "module-1")).toBe(
            "/agentos/workspaces/workspace-1/modules/studio/module-1",
        )
        expect(installation("workspace-1", "installation-1")).toBe(
            "/agentos/workspaces/workspace-1/modules/installation-1",
        )
        expect(purchase("purchase-1")).toBe("/agentos/workspaces/purchases/purchase-1")
        expect(purchaseProvisioning("purchase-1")).toBe("/agentos/workspaces/purchases/purchase-1/provisioning")
        expect(apps()).toBe("/apps")
        expect(app("site-1")).toBe("/apps/site-1")
        expect(appFromTemplate("ai_academy")).toBe("/apps/create/ai_academy")
        expect(appProvisioning("site-1")).toBe("/apps/site-1/provisioning")
        expect(overview()).toBe("/overview")
    })

    it("encodes every dynamic segment, so a caller value cannot become another path", () => {
        expect(workspace("a/b c?d")).toBe("/agentos/workspaces/a%2Fb%20c%3Fd")
        expect(moduleStudio("w1", "../escape")).toBe("/agentos/workspaces/w1/modules/studio/..%2Fescape")
        expect(installation("w1", "i?x=1")).toBe("/agentos/workspaces/w1/modules/i%3Fx%3D1")
        expect(purchase("p#f")).toBe("/agentos/workspaces/purchases/p%23f")
        expect(app("s/s")).toBe("/apps/s%2Fs")
        expect(appFromTemplate("ai/academy?draft")).toBe("/apps/create/ai%2Facademy%3Fdraft")
    })

    it("appends the checkout query only when one is given", () => {
        expect(newWorkspaceCheckout()).toBe("/agentos/workspaces/new/checkout")
        expect(newWorkspaceCheckout(new URLSearchParams())).toBe("/agentos/workspaces/new/checkout")
        expect(newWorkspaceCheckout(new URLSearchParams({ offer: "offer-1", offerVersion: "3" }))).toBe(
            "/agentos/workspaces/new/checkout?offer=offer-1&offerVersion=3",
        )
    })
})
