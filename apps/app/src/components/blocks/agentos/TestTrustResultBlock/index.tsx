"use client"

import type { ComponentType } from "react"
import {
    Heading, SurfaceCard, Text, Tree,
    defineContractComponent, defineContractProjection, defineLeafComponent,
} from "@nivo/ui"
import type {
    AgentosModuleTestAssertionResult, AgentosModuleTestContract, AgentosModuleTestRun, AgentosRuntimeValue,
} from "@/modules/api/console"

type EvidenceComponentProps = { readonly assertion: AgentosModuleTestAssertionResult }
type EvidenceRegistry = Readonly<Record<string, ComponentType<EvidenceComponentProps>>>

/** Persisted result boundary rendered by the trusted evidence registry. */
export type TestTrustResultBlockProps = {
    readonly contract: AgentosModuleTestContract
    readonly run: AgentosModuleTestRun | null
    readonly assertions: ReadonlyArray<AgentosModuleTestAssertionResult>
    readonly contextLabel: string
    readonly registry?: EvidenceRegistry
}

const valueLabel = (value: AgentosRuntimeValue | null): string => {
    if (value === null) return "—"
    if (typeof value === "string") return value
    return JSON.stringify(value)
}

const NivoTestEvidence = ({ assertion }: EvidenceComponentProps) => (
    <Tree contract="labelled-fact-stack" render={defineContractComponent("labelled-fact-stack", {
        fact: [
            defineContractComponent("label-value-row", {
                label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: assertion.label, size: "sm", weight: "semibold" }} />),
                value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: assertion.verdict.toUpperCase(), size: "sm", tone: assertion.verdict === "pass" ? "accent" : "muted", weight: "semibold" }} />),
            }),
            defineContractComponent("label-value-row", {
                label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Expected", size: "sm" }} />),
                value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: valueLabel(assertion.expected), size: "sm" }} />),
            }),
            defineContractComponent("label-value-row", {
                label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Observed", size: "sm" }} />),
                value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: valueLabel(assertion.actual), size: "sm" }} />),
            }),
        ],
    })} />
)

const RejectedEvidence = ({ assertion }: EvidenceComponentProps) => (
    <Tree contract="labelled-fact-stack" render={defineContractComponent("labelled-fact-stack", {
        fact: [defineContractComponent("label-value-row", {
            label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: assertion.label, size: "sm" }} />),
            value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Untrusted evidence rejected", size: "sm", weight: "semibold" }} />),
        })],
    })} />
)

const DEFAULT_EVIDENCE_REGISTRY: EvidenceRegistry = { "nivo.test-evidence@1.0.0": NivoTestEvidence }
const count = (run: AgentosModuleTestRun, key: "total" | "pass" | "warning" | "fail"): string => {
    const value = run.summary[key]
    return typeof value === "number" || typeof value === "string" ? String(value) : "0"
}

/** Render one persisted Test run only through its registered trusted evidence ComponentType. */
export const TestTrustResultBlock = ({
    contract, run, assertions, contextLabel, registry = DEFAULT_EVIDENCE_REGISTRY,
}: TestTrustResultBlockProps) => (
    <SurfaceCard
        props={{ label: "Trust evidence", fact: run === null ? "Not run" : run.status }}
        contract="agentos-test-evidence-body"
        render={defineContractComponent("agentos-test-evidence-body", {
            identity: defineContractComponent("title-with-baseline-fact", {
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: run === null ? "Run a scenario to collect evidence" : `Result: ${run.status}`, level: 3 }} />),
                fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: contextLabel, size: "sm", tone: "muted" }} />),
            }),
            summary: defineContractComponent("labelled-fact-stack", {
                fact: run === null ? [defineContractComponent("label-value-row", {
                    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Evidence", size: "sm" }} />),
                    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "No persisted run yet", size: "sm" }} />),
                })] : (["total", "pass", "warning", "fail"] as const).map((key) => defineContractComponent("label-value-row", {
                    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: key, size: "sm" }} />),
                    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: count(run, key), size: "sm", weight: "semibold" }} />),
                })),
            }),
            assertion: assertions.map((assertion) => {
                const identity = `${assertion.evidence.component}@${assertion.evidence.version}`
                const Evidence = identity === `${contract.evidenceWidget.key}@${contract.evidenceWidget.version}`
                    ? registry[identity] ?? RejectedEvidence
                    : RejectedEvidence
                return defineContractProjection("labelled-fact-stack", () => <Evidence assertion={assertion} />)
            }),
            notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: "Evidence is persisted against this exact Setup draft digest or context version. It does not rewrite Execute history or apply anything automatically.", size: "sm", tone: "muted", live: "polite" }} />
            )),
        })}
    />
)

/** Source-level tier marker for the pure trusted Test evidence boundary. */
export const meta = { shape: "block", world: "pure" } as const
