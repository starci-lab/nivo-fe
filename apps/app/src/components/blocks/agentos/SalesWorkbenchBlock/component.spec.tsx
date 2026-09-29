import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import type { ReactElement } from "react"
import { SalesWorkbenchBlockBase } from "./component"
import type { useSalesWorkbench } from "@/hooks"
import type { Formatter } from "@/modules/i18n/formatter"
import { formatSalesInstant } from "@/modules/sales/sales-workbench"
import en from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

/*
 * The rendering assertions the accepted ui.sales.workbench direction pins, one per state that changes
 * what an operator sees: the attention rows of a bounded pipeline page, one bounded outcome command,
 * a command plan's own readback in every status it discloses, one material clarification with its
 * pending revision, the recovery door only the read's own proof opens, the selected opportunity's
 * wait and its won or lost closure. The copy asserted here is the real catalog, so a renamed key
 * fails this spec rather than silently rendering a key path.
 */

type Catalog = Readonly<Record<string, unknown>>
const catalog = en.console.agentos.modules.runtime.workbench.salesWorkbench as Catalog
const vietnamese = viMessages.console.agentos.modules.runtime.workbench.salesWorkbench as Catalog
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
const formatter = {
    number: () => "",
    dateTime: () => "formatted instant",
    relativeTime: () => "",
} satisfies Formatter
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

const ROW = {
    opportunityId: "opportunity-1",
    customerRef: "Northstar Retail",
    purpose: "Confirm 3 rollout sites",
    status: "open",
    workState: "attention",
    revision: 4,
}
const SECOND_ROW = {
    opportunityId: "opportunity-2",
    customerRef: "Atlas Foods",
    purpose: "Propose a date",
    status: "open",
    workState: "waiting",
    revision: 2,
}
const OPPORTUNITY = {
    opportunityId: "opportunity-1",
    customerRef: "Northstar Retail",
    purpose: "Confirm 3 rollout sites",
    status: "open",
    workState: "attention",
    reason: "needs-clarification",
    evidenceRefs: ["evidence-1"],
    revision: 4,
    closedAt: null as string | null,
}
const ACTION = {
    actionId: "action-1",
    attemptGeneration: 1,
    status: "not-started",
    receiverReceipt: {
        noStartProofRef: "proof-1",
        writerFence: { claimTokenHash: "fence-1", fencedAt: "2026-09-25T00:00:00.000Z" },
    } as Readonly<Record<string, unknown>> | null,
    observationGap: false,
    revision: 2,
}

type SalesWorkbenchView = ReturnType<typeof useSalesWorkbench>
type SalesWorkbenchGroup =
    | "attention"
    | "command"
    | "history"
    | "routine"
    | "wait"
    | "ambiguity"
    | "closure"
    | "installation"
    | "policy"
type SalesWorkbenchViewOverrides = Omit<Partial<SalesWorkbenchView>, SalesWorkbenchGroup> & {
    readonly [Key in SalesWorkbenchGroup]?: Partial<SalesWorkbenchView[Key]>
}

/** The full settled view the direction's populated state draws, overridden per state under test. */
const view = (overrides: SalesWorkbenchViewOverrides = {}): SalesWorkbenchView => {
    const settled: SalesWorkbenchView = {
        t: translate,
        locale: "en",
        scopeStanding: "ready",
        scopeReady: true,
        scopeInstallation: "installation-1",
        notice: null,
        attention: {
            standing: "ready",
            rows: [ROW, SECOND_ROW],
            total: 3,
            observedAt: "2026-09-23T14:10:00Z",
            nextAfter: null,
            isLoading: false,
            retry: () => undefined,
            loadMore: () => undefined,
        },
        command: {
            standing: "ready",
            commandId: "command-1",
            setCommandId: () => undefined,
            commandRevision: "1",
            setCommandRevision: () => undefined,
            customerRefs: "",
            setCustomerRefs: () => undefined,
            opportunityIds: "opportunity-1",
            setOpportunityIds: () => undefined,
            offerRefs: "",
            setOfferRefs: () => undefined,
            requestedActions: "qualify",
            setRequestedActions: () => undefined,
            actions: ["qualify"],
            fingerprint: "sha256:1",
            setFingerprint: () => undefined,
            expectedRevisions: "opportunity-1=4",
            setExpectedRevisions: () => undefined,
            isSubmitting: false,
            addressable: true,
            onSubmit: () => undefined,
        },
        history: {
            standing: "ready",
            commandId: "command-1",
            setCommandId: () => undefined,
            isLoading: false,
            retry: () => undefined,
            model: {
                commandId: "command-1",
                commandRevision: 2,
                status: "accepted",
                clarification: null as Readonly<Record<string, unknown>> | null,
                actionIds: ["action-1"],
                revision: 3,
            },
        },
        routine: {
            standing: "ready",
            actionId: "action-1",
            setActionId: () => undefined,
            actionIds: ["action-1"],
            attemptGeneration: "1",
            setAttemptGeneration: () => undefined,
            revision: "2",
            setRevision: () => undefined,
            receiverIntentId: "",
            setReceiverIntentId: () => undefined,
            receiverAttemptId: "",
            setReceiverAttemptId: () => undefined,
            fingerprint: "",
            setFingerprint: () => undefined,
            model: ACTION as typeof ACTION | null,
            door: "retry",
            attestedProof: "proof-1",
            attestedFence: { claimTokenHash: "fence-1", fencedAt: "2026-09-25T00:00:00.000Z" },
            addressable: true,
            isLoading: false,
            isRecovering: false,
            reload: () => undefined,
            onRetry: () => undefined,
            onStop: () => undefined,
        },
        wait: {
            standing: "ready",
            opportunityId: "opportunity-1",
            setOpportunityId: () => undefined,
            model: OPPORTUNITY as typeof OPPORTUNITY | null,
            isLoading: false,
            reload: () => undefined,
        },
        ambiguity: {
            standing: "ready",
            clarification: { fact: "opportunityId" } as Readonly<Record<string, unknown>> | null,
            revision: "5",
            setRevision: () => undefined,
            factKind: "opportunityId" as const,
            setFactKind: () => undefined,
            factValue: "opportunity-1",
            setFactValue: () => undefined,
            isClarifying: false,
            addressable: true,
            onClarify: () => undefined,
        },
        closure: {
            standing: "ready",
            intentId: "intent-1",
            setIntentId: () => undefined,
            outcome: "won" as const,
            setOutcome: () => undefined,
            evidenceRefs: "evidence-1",
            setEvidenceRefs: () => undefined,
            orderId: "order-1",
            setOrderId: () => undefined,
            revision: "2",
            setRevision: () => undefined,
            model: OPPORTUNITY as typeof OPPORTUNITY | null,
            isClosing: false,
            addressable: true,
            onClose: () => undefined,
        },
        installation: {
            standing: "ready",
            isLoading: false,
            reload: () => undefined,
            model: {
                salesInstallationId: "installation-1",
                lifecycleIntentId: "lifecycle-1",
                configurationRevision: "configuration-1",
                setupAuthorityGeneration: 1,
                runtimeGeneration: "runtime-1",
                sourceRevision: "source-1",
                ready: true,
                observedAt: "2026-09-23T14:10:00Z",
                revision: 2,
            },
        },
        policy: {
            standing: "ready",
            model: {
                salesInstallationId: "installation-1",
                revision: 7,
                requestId: "policy-request-1",
                values: {},
                unsetItems: ["routineCadence"],
                configuredBy: "owner",
                recordedAt: "2026-09-23T14:10:00Z",
            },
            revision: "",
            setRevision: () => undefined,
            cadence: "",
            setCadence: () => undefined,
            isConfiguring: false,
            onConfigure: () => undefined,
        },
    }
    return {
        ...settled,
        ...overrides,
        attention: { ...settled.attention, ...overrides.attention },
        command: { ...settled.command, ...overrides.command },
        history: { ...settled.history, ...overrides.history },
        routine: { ...settled.routine, ...overrides.routine },
        wait: { ...settled.wait, ...overrides.wait },
        ambiguity: { ...settled.ambiguity, ...overrides.ambiguity },
        closure: { ...settled.closure, ...overrides.closure },
        installation: { ...settled.installation, ...overrides.installation },
        policy: { ...settled.policy, ...overrides.policy },
    }
}
const renderBlock = (input: SalesWorkbenchViewOverrides = {}) => {
    const rendered: ReactElement = (
        <SalesWorkbenchBlockBase
            props={{ view: view(input), format: formatter }}
            on={{
                selectOpportunity: () => undefined,
                setFactKind: () => undefined,
                setOutcome: () => undefined,
            }}
        />
    )
    return render(rendered)
}

describe("SalesWorkbenchBlockBase", () => {
    it("keeps every Sales workbench copy key in both catalogues", () => {
        expect([...keyPaths(vietnamese)].sort()).toEqual([...keyPaths(catalog)].sort())
    })

    it("shows the bounded command band, the attention rows and only the facts the reads disclosed", () => {
        const { container } = renderBlock()
        const text = container.textContent ?? ""
        expect(text).toContain(translate("attention.title"))
        expect(text).toContain(translate("command.label"))
        expect(text).toContain(translate("command.outcome"))
        expect(text).toContain(translate("command.submit"))
        expect(text).toContain(translate("attention.list"))
        expect(text).toContain("Northstar Retail")
        expect(text).toContain("Atlas Foods")
        expect(text).toContain(translate("workState.attention"))
        expect(text).toContain(translate("workState.waiting"))
        expect(text).toContain(translate("lifecycle.open"))
        expect(text).toContain(translate("wait.nextStep"))
        expect(text).not.toContain("…")
    })

    it("keeps page geometry with inert effects while the pipeline read is still loading", () => {
        const { container } = renderBlock({
            attention: { standing: "loading", rows: [] },
            wait: { standing: "loading", model: null },
            closure: { standing: "loading", model: null },
            scopeReady: false,
            scopeStanding: "loading",
        })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("standing.loading"))
        expect(text).not.toContain("Northstar Retail")
        expect(container.querySelectorAll("button").length).toBeGreaterThan(0)
        expect(inert(buttonLabelled(container, translate("command.submit")))).toBe(true)
    })

    it("shows one empty notice with no invented action or count when the page holds no attention row", () => {
        const { container } = renderBlock({
            attention: { standing: "empty", rows: [], total: 0, observedAt: null },
            wait: { standing: "empty", model: null },
            closure: { standing: "empty", model: null },
        })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("attention.empty"))
        expect(text).toContain(translate("attention.emptyHint"))
        expect(text).toContain(translate("attention.covered", { count: 0 }))
        expect(text).not.toContain("Northstar Retail")
    })

    it("offers only a safe re-read on an error, with no cached fact and no effect control", () => {
        const { container } = renderBlock({
            attention: { standing: "unavailable", rows: [] },
            wait: { standing: "unavailable", model: null },
            closure: { standing: "unavailable", model: null },
        })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("surfaceUnavailable"))
        expect(text).toContain(translate("nothingChanged"))
        expect(text).not.toContain("Northstar Retail")
        expect(text).not.toContain(translate("workState.attention"))
    })

    it("clears protected facts and controls on a denial and states a non-disclosing refusal", () => {
        const { container } = renderBlock({
            attention: { standing: "denied", rows: [] },
            wait: { standing: "denied", model: null },
            closure: { standing: "denied", model: null },
        })
        const text = container.textContent ?? ""
        expect(text).toContain(translate("refusal.forbidden"))
        expect(text).not.toContain("Northstar Retail")
        expect(text).not.toContain(translate("wait.nextStep"))
    })

    it("shows a submitted command as pending until the command readback settles it", () => {
        const pending =
            renderBlock({
                history: {
                    model: {
                        commandId: "command-1",
                        commandRevision: 2,
                        status: "pending",
                        clarification: null,
                        actionIds: [],
                        revision: 2,
                    },
                },
            }).container.textContent ?? ""
        expect(pending).toContain(translate("commandStatus.pending"))
        expect(pending).not.toContain(translate("commandStatus.accepted"))
    })

    it("shows an unknown command outcome as unknown rather than promoting it to an accepted plan", () => {
        const unknown =
            renderBlock({
                history: {
                    model: {
                        commandId: "command-1",
                        commandRevision: 2,
                        status: "outcome-unknown",
                        clarification: null,
                        actionIds: [],
                        revision: 2,
                    },
                },
            }).container.textContent ?? ""
        expect(unknown).toContain("outcome-unknown")
        expect(unknown).not.toContain(translate("commandStatus.accepted"))
    })

    it("opens a recovery door only from the no-start proof and fence the action read attested", () => {
        const open = renderBlock().container
        expect(open.textContent).toContain(translate("recovery.retry"))
        expect(open.textContent).toContain("proof-1")
        expect(inert(buttonLabelled(open, translate("recovery.retry")))).toBe(false)
        const held = renderBlock({
            routine: {
                door: "hold",
                attestedProof: null,
                attestedFence: null,
                model: { ...ACTION, receiverReceipt: null },
                addressable: false,
            },
        }).container
        expect(held.textContent).toContain(translate("recovery.noProof"))
        expect(inert(buttonLabelled(held, translate("recovery.retry")))).toBe(true)
        expect(inert(buttonLabelled(held, translate("recovery.stop")))).toBe(true)
    })

    it("shows the attributable no-start proof and the observation gap the action read disclosed", () => {
        const gap =
            renderBlock({
                routine: { door: "hold", model: { ...ACTION, observationGap: true, receiverReceipt: null } },
            }).container.textContent ?? ""
        expect(gap).toContain(translate("routine.gap"))
    })

    it("asks for the pending revision when the plan is waiting on one material fact", () => {
        const text = renderBlock().container.textContent ?? ""
        expect(text).toContain(translate("ambiguity.question"))
        expect(text).toContain(translate("ambiguity.revision"))
        expect(text).toContain(translate("ambiguity.fact"))
    })

    it("shows a closure only once the opportunity read discloses one", () => {
        expect(renderBlock().container.textContent).toContain(translate("closure.openNote"))
        const closedAt = formatSalesInstant("2026-09-24T09:00:00Z", formatter)
        const closed =
            renderBlock({
                closure: {
                    model: { ...OPPORTUNITY, status: "won", workState: "ready", closedAt: "2026-09-24T09:00:00Z" },
                },
            }).container.textContent ?? ""
        expect(closed).toContain(translate("lifecycle.won"))
        expect(closed).toContain(translate("closure.closedAt", { at: closedAt }))
        expect(closed).not.toContain(translate("closure.openNote"))
    })

    it("says the installation scope is unresolved before any operation address exists", () => {
        const text = renderBlock({ scopeReady: false, scopeStanding: "loading" }).container.textContent ?? ""
        expect(text).toContain(translate("standing.loading"))
        expect(text).toContain(translate("rail.noticeEmpty"))
    })
})
