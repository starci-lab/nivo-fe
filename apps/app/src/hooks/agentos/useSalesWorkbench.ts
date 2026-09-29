"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import type {
  SalesActionValue,
  SalesClarificationFact,
  SalesCloseRequest,
  SalesCommandValue,
  SalesInstallationScope,
  SalesOpportunityValue,
  SalesPipelineItem,
  SalesPipelineRequest,
  SalesPipelineValue,
  SalesPolicyValue,
  SalesReadinessValue
} from "@/modules/api/sales";
import { nivoQueryData } from "@/modules/query";
import { useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks/swr/queries/console";
import { useQuerySalesReadinessSwr } from "@/hooks/swr/queries/useQuerySalesReadinessSwr";
import { useQuerySalesPolicySwr } from "@/hooks/swr/queries/useQuerySalesPolicySwr";
import { useQuerySalesPipelineSwr } from "@/hooks/swr/queries/useQuerySalesPipelineSwr";
import { useQuerySalesOpportunitySwr } from "@/hooks/swr/queries/useQuerySalesOpportunitySwr";
import { useQuerySalesCommandSwr } from "@/hooks/swr/queries/useQuerySalesCommandSwr";
import { useQuerySalesActionSwr } from "@/hooks/swr/queries/useQuerySalesActionSwr";
import { useMutateSalesConfigurePolicySwr } from "@/hooks/swr/mutations/useMutateSalesConfigurePolicySwr";
import { useMutateSalesSubmitCommandSwr } from "@/hooks/swr/mutations/useMutateSalesSubmitCommandSwr";
import { useMutateSalesClarifyCommandSwr } from "@/hooks/swr/mutations/useMutateSalesClarifyCommandSwr";
import { useMutateSalesCloseSwr } from "@/hooks/swr/mutations/useMutateSalesCloseSwr";
import { useMutateSalesRecoverActionSwr } from "@/hooks/swr/mutations/useMutateSalesRecoverActionSwr";
import {
  salesActionIdentityOf,
  salesActionStatusKey,
  salesCommandStatusKey,
  salesExpectedRevisions,
  salesIdentityList,
  salesLifecycleKey,
  salesNoStartProof,
  salesRecoveryDoor,
  salesRefusalKey,
  salesRequestedActions,
  salesSurfaceStanding,
  salesWording,
  salesWriterFence,
  type SalesCommandAnswer,
  type SalesAnswerStanding,
  type SalesNotice,
  type SalesSurfaceStanding,
  type SalesTranslation
} from "@/modules/sales/sales-workbench";

/*
 * The connected Sales workbench (impl.sales.nivo-fe.opportunity-workbench-view).
 *
 * THE SCOPE IS RESOLVED, NEVER INVENTED. Every operation address carries a workspace, an instance
 * and an installation. The operate route discloses the workspace and the installation, and the
 * instance comes from the owner-safe workspace control-center read. Until both are known no operation
 * is addressed at all: each read and each command is held by its own `enabled` gate, so a surface can
 * show a standing without a request ever leaving with a half-filled address.
 *
 * NO PRESS CLAIMS AN EFFECT BY ITSELF. A press carries the stable identity that press minted, and the
 * success a surface shows is read out of the readback of the same Sales object - never out of the
 * press. A refused press is reported as refused; an unattested outcome is reported as unknown and is
 * reconciled by reading the same identity, never by sending it again.
 *
 * THE PIPELINE ADDRESS IS A FINGERPRINT OF THE SCOPE. `sales.pipeline@1` names its own selection
 * fingerprint, and this surface derives it from the resolved coordinates, so a re-read of one scope
 * is one cache entry rather than a new page identity each render.
 *
 * A RECOVERY DOOR IS THE READ'S, NOT THE OPERATOR'S. Retry and stop are enabled only from the
 * no-start proof and the writer fence the action read itself disclosed.
 */

/*
 * A press identity that is unique without inventing randomness: the platform's own UUID when the
 * runtime has one, otherwise a monotonic fallback - an identity only has to be distinct, and a
 * counter is distinct within this module's life.
 */
let pressSequence = 0;
const requestId = (): string => {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid !== undefined) return uuid;
  pressSequence += 1;
  return `request-${Date.now()}-${pressSequence}`;
};
const PAGE_SIZE = 20;

/** The receiver's own state spelling inside one settled payload. */
type CommandPayloadState = { readonly state?: string; readonly status?: string; readonly revision?: number; readonly opportunityId?: string; readonly actionId?: string };
const payloadValue = (answer: SalesCommandAnswer): CommandPayloadState | undefined => answer.ok ? answer.data as CommandPayloadState : undefined;

/** One read's served value, or null when it has not answered with one. */
const answered = <TValue>(answer: SalesAnswerStanding | undefined): TValue | null => answer?.ok === true ? (answer.data as TValue) : null;

/** One route parameter as a usable string. */
const stringOr = (value: unknown, fallback: string): string => typeof value === "string" ? value : fallback;

/** The resolved installation address, or null while the instance coordinate is not known. */
const scopeOf = (workspaceId: string, instanceId: string, installationId: string): SalesInstallationScope | null => workspaceId.length > 0 && instanceId.length > 0 ? { workspaceId, instanceId, installationId } : null;

/** The pipeline's fingerprint of one resolved scope; no scope means no page to address. */
const scopeFingerprintOf = (scope: SalesInstallationScope | null): string => scope === null ? "" : `${scope.workspaceId}~${scope.instanceId}~${scope.installationId}`;

/** The pipeline page a surface opens on, or advances to. */
const pipelinePageOf = (scopeFingerprint: string, cursor: string | null): SalesPipelineRequest => ({ scopeFingerprint, statusFilter: null, after: cursor === null ? null : { lastOpportunityId: cursor }, limit: PAGE_SIZE });

/** Whether one named selector may be addressed at all. */
const named = (ready: boolean, identity: string): boolean => ready && identity.length > 0;

/** One integer control as a usable revision, or null while it holds none. */
const integerOrNull = (value: string): number | null => Number.isSafeInteger(Number(value)) ? Number(value) : null;

/** Whether one command press carries everything its registered input requires. */
const commandPressable = (ready: boolean, commandId: string, revision: number | null, fingerprint: string): boolean => ready && commandId.length > 0 && revision !== null && fingerprint.length > 0;

/** Whether one clarification carries its pending revision and its one permitted fact. */
const clarifyPressable = (ready: boolean, commandId: string, fact: string, revision: number | null): boolean => ready && commandId.length > 0 && fact.length > 0 && revision !== null;

/** Whether one closure carries the intent, the opportunity and the revision it is guarded at. */
const closePressable = (ready: boolean, intentId: string, opportunityId: string, revision: number | null): boolean => ready && intentId.length > 0 && opportunityId.length > 0 && revision !== null;

/** One recovery press, as the read and the controls settled it. */
type RecoveryPress = {
  readonly ready: boolean;
  readonly actionId: string;
  readonly attempt: number | null;
  readonly revision: number | null;
  readonly door: "retry" | "stop" | "hold";
  readonly proof: string | null;
  readonly fence: unknown;
  readonly receiverIntentId: string;
  readonly receiverAttemptId: string;
  readonly fingerprint: string;
};

/** Whether one recovery press may leave: only the read's own no-start proof and fence open a door. */
const recoveryPressable = (press: RecoveryPress): boolean =>
  press.ready && press.actionId.length > 0 && press.attempt !== null && press.revision !== null && press.door === "retry"
  && press.proof !== null && press.fence !== null && press.receiverIntentId.length > 0 && press.receiverAttemptId.length > 0 && press.fingerprint.length > 0;

/** The permitted fact one clarification names. */
const permittedFactOf = (kind: "customerRef" | "opportunityId", value: string): SalesClarificationFact => kind === "opportunityId" ? { opportunityId: value } : { customerRef: value };

/** The confirmed order a closure claims, or none at all. */
const confirmedOrderOf = (orderId: string): SalesCloseRequest["confirmedOrder"] => orderId.length === 0 ? null : { orderId };

/** The fact one command band shows before and after an address exists. */
const bandStandingOf = (ready: boolean, scopeStanding: SalesSurfaceStanding): SalesSurfaceStanding => ready ? "ready" : scopeStanding;

/** The attention rows of one pipeline page: only the rows whose work state is not ready need handling. */
const attentionRowsOf = (model: SalesPipelineValue | null): ReadonlyArray<SalesPipelineItem> => model === null ? [] : model.items.filter(item => item.workState !== "ready");

/** Whether one read is still being re-read. */
const loadingOf = (isLoading: boolean, isValidating: boolean): boolean => isLoading || isValidating;

/** What the installation line shows before an address exists: a held read, a refusal, or a true standing. */
const scopeStandingFor = (answer: SalesAnswerStanding | undefined, error: unknown, hasInstance: boolean): SalesSurfaceStanding => {
  if (answer === undefined && error === undefined) return "loading";
  if (error !== undefined) return "unavailable";
  const standing = salesSurfaceStanding(answer, hasInstance);
  return standing === "empty" ? "unavailable" : standing;
};

/** One exact input's stable request identity, kept until that input is delivered. */
type Intent = { readonly fingerprint: string; readonly token: string };

/** Own Sales form state, the resolved installation scope, idempotent intents and readback-settled feedback. */
export const useSalesWorkbench = (moduleId: string, locale: string, t: SalesTranslation) => {
  const params = useParams<{ readonly workspaceId?: string; readonly installationId?: string }>() as { readonly workspaceId?: string; readonly installationId?: string } | null;
  const routeWorkspaceId = stringOr(params?.workspaceId, "");
  const routeInstallationId = stringOr(params?.installationId, moduleId);
  const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(routeWorkspaceId, routeWorkspaceId.length > 0);
  const instanceId = nivoQueryData(controlCenter.data)?.instance?.id ?? "";
  const scope = scopeOf(routeWorkspaceId, instanceId, routeInstallationId);
  const scopeStanding = scopeStandingFor(controlCenter.data, controlCenter.error, instanceId.length > 0);
  const addressable = scope ?? { workspaceId: "", instanceId: "", installationId: routeInstallationId };
  const ready = scope !== null;
  const scopeFingerprint = scopeFingerprintOf(scope);

  const [notice, setNotice] = useState<SalesNotice | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [opportunityId, setOpportunityId] = useState("");
  const [commandId, setCommandId] = useState("");
  const [commandRevision, setCommandRevision] = useState("1");
  const [customerRefs, setCustomerRefs] = useState("");
  const [opportunityIds, setOpportunityIds] = useState("");
  const [offerRefs, setOfferRefs] = useState("");
  const [requestedActions, setRequestedActions] = useState("");
  const [commandFingerprint, setCommandFingerprint] = useState("");
  const [expectedRevisions, setExpectedRevisions] = useState("");
  const [clarificationRevision, setClarificationRevision] = useState("1");
  const [factKind, setFactKind] = useState<"customerRef" | "opportunityId">("opportunityId");
  const [factValue, setFactValue] = useState("");
  const [actionId, setActionId] = useState("");
  const [attemptGeneration, setAttemptGeneration] = useState("1");
  const [actionRevision, setActionRevision] = useState("1");
  const [receiverIntentId, setReceiverIntentId] = useState("");
  const [receiverAttemptId, setReceiverAttemptId] = useState("");
  const [recoveryFingerprint, setRecoveryFingerprint] = useState("");
  const [closeIntentId, setCloseIntentId] = useState("");
  const [closeOutcome, setCloseOutcome] = useState<SalesCloseRequest["outcome"]>("won");
  const [closeEvidenceRefs, setCloseEvidenceRefs] = useState("");
  const [closeOrderId, setCloseOrderId] = useState("");
  const [closeRevision, setCloseRevision] = useState("1");
  const [policyRevision, setPolicyRevision] = useState("");
  const [policyCadence, setPolicyCadence] = useState("");
  const intents = useRef<Record<string, Intent>>({});

  const pipelineInput = pipelinePageOf(scopeFingerprint, cursor);
  const pipeline = useQuerySalesPipelineSwr(addressable, pipelineInput, ready);
  const readiness = useQuerySalesReadinessSwr(addressable, { salesInstallationId: routeInstallationId }, ready);
  const policy = useQuerySalesPolicySwr(addressable, { salesInstallationId: routeInstallationId, requestId: null }, ready);
  const opportunity = useQuerySalesOpportunitySwr(addressable, { opportunityId }, named(ready, opportunityId));
  const command = useQuerySalesCommandSwr(addressable, { commandId }, named(ready, commandId));
  const action = useQuerySalesActionSwr(addressable, { actionId }, named(ready, actionId));

  const configurePolicy = useMutateSalesConfigurePolicySwr(addressable, ready);
  const submitCommand = useMutateSalesSubmitCommandSwr(addressable, ready);
  const clarifyCommand = useMutateSalesClarifyCommandSwr(addressable, ready);
  const closeOpportunity = useMutateSalesCloseSwr(addressable, ready);
  const recoverAction = useMutateSalesRecoverActionSwr(addressable, ready);

  const pipelineModel = answered<SalesPipelineValue>(pipeline.data);
  const readinessModel = answered<SalesReadinessValue>(readiness.data);
  const policyModel = answered<SalesPolicyValue>(policy.data);
  const opportunityModel = answered<SalesOpportunityValue>(opportunity.data);
  const commandModel = answered<SalesCommandValue>(command.data);
  const actionModel = answered<SalesActionValue>(action.data);

  const intentFor = (key: string, value: unknown): string => {
    const valueFingerprint = JSON.stringify(value);
    const prior = intents.current[key];
    if (prior?.fingerprint === valueFingerprint) return prior.token;
    const token = requestId();
    intents.current[key] = { fingerprint: valueFingerprint, token };
    return token;
  };
  const settle = async (key: string, press: () => Promise<SalesCommandAnswer>, readback: (() => Promise<SalesCommandAnswer>) | null, describe: (answer: SalesCommandAnswer) => string | null): Promise<void> => {
    setNotice(null);
    try {
      const answer = await press();
      if (!answer.ok && answer.code !== "outcome_unknown" && answer.code !== "DEADLINE_EXCEEDED") {
        setNotice({ kind: "refused", message: t(salesRefusalKey(answer.code ?? ""), { reason: answer.reason ?? "" }) });
        return;
      }
      const settled = readback === null ? answer : await readback();
      const confirmed = settled.ok ? describe(settled) : null;
      if (confirmed === null) { setNotice({ kind: "refused", message: t("refusal.unsettled") }); return; }
      delete intents.current[key];
      setNotice({ kind: "success", message: confirmed });
    } catch {
      setNotice({ kind: "refused", message: t("refusal.unreachable") });
    }
  };

  const commandActions = salesRequestedActions(requestedActions);
  const commandInput = {
    commandId,
    commandRevision: Number(commandRevision),
    scope: { customerRefs: salesIdentityList(customerRefs), opportunityIds: salesIdentityList(opportunityIds), offerRefs: salesIdentityList(offerRefs) },
    requestedActions: commandActions,
    fingerprint: commandFingerprint,
    expectedOpportunityRevisions: salesExpectedRevisions(expectedRevisions)
  };
  const commandAddressable = commandPressable(ready, commandId, integerOrNull(commandRevision), commandFingerprint);
  const permittedFact = permittedFactOf(factKind, factValue);
  const clarifyInput = { commandId, clarificationRevision: Number(clarificationRevision), permittedFact };
  const clarifyAddressable = clarifyPressable(ready, commandId, factValue, integerOrNull(clarificationRevision));
  const recoveryDoor = salesRecoveryDoor(actionModel);
  const attestedProof = salesNoStartProof(actionModel);
  const attestedFence = salesWriterFence(actionModel);
  const recoveryAddressable = recoveryPressable({ ready, actionId, attempt: integerOrNull(attemptGeneration), revision: integerOrNull(actionRevision), door: recoveryDoor, proof: attestedProof, fence: attestedFence, receiverIntentId, receiverAttemptId, fingerprint: recoveryFingerprint });
  const closeInput = {
    intentId: closeIntentId,
    opportunityId,
    outcome: closeOutcome,
    evidenceRefs: salesIdentityList(closeEvidenceRefs),
    confirmedOrder: confirmedOrderOf(closeOrderId),
    expectedRevision: Number(closeRevision)
  };
  const closeAddressable = closePressable(ready, closeIntentId, opportunityId, integerOrNull(closeRevision));

  const planSettled = (answer: SalesCommandAnswer): string | null => {
    const state = payloadValue(answer);
    const status = state?.status ?? state?.state;
    return status === undefined ? null : t("command.settled", { status: salesWording(salesCommandStatusKey(status), status, t) });
  };
  const closeSettled = (answer: SalesCommandAnswer): string | null => {
    const state = payloadValue(answer);
    const status = state?.status;
    return state?.opportunityId === undefined || status === undefined ? null : t("closure.settled", { opportunity: state.opportunityId, status: salesWording(salesLifecycleKey(status), status, t) });
  };
  const actionSettled = (answer: SalesCommandAnswer): string | null => {
    const state = payloadValue(answer);
    const status = state?.status;
    return state?.actionId === undefined || status === undefined ? null : t("recovery.settled", { action: state.actionId, status: salesWording(salesActionStatusKey(status), status, t) });
  };
  const policySettled = (answer: SalesCommandAnswer): string | null => {
    const state = payloadValue(answer);
    return state?.revision === undefined ? null : t("policy.settled", { revision: state.revision });
  };

  const onSubmitCommand = () => {
    if (!commandAddressable) return;
    void settle(`command-${commandId}`, () => submitCommand.trigger({ requestId: intentFor(`command-${commandId}`, commandInput), input: commandInput }) as Promise<SalesCommandAnswer>, () => command.mutate() as Promise<SalesCommandAnswer>, planSettled);
  };
  const onClarify = () => {
    if (!clarifyAddressable) return;
    void settle(`clarify-${commandId}`, () => clarifyCommand.trigger({ requestId: intentFor(`clarify-${commandId}`, clarifyInput), input: clarifyInput }) as Promise<SalesCommandAnswer>, () => command.mutate() as Promise<SalesCommandAnswer>, planSettled);
  };
  const onClose = () => {
    if (!closeAddressable) return;
    void settle(`close-${closeIntentId}`, () => closeOpportunity.trigger({ requestId: intentFor(`close-${closeIntentId}`, closeInput), input: closeInput }) as Promise<SalesCommandAnswer>, () => opportunity.mutate() as Promise<SalesCommandAnswer>, closeSettled);
  };
  const onRecover = (operation: "retryNoStart" | "cancelNoStart") => {
    if (!recoveryAddressable || attestedProof === null || attestedFence === null) return;
    const value = operation === "retryNoStart"
      ? { operation, actionId, attemptGeneration: Number(attemptGeneration), receiverIntentId, receiverAttemptId, receiverNoStartProofRef: attestedProof, oldWriterFence: attestedFence, fingerprint: recoveryFingerprint, expectedRevision: Number(actionRevision) }
      : { operation, actionId, attemptGeneration: Number(attemptGeneration), noStartProof: { proofRef: attestedProof }, oldWriterFence: attestedFence, expectedRevision: Number(actionRevision) };
    void settle(`${operation}-${actionId}`, () => recoverAction.trigger({ requestId: intentFor(`${operation}-${actionId}`, value), input: value }) as Promise<SalesCommandAnswer>, () => action.mutate() as Promise<SalesCommandAnswer>, actionSettled);
  };
  const onConfigurePolicy = () => {
    if (!ready) return;
    const expected = policyRevision.length > 0 ? Number(policyRevision) : policyModel?.revision ?? null;
    const value = {
      requestId: intentFor("policy", { expected, cadence: policyCadence }),
      salesInstallationId: routeInstallationId,
      expectedPolicyRevision: expected,
      values: { routineCadence: policyCadence.length > 0 ? { cadence: policyCadence } : null, responseTarget: null, contactPolicy: null, catalogueReference: null, capacityLimits: null }
    };
    void settle("policy", () => configurePolicy.trigger({ requestId: value.requestId, input: value }) as Promise<SalesCommandAnswer>, () => policy.mutate() as Promise<SalesCommandAnswer>, policySettled);
  };

  /*
   * One region's standing. Before an address exists the scope's own answer decides what the surface
   * shows; after it, the read's answer does - and a held read is still 'loading', never empty.
   */
  const regionStanding = (answer: SalesAnswerStanding | undefined, hasContent: boolean): SalesSurfaceStanding => ready ? salesSurfaceStanding(answer, hasContent) : scopeStanding;
  const bandStanding = bandStandingOf(ready, scopeStanding);
  const attentionRows = attentionRowsOf(pipelineModel);
  return {
    t, locale,
    scopeStanding, scopeReady: ready, scopeInstallation: routeInstallationId,
    notice,
    attention: {
      standing: regionStanding(pipeline.data, attentionRows.length > 0),
      rows: attentionRows, total: pipelineModel?.items.length ?? 0,
      observedAt: pipelineModel?.observedAt ?? null, nextAfter: pipelineModel?.nextAfter?.lastOpportunityId ?? null,
      isLoading: loadingOf(pipeline.isLoading, pipeline.isValidating),
      retry: () => void pipeline.mutate(),
      loadMore: () => setCursor(pipelineModel?.nextAfter?.lastOpportunityId ?? null)
    },
    command: {
      standing: bandStanding,
      commandId, setCommandId, commandRevision, setCommandRevision,
      customerRefs, setCustomerRefs, opportunityIds, setOpportunityIds, offerRefs, setOfferRefs,
      requestedActions, setRequestedActions, actions: commandActions,
      fingerprint: commandFingerprint, setFingerprint: setCommandFingerprint, expectedRevisions, setExpectedRevisions,
      isSubmitting: submitCommand.isMutating, addressable: commandAddressable, onSubmit: onSubmitCommand
    },
    history: {
      standing: regionStanding(command.data, commandModel !== null),
      commandId, setCommandId, model: commandModel, isLoading: command.isLoading, retry: () => void command.mutate()
    },
    routine: {
      standing: regionStanding(action.data, actionModel !== null),
      actionId: salesActionIdentityOf(commandModel?.actionIds ?? [], actionId), setActionId,
      actionIds: commandModel?.actionIds ?? [],
      attemptGeneration, setAttemptGeneration, revision: actionRevision, setRevision: setActionRevision,
      receiverIntentId, setReceiverIntentId, receiverAttemptId, setReceiverAttemptId, fingerprint: recoveryFingerprint, setFingerprint: setRecoveryFingerprint,
      model: actionModel, door: recoveryDoor, attestedProof, attestedFence, addressable: recoveryAddressable,
      isLoading: action.isLoading, isRecovering: recoverAction.isMutating,
      reload: () => void action.mutate(), onRetry: () => onRecover("retryNoStart"), onStop: () => onRecover("cancelNoStart")
    },
    wait: {
      standing: regionStanding(opportunity.data, opportunityModel !== null),
      opportunityId, setOpportunityId, model: opportunityModel, isLoading: opportunity.isLoading, reload: () => void opportunity.mutate()
    },
    ambiguity: {
      standing: regionStanding(command.data, commandModel !== null && commandModel.clarification !== null),
      clarification: commandModel?.clarification ?? null,
      revision: clarificationRevision, setRevision: setClarificationRevision,
      factKind, setFactKind, factValue, setFactValue,
      isClarifying: clarifyCommand.isMutating, addressable: clarifyAddressable, onClarify
    },
    closure: {
      standing: regionStanding(opportunity.data, opportunityModel !== null),
      intentId: closeIntentId, setIntentId: setCloseIntentId, outcome: closeOutcome, setOutcome: setCloseOutcome,
      evidenceRefs: closeEvidenceRefs, setEvidenceRefs: setCloseEvidenceRefs, orderId: closeOrderId, setOrderId: setCloseOrderId, revision: closeRevision, setRevision: setCloseRevision,
      model: opportunityModel, isClosing: closeOpportunity.isMutating, addressable: closeAddressable, onClose
    },
    installation: {
      standing: regionStanding(readiness.data, readinessModel !== null),
      model: readinessModel, isLoading: readiness.isLoading, reload: () => void readiness.mutate()
    },
    policy: {
      standing: regionStanding(policy.data, policyModel !== null),
      model: policyModel, revision: policyRevision, setRevision: setPolicyRevision, cadence: policyCadence, setCadence: setPolicyCadence,
      isConfiguring: configurePolicy.isMutating, onConfigure: onConfigurePolicy
    }
  };
};