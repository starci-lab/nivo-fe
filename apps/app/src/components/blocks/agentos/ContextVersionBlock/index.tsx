"use client";

import { Badge, Button, Heading, SurfaceCard, Text } from "@starci/grammar/common";
import { CONTEXT_BAND_CLASS_NAME, CONTEXT_GATE_ROW_CLASS_NAME, CONTEXT_RAISED_BAND_CLASS_NAME } from "./classNames";

/** One readiness requirement and its measured evidence for the selected revision. */
export type SetupGate = { readonly key: string; readonly label: string; readonly passed: boolean };
/** Immutable context identity and exact Test evidence resolved for the selected Setup revision. */
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
/** Facts and action state supplied by the selected revision owner. */
export type ContextVersionContentProps = {
  readonly activeVersion: number | null;
  readonly draft: ContextDraft | null;
  readonly pending: boolean;
  readonly ownPending?: boolean;
  readonly peerDisabled?: boolean;
  readonly refused: boolean;
  readonly onApply: () => void;
};
/** Public review contract for activating one tested context version. */
export type ContextVersionBlockProps = ContextVersionContentProps;

/** Render complete facts, gates and exact Test state with Apply as the sole mutation. */
export const ContextVersionBlock = (props: ContextVersionBlockProps) => {
  const { activeVersion, draft, pending, ownPending = pending, peerDisabled = false, refused, onApply } = props;
  const gates = draft?.gates ?? [];
  const passed = gates.filter(gate => gate.passed).length;
  const applyReady = draft !== null && draft.version !== null && draft.status === "completed" && draft.exactTestPassed && !draft.isActive;
  const applyLabel = draft === null ? "Complete Setup gates" : draft.isActive ? `v${draft.version} active` : draft.version === null ? "Complete Setup gates" : !draft.exactTestPassed ? "Pass this revision's Test first" : `Apply context v${draft.version}`;
  return (
    <SurfaceCard ariaLabel="Setup gates and context review" composition="joined">
      <div className={CONTEXT_RAISED_BAND_CLASS_NAME} data-contract="SURFACE-3 GAP-3 PADDING-4">
        <Heading level={3}>Review business context</Heading>
        <Text size="sm" tone="muted">{draft === null ? "No Setup draft" : `Setup draft r${draft.revision}`} · Active context {activeVersion === null ? "not applied" : `v${activeVersion}`}</Text>
      </div>
      <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
        <Text size="sm" weight="semibold">{draft?.summary ?? "Setup has not produced a candidate yet."}</Text>
        {(draft?.facts.length ? draft.facts : ["Continue the private Setup chat so Nivo can ask the missing business questions."]).slice(0, 4).map((fact, index) => <Text size="sm" key={`${draft?.setupSessionId ?? "empty"}-fact-${index}`}>{fact}</Text>)}
      </div>
      <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
        <Heading level={4}>Setup gates</Heading>
        {gates.length > 0 ? <Text size="sm" weight="semibold">{passed}/{gates.length} complete</Text> : <Text size="sm" tone="muted">Continue Setup to define the gates for this module.</Text>}
        {gates.map(gate => <div className={CONTEXT_GATE_ROW_CLASS_NAME} data-contract="BOUNDARY-1 GAP-2 PADDING-3" key={gate.key}><Text size="sm">{gate.label}</Text><Badge tone={gate.passed ? "success" : "neutral"}>{gate.passed ? "Complete" : "Needs follow-up"}</Badge></div>)}
      </div>
      <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
        <Heading level={4}>Exact Test</Heading>
        <Text size="sm" weight="semibold">{draft?.exactTestPassed ? "Passed for this digest" : "Required before Apply"}</Text>
        <Text size="sm" tone="muted" live={refused ? "assertive" : undefined}>{refused ? "The context operation was refused; the active version did not change." : "Apply activates only this tested immutable version, disables Live, and never rewrites earlier Execute messages."}</Text>
        <Button variant="primary" isPending={ownPending} isDisabled={!applyReady || peerDisabled || ownPending} onPress={onApply}>{applyLabel}</Button>
      </div>
    </SurfaceCard>
  );
};
