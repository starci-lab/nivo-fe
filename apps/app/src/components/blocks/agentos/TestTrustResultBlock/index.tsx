"use client";
import { SurfaceCard, Heading, Text } from "@starci/grammar/core";

import type { ComponentType } from "react";

import type { AgentosModuleTestAssertionResult, AgentosModuleTestContract, AgentosModuleTestRun, AgentosRuntimeValue } from "@/modules/api/console";
type EvidenceComponentProps = {
  readonly assertion: AgentosModuleTestAssertionResult;
};
type EvidenceRegistry = Readonly<Record<string, ComponentType<EvidenceComponentProps>>>;

/** Persisted result boundary rendered by the trusted evidence registry. */
export type TestTrustResultBlockProps = {
  readonly contract: AgentosModuleTestContract;
  readonly run: AgentosModuleTestRun | null;
  readonly assertions: ReadonlyArray<AgentosModuleTestAssertionResult>;
  readonly contextLabel: string;
  readonly registry?: EvidenceRegistry;
};
const valueLabel = (value: AgentosRuntimeValue | null): string => {
  if (value === null) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};
const NivoTestEvidence = ({
  assertion
}: EvidenceComponentProps) => <div><><div>



      <Text size="sm" weight="semibold">{assertion.label}</Text>
      <Text size="sm" tone={assertion.verdict === "pass" ? "accent" : "muted"} weight="semibold">{assertion.verdict.toUpperCase()}</Text></div><div>


      <Text size="sm">{"Expected"}</Text>
      <Text size="sm">{valueLabel(assertion.expected)}</Text></div><div>


      <Text size="sm">{"Observed"}</Text>
      <Text size="sm">{valueLabel(assertion.actual)}</Text></div></></div>;
const RejectedEvidence = ({
  assertion
}: EvidenceComponentProps) => <div><><div>


      <Text size="sm">{assertion.label}</Text>
      <Text size="sm" weight="semibold">{"Untrusted evidence rejected"}</Text></div></></div>;
const DEFAULT_EVIDENCE_REGISTRY: EvidenceRegistry = {
  "nivo.test-evidence@1.0.0": NivoTestEvidence
};
const count = (run: AgentosModuleTestRun, key: "total" | "pass" | "warning" | "fail"): string => {
  const value = run.summary[key];
  return typeof value === "number" || typeof value === "string" ? String(value) : "0";
};

/** Render one persisted Test run only through its registered trusted evidence ComponentType. */
export const TestTrustResultBlock = (props: TestTrustResultBlockProps) => {
  const {
    contract,
    run,
    assertions,
    contextLabel,
    registry = DEFAULT_EVIDENCE_REGISTRY
  }: TestTrustResultBlockProps = props;
  return <SurfaceCard
    label="Trust evidence"
    fact={run === null ? "Not run" : run.status}
  ><div><div>



      <Heading level={3}>{run === null ? "Run a scenario to collect evidence" : `Result: ${run.status}`}</Heading>
      <Text size="sm" tone="muted">{contextLabel}</Text></div><div>{run === null ? [<div key="item-0">
        <Text size="sm">{"Evidence"}</Text>
        <Text size="sm">{"No persisted run yet"}</Text></div>] : (["total", "pass", "warning", "fail"] as const).map((key, index) => <div key={index}>
        <Text size="sm">{key}</Text>
        <Text size="sm" weight="semibold">{count(run, key)}</Text></div>)}</div>{assertions.map(assertion => {
        const identity = `${assertion.evidence.component}@${assertion.evidence.version}`;
        const Evidence = identity === `${contract.evidenceWidget.key}@${contract.evidenceWidget.version}` ? registry[identity] ?? RejectedEvidence : RejectedEvidence;
        return <Evidence key={identity} assertion={assertion} />;
      })}

    <Text size="sm" tone="muted" live="polite">{"Evidence is persisted against this exact Setup draft digest or context version. It does not rewrite Execute history or apply anything automatically."}</Text></div></SurfaceCard>;
};
