"use client";
import { SurfaceCard, Button, Heading, Text } from "@starci/grammar/common";



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


      <Heading level={3}>{candidateLabel}</Heading>

      <Text size="sm" tone="muted">{activeLabel}</Text></div>



    <Text size="sm" weight="semibold">{draft?.summary ?? "Setup has not produced a candidate yet."}</Text><div><><div>




          <Text size="sm">{"Setup gates"}</Text>

          <Text size="sm" tone={gateCount > 0 && passedGateCount === gateCount ? "accent" : undefined} weight="semibold">{`${passedGateCount}/${gateCount} complete`}</Text></div>{gates.map((gate, index) => <div key={index}>{<Text size="sm">{gate.label}</Text>}{<Text size="sm" tone={gate.passed ? "accent" : "muted"} weight="semibold">{gate.passed ? "Complete" : "Needs follow-up"}</Text>}</div>)}{reviewFacts.slice(0, 4).map((fact, index) => <div key={index}>{<Text size="sm">{`Evidence ${index + 1}`}</Text>}{<Text size="sm">{fact}</Text>}</div>)}<div>

          <Text size="sm">{"Exact Test"}</Text>

          <Text size="sm" tone={draft?.exactTestPassed === true ? "accent" : "muted"} weight="semibold">{draft?.exactTestPassed === true ? "Passed for this digest" : "Required before Apply"}</Text></div></></div>





    <Text size="sm" tone="muted" live={refused ? "assertive" : undefined}>{refused ? "The context operation was refused; the active version did not change." : "Apply activates only this tested immutable version, disables Live, and never rewrites earlier Execute messages."}</Text><>



      <Button
        variant="primary"
        isDisabled={!applyReady}
        isPending={pending}
        onPress={onApply}
      >{applyLabel}</Button></></div>;
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
  return <SurfaceCard
    label="Business context"
    fact={activeVersion === null ? "Not applied" : `v${activeVersion} active`}
  >
  <ContextVersionContent activeVersion={activeVersion} draft={draft} pending={pending} refused={refused} onApply={onApply} />
</SurfaceCard>;
};

