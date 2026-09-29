"use client"

import { useRef, useState } from "react"
import type { SalesHandoffValue, SalesInstallationScope, SalesSubmitHandoffRequest } from "@/modules/api/sales"
import { nivoQueryPayload } from "@/modules/query"
import { useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks/swr/queries/useQueryMyAgentWorkspaceControlCenterSwr"
import { useQuerySalesHandoffSwr } from "@/hooks/swr/queries/useQuerySalesHandoffSwr"
import { useMutateSalesSubmitHandoffSwr } from "@/hooks/swr/mutations/useMutateSalesSubmitHandoffSwr"
import {
    salesRefusalKey,
    salesSurfaceStanding,
    type SalesAnswerStanding,
    type SalesCommandAnswer,
    type SalesNotice,
    type SalesSurfaceStanding,
    type SalesTranslation,
} from "@/modules/sales/sales-workbench"

/*
 * The connected handoff surface (impl.sales.nivo-fe.handoff-view).
 *
 * THE SCOPE IS RESOLVED, NEVER INVENTED. Every operation address carries a workspace, an instance and
 * an installation. The handoffs route discloses the workspace and the installation, and the instance
 * comes from the owner-safe workspace control-center read. Until both are known no read is addressed
 * at all: the handoff read and the submission press hold their own gates.
 *
 * ONLY A PREPARED HANDOFF LEAVES. The read's own status decides whether the surface offers its one
 * authorized submission command, and it decides what the surface may claim afterwards: an admission
 * is a receipt of intake, a refusal is what Accounting itself said, and a status that admits an
 * attempt may have started leaves only a lookup of this same handoff identity - never a new submit.
 *
 * NO PRESS CLAIMS AN EFFECT BY ITSELF. The outcome the surface shows is read out of `sales.handoff@1`
 * for the same identity, never out of the press.
 */

/*
 * A submission identity that is unique without inventing randomness: the platform's own UUID when the
 * runtime has one, otherwise a monotonic fallback - an identity only has to be distinct, and a counter
 * is distinct within this module's life.
 */
let submissionSequence = 0
const submissionRequestId = (): string => {
    const uuid = globalThis.crypto?.randomUUID?.()
    if (uuid !== undefined) return uuid
    submissionSequence += 1
    return `submission-${Date.now()}-${submissionSequence}`
}

/** The receiver's own state spelling inside one settled payload. */
type HandoffPayloadState = { readonly handoffId?: string; readonly status?: string; readonly revision?: number }

/** The statuses whose attempt may already have started; after them only the same identity is looked up. */
const LOOKUP_ONLY_STATUSES: ReadonlySet<string> = new Set(["possible-start", "outcome-unknown"])

/** One read's served value, or null when it has not answered with one. */
const answered = <TValue>(answer: SalesAnswerStanding | undefined): TValue | null =>
    answer?.ok === true ? (answer.data as TValue) : null

/** One settled payload, or undefined when the readback disclosed none. */
const payloadState = (answer: SalesCommandAnswer): HandoffPayloadState | undefined =>
    answer.ok ? (answer.data as HandoffPayloadState) : undefined

/** The resolved installation address, or null while the instance coordinate is not known. */
const scopeOf = (workspaceId: string, instanceId: string, installationId: string): SalesInstallationScope | null =>
    workspaceId.length > 0 && instanceId.length > 0 ? { workspaceId, instanceId, installationId } : null

/** One integer control as a usable revision, or null while it holds none. */
const integerOrNull = (value: string): number | null => (Number.isSafeInteger(Number(value)) ? Number(value) : null)

/** Whether one named selector may be addressed at all. */
const named = (ready: boolean, identity: string): boolean => ready && identity.length > 0

/** Whether one submission press carries the content it claims and the revision it is guarded at. */
const submissionPressable = (
    ready: boolean,
    prepared: boolean,
    lookupOnly: boolean,
    fingerprint: string,
    revision: number | null,
): boolean => ready && prepared && !lookupOnly && fingerprint.length > 0 && revision !== null

/** Whether one disclosed status leaves only a lookup of the same identity open. */
const lookupOnlyOf = (status: string): boolean => LOOKUP_ONLY_STATUSES.has(status)

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

/** One exact submission's stable request identity, kept until that submission is delivered. */
type Intent = { readonly fingerprint: string; readonly token: string }

/** Own submission form state, the resolved installation scope, one idempotent submission and its readback-settled notice. */
export const useSalesHandoff = (workspaceId: string, installationId: string, t: SalesTranslation) => {
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId, workspaceId.length > 0)
    const instanceId = nivoQueryPayload(controlCenter.data)?.instance?.id ?? ""
    const scope = scopeOf(workspaceId, instanceId, installationId)
    const scopeStanding = scopeStandingFor(controlCenter.data, controlCenter.error, instanceId.length > 0)
    const addressable = scope ?? { workspaceId: "", instanceId: "", installationId }
    const ready = scope !== null

    const [notice, setNotice] = useState<SalesNotice | null>(null)
    const [handoffId, setHandoffId] = useState("")
    const [fingerprint, setFingerprint] = useState("")
    const [expectedRevision, setExpectedRevision] = useState("")
    const intents = useRef<Record<string, Intent>>({})

    const handoff = useQuerySalesHandoffSwr(addressable, { handoffId }, named(ready, handoffId))
    const submitHandoff = useMutateSalesSubmitHandoffSwr(addressable, ready)
    const model = answered<SalesHandoffValue>(handoff.data)

    const status = model?.status ?? ""
    const mayLookupOnly = model !== null && lookupOnlyOf(model.status)
    const revision = integerOrNull(expectedRevision)
    const submissionAddressable = submissionPressable(
        ready,
        status === "prepared",
        mayLookupOnly,
        fingerprint,
        revision,
    )

    const intentFor = (key: string, value: unknown): string => {
        const valueFingerprint = JSON.stringify(value)
        const prior = intents.current[key]
        if (prior?.fingerprint === valueFingerprint) return prior.token
        const token = submissionRequestId()
        intents.current[key] = { fingerprint: valueFingerprint, token }
        return token
    }

    /** Submit the prepared handoff once, then let the readback of the same handoff decide what may be claimed. */
    const onSubmit = () => {
        if (!submissionAddressable || model === null || revision === null) return
        const input: SalesSubmitHandoffRequest = {
            handoffId: model.handoffId,
            confirmedOrderRevision: model.orderRevision,
            fingerprint,
            expectedHandoffRevision: revision,
        }
        void (async () => {
            setNotice(null)
            try {
                const answer = (await submitHandoff.trigger({
                    requestId: intentFor("submission", input),
                    input,
                })) as SalesCommandAnswer
                if (!answer.ok && answer.code !== "outcome_unknown" && answer.code !== "DEADLINE_EXCEEDED") {
                    setNotice({
                        kind: "refused",
                        message: t(salesRefusalKey(answer.code ?? ""), { reason: answer.reason ?? "" }),
                    })
                    return
                }
                const settled = (await handoff.mutate()) as SalesCommandAnswer
                const settledStatus = payloadState(settled)?.status
                if (settledStatus === undefined || settledStatus === "prepared") {
                    setNotice({ kind: "refused", message: t("refusal.unsettled") })
                    return
                }
                delete intents.current["submission"]
                setNotice({ kind: "success", message: t("submission.settled", { status: settledStatus }) })
            } catch {
                setNotice({ kind: "refused", message: t("refusal.unreachable") })
            }
        })()
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
        notice,
        handoff: {
            standing: regionStanding(handoff.data, model !== null),
            model,
            handoffId,
            setHandoffId,
            isLoading: loadingOf(handoff.isLoading, handoff.isValidating),
            reload: () => void handoff.mutate(),
        },
        submission: {
            standing: regionStanding(handoff.data, model !== null),
            fingerprint,
            setFingerprint,
            expectedRevision,
            setExpectedRevision,
            isSubmitting: submitHandoff.isMutating,
            addressable: submissionAddressable,
            lookupOnly: mayLookupOnly,
            onSubmit,
        },
    }
}
