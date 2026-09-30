"use client"

import { ContextVersionBlockBase } from "./component"

type SetupApplyVersionValues = { readonly version: number }
type SetupCompleteCountValues = { readonly passed: number; readonly total: number }
type SetupDraftRevisionValues = { readonly revision: number }
type SetupReviewSummaryValues = { readonly draft: string; readonly version: string }
type SetupVersionActiveValues = { readonly version: string | number }

/** Settled display labels and typed formatters supplied by the page owner. */
export type ContextVersionBlockCopy = {
    readonly setup: {
        readonly applyHint: string
        readonly applyVersion: (values: SetupApplyVersionValues) => string
        readonly complete: string
        readonly completeCount: (values: SetupCompleteCountValues) => string
        readonly completeGates: string
        readonly confirmRequirement: string
        readonly confirmed: string
        readonly evidenceRequired: string
        readonly continueChat: string
        readonly createVersion: string
        readonly draftRevision: (values: SetupDraftRevisionValues) => string
        readonly exactTest: string
        readonly gatesReview: string
        readonly needsFollowUp: string
        readonly noCandidate: string
        readonly noDraft: string
        readonly noGates: string
        readonly notApplied: string
        readonly operationRefused: string
        readonly passTestFirst: string
        readonly reviewContext: string
        readonly reviewSummary: (values: SetupReviewSummaryValues) => string
        readonly setupGates: string
        readonly testPassed: string
        readonly testRequired: string
        readonly versionActive: (values: SetupVersionActiveValues) => string
    }
}

/** One readiness requirement and its measured evidence for the selected revision. */
type SetupGate = {
    readonly key: string
    readonly label: string
    readonly passed: boolean
    readonly ownerConfirmation: boolean
    readonly confirmed: boolean
    readonly citationPolicy: "none" | "attachment-content"
}
/** Immutable context identity and exact Test evidence resolved for the selected Setup revision. */
export type ContextDraft = {
    readonly contextId: string | null
    readonly setupSessionId: string
    readonly revision: number
    readonly status: "open" | "ready" | "completed" | "superseded"
    readonly version: number | null
    readonly digest: string | null
    readonly definitionDigest: string | null
    readonly authorityGeneration: number
    readonly sourceGeneration: number
    readonly retrievalGeneration: number
    readonly summary: string
    readonly facts: ReadonlyArray<string>
    readonly gates: ReadonlyArray<SetupGate>
    readonly exactTestPassed: boolean
    readonly isActive: boolean
}
/** Facts and action state supplied by the selected revision owner. */
type ContextVersionContentProps = {
    readonly copy: ContextVersionBlockCopy
    readonly activeVersion: number | null
    readonly draft: ContextDraft | null
    readonly pending: boolean
    readonly ownPending?: boolean
    readonly peerDisabled?: boolean
    readonly refused: boolean
    readonly onApply: () => void
    readonly onCreateVersion: () => void
    readonly onConfirmRequirement: (gate: SetupGate) => void
}
/** Public review contract for activating one tested context version. */
type ContextVersionBlockProps = ContextVersionContentProps

/** Render facts, confirmations, immutable-version creation and exact Apply readiness. */
export const ContextVersionBlock = (props: ContextVersionBlockProps) => {
    const { copy } = props
    const {
        activeVersion,
        draft,
        pending,
        ownPending = pending,
        peerDisabled = false,
        refused,
        onApply,
        onCreateVersion,
        onConfirmRequirement,
    } = props
    const gates = draft?.gates ?? []
    const passed = gates.filter((gate) => gate.passed).length
    const applyReady =
        draft !== null &&
        draft.version !== null &&
        draft.status === "completed" &&
        draft.exactTestPassed &&
        !draft.isActive
    const createReady = draft !== null && draft.version === null && draft.status === "ready" && draft.digest !== null
    const applyLabel =
        draft === null
            ? copy.setup.completeGates
            : draft.isActive
              ? copy.setup.versionActive({ version: String(draft.version) })
              : draft.version === null
                ? createReady
                    ? copy.setup.createVersion
                    : copy.setup.completeGates
                : !draft.exactTestPassed
                  ? copy.setup.passTestFirst
                  : copy.setup.applyVersion({ version: draft.version })
    const factOccurrences = new Map<string, number>()
    const factRows = (draft?.facts.length ? draft.facts : [copy.setup.continueChat]).slice(0, 4).map((fact) => {
        const occurrence = factOccurrences.get(fact) ?? 0
        factOccurrences.set(fact, occurrence + 1)
        return { fact, key: `${fact}:${occurrence}` }
    })
    return (
        <ContextVersionBlockBase
            props={{
                labels: {
                    gatesReview: copy.setup.gatesReview,
                    reviewContext: copy.setup.reviewContext,
                    setupGates: copy.setup.setupGates,
                    noGates: copy.setup.noGates,
                    confirmed: copy.setup.confirmed,
                    complete: copy.setup.complete,
                    needsFollowUp: copy.setup.needsFollowUp,
                    confirmRequirement: copy.setup.confirmRequirement,
                    evidenceRequired: copy.setup.evidenceRequired,
                    exactTest: copy.setup.exactTest,
                },
                reviewSummary: copy.setup.reviewSummary({
                    draft: draft === null ? copy.setup.noDraft : copy.setup.draftRevision({ revision: draft.revision }),
                    version: activeVersion === null ? copy.setup.notApplied : `v${activeVersion}`,
                }),
                summary: draft?.summary ?? copy.setup.noCandidate,
                factRows,
                gates,
                completeCount: gates.length > 0 ? copy.setup.completeCount({ passed, total: gates.length }) : "",
                testStatus: draft?.exactTestPassed ? copy.setup.testPassed : copy.setup.testRequired,
                applyHint: refused ? copy.setup.operationRefused : copy.setup.applyHint,
                applyLabel,
                pending,
                ownPending,
                peerDisabled,
                refused,
                actionDisabled: (!applyReady && !createReady) || peerDisabled || ownPending,
            }}
            on={{ apply: createReady ? onCreateVersion : onApply, confirmRequirement: onConfirmRequirement }}
        />
    )
}
