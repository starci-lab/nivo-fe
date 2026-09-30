import { render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import enMessages from "@/messages/en.json"
import { TIME_ZONE } from "@/modules/i18n"

/*
 * The connected decision block, driven at its published door. `@/hooks` is the only place this block
 * reads the world from, so that door is what this spec stands in for: every state the surface can draw
 * is settled here once, and the assertions are about what the block does with what the door handed it.
 * The copy asserted is the real catalogue, so a renamed key fails this spec rather than rendering a
 * key path.
 */

const mocks = vi.hoisted(() => {
    const calls: Array<{ readonly workspaceId: string; readonly installationId: string; readonly t: unknown }> = []
    let state = "loading"

    const pending = {
        decisionRequestId: "decision-request-1",
        opportunityId: "opportunity-1",
        proposalVersion: 3,
        proposalFingerprint: "sha256:proposal-3",
        status: "pending",
        revision: 7,
    }
    const approved = { ...pending, status: "approved", revision: 8 }

    /* The one state under test, projected onto the two standings it moves and the proposal it shows. */
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
        state === "settled"
            ? approved
            : state === "pending" || state === "answering" || state === "stale"
              ? pending
              : null

    const view = (workspaceId: string, installationId: string, t: unknown) => {
        const standing = standingOf()
        return {
            t,
            scopeWorkspace: workspaceId,
            scopeInstallation: installationId,
            scopeReady: state !== "loading" && state !== "denied",
            scopeStanding: standing,
            notice: null,
            proposal: {
                standing,
                model: modelOf(),
                decisionRequestId: "decision-request-1",
                setDecisionRequestId: () => undefined,
                isLoading: false,
                reload: () => undefined,
            },
            answer: {
                standing,
                choice: "approve",
                setChoice: () => undefined,
                expectedRevision: "7",
                setExpectedRevision: () => undefined,
                isAnswering: state === "answering",
                addressable: state === "pending",
                stale: state === "stale",
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
    useSalesDecision: (workspaceId: string, installationId: string, t: unknown) =>
        mocks.use(workspaceId, installationId, t),
}))

import { SalesDecisionBlock } from "."

type Catalog = Readonly<Record<string, unknown>>
const catalog = enMessages.agentos.sales.decision as Catalog
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
            <SalesDecisionBlock workspaceId="workspace-1" installationId="installation-1" />
        </NextIntlClientProvider>,
    )

const textOf = (container: HTMLElement): string => container.textContent ?? ""

describe("SalesDecisionBlock", () => {
    beforeEach(() => {
        mocks.calls.length = 0
        mocks.setState("loading")
    })

    it("reads the whole surface through the published door with the route's own scope and catalogue", () => {
        mocks.setState("pending")
        const { container } = renderBlock()
        expect(mocks.calls[0]?.workspaceId).toBe("workspace-1")
        expect(mocks.calls[0]?.installationId).toBe("installation-1")
        expect(typeof mocks.calls[0]?.t).toBe("function")
        expect(textOf(container)).toContain(translate("title"))
        expect(textOf(container)).toContain(
            translate("rail.installation", { workspace: "workspace-1", installation: "installation-1" }),
        )
    })

    it("keeps the surface inert while the door still holds a loading standing", () => {
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("standing.loading"))
        expect(text).not.toContain("decision-request-1")
        expect(inert(buttonLabelled(container, translate("answer.submit")))).toBe(true)
    })

    it("shows the door's empty standing without inventing a proposal fact", () => {
        mocks.setState("empty")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("proposal.empty"))
        expect(text).toContain(translate("proposal.emptyHint"))
        expect(text).not.toContain(translate("proposal.version", { version: 3 }))
    })

    it("offers only a safe re-read on the door's unavailable standing", () => {
        mocks.setState("unavailable")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("standing.safeToRetry"))
        expect(text).toContain(translate("standing.nothingChanged"))
        expect(text).not.toContain("sha256:proposal-3")
        expect(inert(buttonLabelled(container, translate("answer.submit")))).toBe(true)
    })

    it("clears protected facts on the door's denial", () => {
        mocks.setState("denied")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("refusal.forbidden"))
        expect(text).not.toContain("decision-request-1")
        expect(text).not.toContain(translate("proposal.version", { version: 3 }))
    })

    it("draws the pending proposal the door disclosed and offers its one answer", () => {
        mocks.setState("pending")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("status.pending"))
        expect(text).toContain(translate("proposal.version", { version: 3 }))
        expect(text).toContain(translate("proposal.fingerprint", { fingerprint: "sha256:proposal-3" }))
        expect(text).toContain(translate("answer.pendingNote"))
        expect(inert(buttonLabelled(container, translate("answer.submit")))).toBe(false)
    })

    it("holds the answer while the door reports the first one still in flight", () => {
        mocks.setState("answering")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("answer.answering"))
        expect(inert(buttonLabelled(container, translate("answer.submit")))).toBe(true)
    })

    it("shows the recorded decision only from the door's settled read", () => {
        mocks.setState("settled")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("status.approved"))
        expect(text).toContain(translate("answer.settled"))
        expect(text).not.toContain(translate("answer.pendingNote"))
        expect(text).not.toContain(translate("status.pending"))
    })

    it("refuses to answer the proposal the door reports as moved", () => {
        mocks.setState("stale")
        const { container } = renderBlock()
        const text = textOf(container)
        expect(text).toContain(translate("answer.stale"))
        expect(inert(buttonLabelled(container, translate("answer.submit")))).toBe(true)
    })
})
