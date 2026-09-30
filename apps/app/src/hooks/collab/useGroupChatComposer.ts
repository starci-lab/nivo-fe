
import { useState } from "react"
import {
    useAccessToken,
    useCollabOfficeTransport,
    useMutateCollabPostMessageSwr,
} from "@/hooks"
import { parseAddressedModule } from "../../modules/collab/group-chat/model"
import type { GroupChatPageView } from "../../modules/collab/group-chat/types"
import { newIntentId } from "./collab.shared"
import type { GroupChatAnswering } from "./useGroupChatTasks"

/** The composer inputs owned elsewhere: the workspace the send runs on and the open question. */
export type GroupChatComposerScope = {
    readonly workspaceId: string | null
    readonly answering: GroupChatAnswering
    readonly clearAnswering: () => void
}

/**
 * Own the Office composer: the draft, the send and the same-intent
 * reconciliation a retry consults first.
 *
 * THE INTENT IDENTITY IS STATE, NOT A REF. The first intent allocates lazily in
 * the initializer and each committed send allocates the next inside the event
 * handler, so no render ever calls `crypto.randomUUID` or `Date.now` for it and
 * no render reads a ref (`react-hooks/refs`). A lost answer keeps the intent a
 * retry must reconcile (`contract.collab.chat`).
 */
export const useGroupChatComposer = (scope: GroupChatComposerScope) => {
    const { workspaceId, answering, clearAnswering } = scope
    const accessToken = useAccessToken()

    /*
     * The Collab refusal language follows the page locale; the transport seam binds
     * the reader here the same way session.tsx binds the shared transport's.
     */
    const { reconcileRequest } = useCollabOfficeTransport()
    const postMessage = useMutateCollabPostMessageSwr(workspaceId)

    const [composerValue, setComposerValue] = useState("")
    const [sendFailure, setSendFailure] = useState<"retry" | "denied" | null>(null)
    const [intentId, setIntentId] = useState(newIntentId)

    const sendMessage = async (): Promise<void> => {
        if (composerValue.trim().length === 0 || workspaceId === null) {
            return
        }
        const moduleName = parseAddressedModule(composerValue)
        setSendFailure(null)
        // The mutation layer's revalidation wrapper types its answer as
        // Outcome<unknown>; the wire value is still the op's own outcome.
        const answer = await postMessage.trigger({
            intentId,
            body: composerValue,
            ...(moduleName !== null ? { moduleName } : {}),
            ...(answering !== null ? { answersQuestionId: answering.questionId } : {}),
        })
        if (answer.ok) {
            setComposerValue("")
            clearAnswering()
            setIntentId(newIntentId())
            return
        }
        setSendFailure(answer.retryable ? "retry" : "denied")
    }

    /*
     * A retry of a lost answer reconciles the SAME intent first: a matched intent
     * proves the message committed and is never resent (`contract.collab.chat`).
     */
    const retrySend = async (): Promise<void> => {
        if (workspaceId === null || accessToken === null) {
            return
        }
        const reconciliation = await reconcileRequest({
            workspaceId,
            accessToken,
            intentId,
        })
        if (reconciliation.ok && reconciliation.data.outcome === "matched") {
            setComposerValue("")
            clearAnswering()
            setSendFailure(null)
            setIntentId(newIntentId())
            return
        }
        await sendMessage()
    }

    const composer: GroupChatPageView["composer"] = {
        value: composerValue,
        pending: postMessage.isMutating,
        failure: sendFailure,
        answering,
    }

    return {
        composer,
        changeComposer: setComposerValue,
        sendMessage,
        retrySend,
    }
}
