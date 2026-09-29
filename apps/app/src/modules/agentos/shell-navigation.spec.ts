import { describe, expect, it } from "vitest"
import { shellNavigationDecision, shellNavigationPath, shellReturnSelection } from "./shell-navigation"
import type { ShellRegisteredDestination, ShellRegisteredViewName } from "@/modules/api/agentos-shell"
import { failed, type Failure } from "@/modules/api/outcome"

const WORKSPACE = "11111111-1111-4111-8111-111111111111"
const INSTANCE = "22222222-2222-4222-8222-222222222222"
const INSTALLATION = "33333333-3333-4333-8333-333333333333"

const destination = (routeName: ShellRegisteredViewName): ShellRegisteredDestination => ({
    grammarVersion: 1,
    routeName,
    workspaceId: WORKSPACE,
    instanceId: INSTANCE,
    installationId: INSTALLATION,
    opaqueItemId: null,
    returnContext: { routeName: "purchased_agentos", workspaceId: WORKSPACE, instanceId: INSTANCE, installationId: INSTALLATION }
})

describe("shellNavigationPath", () => {
    it("opens the installation's own surface for every registered view name", () => {
        const installation = `/agentos/workspaces/${WORKSPACE}/modules/${INSTALLATION}`
        expect(shellNavigationPath(destination("module-home"))).toBe(installation)
        expect(shellNavigationPath(destination("module-diagnostics"))).toBe(`${installation}/diagnostics`)
        // The domain views are the installed module's own surfaces; the module's operation surface is
        // where they render and where the owning route re-resolves its opaque item itself.
        expect(shellNavigationPath(destination("sales-opportunity"))).toBe(`${installation}/operate`)
        expect(shellNavigationPath(destination("accounting-exception"))).toBe(`${installation}/operate`)
        expect(shellNavigationPath(destination("chatbot-handoff"))).toBe(`${installation}/operate`)
    })

    it("builds the path from the destination's identities, so no caller string can become a url", () => {
        const path = shellNavigationPath(destination("module-home"))
        expect(path.startsWith("/agentos/workspaces/")).toBe(true)
        expect(path).not.toContain("://")
        expect(path).not.toContain("..")
    })
})

describe("shellReturnSelection", () => {
    it("keeps the AgentOS selector as context and carries no observation back", () => {
        expect(shellReturnSelection(destination("module-home"))).toEqual({ workspaceId: WORKSPACE, instanceId: INSTANCE })
        expect(Object.keys(shellReturnSelection(destination("module-home"))).sort()).toEqual(["instanceId", "workspaceId"])
    })
})

describe("shellNavigationDecision", () => {
    it("opens a resolved destination at its registered path", () => {
        const decision = shellNavigationDecision({ ok: true, data: destination("module-diagnostics") }, "vi")
        expect(decision).toEqual({
            open: true,
            href: `/agentos/workspaces/${WORKSPACE}/modules/${INSTALLATION}/diagnostics`,
            returnSelection: { workspaceId: WORKSPACE, instanceId: INSTANCE }
        })
    })

    it("opens the module-owned destination of an attention or result entry", () => {
        for (const routeName of ["sales-opportunity", "accounting-result", "chatbot-conversation"] as const) {
            const decision = shellNavigationDecision({ ok: true, data: { ...destination(routeName), opaqueItemId: "item-1" } }, "vi")
            expect(decision.open).toBe(true)
        }
    })

    it("leaves the current view unchanged for every non-destination outcome", () => {
        const outcomes: ReadonlyArray<Failure> = [
            failed("forbidden", { code: "parent-mismatch", reason: "parent-mismatch" }),
            failed("unavailable", { code: "NAVIGATION_UNAVAILABLE", reason: "deadline-exceeded" }),
            failed("invalid", { code: "UNSUPPORTED", reason: "route-key-unsupported" }),
            failed("invalid", { code: "OBSOLETE_SELECTION", reason: "obsolete-selection" }),
            failed("refused", { code: "UNAUTHENTICATED", reason: "no token" }),
            failed("unavailable", { code: "NETWORK", reason: "network" })
        ]
        for (const outcome of outcomes) {
            const decision = shellNavigationDecision(outcome, "vi")
            expect(decision.open).toBe(false)
            expect(decision).toEqual({ open: false, kind: outcome.kind, code: outcome.code })
        }
    })

    it("opens on the resolved answer alone, whose destination names no authority the shell could use", () => {
        expect(Object.keys(destination("module-home")).sort()).toEqual(["grammarVersion", "installationId", "instanceId", "opaqueItemId", "returnContext", "routeName", "workspaceId"])
        expect(JSON.stringify(destination("module-home"))).not.toMatch(/grant|role|permission|authority/iu)
    })
})