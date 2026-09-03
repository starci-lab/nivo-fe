"use client";

import { useState } from "react";
import { ChoiceTabs } from "@nivo/ui";
import { SurfaceCard, Button, Input, Text } from "@starci/grammar/common";

/** One accepted turn in the installation's private resumable Setup session. */
export type SetupMessage = {
  readonly id: string;
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
};

/** One immutable or resumable Setup revision identity visible only to the owner. */
export type SetupRevision = {
  readonly id: string;
  readonly revision: number;
  readonly status: "open" | "ready" | "completed" | "superseded";
};

/** Runtime data passed through the typed Setup chat body component. */
export type PrivateSetupChatContentProps = {
  readonly messages: ReadonlyArray<SetupMessage>;
  readonly draft: string;
  readonly composerKey: number;
  readonly pending: boolean;
  readonly refused: boolean;
  readonly revisions: ReadonlyArray<SetupRevision>;
  readonly selectedRevisionId: string;
  readonly canSend: boolean;
  readonly canStartRevision: boolean;
  readonly showRevisionControls: boolean;
  readonly onDraft: (content: string) => void;
  readonly onSubmit: () => void;
  readonly onSelectRevision: (sessionId: string) => void;
  readonly onStartRevision: () => void;
};

/** Public Setup chat boundary; Execute histories are intentionally absent. */
export type PrivateSetupChatBlockProps = {
  readonly messages: ReadonlyArray<SetupMessage>;
  readonly pending?: boolean;
  readonly refused?: boolean;
  readonly revisions: ReadonlyArray<SetupRevision>;
  readonly selectedRevisionId: string;
  readonly canSend: boolean;
  readonly canStartRevision: boolean;
  readonly showRevisionControls?: boolean;
  readonly onSelectRevision: (sessionId: string) => void;
  readonly onStartRevision: () => void;
  readonly onSend: (content: string) => void;
};
const actorLabel = (role: SetupMessage["role"]): string => {
  if (role === "user") return "You";
  if (role === "assistant") return "Nivo AI";
  return "System";
};
const PrivateSetupChatContent = ({
  messages,
  draft,
  composerKey,
  pending,
  refused,
  revisions,
  selectedRevisionId,
  canSend,
  canStartRevision,
  showRevisionControls,
  onDraft,
  onSubmit,
  onSelectRevision,
  onStartRevision
}: PrivateSetupChatContentProps) => <div>{!showRevisionControls || revisions.length < 2 ? undefined : <ChoiceTabs props={{
    label: "Setup revisions",
    selectedKey: selectedRevisionId,
    tabs: revisions.map(revision => ({
      id: revision.id,
      label: `r${revision.revision} · ${revision.status}`
    }))
  }} on={{
    select: onSelectRevision
  }} />}{messages.map((message, index) => <div key={index}>{<Text size="xs" tone="muted" weight="semibold">{actorLabel(message.role)}</Text>}{<Text size="sm">{message.content}</Text>}</div>)}{canSend ? <div>{[<Input
      key={composerKey}
      id="agentos-private-setup-message"
      name="setupMessage"
      label="Teach this module about your business"
      placeholder="Describe priorities, policies, or exceptions…"
      isDisabled={pending}
      variant="secondary"
      onValueChange={onDraft}
    />]}{<Button
      variant="primary"
      isDisabled={draft.trim().length === 0}
      isPending={pending}
      onPress={onSubmit}
    >Send</Button>}</div> : undefined}{showRevisionControls && canStartRevision ? <Button
      variant="secondary"
      isPending={pending}
      onPress={onStartRevision}
    >Start new AI Setup chat</Button> : undefined}{refused ? <Text size="sm" tone="muted" live="assertive">{"Setup message was refused. Nothing was added to the context draft."}</Text> : canStartRevision ? <Text size="sm" tone="muted">{"This Setup revision is complete. Start a new private AI chat to revise the business context; the active version stays unchanged until Test and Apply pass."}</Text> : undefined}</div>;

/** Draw the private context-building conversation through one runtime ComponentType and Tree. */
export const PrivateSetupChatBlock = (props: PrivateSetupChatBlockProps) => {
  const {
    messages,
    pending = false,
    refused = false,
    revisions,
    selectedRevisionId,
    canSend,
    canStartRevision,
    showRevisionControls = true,
    onSelectRevision,
    onStartRevision,
    onSend
  }: PrivateSetupChatBlockProps = props;
  const [draft, setDraft] = useState("");
  const [composerKey, setComposerKey] = useState(0);
  const submit = () => {
    const content = draft.trim();
    if (content.length === 0) return;
    onSend(content);
    setDraft("");
    setComposerKey(current => current + 1);
  };
  return <SurfaceCard
    label="Private Setup chat"
    fact={revisions.find(revision => revision.id === selectedRevisionId) === undefined ? "Setup only" : `r${revisions.find(revision => revision.id === selectedRevisionId)?.revision} · ${revisions.find(revision => revision.id === selectedRevisionId)?.status}`}
  >
      <PrivateSetupChatContent messages={messages} draft={draft} composerKey={composerKey} pending={pending} refused={refused} revisions={revisions} selectedRevisionId={selectedRevisionId} canSend={canSend} canStartRevision={canStartRevision} showRevisionControls={showRevisionControls} onDraft={setDraft} onSubmit={submit} onSelectRevision={onSelectRevision} onStartRevision={onStartRevision} />
    </SurfaceCard>;
};
