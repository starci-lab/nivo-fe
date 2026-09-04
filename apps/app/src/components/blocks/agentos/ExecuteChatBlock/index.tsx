"use client";

type RuntimeExecuteChatAttachmentValues = { readonly label: string; readonly mediaType: string };
type RuntimeExecuteChatSchemaValues = { readonly version: string };
type RuntimeLabelsActionValues = { readonly key: string };
type RuntimeLabelsFieldValues = { readonly key: string };

/** Settled display labels and typed formatters supplied by the page owner. */
export type ExecuteChatBlockCopy = {
  readonly "executeChat": {
    readonly "acceptTask": string;
    readonly "ai": string;
    readonly "attachment": (values: RuntimeExecuteChatAttachmentValues) => string;
    readonly "messageLabel": string;
    readonly "openWorkbench": string;
    readonly "placeholder": string;
    readonly "refused": string;
    readonly "schema": (values: RuntimeExecuteChatSchemaValues) => string;
    readonly "send": string;
    readonly "system": string;
    readonly "title": string;
    readonly "typedInput": string;
    readonly "widgetRefused": string;
    readonly "you": string;
  };
  readonly "fields": {
    readonly "amount": string;
    readonly "approvalState": string;
    readonly "citations": string;
    readonly "confidence": string;
    readonly "conflicts": string;
    readonly "currency": string;
    readonly "dateTime": string;
    readonly "options": string;
    readonly "priority": string;
    readonly "sla": string;
    readonly "status": string;
    readonly "summary": string;
    readonly "timeZone": string;
    readonly "title": string;
  };
  readonly "labels": {
    readonly "action": (values: RuntimeLabelsActionValues) => string;
    readonly "field": (values: RuntimeLabelsFieldValues) => string;
  };
  readonly "widgets": {
    readonly "calendarCaption": string;
    readonly "calendarNotice": string;
    readonly "calendarTitle": string;
    readonly "financeCaption": string;
    readonly "financeNotice": string;
    readonly "financeTitle": string;
    readonly "knowledgeCaption": string;
    readonly "knowledgeNotice": string;
    readonly "knowledgeTitle": string;
    readonly "supportCaption": string;
    readonly "supportNotice": string;
    readonly "supportTitle": string;
  };
};





import { createElement, useState, type ComponentType } from "react";
import { MarkdownComponent } from "@nivo/ui";
import { SurfaceCard, Button, Input, Heading, Text } from "@starci/grammar/common";
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
  readonly copy: ExecuteChatBlockCopy;
  readonly payload: ChatWidgetPayload;
  readonly onAction?: TrustedWidgetActionHandler;
};

/** Open trusted widget registry; unknown component/version pairs fail closed. */
export type TrustedWidgetRegistry = Readonly<Record<string, ComponentType<TrustedWidgetComponentProps>>>;

/** Runtime data passed through the stable Execute chat body ComponentType. */
export type ExecuteChatContentProps = {
  readonly copy: ExecuteChatBlockCopy;
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
  readonly copy: ExecuteChatBlockCopy;
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
const StructuredWidget = ({ copy,
  payload,
  onAction
}: TrustedWidgetComponentProps) => {
  
  const facts = Object.entries(payload.node.props);
  const immediateActions = payload.actions.filter(action => action.inputKeys.length === 0);
  return <div><div>


      <Heading level={4}>{payload.node.component}</Heading>

      <Text size="xs" tone="muted">{copy.executeChat.schema({ version: payload.node.version })}</Text></div>{facts.length === 0 ? undefined : <div>{facts.map(([ key, value], index) => <div key={index}>{<Text size="sm">{copy.labels.field({ key })}</Text>}{<Text size="sm">{valueLabel(value)}</Text>}</div>)}</div>}{immediateActions.length === 0 ? undefined : <div>{immediateActions.map((action, index) => <Button
          key={index}
          variant="secondary"
          onPress={() => onAction?.(payload.id, action.key, {})}
        >{copy.labels.action({ key: action.key })}</Button>)}</div>}{payload.actions.some(action => action.inputKeys.length > 0) ? <Text size="sm" tone="muted">{copy.executeChat.typedInput}</Text> : undefined}</div>;
};
type OperationWidgetProps = TrustedWidgetComponentProps & {
  readonly title: string;
  readonly caption: string;
  readonly factKeys: ReadonlyArray<string>;
  readonly notice: string;
};
const FIELD_KEYS = { title: "title", summary: "summary", priority: "priority", status: "status", sla: "sla", amount: "amount", currency: "currency", approvalState: "approvalState", dateTime: "dateTime", timeZone: "timeZone", options: "options", citations: "citations", confidence: "confidence", conflicts: "conflicts" } as const;
const readableKey = (key: string, copy: ExecuteChatBlockCopy): string => {
  const known = Object.prototype.hasOwnProperty.call(FIELD_KEYS, key) ? FIELD_KEYS[key as keyof typeof FIELD_KEYS] : undefined;
  return known === undefined ? copy.labels.field({ key }) : copy.fields[known];
};
const OperationWidget = ({ copy,
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


      <Heading level={4}>{title}</Heading>

      <Text size="xs" tone="muted">{caption}</Text></div><div>{facts.map(([ key, value], index) => <div key={index}>{<Text size="sm">{readableKey(key, copy)}</Text>}{<Text size="sm" weight="semibold">{valueLabel(value)}</Text>}</div>)}</div>{!canOpen && !canAccept ? undefined : <div>{[...(canOpen ? [<Button
          key="item-0"
          variant="secondary"
          onPress={() => onAction?.(payload.id, "open-task", {
          taskId
        })}
        >{copy.executeChat.openWorkbench}</Button>] : []), ...(canAccept ? [<Button
        key="item-1"
        variant="primary"
        onPress={() => onAction?.(payload.id, "accept", {
          taskId,
          expectedVersion
        }, expectedVersion)}
      >{copy.executeChat.acceptTask}</Button>] : [])]}</div>}

    <Text size="sm" tone="muted">{notice}</Text></div>;
};
const SupportTaskWidget = (props: TrustedWidgetComponentProps) => {
  const { copy } = props;
  return (<OperationWidget {...props} title={copy.widgets.supportTitle} caption={copy.widgets.supportCaption} factKeys={["title", "summary", "priority", "status", "sla"]} notice={copy.widgets.supportNotice} />);
};
const FinanceApprovalWidget = (props: TrustedWidgetComponentProps) => {
  const { copy } = props;
  return (<OperationWidget {...props} title={copy.widgets.financeTitle} caption={copy.widgets.financeCaption} factKeys={["title", "amount", "currency", "approvalState", "priority", "status"]} notice={copy.widgets.financeNotice} />);
};
const CalendarOptionsWidget = (props: TrustedWidgetComponentProps) => {
  const { copy } = props;
  return (<OperationWidget {...props} title={copy.widgets.calendarTitle} caption={copy.widgets.calendarCaption} factKeys={["title", "dateTime", "timeZone", "options", "priority", "status"]} notice={copy.widgets.calendarNotice} />);
};
const KnowledgeEvidenceWidget = (props: TrustedWidgetComponentProps) => {
  const { copy } = props;
  return (<OperationWidget {...props} title={copy.widgets.knowledgeTitle} caption={copy.widgets.knowledgeCaption} factKeys={["title", "summary", "citations", "confidence", "conflicts", "status"]} notice={copy.widgets.knowledgeNotice} />);
};

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
const actorLabel = (role: ExecuteMessage["role"], copy: ExecuteChatBlockCopy): string => {
  if (role === "user") return copy.executeChat.you;
  if (role === "assistant") return copy.executeChat.ai;
  return copy.executeChat.system;
};
const widgetProjection = (payload: ChatWidgetPayload, registry: TrustedWidgetRegistry, onAction: TrustedWidgetActionHandler | undefined, copy: ExecuteChatBlockCopy) => {
  const Widget = registry[`${payload.node.component}@${payload.node.version}`];
  return Widget === undefined ? <Text size="sm" tone="muted" live="assertive">{copy.executeChat.widgetRefused}</Text> : createElement(Widget, {
    payload,
    onAction,
    copy
  });
};
const markdownFor = (message: ExecuteMessage, copy: ExecuteChatBlockCopy): string => {
  const nodes = message.messageTree?.nodes ?? [];
  const content = nodes.flatMap(node => {
    if (node.type === "markdown") return [node.markdown];
    if (node.type === "attachment") return [copy.executeChat.attachment({ label: node.label, mediaType: node.mediaType })];
    return [];
  }).join("\n\n");
  return content.trim().length > 0 ? content : message.content;
};
const ExecuteChatContent = ({ copy,
  messages,
  draft,
  composerKey,
  pending,
  refused,
  registry,
  onDraft,
  onSubmit,
  onWidgetAction
}: ExecuteChatContentProps) => {
  
  return (<div>{messages.map((message, index) => <div key={index}>{<Text size="xs" tone="muted" weight="semibold">{actorLabel(message.role, copy)}</Text>}{<MarkdownComponent markdown={markdownFor(message, copy)} />}{<Text size="xs" tone="muted">{message.contextLabel}</Text>}{message.widget === undefined ? undefined : widgetProjection(message.widget, registry, onWidgetAction, copy)}</div>)}<div><>


      <Input
        key={composerKey}
        id="agentos-execute-message"
        name="executeMessage"
        label={copy.executeChat.messageLabel}
        placeholder={copy.executeChat.placeholder}
        isDisabled={pending}
        variant="secondary"
        onValueChange={onDraft}
      /></>



    <Button
      variant="primary"
      isDisabled={draft.trim().length === 0}
      isPending={pending}
      onPress={onSubmit}
    >{copy.executeChat.send}</Button></div>{refused ? <Text size="sm" tone="muted" live="assertive">{copy.executeChat.refused}</Text> : undefined}</div>);
};

/** Draw Execute messages and fail-closed widgets through the trusted ComponentType registry. */
export const ExecuteChatBlock = (props: ExecuteChatBlockProps) => {
  const { copy } = props;
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
  return <SurfaceCard
    label={copy.executeChat.title}
    fact={sessionTitle}
  >
      <ExecuteChatContent copy={copy} messages={messages} draft={draft} composerKey={composerKey} pending={pending} refused={refused} registry={registry} onDraft={setDraft} onSubmit={submit} onWidgetAction={onWidgetAction} />
    </SurfaceCard>;
};



