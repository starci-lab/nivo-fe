"use client";

type SetupApplyVersionValues = { readonly version: number };
type SetupCompleteCountValues = { readonly passed: number; readonly total: number };
type SetupDraftRevisionValues = { readonly revision: number };
type SetupReviewSummaryValues = { readonly draft: string; readonly version: string };
type SetupVersionActiveValues = { readonly version: string | number };

/** Settled display labels and typed formatters supplied by the page owner. */
export type ContextVersionBlockCopy = {
  readonly "setup": {
    readonly "applyHint": string;
    readonly "applyVersion": (values: SetupApplyVersionValues) => string;
    readonly "complete": string;
    readonly "completeCount": (values: SetupCompleteCountValues) => string;
    readonly "completeGates": string;
    readonly "continueChat": string;
    readonly "draftRevision": (values: SetupDraftRevisionValues) => string;
    readonly "exactTest": string;
    readonly "gatesReview": string;
    readonly "needsFollowUp": string;
    readonly "noCandidate": string;
    readonly "noDraft": string;
    readonly "noGates": string;
    readonly "notApplied": string;
    readonly "operationRefused": string;
    readonly "passTestFirst": string;
    readonly "reviewContext": string;
    readonly "reviewSummary": (values: SetupReviewSummaryValues) => string;
    readonly "setupGates": string;
    readonly "testPassed": string;
    readonly "testRequired": string;
    readonly "versionActive": (values: SetupVersionActiveValues) => string;
  };
};


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
  readonly copy: ContextVersionBlockCopy;
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
  const { copy } = props;
  const { activeVersion, draft, pending, ownPending = pending, peerDisabled = false, refused, onApply } = props;
  const gates = draft?.gates ?? [];
  const passed = gates.filter(gate => gate.passed).length;
  const applyReady = draft !== null && draft.version !== null && draft.status === "completed" && draft.exactTestPassed && !draft.isActive;
  const applyLabel = draft === null ? copy.setup.completeGates : draft.isActive ? copy.setup.versionActive({ version: String(draft.version) }) : draft.version === null ? copy.setup.completeGates : !draft.exactTestPassed ? copy.setup.passTestFirst : copy.setup.applyVersion({ version: draft.version });
  return (
    <SurfaceCard ariaLabel={copy.setup.gatesReview} composition="joined">
      <div className={CONTEXT_RAISED_BAND_CLASS_NAME} data-contract="SURFACE-3 GAP-3 PADDING-4">
        <Heading level={3}>{copy.setup.reviewContext}</Heading>
        <Text size="sm" tone="muted">{copy.setup.reviewSummary({ draft: draft === null ? copy.setup.noDraft : copy.setup.draftRevision({ revision: draft.revision }), version: activeVersion === null ? copy.setup.notApplied : `v${activeVersion}` })}</Text>
      </div>
      <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
        <Text size="sm" weight="semibold">{draft?.summary ?? copy.setup.noCandidate}</Text>
        {(draft?.facts.length ? draft.facts : [copy.setup.continueChat]).slice(0, 4).map((fact, index) => <Text size="sm" key={`${draft?.setupSessionId ?? "empty"}-fact-${index}`}>{fact}</Text>)}
      </div>
      <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
        <Heading level={4}>{copy.setup.setupGates}</Heading>
        {gates.length > 0 ? <Text size="sm" weight="semibold">{copy.setup.completeCount({ passed, total: gates.length })}</Text> : <Text size="sm" tone="muted">{copy.setup.noGates}</Text>}
        {gates.map(gate => <div className={CONTEXT_GATE_ROW_CLASS_NAME} data-contract="BOUNDARY-1 GAP-2 PADDING-3" key={gate.key}><Text size="sm">{gate.label}</Text><Badge tone={gate.passed ? "success" : "neutral"}>{gate.passed ? copy.setup.complete : copy.setup.needsFollowUp}</Badge></div>)}
      </div>
      <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
        <Heading level={4}>{copy.setup.exactTest}</Heading>
        <Text size="sm" weight="semibold">{draft?.exactTestPassed ? copy.setup.testPassed : copy.setup.testRequired}</Text>
        <Text size="sm" tone="muted" live={refused ? "assertive" : undefined}>{refused ? copy.setup.operationRefused : copy.setup.applyHint}</Text>
        <Button variant="primary" isPending={ownPending} isDisabled={!applyReady || peerDisabled || ownPending} onPress={onApply}>{applyLabel}</Button>
      </div>
    </SurfaceCard>
  );
};
