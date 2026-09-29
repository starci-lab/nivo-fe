import { describe, expect, it, vi } from "vitest"
import { templateAppProvisioningView } from "./view"

const messages: Readonly<Record<string, string>> = {
    "template.slugLabel": "Slug",
    "template.slugPlaceholder": "my-academy",
    "template.slugHint": "Use a short name",
    "template.submit": "Create app",
    readyTitle: "Ready",
    "template.readyText": "Your app is ready",
    manageApps: "Manage app",
}

describe("templateAppProvisioningView", () => {
    it("routes a ready deployment action with its resolved site identity", () => {
        const act = vi.fn()
        const flow = { phase: "ready" as const, siteId: "site-1", deploymentId: "deployment-1", publicHost: "academy.vn" }
        const view = templateAppProvisioningView({
            flow,
            steps: [],
            t: (key) => {
                const message = messages[key]
                if (message === undefined) throw new Error(`Missing test message ${key}`)
                return message
            },
            realtimeStatus: "connected",
            changeSlug: vi.fn(),
            submit: vi.fn(),
            act,
        })
        view.on?.act?.()
        expect(view.state).toBe("ready")
        expect(view.props.subject).toBe("academy.vn")
        expect(view.props.statusText).toBe("Your app is ready")
        expect(act).toHaveBeenCalledWith(flow)
    })
})
