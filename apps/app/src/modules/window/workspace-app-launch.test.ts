import { describe, expect, it } from "vitest"
import { safeWorkspaceAppRedirect, workspaceAppLaunchChannelName } from "./workspace-app-launch"

describe("workspace app launch boundaries", () => {
    it("names a channel per workspace", () => {
        expect(workspaceAppLaunchChannelName("ws-42")).toBe("nivo-workspace-app-launch:ws-42")
    })

    it("accepts HTTPS and local gateway redirects", () => {
        expect(safeWorkspaceAppRedirect("https://apps.example.test/open?id=1")).toBe("https://apps.example.test/open?id=1")
        expect(safeWorkspaceAppRedirect("http://localhost:4100/open")).toBe("http://localhost:4100/open")
    })

    it("rejects unsafe and malformed redirects", () => {
        expect(safeWorkspaceAppRedirect("http://evil.example.test/open")).toBeNull()
        expect(safeWorkspaceAppRedirect("not a URL")).toBeNull()
    })
})
