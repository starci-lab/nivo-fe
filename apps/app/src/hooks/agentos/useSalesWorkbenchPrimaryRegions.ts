import { type SalesPipelineItem, type SalesPipelineValue } from "@/modules/api/sales"
import {
    salesActionIdentityOf,
    salesSurfaceStanding,
    type SalesAnswerStanding,
    type SalesSurfaceStanding,
} from "@/modules/sales/sales-workbench"
import type { useSalesWorkbenchContext } from "./useSalesWorkbenchContext"
import type { useSalesWorkbenchActions } from "./useSalesWorkbenchActions"
/** The fact one command band shows before and after an address exists. */
const bandStandingOf = (ready: boolean, scopeStanding: SalesSurfaceStanding): SalesSurfaceStanding =>
    ready ? "ready" : scopeStanding

/** The attention rows of one pipeline page: only the rows whose work state is not ready need handling. */
const attentionRowsOf = (model: SalesPipelineValue | null): ReadonlyArray<SalesPipelineItem> =>
    model === null ? [] : model.items.filter((item) => item.workState !== "ready")

/** Whether one read is still being re-read. */
const loadingOf = (isLoading: boolean, isValidating: boolean): boolean => isLoading || isValidating

/** Project the SalesWorkbenchPrimaryRegions responsibility for one workbench. */
export const useSalesWorkbenchPrimaryRegions = (
    context: ReturnType<typeof useSalesWorkbenchContext> & ReturnType<typeof useSalesWorkbenchActions>,
) => {
    const {
        action,
        actionId,
        actionModel,
        actionRevision,
        attemptGeneration,
        attestedFence,
        attestedProof,
        command,
        commandActions,
        commandAddressable,
        commandFingerprint,
        commandId,
        commandModel,
        commandRevision,
        customerRefs,
        expectedRevisions,
        locale,
        offerRefs,
        onRecover,
        onSubmitCommand,
        opportunityIds,
        pipeline,
        pipelineModel,
        ready,
        receiverAttemptId,
        receiverIntentId,
        recoverAction,
        recoveryAddressable,
        recoveryDoor,
        recoveryFingerprint,
        requestedActions,
        routeInstallationId,
        scopeStanding,
        setActionId,
        setActionRevision,
        setAttemptGeneration,
        setCommandFingerprint,
        setCommandId,
        setCommandRevision,
        setCursor,
        setCustomerRefs,
        setExpectedRevisions,
        setOfferRefs,
        setOpportunityIds,
        setReceiverAttemptId,
        setReceiverIntentId,
        setRecoveryFingerprint,
        setRequestedActions,
        submitCommand,
        t,
        workbenchCommand,
    } = context
    const regionStanding = (answer: SalesAnswerStanding | undefined, hasContent: boolean): SalesSurfaceStanding =>
        ready ? salesSurfaceStanding(answer, hasContent) : scopeStanding
    const bandStanding = bandStandingOf(ready, scopeStanding)
    const attentionRows = attentionRowsOf(pipelineModel)
    return {
        t,
        locale,
        scopeStanding,
        scopeReady: ready,
        scopeInstallation: routeInstallationId,
        notice: workbenchCommand.notice,
        attention: {
            standing: regionStanding(pipeline.data, attentionRows.length > 0),
            rows: attentionRows,
            total: pipelineModel?.items.length ?? 0,
            observedAt: pipelineModel?.observedAt ?? null,
            nextAfter: pipelineModel?.nextAfter?.lastOpportunityId ?? null,
            isLoading: loadingOf(pipeline.isLoading, pipeline.isValidating),
            retry: () => void pipeline.mutate(),
            loadMore: () => setCursor(pipelineModel?.nextAfter?.lastOpportunityId ?? null),
        },
        command: {
            standing: bandStanding,
            commandId,
            setCommandId,
            commandRevision,
            setCommandRevision,
            customerRefs,
            setCustomerRefs,
            opportunityIds,
            setOpportunityIds,
            offerRefs,
            setOfferRefs,
            requestedActions,
            setRequestedActions,
            actions: commandActions,
            fingerprint: commandFingerprint,
            setFingerprint: setCommandFingerprint,
            expectedRevisions,
            setExpectedRevisions,
            isSubmitting: submitCommand.isMutating || workbenchCommand.isPending(`command-${commandId}`),
            addressable: commandAddressable,
            onSubmit: onSubmitCommand,
        },
        history: {
            standing: regionStanding(command.data, commandModel !== null),
            commandId,
            setCommandId,
            model: commandModel,
            isLoading: command.isLoading,
            retry: () => void command.mutate(),
        },
        routine: {
            standing: regionStanding(action.data, actionModel !== null),
            actionId: salesActionIdentityOf(commandModel?.actionIds ?? [], actionId),
            setActionId,
            actionIds: commandModel?.actionIds ?? [],
            attemptGeneration,
            setAttemptGeneration,
            revision: actionRevision,
            setRevision: setActionRevision,
            receiverIntentId,
            setReceiverIntentId,
            receiverAttemptId,
            setReceiverAttemptId,
            fingerprint: recoveryFingerprint,
            setFingerprint: setRecoveryFingerprint,
            model: actionModel,
            door: recoveryDoor,
            attestedProof,
            attestedFence,
            addressable: recoveryAddressable,
            isLoading: action.isLoading,
            isRecovering:
                recoverAction.isMutating ||
                workbenchCommand.isPending(`retryNoStart-${actionId}`) ||
                workbenchCommand.isPending(`cancelNoStart-${actionId}`),
            reload: () => void action.mutate(),
            onRetry: () => onRecover("retryNoStart"),
            onStop: () => onRecover("cancelNoStart"),
        },
    }
}
