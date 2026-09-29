"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"
import {
    useMutateEndPrincipalSessionsSwr,
    useQueryCollabOfficeSwr,
    useQueryMyAgentWorkspaceControlCenterSwr,
} from "@/hooks"
import { nivoQueryData } from "@/modules/query"
import {
    AdministratorRevocationDialogBase,
    type AdministratorRevocationMember,
    type AdministratorRevocationStage,
} from "./component"

/** Props for the console's scoped administrator session ending. */
export type AdministratorRevocationDialogProps = {
    readonly isOpen: boolean
    readonly onOpenChange: (isOpen: boolean) => void
}

/** A fresh identity for one logical ending request, so a retry resends this exact value. */
const newRequestId = (): string =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `principal-ending-${Date.now()}-${Math.random().toString(36).slice(2)}`

/**
 * Connected scoped administrator ending: the resolve half of the confirmation above it.
 *
 * THE SCOPE IS THE ROUTE'S WORKSPACE, and only when the route has one. That is the single authority
 * context this surface acts under: no operator context is offered, because no accepted record names
 * an operator signal, and this half resolves only what the dialog is allowed to draw.
 *
 * THE MEMBER COMES FROM THE WORKSPACE'S OWN OFFICE ROSTER. The picker is the current human members
 * of the workspace the route names - the connected roster read the Office surface already makes, so
 * this adds no read of its own - with the viewer's own member row left out, because a member cannot
 * end their own sessions here. Only the display name reaches the dialog: the memberId stays in this
 * half, travels in the request and is never drawn, exactly as the workspace authority - not this
 * browser - resolves which Login principal it belongs to. A roster that has not answered yet is a
 * wait, a roster that answered with a failure is one unavailable sentence, and a roster with nobody
 * left to choose is its own sentence; none of the three is drawn as an empty picker.
 *
 * THE WORKSPACE IS NAMED BY THE READ THE ROUTE ALREADY MAKES. The workspace heading above this
 * dialog is the route layout's own control-center read; this half reads the same projection (the
 * cache entry the layout filled) and draws the workspace's display name. The route's workspaceId
 * never stands in for that name, and no read is invented for it.
 *
 * ONE REQUEST IDENTITY PER LOGICAL REQUEST. It is minted on the first submission, kept while the
 * answer is unknown, and resent unchanged by the retry in the undecided state - so a timeout or a
 * lost response continues the same request instead of starting a second one. A different member is
 * a *different* request, so the identity is dropped when the selection changes; the two settled
 * endings drop it as well, since neither can be continued.
 *
 * AN UNANSWERED AUTHORITY IS NEVER DRAWN AS A REFUSAL. A transport answer that is not a decided kind
 * - a refusal sentence, a malformed body, a request that never arrived - lands on the undecided
 * state, which claims no effect and keeps the identity for its retry.
 *
 * THE CONFIRMATION'S OWN CANCEL IS A STEP BACK, NOT A DISMISSAL, and the record draws it that way: a
 * cancelled confirmation returns to the picker with nothing sent, while a cancelled picker and a
 * dismissed answer close the dialog. Escape and an outside press take the same route at each stage.
 */
export const AdministratorRevocationDialog = (props: AdministratorRevocationDialogProps) => {
    const { isOpen, onOpenChange } = props
    const t = useTranslations("console")
    const { workspaceId } = useParams<{ readonly workspaceId?: string }>()
    const workspace = workspaceId === undefined || workspaceId.length === 0 ? null : workspaceId
    const office = useQueryCollabOfficeSwr(workspace)
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspace ?? "", workspace !== null)
    const officeView = office.data?.ok === true ? office.data.data : null
    const members: ReadonlyArray<AdministratorRevocationMember> =
        officeView === null
            ? []
            : officeView.participants
                  .filter(
                      (participant) =>
                          participant.kind === "human" &&
                          participant.status === "active" &&
                          participant.memberId !== officeView.viewer.memberId,
                  )
                  .map((participant) => ({ memberId: participant.memberId, displayName: participant.displayName }))
    const [selected, setSelected] = useState<AdministratorRevocationMember | null>(null)
    const [stage, setStage] = useState<AdministratorRevocationStage>("ready")
    const requestId = useRef<string | null>(null)
    const ending = useMutateEndPrincipalSessionsSwr()
    const memberName = selected?.displayName ?? ""
    const submit = (): void => {
        if (stage === "pending" || workspace === null || selected === null) {
            return
        }
        const identity = requestId.current ?? newRequestId()
        requestId.current = identity
        setStage("pending")
        /*
         * The chosen member travels as the workspace roster memberId, never as a Login principal: the
         * workspace authority owner resolves the member's principal from this value alone.
         */
        void ending
            .trigger({ requestId: identity, workspaceId: workspace, memberId: selected.memberId })
            .then((answer) => {
                if (answer.ok && answer.data.kind === "scopeApplied") {
                    requestId.current = null
                    setStage("applied")
                    return
                }
                if (answer.ok && answer.data.kind === "refused") {
                    requestId.current = null
                    setStage("refused")
                    return
                }
                setStage("undecided")
            })
    }
    return (
        <AdministratorRevocationDialogBase
            props={{
                title:
                    stage === "ready"
                        ? t("account.administratorEnding.chooseTitle")
                        : t("account.administratorEnding.confirmTitle", {
                              member: memberName,
                          }),
                description: stage === "ready" ? t("account.administratorEnding.chooseDescription") : undefined,
                contextLabel: t("account.administratorEnding.workspaceLabel"),
                context: nivoQueryData(controlCenter.data)?.workspace.name ?? "",
                memberLabel: t("account.administratorEnding.memberLabel"),
                memberPlaceholder: t("account.administratorEnding.memberPlaceholder"),
                members,
                memberId: selected?.memberId ?? null,
                memberNotice:
                    office.data !== undefined && office.data.ok === false
                        ? t("account.administratorEnding.rosterUnavailable")
                        : members.length === 0 && officeView !== null
                          ? t("account.administratorEnding.noMembers")
                          : null,
                isMemberPending: office.data === undefined,
                consequence:
                    stage === "ready"
                        ? t("account.administratorEnding.chooseConsequence")
                        : t("account.administratorEnding.confirmConsequence", {
                              member: memberName,
                          }),
                cancelLabel: t("account.administratorEnding.cancel"),
                continueLabel: t("account.administratorEnding.continue"),
                confirmLabel: t("account.administratorEnding.confirmAll"),
                pendingLabel: t("account.administratorEnding.pending"),
                appliedLabel: t("account.administratorEnding.applied"),
                refusedLabel: t("account.administratorEnding.refused"),
                undecidedLabel: t("account.administratorEnding.undecided"),
                retryLabel: t("account.administratorEnding.retry"),
                stage,
                isOpen,
            }}
            on={{
                memberChange: (next: string | null) => {
                    if (next !== (selected?.memberId ?? null)) {
                        requestId.current = null
                    }
                    setSelected(members.find((member) => member.memberId === next) ?? null)
                },
                confirm: () => {
                    if (stage === "ready") {
                        setStage("confirm")
                        return
                    }
                    submit()
                },
                retry: submit,
                onOpenChange: (next: boolean) => {
                    if (!next) {
                        if (stage === "confirm") {
                            setStage("ready")
                            return
                        }
                        setStage("ready")
                        setSelected(null)
                    }
                    onOpenChange(next)
                },
            }}
        />
    )
}
