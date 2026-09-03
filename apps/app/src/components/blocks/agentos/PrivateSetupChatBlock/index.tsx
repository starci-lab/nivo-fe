"use client";

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

export type SetupMessage = {
  readonly id: string;
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
};

export type SetupRevision = {
  readonly id: string;
  readonly revision: number;
  readonly status: "open" | "ready" | "completed" | "superseded";
};

export type PrivateSetupChatBlockProps = {
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

const actorLabel = (role: SetupMessage["role"]): string => role === "assistant" ? "Nivo AI" : role === "user" ? "You" : "System";

/** Render the private Setup conversation and its revision aware composer. */
export const PrivateSetupChatBlock = (props: PrivateSetupChatBlockProps) => {
  const revision = props.revisions.find(item => item.id === props.selectedRevisionId);
  const draft = props.draft ?? "";
  const ownPending = props.ownPending ?? props.pending ?? false;
  const peerDisabled = props.peerDisabled ?? false;
  const canEdit = props.canSend;
  const conversation = props.messages.length > 0 ? (
    <div className={PRIVATE_SETUP_CONVERSATION_CLASS_NAME} data-contract="GAP-5 FLOW-3 PADDING-4">
      {props.messages.map(message => (
        <div className={PRIVATE_SETUP_MESSAGE_CLASS_NAME} data-contract="GAP-2 FLOW-3" key={message.id}>
          <Text size="xs" weight="semibold">{actorLabel(message.role)}</Text>
          <Text size="sm">{message.content}</Text>
        </div>
      ))}
    </div>
  ) : (
    <div className={PRIVATE_SETUP_EMPTY_CLASS_NAME} data-contract="GAP-2 MEASURE-4 FLOW-3">
      <Heading level={4}>Teach this module about your business</Heading>
      <Text size="sm" tone="muted">Start with what this module should do, the policies it must follow, and when it should ask you for help.</Text>
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
        label="Message to Nivo"
        hint="This private Setup chat builds a draft; it does not activate the module."
        placeholder="Describe priorities, policies, or exceptions…"
        variant="secondary"
        value={draft}
        onValueChange={props.onDraft}
        isDisabled={ownPending || peerDisabled}
      />
      <Button type="submit" variant="primary" isPending={ownPending} isDisabled={draft.trim().length === 0 || ownPending || peerDisabled}>Send</Button>
      {props.refused ? <Text size="sm" live="assertive">The Setup message was refused. Nothing was added to the draft. Review your message and send again.</Text> : null}
      {props.unconfirmed ? <Text size="sm" tone="muted">The response was not confirmed. Inspect the conversation before sending again.</Text> : null}
    </form>
  ) : (
    <div className={PRIVATE_SETUP_READONLY_CLASS_NAME} data-contract="GAP-2 PADDING-4">
      <Text size="sm" tone="muted">This Setup revision is complete. Start a new private AI chat to revise the business context.</Text>
      <TextAction onPress={props.onOpenVersions}>Open Versions</TextAction>
    </div>
  );
  return (
    <SurfaceCard ariaLabel="Private Setup chat" composition="joined">
      <div
        className={PRIVATE_SETUP_HOST_CLASS_NAME}
        data-contract="MEASURE-2"
        style={props.messages.length > 0 ? { height: "clamp(26rem,56dvh,36rem)" } : undefined}
      >
        <ChatWorkspace
          label="Private Setup chat"
          conversationLabel="Setup messages"
          header={
            <div className={PRIVATE_SETUP_HEADER_CLASS_NAME} data-contract="GAP-3 PADDING-4">
              <div className={PRIVATE_SETUP_HEADER_COPY_CLASS_NAME} data-contract="GAP-2">
                <Heading level={3}>Private Setup chat</Heading>
                <Text size="sm" tone="muted">Revision r{revision?.revision ?? "?"} · {revision?.status ?? "unavailable"}</Text>
              </div>
              <Badge tone="neutral">Private</Badge>
            </div>
          }
          conversation={conversation}
          composer={composer}
        />
      </div>
    </SurfaceCard>
  );
};
