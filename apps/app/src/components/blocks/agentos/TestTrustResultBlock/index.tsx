import type { MyAgentosModuleTestSurfaceQuery } from "@/modules/api/__generated__/core"

import type { AgentosModuleTestContractView } from "@/modules/api/agentos-module-tests"


type RuntimeTrustResultValues = { readonly status: string }

/** Settled display labels and typed formatters supplied by the page owner. */
export type TestTrustResultBlockCopy = {
    readonly testStatus: {
        readonly failed: string
        readonly passed: string
        readonly running: string
        readonly warning: string
    }
    readonly trust: {
        readonly collect: string
        readonly evidence: string
        readonly expected: string
        readonly fail: string
        readonly noRun: string
        readonly notRun: string
        readonly notice: string
        readonly observed: string
        readonly pass: string
        readonly rejected: string
        readonly result: (values: RuntimeTrustResultValues) => string
        readonly title: string
        readonly total: string
        readonly verdictFail: string
        readonly verdictPass: string
        readonly verdictWarning: string
        readonly warning: string
    }
}

import { SurfaceCard, Heading, Text } from "@starci/grammar/common"

import type { ComponentType } from "react"

import type { AgentosRuntimeValue } from "@/modules/api/agentos-runtime-tree"
type EvidenceComponentProps = {
    readonly copy: TestTrustResultBlockCopy
    readonly assertion: NonNullable<MyAgentosModuleTestSurfaceQuery["myAgentosModuleTestSurface"]["data"]>["assertions"][number]
}
type EvidenceRegistry = Readonly<Record<string, ComponentType<EvidenceComponentProps>>>

/** Persisted result boundary rendered by the trusted evidence registry. */
type TestTrustResultBlockProps = {
    readonly copy: TestTrustResultBlockCopy
    readonly contract: AgentosModuleTestContractView
    readonly run: NonNullable<MyAgentosModuleTestSurfaceQuery["myAgentosModuleTestSurface"]["data"]>["runs"][number] | null
    readonly assertions: ReadonlyArray<NonNullable<MyAgentosModuleTestSurfaceQuery["myAgentosModuleTestSurface"]["data"]>["assertions"][number]>
    readonly contextLabel: string
    readonly registry?: EvidenceRegistry
}
const valueLabel = (value: AgentosRuntimeValue | null): string => {
    if (value === null) return "—"
    if (typeof value === "string") return value
    return JSON.stringify(value)
}
const NivoTestEvidence = ({ copy, assertion }: EvidenceComponentProps) => {
    return (
        <div>
            <>
                <div>
                    <Text size="sm" weight="semibold">
                        {assertion.label}
                    </Text>
                    <Text size="sm" tone={assertion.verdict === "pass" ? "accent" : "muted"} weight="semibold">
                        {assertion.verdict === "pass"
                            ? copy.trust.verdictPass
                            : assertion.verdict === "warning"
                              ? copy.trust.verdictWarning
                              : copy.trust.verdictFail}
                    </Text>
                </div>
                <div>
                    <Text size="sm">{copy.trust.expected}</Text>
                    <Text size="sm">{valueLabel(assertion.expected)}</Text>
                </div>
                <div>
                    <Text size="sm">{copy.trust.observed}</Text>
                    <Text size="sm">{valueLabel(assertion.actual)}</Text>
                </div>
            </>
        </div>
    )
}
const RejectedEvidence = ({ copy, assertion }: EvidenceComponentProps) => {
    return (
        <div>
            <>
                <div>
                    <Text size="sm">{assertion.label}</Text>
                    <Text size="sm" weight="semibold">
                        {copy.trust.rejected}
                    </Text>
                </div>
            </>
        </div>
    )
}
const DEFAULT_EVIDENCE_REGISTRY: EvidenceRegistry = {
    "nivo.test-evidence@1.0.0": NivoTestEvidence,
}
const RUN_SUMMARY_KEYS = ["total", "pass", "warning", "fail"] as const
const testStatusLabel = (status: string, copy: TestTrustResultBlockCopy): string => {
    if (status === "failed") return copy.testStatus.failed
    if (status === "passed") return copy.testStatus.passed
    if (status === "running") return copy.testStatus.running
    if (status === "warning") return copy.testStatus.warning
    return status
}
const count = (run: NonNullable<MyAgentosModuleTestSurfaceQuery["myAgentosModuleTestSurface"]["data"]>["runs"][number], key: "total" | "pass" | "warning" | "fail"): string => {
    const value = run.summary[key]
    return typeof value === "number" || typeof value === "string" ? String(value) : "0"
}

/** Render one persisted Test run only through its registered trusted evidence ComponentType. */
export const TestTrustResultBlock = (props: TestTrustResultBlockProps) => {
    const { copy } = props
    const {
        contract,
        run,
        assertions,
        contextLabel,
        registry = DEFAULT_EVIDENCE_REGISTRY,
    }: TestTrustResultBlockProps = props
    return (
        <SurfaceCard label={copy.trust.title} fact={run === null ? copy.trust.notRun : testStatusLabel(run.status, copy)}>
            <div>
                <div>
                    <Heading level={3}>
                        {run === null ? copy.trust.collect : copy.trust.result({ status: testStatusLabel(run.status, copy) })}
                    </Heading>
                    <Text size="sm" tone="muted">
                        {contextLabel}
                    </Text>
                </div>
                <div>
                    {run === null
                        ? [
                              <div key="item-0">
                                  <Text size="sm">{copy.trust.evidence}</Text>
                                  <Text size="sm">{copy.trust.noRun}</Text>
                              </div>,
                          ]
                        : RUN_SUMMARY_KEYS.map((key) => (
                              <div key={key}>
                                  <Text size="sm">{copy.trust[key]}</Text>
                                  <Text size="sm" weight="semibold">
                                      {count(run, key)}
                                  </Text>
                              </div>
                          ))}
                </div>
                {assertions.map((assertion) => {
                    const identity = `${assertion.evidence.component}@${assertion.evidence.version}`
                    const Evidence =
                        identity === `${contract.evidenceWidget.key}@${contract.evidenceWidget.version}`
                            ? (registry[identity] ?? RejectedEvidence)
                            : RejectedEvidence
                    return <Evidence copy={copy} key={identity} assertion={assertion} />
                })}

                <Text size="sm" tone="muted" live="polite">
                    {copy.trust.notice}
                </Text>
            </div>
        </SurfaceCard>
    )
}
