import { describe, expect, it } from "vitest"
import type { InstallationRouteProps } from "./installation"
import { readInstallationRoute } from "./installation"

describe("readInstallationRoute", () => {
    it("resolves the workspace and installation route identities", async () => {
        const props: InstallationRouteProps = {
            params: Promise.resolve({ workspaceId: "workspace-1", installationId: "installation-1" }),
        }

        await expect(readInstallationRoute(props.params)).resolves.toEqual({
            workspaceId: "workspace-1",
            installationId: "installation-1",
        })
    })

    it("rejects incomplete or malformed installation identities", async () => {
        const params: Promise<unknown> = Promise.resolve({ workspaceId: "", installationId: "installation-1" })

        await expect(readInstallationRoute(params)).rejects.toThrow("Installation route parameters must be non-empty")
    })
})
