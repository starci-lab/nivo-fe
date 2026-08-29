"use client";

import type { ComponentType } from "react";
import { Heading, SurfaceCard, Text } from "@nivo/ui";
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



      <Text props={{
        content: assertion.label,
        size: "sm",
        weight: "semibold"
      }} />
      <Text props={{
        content: assertion.verdict.toUpperCase(),
        size: "sm",
        tone: assertion.verdict === "pass" ? "accent" : "muted",
        weight: "semibold"
      }} /></div><div>


      <Text props={{
        content: "Expected",
        size: "sm"
      }} />
      <Text props={{
        content: valueLabel(assertion.expected),
        size: "sm"
      }} /></div><div>


      <Text props={{
        content: "Observed",
        size: "sm"
      }} />
      <Text props={{
        content: valueLabel(assertion.actual),
        size: "sm"
      }} /></div></></div>;
const RejectedEvidence = ({
  assertion
}: EvidenceComponentProps) => <div><><div>


      <Text props={{
        content: assertion.label,
        size: "sm"
      }} />
      <Text props={{
        content: "Untrusted evidence rejected",
        size: "sm",
        weight: "semibold"
      }} /></div></></div>;
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
  return <SurfaceCard props={{
    label: "Trust evidence",
    fact: run === null ? "Not run" : run.status
  }}><div><div>



      <Heading props={{
          content: run === null ? "Run a scenario to collect evidence" : `Result: ${run.status}`,
          level: 3
        }} />
      <Text props={{
          content: contextLabel,
          size: "sm",
          tone: "muted"
        }} /></div><div>{run === null ? [<div key="item-0">
        <Text props={{
            content: "Evidence",
            size: "sm"
          }} />
        <Text props={{
            content: "No persisted run yet",
            size: "sm"
          }} /></div>] : (["total", "pass", "warning", "fail"] as const).map((key, index) => <div key={index}>
        <Text props={{
            content: key,
            size: "sm"
          }} />
        <Text props={{
            content: count(run, key),
            size: "sm",
            weight: "semibold"
          }} /></div>)}</div>{assertions.map(assertion => {
        const identity = `${assertion.evidence.component}@${assertion.evidence.version}`;
        const Evidence = identity === `${contract.evidenceWidget.key}@${contract.evidenceWidget.version}` ? registry[identity] ?? RejectedEvidence : RejectedEvidence;
        return <Evidence key={identity} assertion={assertion} />;
      })}

    <Text props={{
        content: "Evidence is persisted against this exact Setup draft digest or context version. It does not rewrite Execute history or apply anything automatically.",
        size: "sm",
        tone: "muted",
        live: "polite"
      }} /></div></SurfaceCard>;
};
