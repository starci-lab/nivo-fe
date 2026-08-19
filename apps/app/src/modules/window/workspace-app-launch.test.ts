import { afterEach, describe, expect, it, vi } from "vitest"
import { followWorkspaceAppRedirect, safeWorkspaceAppRedirect, workspaceAppLaunchChannelName } from "./workspace-app-launch"

describe("workspace app launch boundaries", () => {
    afterEach(() => vi.restoreAllMocks())
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

    it("follows a safe redirect through a hidden native anchor", () => {
        const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined)
        vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
            callback(0)
            return 1
        })

        followWorkspaceAppRedirect("https://apps.example.test/open")

        const anchor = document.body.lastElementChild
        expect(anchor).toBeInstanceOf(HTMLAnchorElement)
        expect(anchor).toMatchObject({ target: "_self", rel: "noopener", hidden: true })
        expect(click).toHaveBeenCalledOnce()
        anchor?.remove()
    })
})
