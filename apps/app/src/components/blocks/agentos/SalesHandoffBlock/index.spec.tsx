import { render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import enMessages from "@/messages/en.json"
import { TIME_ZONE } from "@/modules/i18n"
import { expectNoA11yViolations } from "@/testing/axe"

/*
 * The connected handoff block, driven at its published door. `@/hooks` is the only place this block
 * reads the world from, so that door is what this spec stands in for: every state the surface can draw
 * is settled here once, and the assertions are about what the block does with what the door handed it.
 * The copy asserted is the real catalogue, so a renamed key fails this spec rather than rendering a
 * key path.
 */

const mocks = vi.hoisted(() => {
    const calls: Array<{ readonly workspaceId: string; readonly installationId: string; readonly t: unknown }> = []
    let state = "loading"

    const prepared = {
        handoffId: "handoff-1",
        status: "prepared",
        orderRevision: 4,
        actionId: null as string | null,
        revision: 2,
    }

    /* The one state under test, projected onto the two standings it moves and the handoff it shows. */
    const standingOf = (): string =>
        state === "loading"
            ? "loading"
            : state === "empty"
              ? "empty"
              : state === "unavailable"
                ? "unavailable"
                : state === "denied"
                  ? "denied"
                  : "ready"
    const modelOf = (): unknown =>
        state === "prepared" || state === "submitting"
            ? prepared
            : state === "unknown"
              ? { ...prepared, status: "outcome-unknown" }
              : state === "admitted"
                ? { ...prepared, status: "accounting-admitted", actionId: "action-1", revision: 3 }
                : state === "refused"
                  ? { ...prepared, status: "accounting-refused" }
                  : null

    const view = (workspaceId: string, installationId: string, t: unknown) => {
        const standing = standingOf()
        return {
            t,
            scopeWorkspace: workspaceId,
            scopeInstallation: installationId,
            scopeReady: state !== "loading" && state !== "denied",
            scopeStanding: standing,
            notice:
                state === "refused"
                    ? { kind: "refused", message: (t as (key: string) => string)("refusal.validation") }
                    : null,
            handoff: {
                standing,
                model: modelOf(),
                handoffId: "handoff-1",
                setHandoffId: () => undefined,
                isLoading: false,
                reload: () => undefined,
            },
            submission: {
                standing,
                fingerprint: "sha256:handoff-1",
                setFingerprint: () => undefined,
                expectedRevision: "2",
                setExpectedRevision: () => undefined,
                isSubmitting: state === "submitting",
                addressable: state === "prepared",
                lookupOnly: state === "unknown",
                onSubmit: () => undefined,
            },
        }
    }
    const use = (workspaceId: string, installationId: string, t: unknown) => {
        calls.push({ workspaceId, installationId, t })
        return view(workspaceId, installationId, t)
    }
    return {
        calls,
        use,
        setState: (next: string) => {
            state = next
        },
    }
})

vi.mock("@/hooks", () => ({
    useSalesHandoff: (workspaceId: string, installationId: string, t: unknown) =>
        mocks.use(workspaceId, installationId, t),
}))

import { SalesHandoffBlock } from "."

type Catalog = Readonly<Record<string, unknown>>
const catalog = {
    ...enMessages.agentos.sales.handoff,
    rail: enMessages.agentos.sales.rail,
    refusal: { ...enMessages.agentos.sales.handoff.refusal, ...enMessages.agentos.sales.rail.refusal },
} as Catalog
const messageFor = (key: string): string => {
    let node: unknown = catalog
    for (const part of key.split(".")) {
        if (node === null || typeof node !== "object") return key
        node = (node as Record<string, unknown>)[part]
    }
    return typeof node === "string" ? node : key
}
const translate = (key: string, values?: Readonly<Record<string, string | number | undefined>>): string =>
    Object.entries(values ?? {}).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        messageFor(key),
    )
const inert = (target: Element | null): boolean =>
    target !== null && (target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true")
const buttonLabelled = (container: HTMLElement, label: string): Element | null =>
    [...container.querySelectorAll("button")].find((button) => (button.textContent ?? "").includes(label)) ?? null

const renderBlock = () =>
    render(
        <NextIntlClientProvider
            locale="en"
            messages={enMessages}
            timeZone={TIME_ZONE}
            onError={(error) => {
                throw error
            }}
        >
            <SalesHandoffBlock workspaceId="workspace-1" installationId="installation-1" />
        </NextIntlClientProvider>,
    )

const textOf = (container: HTMLElement): string => container.textContent ?? ""

describe("SalesHandoffBlock", () => {
    beforeEach(() => {
        mocks.calls.length = 0
        mocks.setState("loading")
    })

    it("reads the whole surface through the published door with the route's own scope and catalogue", async () => {
        mocks.setState("prepared")
        const { container } = renderBlock()
        expect(mocks.calls[0]?.workspaceId).toBe("workspace-1")
        expect(mocks.calls[0]?.installationId).toBe("installation-1")
        expect(typeof mocks.calls[0]?.t).toBe("function")
        expect(textOf(container)).toContain(translate("title"))
        expect(textOf(container)).toContain(
            translate("rail.installation", { workspace: "workspace-1", installation: "installation-1" }),
        )
        await expectNoA11yViolations(container)
    })

    it("keeps the surface inert while the door still holds a loading standing", () => {
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("standing.loading"))
        expect(text).not.toContain("handoff-1")
        expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true)
    })

    it("shows the door's empty standing without inventing a handoff fact", () => {
        mocks.setState("empty")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("handoff.empty"))
        expect(text).toContain(translate("handoff.emptyHint"))
        expect(text).not.toContain(translate("handoff.revision", { revision: 2 }))
    })

    it("offers only a safe re-read on the door's unavailable standing", () => {
        mocks.setState("unavailable")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("standing.safeToRetry"))
        expect(text).toContain(translate("standing.nothingChanged"))
        expect(text).not.toContain("handoff-1")
        expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true)
    })

    it("clears protected facts on the door's denial", () => {
        mocks.setState("denied")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("refusal.forbidden"))
        expect(text).not.toContain("handoff-1")
        expect(text).not.toContain(translate("handoff.identity", { handoff: "handoff-1", order: 4 }))
    })

    it("draws the prepared handoff the door disclosed and offers its one submission", () => {
        mocks.setState("prepared")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("status.prepared"))
        expect(text).toContain(translate("handoff.identity", { handoff: "handoff-1", order: 4 }))
        expect(text).toContain(translate("submission.held"))
        expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(false)
    })

    it("holds the submission while the door reports the first one still in flight", () => {
        mocks.setState("submitting")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("submission.submitting"))
        expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true)
    })

    it("leaves only a lookup open once the door reports the attempt may have started", () => {
        mocks.setState("unknown")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("status.outcomeUnknown"))
        expect(text).toContain(translate("submission.lookupOnly"))
        expect(text).not.toContain(translate("submission.held"))
        expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true)
    })

    it("shows the door's admission as intake only, never as a completed effect", () => {
        mocks.setState("admitted")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("status.accountingAdmitted"))
        expect(text).toContain(translate("handoff.intakeOnly"))
        expect(text).toContain(translate("handoff.action", { action: "action-1" }))
        expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true)
    })

    it("states the refusal the door reports rather than a surface guess", () => {
        mocks.setState("refused")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("status.accountingRefused"))
        expect(text).toContain(translate("refusal.validation"))
        expect(inert(buttonLabelled(container, translate("submission.submit")))).toBe(true)
    })
})
