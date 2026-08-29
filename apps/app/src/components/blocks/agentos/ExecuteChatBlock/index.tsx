"use client";

import { createElement, useState, type ComponentType } from "react";
import { Button, Field, Heading, MarkdownComponent, SurfaceCard, Text } from "@nivo/ui";
import type { AgentosRuntimeMessageTree, AgentosRuntimeValue, AgentosRuntimeWidgetNode } from "@/modules/api/console";

/** Trusted widget action advertised by the pinned runtime manifest. */
export type ChatWidgetAction = {
  readonly key: string;
  readonly inputKeys: ReadonlyArray<string>;
};

/** Validated widget identity attached to one immutable Execute message. */
export type ChatWidgetPayload = {
  readonly id: string;
  readonly node: AgentosRuntimeWidgetNode;
  readonly actions: ReadonlyArray<ChatWidgetAction>;
};

/** One Execute message with its immutable context binding and optional trusted widget. */
export type ExecuteMessage = {
  readonly id: string;
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
  readonly messageTree?: AgentosRuntimeMessageTree | null;
  readonly contextLabel: string;
  readonly widget?: ChatWidgetPayload;
};

/** Runtime props every trusted widget ComponentType must accept. */
export type TrustedWidgetActionHandler = (widgetId: string, actionKey: string, input: Readonly<Record<string, AgentosRuntimeValue>>, taskExpectedVersion?: number) => void;

/** Runtime props every trusted widget ComponentType must accept. */
export type TrustedWidgetComponentProps = {
  readonly payload: ChatWidgetPayload;
  readonly onAction?: TrustedWidgetActionHandler;
};

/** Open trusted widget registry; unknown component/version pairs fail closed. */
export type TrustedWidgetRegistry = Readonly<Record<string, ComponentType<TrustedWidgetComponentProps>>>;

/** Runtime data passed through the stable Execute chat body ComponentType. */
export type ExecuteChatContentProps = {
  readonly messages: ReadonlyArray<ExecuteMessage>;
  readonly draft: string;
  readonly composerKey: number;
  readonly pending: boolean;
  readonly refused: boolean;
  readonly registry: TrustedWidgetRegistry;
  readonly onDraft: (content: string) => void;
  readonly onSubmit: () => void;
  readonly onWidgetAction?: TrustedWidgetActionHandler;
};

/** Public Execute conversation boundary for one selected collaborative session. */
export type ExecuteChatBlockProps = {
  readonly sessionTitle: string;
  readonly messages: ReadonlyArray<ExecuteMessage>;
  readonly pending?: boolean;
  readonly refused?: boolean;
  readonly registry?: TrustedWidgetRegistry;
  readonly onSend: (content: string) => void;
  readonly onWidgetAction?: TrustedWidgetActionHandler;
};
const valueLabel = (value: AgentosRuntimeValue): string => {
  if (value === null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
};
const StructuredWidget = ({
  payload,
  onAction
}: TrustedWidgetComponentProps) => {
  const facts = Object.entries(payload.node.props);
  const immediateActions = payload.actions.filter(action => action.inputKeys.length === 0);
  return <div><div>


      <Heading props={{
        content: payload.node.component,
        level: 4
      }} />

      <Text props={{
        content: `Trusted schema ${payload.node.version}`,
        size: "xs",
        tone: "muted"
      }} /></div>{facts.length === 0 ? undefined : <div>{facts.map(([ key, value], index) => <div key={index}>{<Text props={{
          content: key,
          size: "sm"
        }} />}{<Text props={{
          content: valueLabel(value),
          size: "sm"
        }} />}</div>)}</div>}{immediateActions.length === 0 ? undefined : <div>{immediateActions.map((action, index) => <Button key={index} props={{
        label: action.key,
        variant: "secondary"
      }} on={{
        press: () => onAction?.(payload.id, action.key, {})
      }} />)}</div>}{payload.actions.some(action => action.inputKeys.length > 0) ? <Text props={{
      content: "Actions requiring typed input continue in the registered workbench.",
      size: "sm",
      tone: "muted"
    }} /> : undefined}</div>;
};
type OperationWidgetProps = TrustedWidgetComponentProps & {
  readonly title: string;
  readonly caption: string;
  readonly factKeys: ReadonlyArray<string>;
  readonly notice: string;
};
const readableKey = (key: string): string => key.replace(/([a-z])([A-Z])/gu, "$1 $2").replace(/^./u, value => value.toUpperCase());
const OperationWidget = ({
  payload,
  onAction,
  title,
  caption,
  factKeys,
  notice
}: OperationWidgetProps) => {
  const taskId = payload.node.props.taskId;
  const expectedVersion = payload.node.props.expectedVersion;
  const facts = factKeys.flatMap(key => Object.hasOwn(payload.node.props, key) ? [[key, payload.node.props[key]] as const] : []);
  const admitted = new Set(payload.actions.map(action => action.key));
  const canOpen = typeof taskId === "string" && admitted.has("open-task");
  const canAccept = typeof taskId === "string" && typeof expectedVersion === "number" && admitted.has("accept");
  return <div><div>


      <Heading props={{
        content: title,
        level: 4
      }} />

      <Text props={{
        content: caption,
        size: "xs",
        tone: "muted"
      }} /></div><div>{facts.map(([ key, value], index) => <div key={index}>{<Text props={{
          content: readableKey(key),
          size: "sm"
        }} />}{<Text props={{
          content: valueLabel(value),
          size: "sm",
          weight: "semibold"
        }} />}</div>)}</div>{!canOpen && !canAccept ? undefined : <div>{[...(canOpen ? [<Button key="item-0" props={{
        label: "Open in workbench",
        variant: "secondary"
      }} on={{
        press: () => onAction?.(payload.id, "open-task", {
          taskId
        })
      }} />] : []), ...(canAccept ? [<Button key="item-1" props={{
        label: "Accept task",
        variant: "primary"
      }} on={{
        press: () => onAction?.(payload.id, "accept", {
          taskId,
          expectedVersion
        }, expectedVersion)
      }} />] : [])]}</div>}

    <Text props={{
      content: notice,
      size: "sm",
      tone: "muted"
    }} /></div>;
};
const SupportTaskWidget = (props: TrustedWidgetComponentProps) => <OperationWidget {...props} title="Support follow-up" caption="SLA-aware customer task" factKeys={["title", "summary", "priority", "status", "sla"]} notice="Nivo may triage and draft; refunds, remedies and sensitive-data disclosure still require the configured authority." />;
const FinanceApprovalWidget = (props: TrustedWidgetComponentProps) => <OperationWidget {...props} title="Finance approval" caption="Evidence-backed owner decision" factKeys={["title", "amount", "currency", "approvalState", "priority", "status"]} notice="Accept queues a review task only. Nivo cannot approve its own work or execute payment." />;
const CalendarOptionsWidget = (props: TrustedWidgetComponentProps) => <OperationWidget {...props} title="Scheduling options" caption="Timezone-normalized proposal" factKeys={["title", "dateTime", "timeZone", "options", "priority", "status"]} notice="Options remain proposals until a participant confirms; the calendar is not silently changed." />;
const KnowledgeEvidenceWidget = (props: TrustedWidgetComponentProps) => <OperationWidget {...props} title="Knowledge evidence" caption="Grounded answer with provenance" factKeys={["title", "summary", "citations", "confidence", "conflicts", "status"]} notice="Sources, conflicts and confidence remain visible; unsupported claims fail closed." />;

/** Built-in trusted widget ComponentTypes aligned with the backend registry. */
export const DEFAULT_WIDGET_REGISTRY: TrustedWidgetRegistry = {
  "nivo.metric@1.0.0": StructuredWidget,
  "nivo.data-table@1.0.0": StructuredWidget,
  "nivo.timeline@1.0.0": StructuredWidget,
  "nivo.action-form@1.0.0": StructuredWidget,
  "nivo.support-task@1.0.0": SupportTaskWidget,
  "nivo.finance-approval@1.0.0": FinanceApprovalWidget,
  "nivo.calendar-options@1.0.0": CalendarOptionsWidget,
  "nivo.knowledge-evidence@1.0.0": KnowledgeEvidenceWidget
};
const actorLabel = (role: ExecuteMessage["role"]): string => {
  if (role === "user") return "You";
  if (role === "assistant") return "Nivo AI";
  return "System";
};
const widgetProjection = (payload: ChatWidgetPayload, registry: TrustedWidgetRegistry, onAction: TrustedWidgetActionHandler | undefined) => {
  const Widget = registry[`${payload.node.component}@${payload.node.version}`];
  return Widget === undefined ? <Text props={{
    content: "Widget refused: No trusted ComponentType is registered.",
    size: "sm",
    tone: "muted",
    live: "assertive"
  }} /> : createElement(Widget, {
    payload,
    onAction
  });
};
const markdownFor = (message: ExecuteMessage): string => {
  const nodes = message.messageTree?.nodes ?? [];
  const content = nodes.flatMap(node => {
    if (node.type === "markdown") return [node.markdown];
    if (node.type === "attachment") return [`Attachment: ${node.label} · ${node.mediaType}`];
    return [];
  }).join("\n\n");
  return content.trim().length > 0 ? content : message.content;
};
const ExecuteChatContent = ({
  messages,
  draft,
  composerKey,
  pending,
  refused,
  registry,
  onDraft,
  onSubmit,
  onWidgetAction
}: ExecuteChatContentProps) => <div>{messages.map((message, index) => <div key={index}>{<Text props={{
      content: actorLabel(message.role),
      size: "xs",
      tone: "muted",
      weight: "semibold"
    }} />}{<MarkdownComponent markdown={markdownFor(message)} />}{<Text props={{
      content: message.contextLabel,
      size: "xs",
      tone: "muted"
    }} />}{message.widget === undefined ? undefined : widgetProjection(message.widget, registry, onWidgetAction)}</div>)}<div><>


      <Field key={composerKey} props={{
        id: "agentos-execute-message",
        name: "executeMessage",
        label: "Message this Execute session",
        placeholder: "Ask Nivo to execute…",
        disabled: pending
      }} on={{
        change: onDraft
      }} /></>



    <Button props={{
      label: "Send",
      variant: "primary",
      disabled: draft.trim().length === 0,
      isPending: pending
    }} on={{
      press: onSubmit
    }} /></div>{refused ? <Text props={{
    content: "The Execute operation was refused; no message or widget was appended.",
    size: "sm",
    tone: "muted",
    live: "assertive"
  }} /> : undefined}</div>;

/** Draw Execute messages and fail-closed widgets through the trusted ComponentType registry. */
export const ExecuteChatBlock = (props: ExecuteChatBlockProps) => {
  const {
    sessionTitle,
    messages,
    pending = false,
    refused = false,
    registry = DEFAULT_WIDGET_REGISTRY,
    onSend,
    onWidgetAction
  }: ExecuteChatBlockProps = props;
  const [draft, setDraft] = useState("");
  const [composerKey, setComposerKey] = useState(0);
  const submit = () => {
    const content = draft.trim();
    if (content.length === 0) return;
    onSend(content);
    setDraft("");
    setComposerKey(current => current + 1);
  };
  return <SurfaceCard props={{
    label: "Execute chat",
    fact: sessionTitle
  }}>
      <ExecuteChatContent messages={messages} draft={draft} composerKey={composerKey} pending={pending} refused={refused} registry={registry} onDraft={setDraft} onSubmit={submit} onWidgetAction={onWidgetAction} />
    </SurfaceCard>;
};



