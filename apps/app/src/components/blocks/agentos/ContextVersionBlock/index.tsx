"use client";

import { Button, Heading, SurfaceCard, Text } from "@nivo/ui";

/** Reviewable immutable context version projected from the backend snapshot. */
export type ContextVersionBlockProps = ContextVersionContentProps;
/** Public API role for SetupGate. */
export type SetupGate = {
  readonly key: string;
  readonly label: string;
  readonly passed: boolean;
};

/** Owner-reviewable Setup draft and the immutable context produced from it. */
export type ContextDraft = {
  readonly contextId: string | null;
  readonly setupSessionId: string;
  readonly revision: number;
  readonly status: "open" | "ready" | "completed" | "superseded";
  readonly version: number | null;
  readonly digest: string | null;
  readonly summary: string;
  readonly facts: ReadonlyArray<string>;
  readonly gates: ReadonlyArray<SetupGate>;
  readonly exactTestPassed: boolean;
  readonly isActive: boolean;
};

/** Runtime data consumed by the stable context-review ComponentType. */
export type ContextVersionContentProps = {
  readonly activeVersion: number | null;
  readonly draft: ContextDraft | null;
  readonly pending: boolean;
  readonly refused: boolean;
  readonly onApply: () => void;
};
const ContextVersionContent = ({
  activeVersion,
  draft,
  pending,
  refused,
  onApply
}: ContextVersionContentProps) => {
  const candidateLabel = draft === null ? "No Setup draft" : draft.version === null ? `Setup draft r${draft.revision}` : `Context v${draft.version}`;
  const activeLabel = activeVersion === null ? "No active context" : `Active v${activeVersion}`;
  const gates = draft?.gates ?? [];
  const passedGateCount = gates.filter(gate => gate.passed).length;
  const gateCount = gates.length;
  const gatesLabel = gateCount === 0 ? "Complete Setup gates" : `Complete all ${gateCount} Setup gates`;
  const reviewFacts = draft?.facts.length ? draft.facts : ["Continue the private Setup chat so Nivo can ask the missing business questions."];
  const applyReady = draft !== null && draft.version !== null && draft.status === "completed" && draft.exactTestPassed && !draft.isActive;
  const applyLabel = draft === null ? gatesLabel : draft.isActive ? `v${draft.version} active` : draft.version === null ? gatesLabel : !draft.exactTestPassed ? "Pass this revision's Test first" : `Apply context v${draft.version}`;
  return <div><div>


      <Heading props={{
        content: candidateLabel,
        level: 3
      }} />

      <Text props={{
        content: activeLabel,
        size: "sm",
        tone: "muted"
      }} /></div>



    <Text props={{
      content: draft?.summary ?? "Setup has not produced a candidate yet.",
      size: "sm",
      weight: "semibold"
    }} /><div><><div>




          <Text props={{
            content: "Setup gates",
            size: "sm"
          }} />

          <Text props={{
            content: `${passedGateCount}/${gateCount} complete`,
            size: "sm",
            weight: "semibold",
            tone: gateCount > 0 && passedGateCount === gateCount ? "accent" : undefined
          }} /></div>{gates.map((gate, index) => <div key={index}>{<Text props={{
            content: gate.label,
            size: "sm"
          }} />}{<Text props={{
            content: gate.passed ? "Complete" : "Needs follow-up",
            size: "sm",
            weight: "semibold",
            tone: gate.passed ? "accent" : "muted"
          }} />}</div>)}{reviewFacts.slice(0, 4).map((fact, index) => <div key={index}>{<Text props={{
            content: `Evidence ${index + 1}`,
            size: "sm"
          }} />}{<Text props={{
            content: fact,
            size: "sm"
          }} />}</div>)}<div>

          <Text props={{
            content: "Exact Test",
            size: "sm"
          }} />

          <Text props={{
            content: draft?.exactTestPassed === true ? "Passed for this digest" : "Required before Apply",
            size: "sm",
            weight: "semibold",
            tone: draft?.exactTestPassed === true ? "accent" : "muted"
          }} /></div></></div>





    <Text props={{
      content: refused ? "The context operation was refused; the active version did not change." : "Apply activates only this tested immutable version, disables Live, and never rewrites earlier Execute messages.",
      size: "sm",
      tone: "muted",
      live: refused ? "assertive" : undefined
    }} /><>



      <Button props={{
        label: applyLabel,
        variant: "primary",
        disabled: !applyReady,
        isPending: pending
      }} on={{
        press: onApply
      }} /></></div>;
};

/** Draw one immutable candidate and preserve explicit application as the only state transition. */
export const ContextVersionBlock = (props: ContextVersionBlockProps) => {
  const {
    activeVersion,
    draft,
    pending,
    refused,
    onApply
  }: ContextVersionContentProps = props;
  return <SurfaceCard props={{
    label: "Business context",
    fact: activeVersion === null ? "Not applied" : `v${activeVersion} active`
  }}>
  <ContextVersionContent activeVersion={activeVersion} draft={draft} pending={pending} refused={refused} onApply={onApply} />
</SurfaceCard>;
};

