import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import type { ReactElement } from "react"
import { SalesDecisionBlockBase } from "./component"
import type { useSalesDecision } from "@/hooks"
import en from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

/*
 * The rendering assertions the accepted decision direction pins, one per state that changes what an
 * operator sees: the proposal exactly as the read disclosed it, one answer bound to that proposal's
 * version and fingerprint, the answering hold, the recorded decision, and the stale proposal that is
 * refused rather than answered against. The copy asserted here is the real catalog, so a renamed key
 * fails this spec rather than silently rendering a key path.
 */

type Catalog = Readonly<Record<string, unknown>>
const catalog = en.agentos.sales.decision as Catalog
const vietnamese = viMessages.agentos.sales.decision as Catalog
const messageFor = (source: Catalog, key: string): string => {
    let node: unknown = source
    for (const part of key.split(".")) {
        if (node === null || typeof node !== "object") return key
        node = (node as Record<string, unknown>)[part]
    }
    return typeof node === "string" ? node : key
}
const translate = (key: string, values?: Readonly<Record<string, string | number | undefined>>): string =>
    Object.entries(values ?? {}).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        messageFor(catalog, key),
    )
const keyPaths = (source: unknown, prefix = ""): ReadonlyArray<string> =>
    source !== null && typeof source === "object"
        ? Object.entries(source as Record<string, unknown>).flatMap(([name, value]) =>
              keyPaths(value, prefix.length === 0 ? name : `${prefix}.${name}`),
          )
        : [prefix]
const inert = (target: Element | null): boolean =>
    target !== null && (target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true")
const buttonLabelled = (container: HTMLElement, label: string): Element | null =>
    [...container.querySelectorAll("button")].find((button) => (button.textContent ?? "").includes(label)) ?? null

const PENDING_PROPOSAL = {
    decisionRequestId: "decision-request-1",
    opportunityId: "opportunity-1",
    proposalVersion: 3,
    proposalFingerprint: "sha256:proposal-3",
    status: "pending",
    revision: 7,
}
const ANSWERED_PROPOSAL = { ...PENDING_PROPOSAL, status: "approved", revision: 8 }

/** The full settled view the direction's pending state draws, overridden per state under test. */
const view = (overrides: Record<string, unknown> = {}): ReturnType<typeof useSalesDecision> => {
    const settled: Record<string, unknown> = {
        t: translate,
        scopeWorkspace: "workspace-1",
        scopeInstallation: "installation-1",
        scopeReady: true,
        scopeStanding: "ready",
        notice: null,
        proposal: {
            standing: "ready",
            model: PENDING_PROPOSAL as typeof PENDING_PROPOSAL | null,
            decisionRequestId: "decision-request-1",
            setDecisionRequestId: () => undefined,
            isLoading: false,
            reload: () => undefined,
        },
        answer: {
            standing: "ready",
            choice: "approve" as const,
            setChoice: () => undefined,
            expectedRevision: "7",
            setExpectedRevision: () => undefined,
            isAnswering: false,
            addressable: true,
            stale: false,
            onSubmit: () => undefined,
        },
    }
    const merged: Record<string, unknown> = { ...settled, ...overrides }
    for (const group of ["proposal", "answer"])
        merged[group] = {
            ...(settled[group] as Record<string, unknown>),
            ...((overrides[group] as Record<string, unknown> | undefined) ?? {}),
        }
    return merged as unknown as ReturnType<typeof useSalesDecision>
}
const renderBlock = (input: Record<string, unknown> = {}) => {
    const rendered: ReactElement = (
        <SalesDecisionBlockBase props={{ view: view(input) }} on={{ selectChoice: () => undefined }} />
    )
    return render(rendered)
}

describe("SalesDecisionBlockBase", () => {
    it("keeps every decision copy key in both catalogues", () => {
        expect([...keyPaths(vietnamese)].sort()).toEqual([...keyPaths(catalog)].sort())
    })

    it("draws the pending proposal exactly as the read disclosed it, with one answer offered", () => {
        const { container } = renderBlock()
        const text = container.textContent ?? ""
        expect(text).toContain(translate("title"))
        expect(text).toContain(translate("status.pending"))
        expect(text).toContain(translate("proposal.version", { version: 3 }))
        expect(text).toContain(translate("proposal.fingerprint", { fingerprint: "sha256:proposal-3" }))
        expect(text).toContain(translate("proposal.revision", { revision: 7 }))
        expect(text).toContain(
            translate("proposal.identity", { request: "decision-request-1", opportunity: "opportunity-1" }),
        )
        expect(text).toContain(translate("answer.question"))
        expect(text).toContain(translate("answer.approve"))
        expect(text).toContain(translate("answer.reject"))
        expect(text).toContain(translate("answer.pendingNote"))
        expect(text).toContain(translate("proposal.notAnEffect"))
        expect(text).not.toContain(translate("status.approved"))
        expect(text).toContain(
            translate("rail.installation", { workspace: "workspace-1", installation: "installation-1" }),
        )
    })

    it("keeps the surface geometry with inert effects while the request read is still loading", () => {
        const { container } = renderBlock({
            proposal: { standing: "loading", model: null },
            answer: { standing: "loading", addressable: false },
            scopeReady: false,
            scopeStanding: "loading",
        })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("standing.loading"))
        expect(text).not.toContain("decision-request-1")
        expect(container.querySelectorAll("button").length).toBeGreaterThan(0)
        expect(inert(buttonLabelled(container, translate("answer.submit")))).toBe(true)
    })

    it("shows one empty notice and no invented fact when the identity holds no proposal", () => {
        const { container } = renderBlock({
            proposal: { standing: "empty", model: null },
            answer: { standing: "empty", addressable: false },
        })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("proposal.empty"))
        expect(text).toContain(translate("proposal.emptyHint"))
        expect(text).not.toContain(translate("proposal.version", { version: 3 }))
    })

    it("offers only a safe re-read on an error, with no cached proposal fact", () => {
        const { container } = renderBlock({
            proposal: { standing: "unavailable", model: null },
            answer: { standing: "unavailable", addressable: false },
        })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("standing.safeToRetry"))
        expect(text).toContain(translate("standing.nothingChanged"))
        expect(text).not.toContain("sha256:proposal-3")
        expect(inert(buttonLabelled(container, translate("answer.submit")))).toBe(true)
    })

    it("clears protected facts on a denial and states a non-disclosing refusal", () => {
        const { container } = renderBlock({
            proposal: { standing: "denied", model: null },
            answer: { standing: "denied", addressable: false },
            scopeStanding: "denied",
        })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("refusal.forbidden"))
        expect(text).not.toContain("decision-request-1")
        expect(text).not.toContain(translate("proposal.version", { version: 3 }))
    })

    it("holds a second answer while the first is still in flight", () => {
        const { container } = renderBlock({ answer: { isAnswering: true, addressable: false } })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("answer.answering"))
        expect(inert(buttonLabelled(container, translate("answer.submit")))).toBe(true)
    })

    it("shows the recorded decision only from a proposal that reads back answered", () => {
        const { container } = renderBlock({ proposal: { model: ANSWERED_PROPOSAL } })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("status.approved"))
        expect(text).toContain(translate("answer.settled"))
        expect(text).not.toContain(translate("answer.pendingNote"))
        expect(text).not.toContain(translate("status.pending"))
    })

    it("refuses to answer a proposal that moved since the surface opened it", () => {
        const { container } = renderBlock({ answer: { stale: true, addressable: false } })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("answer.stale"))
        expect(inert(buttonLabelled(container, translate("answer.submit")))).toBe(true)
    })

    it("states the answer this surface sent and why nothing else may be claimed", () => {
        const refused =
            renderBlock({ notice: { kind: "refused", message: translate("refusal.conflict") } }).container
                .textContent ?? ""
        expect(refused).toContain(translate("refusal.conflict"))
        const settled =
            renderBlock({
                notice: {
                    kind: "success",
                    message: translate("answer.recorded", { status: translate("status.approved") }),
                },
            }).container.textContent ?? ""
        expect(settled).toContain(translate("answer.recorded", { status: translate("status.approved") }))
    })
})
