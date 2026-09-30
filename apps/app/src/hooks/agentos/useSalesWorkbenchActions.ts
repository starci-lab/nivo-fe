import type { useSalesWorkbenchContext } from "./useSalesWorkbenchContext"
import { useSalesWorkbenchFeedback } from "./useSalesWorkbenchFeedback"
/** Own Sales command handlers and their readback-settled feedback. */
export const useSalesWorkbenchActions = (context: ReturnType<typeof useSalesWorkbenchContext>) => {
    const {
        action,
        actionId,
        actionRevision,
        attemptGeneration,
        attestedFence,
        attestedProof,
        clarifyAddressable,
        clarifyCommand,
        clarifyInput,
        closeAddressable,
        closeInput,
        closeIntentId,
        closeOpportunity,
        command,
        commandAddressable,
        commandId,
        commandInput,
        configurePolicy,
        opportunity,
        policy,
        policyCadence,
        policyModel,
        policyRevision,
        ready,
        receiverAttemptId,
        receiverIntentId,
        recoverAction,
        recoveryAddressable,
        recoveryFingerprint,
        routeInstallationId,
        submitCommand,
    } = context
    const { actionSettled, closeSettled, describe, planSettled, policySettled, workbenchCommand } =
        useSalesWorkbenchFeedback(context)
    const onSubmitCommand = () => {
        if (!commandAddressable) return
        const key = `command-${commandId}`
        void workbenchCommand.settle({
            key,
            value: commandInput,
            press: (requestId) => submitCommand.trigger({ requestId, input: commandInput }),
            readback: () => command.mutate(),
            describe: (answer) => describe(answer, planSettled),
        })
    }
    const onClarify = () => {
        if (!clarifyAddressable) return
        const key = `clarify-${commandId}`
        void workbenchCommand.settle({
            key,
            value: clarifyInput,
            press: (requestId) => clarifyCommand.trigger({ requestId, input: clarifyInput }),
            readback: () => command.mutate(),
            describe: (answer) => describe(answer, planSettled),
        })
    }
    const onClose = () => {
        if (!closeAddressable) return
        const key = `close-${closeIntentId}`
        void workbenchCommand.settle({
            key,
            value: closeInput,
            press: (requestId) => closeOpportunity.trigger({ requestId, input: closeInput }),
            readback: () => opportunity.mutate(),
            describe: (answer) => describe(answer, closeSettled),
        })
    }
    const onRecover = (operation: "retryNoStart" | "cancelNoStart") => {
        if (!recoveryAddressable || attestedProof === null || attestedFence === null) return
        const value =
            operation === "retryNoStart"
                ? {
                      operation,
                      actionId,
                      attemptGeneration: Number(attemptGeneration),
                      receiverIntentId,
                      receiverAttemptId,
                      receiverNoStartProofRef: attestedProof,
                      oldWriterFence: attestedFence,
                      fingerprint: recoveryFingerprint,
                      expectedRevision: Number(actionRevision),
                  }
                : {
                      operation,
                      actionId,
                      attemptGeneration: Number(attemptGeneration),
                      noStartProof: { proofRef: attestedProof },
                      oldWriterFence: attestedFence,
                      expectedRevision: Number(actionRevision),
                  }
        const key = `${operation}-${actionId}`
        void workbenchCommand.settle({
            key,
            value,
            press: (requestId) => recoverAction.trigger({ requestId, input: value }),
            readback: () => action.mutate(),
            describe: (answer) => describe(answer, actionSettled),
        })
    }
    const onConfigurePolicy = () => {
        if (!ready) return
        const expected = policyRevision.length > 0 ? Number(policyRevision) : (policyModel?.revision ?? null)
        const value = {
            salesInstallationId: routeInstallationId,
            expectedPolicyRevision: expected,
            values: {
                routineCadence: policyCadence.length > 0 ? { cadence: policyCadence } : null,
                responseTarget: null,
                contactPolicy: null,
                catalogueReference: null,
                capacityLimits: null,
            },
        }
        void workbenchCommand.settle({
            key: "policy",
            value: { expected, cadence: policyCadence },
            press: (requestId) => configurePolicy.trigger({ requestId, input: { ...value, requestId } }),
            readback: () => policy.mutate(),
            describe: (answer) => describe(answer, policySettled),
        })
    }

    return { workbenchCommand, onClarify, onClose, onConfigurePolicy, onRecover, onSubmitCommand }
}
