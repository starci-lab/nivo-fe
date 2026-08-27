"use client"

import {
    Button, Heading, SurfaceCard, Text, Tree,
    defineContractComponent, defineLeafComponent,
} from "@nivo/ui"

/** Reviewable immutable context version projected from the backend snapshot. */
export type SetupGate = {
    readonly key: string
    readonly label: string
    readonly passed: boolean
}

/** Owner-reviewable Setup draft and the immutable context produced from it. */
export type ContextDraft = {
    readonly contextId: string | null
    readonly setupSessionId: string
    readonly revision: number
    readonly status: "open" | "ready" | "completed" | "superseded"
    readonly version: number | null
    readonly digest: string | null
    readonly summary: string
    readonly facts: ReadonlyArray<string>
    readonly gates: ReadonlyArray<SetupGate>
    readonly exactTestPassed: boolean
    readonly isActive: boolean
}

/** Runtime data consumed by the stable context-review ComponentType. */
export type ContextVersionContentProps = {
    readonly activeVersion: number | null
    readonly draft: ContextDraft | null
    readonly pending: boolean
    readonly refused: boolean
    readonly onApply: () => void
}

const ContextVersionContent = ({ activeVersion, draft, pending, refused, onApply }: ContextVersionContentProps) => {
    const candidateLabel = draft === null
        ? "No Setup draft"
        : draft.version === null ? `Setup draft r${draft.revision}` : `Context v${draft.version}`
    const activeLabel = activeVersion === null ? "No active context" : `Active v${activeVersion}`
    const gates = draft?.gates ?? []
    const passedGateCount = gates.filter((gate) => gate.passed).length
    const gateCount = gates.length
    const gatesLabel = gateCount === 0 ? "Complete Setup gates" : `Complete all ${gateCount} Setup gates`
    const reviewFacts = draft?.facts.length ? draft.facts : ["Continue the private Setup chat so Nivo can ask the missing business questions."]
    const applyReady = draft !== null && draft.version !== null && draft.status === "completed" && draft.exactTestPassed && !draft.isActive
    const applyLabel = draft === null ? gatesLabel
        : draft.isActive ? `v${draft.version} active`
            : draft.version === null ? gatesLabel
                : !draft.exactTestPassed ? "Pass this revision's Test first" : `Apply context v${draft.version}`
    return (
        <Tree contract="agentos-context-review" render={defineContractComponent("agentos-context-review", {
            heading: defineContractComponent("title-with-baseline-fact", {
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: candidateLabel, level: 3 }} />),
                fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: activeLabel, size: "sm", tone: "muted" }} />
                )),
            }),
            summary: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: draft?.summary ?? "Setup has not produced a candidate yet.", size: "sm", weight: "semibold" }} />
            )),
            facts: defineContractComponent("labelled-fact-stack", {
                fact: [
                    defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Setup gates", size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: `${passedGateCount}/${gateCount} complete`, size: "sm", weight: "semibold", tone: gateCount > 0 && passedGateCount === gateCount ? "accent" : undefined }} />
                        )),
                    }),
                    ...gates.map((gate) => defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: gate.label, size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: gate.passed ? "Complete" : "Needs follow-up", size: "sm", weight: "semibold", tone: gate.passed ? "accent" : "muted" }} />
                        )),
                    })),
                    ...reviewFacts.slice(0, 4).map((fact, index) => defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: `Evidence ${index + 1}`, size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: fact, size: "sm" }} />),
                    })),
                    defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Exact Test", size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: draft?.exactTestPassed === true ? "Passed for this digest" : "Required before Apply", size: "sm", weight: "semibold", tone: draft?.exactTestPassed === true ? "accent" : "muted" }} />
                        )),
                    }),
                ],
            }),
            notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text
                    props={{
                        content: refused
                            ? "The context operation was refused; the active version did not change."
                            : "Apply activates only this tested immutable version, disables Live, and never rewrites earlier Execute messages.",
                        size: "sm",
                        tone: "muted",
                        live: refused ? "assertive" : undefined,
                    }}
                />
            )),
            action: [defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: applyLabel,
                        variant: "primary",
                        disabled: !applyReady,
                        isPending: pending,
                    }}
                    on={{ press: onApply }}
                />
            ))],
        })} />
    )
}

const CONTEXT_VERSION_CONTENT = defineContractComponent("agentos-context-review", ContextVersionContent)

/** Draw one immutable candidate and preserve explicit application as the only state transition. */
export const ContextVersionBlock = ({ activeVersion, draft, pending, refused, onApply }: ContextVersionContentProps) => (
    <SurfaceCard
        props={{ label: "Business context", fact: activeVersion === null ? "Not applied" : `v${activeVersion} active` }}
        contract="agentos-context-review"
        render={CONTEXT_VERSION_CONTENT}
        contentProps={{ activeVersion, draft, pending, refused, onApply }}
    />
)

/** Source-level tier marker for the pure context-version block. */
export const meta = { shape: "block", world: "pure" } as const
