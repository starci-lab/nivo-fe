import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import type { ReactElement } from "react"
import { AccountingWorkbenchBlockBase } from "./component"
import type { useAccountingWorkbench } from "@/hooks"
import en from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

/*
 * The rendering assertions the accepted ui.accounting.workbench direction pins, one per state that
 * changes what an operator sees: the six measures of a period with its partial coverage, an intake
 * readback in every admission state, one material question with its evidence, alternatives and
 * consequence, a result detail with its evidence, reason, receipt and lineage, and a correction that
 * shows the appended linked result beside the unchanged original. The copy asserted here is the real
 * catalog, so a renamed key fails this spec rather than silently rendering a key path.
 */

type Catalog = Readonly<Record<string, unknown>>
const catalog = en.console.agentos.modules.runtime.workbench.accountingWorkbench as Catalog
const vietnamese = viMessages.console.agentos.modules.runtime.workbench.accountingWorkbench as Catalog
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

type AccountingWorkbenchGroup = "overview" | "intake" | "routine" | "question" | "detail" | "correction"
type AccountingWorkbenchView = ReturnType<typeof useAccountingWorkbench>
type AccountingWorkbenchViewOverrides = Omit<Partial<AccountingWorkbenchView>, AccountingWorkbenchGroup> & {
    readonly [Key in AccountingWorkbenchGroup]?: Partial<AccountingWorkbenchView[Key]>
}

/** A complete settled view with one readable result, overridden per state under test. */
const view = (overrides: AccountingWorkbenchViewOverrides = {}): AccountingWorkbenchView => {
    const settled: AccountingWorkbenchView = {
        t: translate,
        locale: "en",
        format: {
            amount: (amountMinor, amountCurrency) => `${amountMinor} ${amountCurrency}`,
            instant: (value) => value,
            period: (value) => value,
        },
        scopeStanding: "ready",
        scopeReady: true,
        periodMonth: "2026-09",
        setPeriodMonth: () => undefined,
        periodLabel: "2026-09-01",
        currency: null,
        setCurrency: () => undefined,
        asOfDraft: "",
        setAsOfDraft: () => undefined,
        asOf: null as string | null,
        setAsOf: () => undefined,
        notice: null,
        overview: {
            standing: "ready",
            model: {
                periodStart: "2026-09-01",
                periodEndExclusive: "2026-10-01",
                currency: "VND",
                items: [
                    {
                        itemId: "item-1",
                        resultId: "result-1",
                        version: 3,
                        effectiveAt: "2026-09-18T00:00:00Z",
                        occurredOn: "2026-09-17",
                        currency: "VND",
                        measures: [
                            { kind: "cash-in", status: "known", amountMinor: 421000000, currency: "VND" },
                            { kind: "cash-out", status: "known", amountMinor: 120000000, currency: "VND" },
                            { kind: "recognized-revenue", status: "known", amountMinor: 380000000, currency: "VND" },
                            { kind: "recognized-cost", status: "known", amountMinor: 95000000, currency: "VND" },
                            { kind: "unpaid", status: "known", amountMinor: 17000000, currency: "VND" },
                            { kind: "estimated-tax", status: "known", amountMinor: 8000000, currency: "VND" },
                        ],
                        paymentStatus: "unmatched",
                        attentionCodes: ["unmatched-payment"],
                        availability: "partial",
                        sourceEvidenceRefs: ["evidence-1"],
                        policyRevision: "policy-7",
                        receiptId: "receipt-1",
                    },
                ],
                partialReasons: [],
                nextCursor: null,
            },
            attention: ["unmatched-payment"],
            nextCursor: null as string | null,
            isFetching: false,
            retry: () => undefined,
            loadMore: () => undefined,
        },
        intake: {
            standing: "ready",
            evidenceId: "evidence-1",
            setEvidenceId: () => undefined,
            sourceKind: "invoice",
            setSourceKind: () => undefined,
            sourceRef: "ref-1",
            setSourceRef: () => undefined,
            sourceRevision: "rev-1",
            setSourceRevision: () => undefined,
            fingerprint: "sha256:1",
            setFingerprint: () => undefined,
            intakeRevision: "0",
            setIntakeRevision: () => undefined,
            model: { evidenceId: "evidence-1", state: "admitted", revision: 2, missingFacts: [] },
            admit: {
                trigger: async () => {
                    throw new Error("The fixture does not submit an admission")
                },
                reset: () => undefined,
                data: undefined,
                error: undefined,
                isMutating: false,
            },
            isAdmitting: false,
            onAdmit: () => undefined,
            reload: () => undefined,
        },
        routine: {
            standing: "ready",
            intentId: "intent-1",
            setIntentId: () => undefined,
            itemId: "item-1",
            setItemId: () => undefined,
            policyRevision: "policy-7",
            setPolicyRevision: () => undefined,
            evidenceIds: "evidence-1",
            setEvidenceIds: () => undefined,
            itemRevision: "3",
            setItemRevision: () => undefined,
            oldAttemptId: "",
            setOldAttemptId: () => undefined,
            notStartedProofRef: "",
            setNotStartedProofRef: () => undefined,
            newAttemptId: "",
            setNewAttemptId: () => undefined,
            model: {
                intentId: "intent-1",
                itemId: "item-1",
                attemptId: "attempt-1",
                state: "committed",
                receiptId: "receipt-1",
                resultId: "result-1",
                reasonCode: null,
            },
            isCommitting: false,
            onCommitRoutine: () => undefined,
            onRetryRoutine: () => undefined,
            reload: () => undefined,
        },
        question: {
            standing: "ready",
            exceptionId: "exception-1",
            setExceptionId: () => undefined,
            choiceCode: "recognize-now",
            setChoiceCode: () => undefined,
            reason: "supplier confirmed",
            setReason: () => undefined,
            evidenceRefs: "evidence-1",
            setEvidenceRefs: () => undefined,
            exceptionRevision: "4",
            setExceptionRevision: () => undefined,
            answerState: { exceptionId: "exception-1", state: "open", revision: 4 },
            isAnswering: false,
            onAnswer: () => undefined,
            onDefer: () => undefined,
            onReopen: () => undefined,
            onEscalate: () => undefined,
            onDismiss: () => undefined,
            routineState: "needs-decision",
            routineReason: "policy-ambiguous",
            attention: ["unmatched-payment"],
            itemEvidenceRefs: ["evidence-1"],
            reload: () => undefined,
        },
        detail: {
            standing: "ready",
            resultId: "result-1",
            setResultId: () => undefined,
            itemId: "item-1",
            setItemId: () => undefined,
            asOfInstant: "",
            setAsOfInstant: () => undefined,
            model: {
                resultId: "result-1",
                itemId: "item-1",
                version: 3,
                effectiveAt: "2026-09-18T00:00:00Z",
                state: "current",
                facts: {
                    amountMinor: 421000000,
                    currency: "VND",
                    occurredOn: "2026-09-17",
                    counterpartyRef: "supplier-a",
                    matchStatus: "unmatched",
                    treatment: { kind: "supported", code: "revenue" },
                },
                sourceEvidenceRefs: ["evidence-1"],
                policyRevision: "policy-7",
                receiptId: "receipt-1",
                predecessorResultId: null,
                successorResultId: null,
            },
            isFetching: false,
            onLoad: () => undefined,
            retry: () => undefined,
        },
        correction: {
            standing: "ready",
            correctionId: "correction-1",
            setCorrectionId: () => undefined,
            predecessorResultId: "result-1",
            setPredecessorResultId: () => undefined,
            correctedAmount: "420000000",
            setCorrectedAmount: () => undefined,
            correctedCounterparty: "supplier-b",
            setCorrectedCounterparty: () => undefined,
            reason: "late invoice",
            setReason: () => undefined,
            evidenceRefs: "evidence-2",
            setEvidenceRefs: () => undefined,
            correctionRevision: "3",
            setCorrectionRevision: () => undefined,
            appendAttemptId: "",
            setAppendAttemptId: () => undefined,
            model: null,
            predecessor: null,
            isCorrecting: false,
            onPropose: () => undefined,
            onAppend: () => undefined,
            reload: () => undefined,
        },
    }
    return {
        ...settled,
        ...overrides,
        overview: { ...settled.overview, ...overrides.overview },
        intake: { ...settled.intake, ...overrides.intake },
        routine: { ...settled.routine, ...overrides.routine },
        question: { ...settled.question, ...overrides.question },
        detail: { ...settled.detail, ...overrides.detail },
        correction: { ...settled.correction, ...overrides.correction },
    }
}
const renderBlock = (input: AccountingWorkbenchViewOverrides = {}): string => {
    const rendered: ReactElement = <AccountingWorkbenchBlockBase props={{ view: view(input) }} />
    return render(rendered).container.textContent ?? ""
}

describe("AccountingWorkbenchBlockBase", () => {
    it("keeps every Accounting workbench copy key in both catalogues", () => {
        expect([...keyPaths(vietnamese)].sort()).toEqual([...keyPaths(catalog)].sort())
    })

    it("shows every available measure of a period, its partial coverage and its attention codes", () => {
        const text = renderBlock()
        for (const measure of [
            "Cash in",
            "Cash out",
            "Recognized revenue",
            "Recognized cost",
            "Unpaid",
            "Estimated tax",
        ])
            expect(text).toContain(measure)
        expect(text).toContain(translate("overview.measureCovered", { count: 1 }))
        expect(text).toContain(translate("overview.attention", { codes: translate("attention.unmatchedPayment") }))
        expect(text).toContain(translate("overview.sourceCoverage", { count: 1 }))
    })

    it("withholds a period total and names the reason when one covered measure is unknown", () => {
        const text = renderBlock({
            overview: {
                model: {
                    periodStart: "2026-09-01",
                    periodEndExclusive: "2026-10-01",
                    currency: "VND",
                    nextCursor: null,
                    partialReasons: ["stale-source"],
                    items: [
                        {
                            itemId: "item-1",
                            resultId: "result-1",
                            version: 1,
                            effectiveAt: "2026-09-18T00:00:00Z",
                            occurredOn: null,
                            currency: "VND",
                            measures: [{ kind: "cash-in", status: "unknown", reasonCode: "source-unreadable" }],
                            paymentStatus: "unmatched",
                            attentionCodes: [],
                            availability: "stale",
                            sourceEvidenceRefs: [],
                            policyRevision: "policy-7",
                            receiptId: null,
                        },
                    ],
                },
            },
        })
        expect(text).toContain(translate("overview.measureUnknown", { reason: "source-unreadable" }))
        expect(text).toContain(translate("overview.partial", { reasons: translate("partialReason.staleSource") }))
        expect(text).not.toContain(translate("overview.measureCovered", { count: 1 }))
    })

    it("shows an admitted item, a likely duplicate and an item that still needs information", () => {
        expect(renderBlock()).toContain(translate("evidenceState.admitted"))
        expect(
            renderBlock({
                intake: {
                    model: { evidenceId: "evidence-1", state: "likely_duplicate", revision: 2, missingFacts: [] },
                },
            }),
        ).toContain(translate("intake.duplicateNotice"))
        expect(
            renderBlock({
                intake: {
                    model: {
                        evidenceId: "evidence-1",
                        state: "needs_information",
                        revision: 2,
                        missingFacts: ["occurredOn"],
                    },
                },
            }),
        ).toContain(translate("intake.missingFacts", { facts: "occurredOn" }))
    })

    it("shows one material question with its evidence, alternatives and consequence, and holds the effect until the readback returns", () => {
        const open = renderBlock()
        expect(open).toContain(translate("question.evidence"))
        expect(open).toContain("evidence-1")
        expect(open).toContain(translate("question.alternatives"))
        expect(open).toContain(translate("question.consequence"))
        expect(open).not.toContain(translate("question.consequenceHeld"))
        const answered = renderBlock({
            question: { answerState: { exceptionId: "exception-1", state: "answered", revision: 5 } },
        })
        expect(answered).toContain(translate("question.settled"))
        expect(answered).toContain(translate("question.consequenceHeld"))
    })

    it("shows a result detail with its evidence, treatment, receipt and lineage", () => {
        const text = renderBlock({
            detail: {
                model: {
                    resultId: "result-1",
                    itemId: "item-1",
                    version: 3,
                    effectiveAt: "2026-09-18T00:00:00Z",
                    state: "historical",
                    facts: {
                        amountMinor: 421000000,
                        currency: "VND",
                        occurredOn: "2026-09-17",
                        counterpartyRef: "supplier-a",
                        matchStatus: "ambiguous",
                        treatment: { kind: "unsupported", reasonCode: "no-policy" },
                    },
                    sourceEvidenceRefs: ["evidence-1"],
                    policyRevision: "policy-7",
                    receiptId: "receipt-1",
                    predecessorResultId: "result-0",
                    successorResultId: "result-2",
                },
            },
        })
        expect(text).toContain(translate("detail.historical"))
        expect(text).toContain(translate("detail.evidenceRefs", { refs: "evidence-1" }))
        expect(text).toContain(translate("treatment.unsupported"))
        expect(text).toContain(translate("detail.receipt", { receipt: "receipt-1", policy: "policy-7" }))
        expect(text).toContain(translate("detail.lineage", { predecessor: "result-0", successor: "result-2" }))
    })

    it("shows a correction's appended linked result beside the original it never rewrites", () => {
        const text = renderBlock({
            correction: {
                model: {
                    correctionId: "correction-1",
                    attemptId: "attempt-2",
                    state: "applied",
                    resultId: "result-2",
                    predecessorResultId: "result-1",
                },
                predecessor: {
                    resultId: "result-1",
                    itemId: "item-1",
                    version: 2,
                    effectiveAt: "2026-09-17T00:00:00Z",
                    state: "historical",
                    facts: {
                        amountMinor: 421000000,
                        currency: "VND",
                        occurredOn: "2026-09-16",
                        counterpartyRef: "supplier-a",
                        matchStatus: "unmatched",
                        treatment: { kind: "supported", code: "revenue" },
                    },
                    sourceEvidenceRefs: ["evidence-1"],
                    policyRevision: "policy-7",
                    receiptId: "receipt-1",
                    predecessorResultId: null,
                    successorResultId: "result-2",
                },
            },
        })
        expect(text).toContain(translate("correction.originalUnchanged"))
        expect(text).toContain(translate("correction.appended", { result: "result-2" }))
        expect(text).toContain(translate("correction.lineage", { predecessor: "result-1", result: "result-2" }))
    })

    it("distinguishes loading, refused, unavailable and empty readings instead of showing one as another", () => {
        const loading = renderBlock({ overview: { standing: "loading" } })
        expect(loading).not.toContain(translate("overview.measureCovered", { count: 1 }))
        expect(renderBlock({ overview: { standing: "denied" } })).toContain(translate("refusal.forbidden"))
        expect(renderBlock({ overview: { standing: "unavailable" } })).toContain(translate("surfaceUnavailable"))
        const empty = renderBlock({ overview: { standing: "empty", model: null } })
        expect(empty).toContain(translate("overview.empty"))
        expect(empty).not.toContain(translate("overview.measureCovered", { count: 1 }))
    })

    it("says the installation scope is unresolved before any operation address exists", () => {
        const text = renderBlock({ scopeReady: false, scopeStanding: "loading" })
        expect(text).toContain(translate("standing.loading"))
        expect(text).toContain(translate("rail.noticeEmpty"))
    })
})
