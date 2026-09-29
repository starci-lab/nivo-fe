import type { CollabHumanRole } from "./calls"

/** Public identity and label for the workspace's Office group. */
export type CollabGroupView = {
    readonly groupId: string
    readonly workspaceId: string
    readonly name: string
    readonly isDefaultOffice: boolean
}

/** One participant row of the current Office roster; never carries an email, phone or principal. */
export type CollabOfficeParticipant = {
    /** Durable identity of the member row - the identity a task's asker and assignee reference. */
    readonly memberId: string
    readonly kind: "human" | "module"
    readonly displayName: string
    readonly role: string
    readonly status: string
    /**
     * The hired module's installation identity on a module entry - the same identity a
     * task's owning module reference and a Tasks module filter use (`contract.collab.chat`
     * rev 5, `contract.collab.task-read` rev 3); null on a human entry.
     */
    readonly moduleInstallationId: string | null
}

/**
 * The requesting member's own active membership identity and its one current role
 * (`contract.collab.chat` rev 5, `sds.collab.workspace-chat` rev 2): resolved by
 * `sds.collab.membership-service` for the derived Login principal in the same authorized
 * read, never from request input and never returned to a non-member. A presentation hint
 * for the approved role-gated controls (the invite action only for a current Owner or
 * Manager, active approval buttons only for a current Manager or Owner); every command
 * still rechecks the actor's current authority at commit.
 */
export type CollabOfficeViewer = {
    /** The viewer's own active member identity. */
    readonly memberId: string
    /** The viewer's one current Owner, Manager or Staff role. */
    readonly role: CollabHumanRole
}

/** The Office landing bundle: the one group, its current roster and the requesting viewer. */
export type CollabOfficeView = {
    readonly group: CollabGroupView
    readonly participants: ReadonlyArray<CollabOfficeParticipant>
    /** The requesting member's own member identity and current role. */
    readonly viewer: CollabOfficeViewer
}

/** Public projection of one durable group message. */
export type CollabMessageView = {
    readonly messageId: string
    readonly workspaceId: string
    readonly groupId: string
    readonly authorKind: "human" | "module"
    readonly authorMemberId: string | null
    readonly authorModuleInstallationId: string | null
    readonly body: string
    readonly intentId: string
    readonly addressedModuleInstallationId: string | null
    readonly addressedModuleKey: string | null
    readonly answersQuestionId: string | null
    readonly occurredAt: string
}

/** The receiver-owned receipt projected onto a card; never a Collab-invented status. */
export type CollabReceiptView =
    | { readonly disposition: "reported"; readonly receiptId: string }
    | { readonly disposition: "not-yet-reported" }
    | { readonly disposition: "refused"; readonly reason: string | null }

/** Public projection of one durable command binding. */
export type CollabBindingView = {
    readonly bindingId: string
    readonly workspaceId: string
    readonly groupId: string
    readonly sourceMessageId: string
    readonly intentId: string
    readonly receiverModuleInstallationId: string
    readonly receiverModuleKey: string
    readonly commandName: string
    readonly commandVersion: string
    readonly askerMemberId: string
    readonly routingRuleId: string | null
    readonly status: "recorded" | "pending" | "admitted" | "refused"
    readonly receipt: CollabReceiptView
}

/** One page of the authorized Office conversation. */
export type CollabGroupRead = {
    readonly group: CollabGroupView
    readonly messages: ReadonlyArray<CollabMessageView>
    readonly cards: ReadonlyArray<CollabBindingView>
    readonly nextCursor?: string
}

/** One command the addressed module published for this workspace. */
export type CollabPublishedCommand = {
    readonly name: string
    readonly version: string
}

/** Public projection of one hired module participant row. */
export type CollabModuleParticipant = {
    readonly memberId: string
    readonly workspaceId: string
    readonly displayName: string
    readonly moduleInstallationId: string
    readonly moduleKey: string
    readonly status: string
}

/** Outcome of `availableCommands`; `unresolved` exposes only addressable hired names. */
export type CollabAvailableCommandsOutcome =
    | {
          readonly status: "resolved"
          readonly member: CollabModuleParticipant
          readonly commands: ReadonlyArray<CollabPublishedCommand>
      }
    | {
          readonly status: "unresolved"
          readonly availableModules: ReadonlyArray<string>
      }

/** Why the router answered with a clarification instead of work. */
export type CollabClarificationReason = "unmatched" | "ambiguous" | "unsupported-version" | "no-commands"

/**
 * Outcome of `routeMessage`. Only `admitted`/`existing` carry an admitted binding;
 * `held`/`pending` keep the durable binding reconcilable under the same intent.
 */
export type CollabRouteOutcome =
    | {
          readonly kind: "admitted" | "existing" | "held" | "pending" | "refused"
          readonly message: CollabMessageView
          readonly binding: CollabBindingView
      }
    | {
          readonly kind: "clarified"
          readonly reason: CollabClarificationReason
          readonly message: CollabMessageView
          readonly clarification: CollabMessageView
          readonly commands: ReadonlyArray<CollabPublishedCommand>
      }
    | {
          readonly kind: "unresolved" | "not-addressed"
          readonly message: CollabMessageView
          readonly availableModules?: ReadonlyArray<string>
      }

/** The one state machine a task moves through. */
