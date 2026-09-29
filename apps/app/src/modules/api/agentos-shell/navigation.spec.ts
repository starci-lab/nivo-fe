import { describe, expect, it } from "vitest"

import {
    AGENTOS_SHELL_NAVIGATION_OPERATION,
    resolveAgentosShellNavigation
} from "./index"
import { shellSpec } from "./spec-helpers"
const { WORKSPACE, INSTANCE, INSTALLATION, COMMAND, TOKEN, SELECTION, scope, answerWith, sentUrl, sentInit } = shellSpec

describe("resolveAgentosShellNavigation", () => {
    const navigationScope = {
        ...scope,
        installationId: INSTALLATION,
        routeKey: "module_home" as const,
        opaqueItemId: null,
        selectionGeneration: SELECTION,
    }
    const destination = {
        grammarVersion: 1,
        routeName: "module-home",
        workspaceId: WORKSPACE,
        instanceId: INSTANCE,
        installationId: INSTALLATION,
        opaqueItemId: null,
        returnContext: {
            routeName: "purchased_agentos",
            workspaceId: WORKSPACE,
            instanceId: INSTANCE,
            installationId: INSTALLATION,
        },
    }

    it("resolves a registered destination and carries no command or url", async () => {
        answerWith(200, { kind: "registered_destination", destination, selectionGeneration: SELECTION })
        const outcome = await resolveAgentosShellNavigation(TOKEN, navigationScope)

        expect(outcome).toEqual({ ok: true, data: destination })
        expect(sentInit().method).toBe("POST")
        expect(sentUrl()).toBe(
            `http://localhost:3068/api/v1/agentos/workspaces/${WORKSPACE}/instances/${INSTANCE}/operations/${encodeURIComponent(AGENTOS_SHELL_NAVIGATION_OPERATION)}`,
        )
        const body = JSON.parse(String(sentInit().body)) as Record<string, unknown>
        expect(Object.keys(body).sort()).toEqual([
            "installationId",
            "instanceId",
            "opaqueItemId",
            "returnContext",
            "routeKey",
            "selectionGeneration",
            "workspaceId",
        ])
        expect(JSON.stringify(body)).not.toContain("command")
    })

    it("reports a destination resolved for another selection as obsolete", async () => {
        answerWith(200, { kind: "registered_destination", destination, selectionGeneration: "showing-something-else" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "invalid",
            code: "OBSOLETE_SELECTION",
        })
    })

    it("fails closed on an unknown grammar version, an unregistered view and another installation", async () => {
        answerWith(200, {
            kind: "registered_destination",
            destination: { ...destination, grammarVersion: 2 },
            selectionGeneration: SELECTION,
        })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        answerWith(200, {
            kind: "registered_destination",
            destination: { ...destination, routeName: "sales-dashboard" },
            selectionGeneration: SELECTION,
        })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })

        answerWith(200, {
            kind: "registered_destination",
            destination: { ...destination, installationId: COMMAND },
            selectionGeneration: SELECTION,
        })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            code: expect.stringMatching(/^UNSUPPORTED/),
        })
    })

    it("keeps a refusal, an unavailability and an unsupported grammar apart", async () => {
        answerWith(403, { kind: "refused", reason: "parent-mismatch", selectionGeneration: SELECTION })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            code: "parent-mismatch",
            reason: "parent-mismatch",
        })

        answerWith(503, { kind: "unavailable", reason: "deadline-exceeded", selectionGeneration: SELECTION })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "NAVIGATION_UNAVAILABLE",
            reason: "deadline-exceeded",
        })

        answerWith(400, { kind: "unsupported", reason: "route-key-unsupported", selectionGeneration: SELECTION })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "invalid",
            code: "NAVIGATION_UNSUPPORTED",
            reason: "route-key-unsupported",
        })

        answerWith(400, { kind: "refused", reason: "unsupported-operation-version", selectionGeneration: null })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            code: "unsupported-operation-version",
            reason: "unsupported-operation-version",
        })
    })

    it("refuses an item entry without its opaque item and a plain entry carrying one", async () => {
        expect(
            await resolveAgentosShellNavigation(TOKEN, { ...navigationScope, routeKey: "attention_item" }),
        ).toMatchObject({ ok: false, kind: "invalid", code: "UNSUPPORTED", reason: "invalid-navigation-intent" })
        expect(
            await resolveAgentosShellNavigation(TOKEN, { ...navigationScope, opaqueItemId: "item-1" }),
        ).toMatchObject({ ok: false, kind: "invalid", code: "UNSUPPORTED", reason: "invalid-navigation-intent" })
        expect(
            await resolveAgentosShellNavigation(TOKEN, {
                ...navigationScope,
                routeKey: "sales_entry" as "module_home",
            }),
        ).toMatchObject({ ok: false, kind: "invalid", code: "UNSUPPORTED", reason: "route-key-unsupported" })
        expect(shellSpec.fetchMock).not.toHaveBeenCalled()
    })

    it("reports a session outcome rather than resolving for an ended session", async () => {
        expect(await resolveAgentosShellNavigation(null, navigationScope)).toMatchObject({
            ok: false,
            kind: "refused",
            code: "UNAUTHENTICATED",
        })
        answerWith(401, { message: "Authentication required" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "refused",
            code: "UNAUTHENTICATED",
        })
    })

    it("opens nothing when the reply cannot be read at all", async () => {
        shellSpec.fetchMock.mockResolvedValue({
            status: 200,
            json: async () => {
                throw new Error("this is not json")
            },
        })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "MALFORMED",
        })

        answerWith(200, "not-an-envelope")
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "UNSUPPORTED_REPLY",
            reason: "unreadable-navigation-answer",
        })

        // An answer of another kind is not a destination this shell may open either.
        answerWith(200, { kind: "overview" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "UNSUPPORTED_REPLY",
            reason: "unreadable-navigation-answer",
        })

        // Core states an unavailability and an unsupported grammar by kind; both keep a reason even
        // when Core sent none, so a caller always has something to show.
        answerWith(503, { kind: "unavailable" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "NAVIGATION_UNAVAILABLE",
            reason: "navigation-unavailable",
        })

        answerWith(400, { kind: "unsupported" })
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "invalid",
            code: "NAVIGATION_UNSUPPORTED",
            reason: "navigation-unsupported",
        })

        shellSpec.fetchMock.mockRejectedValue(new Error("socket closed"))
        expect(await resolveAgentosShellNavigation(TOKEN, navigationScope)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "NETWORK",
        })

        expect(
            await resolveAgentosShellNavigation(TOKEN, { ...navigationScope, installationId: "not-a-uuid" }),
        ).toMatchObject({ ok: false, kind: "invalid", code: "UNSUPPORTED", reason: "invalid-navigation-intent" })
    })

    it("fails closed on a destination it cannot read field by field", async () => {
        const variants: ReadonlyArray<unknown> = [
            "not-a-destination",
            { ...destination, returnContext: null },
            { ...destination, returnContext: { ...destination.returnContext, routeName: "somewhere_else" } },
            { ...destination, returnContext: { ...destination.returnContext, workspaceId: COMMAND } },
            { ...destination, returnContext: { ...destination.returnContext, installationId: 7 } },
            { ...destination, workspaceId: "not-a-uuid" },
            { ...destination, workspaceId: COMMAND },
            { ...destination, opaqueItemId: 7 },
        ]
        for (const variant of variants) {
            answerWith(200, { kind: "registered_destination", destination: variant, selectionGeneration: SELECTION })
            expect([variant, await resolveAgentosShellNavigation(TOKEN, navigationScope)]).toEqual([
                variant,
                expect.objectContaining({ ok: false, code: "UNSUPPORTED_REPLY", reason: "unregistered-destination" }),
            ])
        }
    })
})

