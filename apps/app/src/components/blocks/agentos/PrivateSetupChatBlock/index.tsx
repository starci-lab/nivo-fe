"use client";

type SetupRevisionValues = { readonly revision: number | "?"; readonly status: string };

/** Settled display labels and typed formatters supplied by the page owner. */
export type PrivateSetupChatBlockCopy = {
  readonly "setup": {
    readonly "actor": {
      readonly "assistant": string;
      readonly "system": string;
      readonly "user": string;
    };
    readonly "emptyDescription": string;
    readonly "emptyTitle": string;
    readonly "messageHint": string;
    readonly "messageLabel": string;
    readonly "messagePlaceholder": string;
    readonly "messageRefused": string;
    readonly "messageUnconfirmed": string;
    readonly "messages": string;
    readonly "openVersions": string;
    readonly "private": string;
    readonly "privateChat": string;
    readonly "revision": (values: SetupRevisionValues) => string;
    readonly "revisionComplete": string;
    readonly "revisionStatus": {
      readonly "completed": string;
      readonly "open": string;
      readonly "ready": string;
      readonly "superseded": string;
      readonly "unavailable": string;
    };
    readonly "send": string;
  };
};


import { Badge, Button, ChatWorkspace, Heading, Input, SurfaceCard, Text, TextAction } from "@starci/grammar/common";

import {
  PRIVATE_SETUP_COMPOSER_CLASS_NAME,
  PRIVATE_SETUP_CONVERSATION_CLASS_NAME,
  PRIVATE_SETUP_EMPTY_CLASS_NAME,
  PRIVATE_SETUP_HEADER_CLASS_NAME,
  PRIVATE_SETUP_HEADER_COPY_CLASS_NAME,
  PRIVATE_SETUP_HOST_CLASS_NAME,
  PRIVATE_SETUP_MESSAGE_CLASS_NAME,
  PRIVATE_SETUP_READONLY_CLASS_NAME,
} from "./classNames";

/** A persisted conversation turn belonging to a private Setup revision. */
export type SetupMessage = {
  readonly id: string;
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
};

/** Revision identity and lifecycle used by the history selector. */
export type SetupRevision = {
  readonly id: string;
  readonly revision: number;
  readonly status: "open" | "ready" | "completed" | "superseded";
};

/** Controlled conversation, draft and command feedback supplied by the Setup owner. */
export type PrivateSetupChatBlockProps = {
  readonly copy: PrivateSetupChatBlockCopy;
  readonly messages: ReadonlyArray<SetupMessage>;
  readonly pending?: boolean;
  readonly ownPending?: boolean;
  readonly peerDisabled?: boolean;
  readonly refused?: boolean;
  readonly unconfirmed?: boolean;
  readonly revisions: ReadonlyArray<SetupRevision>;
  readonly selectedRevisionId: string;
  readonly canSend: boolean;
  readonly canStartRevision: boolean;
  readonly showRevisionControls?: boolean;
  readonly draft?: string;
  readonly onDraft?: (content: string) => void;
  readonly onSelectRevision: (sessionId: string) => void;
  readonly onStartRevision: () => void;
  readonly onSend: (content: string) => void;
  readonly onOpenVersions?: () => void;
};



/** Render the private Setup conversation and its revision aware composer. */
export const PrivateSetupChatBlock = (props: PrivateSetupChatBlockProps) => {
  const { copy } = props;
  const revision = props.revisions.find(item => item.id === props.selectedRevisionId);
  const draft = props.draft ?? "";
  const ownPending = props.ownPending ?? props.pending ?? false;
  const peerDisabled = props.peerDisabled ?? false;
  const canEdit = props.canSend;
  const conversation = props.messages.length > 0 ? (
    <div className={PRIVATE_SETUP_CONVERSATION_CLASS_NAME} data-contract="GAP-5 FLOW-3 PADDING-4">
      {props.messages.map(message => (
        <div className={PRIVATE_SETUP_MESSAGE_CLASS_NAME} data-contract="GAP-2 FLOW-3" key={message.id}>
          <Text size="xs" weight="semibold">{copy.setup.actor[message.role]}</Text>
          <Text size="sm">{message.content}</Text>
        </div>
      ))}
    </div>
  ) : (
    <div className={PRIVATE_SETUP_EMPTY_CLASS_NAME} data-contract="GAP-2 MEASURE-4 FLOW-3">
      <Heading level={4}>{copy.setup.emptyTitle}</Heading>
      <Text size="sm" tone="muted">{copy.setup.emptyDescription}</Text>
    </div>
  );
  const composer = canEdit ? (
    <form
      className={PRIVATE_SETUP_COMPOSER_CLASS_NAME}
      data-contract="GAP-3 PADDING-4"
      onSubmit={event => {
        event.preventDefault();
        const content = draft.trim();
        if (content.length > 0 && !ownPending && !peerDisabled) props.onSend(content);
      }}
    >
      <Input
        id="agentos-private-setup-message"
        name="setupMessage"
        label={copy.setup.messageLabel}
        hint={copy.setup.messageHint}
        placeholder={copy.setup.messagePlaceholder}
        variant="secondary"
        value={draft}
        onValueChange={props.onDraft}
        isDisabled={ownPending || peerDisabled}
      />
      <Button type="submit" variant="primary" isPending={ownPending} isDisabled={draft.trim().length === 0 || ownPending || peerDisabled}>{copy.setup.send}</Button>
      {props.refused ? <Text size="sm" live="assertive">{copy.setup.messageRefused}</Text> : null}
      {props.unconfirmed ? <Text size="sm" tone="muted">{copy.setup.messageUnconfirmed}</Text> : null}
    </form>
  ) : (
    <div className={PRIVATE_SETUP_READONLY_CLASS_NAME} data-contract="GAP-2 PADDING-4">
      <Text size="sm" tone="muted">{copy.setup.revisionComplete}</Text>
      <TextAction onPress={props.onOpenVersions}>{copy.setup.openVersions}</TextAction>
    </div>
  );
  return (
    <SurfaceCard ariaLabel={copy.setup.privateChat} composition="joined">
      <div
        className={PRIVATE_SETUP_HOST_CLASS_NAME}
        data-contract="MEASURE-2"
        style={props.messages.length > 0 ? { height: "clamp(26rem,56dvh,36rem)" } : undefined}
      >
        <ChatWorkspace
          label={copy.setup.privateChat}
          conversationLabel={copy.setup.messages}
          header={
            <div className={PRIVATE_SETUP_HEADER_CLASS_NAME} data-contract="GAP-3 PADDING-4">
              <div className={PRIVATE_SETUP_HEADER_COPY_CLASS_NAME} data-contract="GAP-2">
                <Heading level={3}>{copy.setup.privateChat}</Heading>
                <Text size="sm" tone="muted">{copy.setup.revision({ revision: revision?.revision ?? "?", status: copy.setup.revisionStatus[revision?.status ?? "unavailable"] })}</Text>
              </div>
              <Badge tone="neutral">{copy.setup.private}</Badge>
            </div>
          }
          conversation={conversation}
          composer={composer}
        />
      </div>
    </SurfaceCard>
  );
};
