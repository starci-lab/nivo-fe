"use client"

import { useRef, useState } from "react"
import type { SalesDecideProposalRequest, SalesDecisionValue, SalesInstallationScope } from "@/modules/api/sales"
import { nivoQueryPayload } from "@/modules/query"
import { useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks/swr/queries/useQueryMyAgentWorkspaceControlCenterSwr"
import { useQuerySalesDecisionRequestSwr } from "@/hooks/swr/queries/useQuerySalesDecisionRequestSwr"
import { useMutateSalesDecideProposalSwr } from "@/hooks/swr/mutations/useMutateSalesDecideProposalSwr"
import {
    salesRefusalKey,
    salesSurfaceStanding,
    type SalesAnswerStanding,
    type SalesSurfaceStanding,
    type SalesTranslation,
} from "@/modules/sales/sales-workbench"
import { parseSalesDecisionValue } from "@/modules/api/sales/payload.guards"
import { useWorkbenchCommand } from "./useWorkbenchCommand"

/*
 * The connected decision surface (impl.sales.nivo-fe.decision-view).
 *
 * THE SCOPE IS RESOLVED, NEVER INVENTED. Every operation address carries a workspace, an instance and
 * an installation. The decisions route discloses the workspace and the installation, and the instance
 * comes from the owner-safe workspace control-center read. Until both are known no read is addressed
 * at all: the request read and the answer press are each held by their own gate, so the surface can
 * show a standing without a request ever leaving with a half-filled address.
 *
 * AN ANSWER IS BOUND TO THE PROPOSAL IT WAS OPENED ON. The answer carries the exact version and
 * fingerprint the read disclosed, and the revision it was opened at. A readback that returns a
 * different proposal is reported as a conflict, and an answer is held outright once the read on
 * screen is no longer the proposal the surface opened - never silently re-pointed at the new one.
 *
 * NO PRESS CLAIMS AN EFFECT BY ITSELF. The success the surface shows is read out of `sales
 * .decisionRequest@1` for the same identity, never out of the press; an unattested outcome is
 * reconciled by reading that identity again, never by answering a second time.
 */

/** The proposal one answer was opened on: what an answer stays bound to. */
type AnswerBasis = { readonly version: number; readonly fingerprint: string }

/** One read's served value, or null when it has not answered with one. */
const answered = <TValue>(
    answer: SalesAnswerStanding | undefined,
    parse: (value: unknown) => TValue | null,
): TValue | null => (answer?.ok === true ? parse(answer.data) : null)

/** One settled payload, or undefined when the readback disclosed none. */
const payloadState = (answer: SalesAnswerStanding | undefined): SalesDecisionValue | undefined =>
    answer?.ok === true ? (parseSalesDecisionValue(answer.data) ?? undefined) : undefined

/** The resolved installation address, or null while the instance coordinate is not known. */
const scopeOf = (workspaceId: string, instanceId: string, installationId: string): SalesInstallationScope | null =>
    workspaceId.length > 0 && instanceId.length > 0 ? { workspaceId, instanceId, installationId } : null

/** One integer control as a usable revision, or null while it holds none. */
const integerOrNull = (value: string): number | null => (Number.isSafeInteger(Number(value)) ? Number(value) : null)

/** Whether one named selector may be addressed at all. */
const named = (ready: boolean, identity: string): boolean => ready && identity.length > 0

/** Whether one answer press carries the proposal it is bound to and the revision it is guarded at. */
const answerPressable = (ready: boolean, pending: boolean, stale: boolean, revision: number | null): boolean =>
    ready && pending && !stale && revision !== null

/** Whether one read is still being re-read. */
const loadingOf = (isLoading: boolean, isValidating: boolean): boolean => isLoading || isValidating

/** What the scope line shows before an address exists: a held read, a refusal, or a true standing. */
const scopeStandingFor = (
    answer: SalesAnswerStanding | undefined,
    error: unknown,
    hasInstance: boolean,
): SalesSurfaceStanding => {
    if (answer === undefined && error === undefined) return "loading"
    if (error !== undefined) return "unavailable"
    const standing = salesSurfaceStanding(answer, hasInstance)
    return standing === "empty" ? "unavailable" : standing
}

/** Own decision form state, the resolved installation scope, one idempotent answer and its readback-settled notice. */
export const useSalesDecision = (workspaceId: string, installationId: string, t: SalesTranslation) => {
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId, workspaceId.length > 0)
    const instanceId = nivoQueryPayload(controlCenter.data)?.instance?.id ?? ""
    const scope = scopeOf(workspaceId, instanceId, installationId)
    const scopeStanding = scopeStandingFor(controlCenter.data, controlCenter.error, instanceId.length > 0)
    const addressable = scope ?? { workspaceId: "", instanceId: "", installationId }
    const ready = scope !== null

    const [decisionRequestId, setDecisionRequestId] = useState("")
    const [choice, setChoice] = useState<SalesDecideProposalRequest["answer"]>("approve")
    const [expectedRevision, setExpectedRevision] = useState("")
    const basis = useRef<AnswerBasis | null>(null)
    const command = useWorkbenchCommand({
        refusal: (code, reason) => t(salesRefusalKey(code), { reason }),
        unsettled: t("refusal.unsettled"),
        unreachable: t("refusal.unreachable"),
        acceptsFailedAnswer: (code) => code === "outcome_unknown" || code === "DEADLINE_EXCEEDED",
    })

    const decision = useQuerySalesDecisionRequestSwr(
        addressable,
        { decisionRequestId },
        named(ready, decisionRequestId),
    )
    const decideProposal = useMutateSalesDecideProposalSwr(addressable, ready)
    const model = answered(decision.data, parseSalesDecisionValue)

    /*
     * Whether the read on screen is still the proposal this surface opened its answer on. A moved
     * proposal is not answered from here: the answer input would carry a version and a fingerprint the
     * read no longer discloses, so the surface states the move and holds the press instead.
     */
    const stale =
        basis.current !== null &&
        model !== null &&
        (basis.current.version !== model.proposalVersion || basis.current.fingerprint !== model.proposalFingerprint)
    const revision = integerOrNull(expectedRevision)
    const pending = model !== null && model.status === "pending"
    const answerAddressable = answerPressable(ready, pending, stale, revision)

    /** Answer the proposal once, then let the readback of the same request decide what the surface may claim. */
    const onAnswer = () => {
        if (!answerAddressable || model === null || revision === null) return
        const claim: AnswerBasis = { version: model.proposalVersion, fingerprint: model.proposalFingerprint }
        basis.current = claim
        const input: SalesDecideProposalRequest = {
            decisionRequestId: model.decisionRequestId,
            proposalVersion: claim.version,
            proposalFingerprint: claim.fingerprint,
            answer: choice,
            expectedDecisionRevision: revision,
        }
        void command.settle({
            key: "answer",
            value: input,
            press: (requestId) => decideProposal.trigger({ requestId, input }),
            readback: () => decision.mutate(),
            describe: (settled) => {
                const state = payloadState(settled)
                if (state?.status === undefined) return null
                if (state.proposalVersion !== claim.version || state.proposalFingerprint !== claim.fingerprint)
                    return { kind: "refused", message: t("refusal.conflict") }
                return { kind: "success", message: t("answer.recorded", { status: state.status }) }
            },
        })
    }

    /*
     * One region's standing. Before an address exists the scope's own answer decides what the surface
     * shows; after it, the read's answer does - and a held read is still 'loading', never empty.
     */
    const regionStanding = (answer: SalesAnswerStanding | undefined, hasContent: boolean): SalesSurfaceStanding =>
        ready ? salesSurfaceStanding(answer, hasContent) : scopeStanding

    return {
        t,
        scopeWorkspace: workspaceId,
        scopeInstallation: installationId,
        scopeReady: ready,
        scopeStanding,
        notice: command.notice,
        proposal: {
            standing: regionStanding(decision.data, model !== null),
            model,
            decisionRequestId,
            setDecisionRequestId,
            isLoading: loadingOf(decision.isLoading, decision.isValidating),
            reload: () => void decision.mutate(),
        },
        answer: {
            standing: regionStanding(decision.data, model !== null),
            choice,
            setChoice,
            expectedRevision,
            setExpectedRevision,
            isAnswering: decideProposal.isMutating || command.isPending("answer"),
            addressable: answerAddressable,
            stale,
            onSubmit: onAnswer,
        },
    }
}
