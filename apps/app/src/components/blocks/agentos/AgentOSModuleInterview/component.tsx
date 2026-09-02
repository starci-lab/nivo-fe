
import { SurfaceCard, Button, Input, Heading, Text } from "@starci/grammar/common";
import type { AgentosModuleStudio } from "@/modules/api/console";

/** Durable conversation projection and the one current answer operation. */
export type AgentOSModuleInterviewProps = AgentOSModuleInterviewViewProps;
/** Public API role for AgentOSModuleInterviewViewProps. */
export type AgentOSModuleInterviewViewProps = {
  readonly state: "loading" | "refused" | "ready";
  readonly studio?: AgentosModuleStudio;
  readonly answer: string;
  readonly pending: boolean;
  readonly labels: {
    readonly title: string;
    readonly saved: string;
    readonly refused: string;
    readonly field: string;
    readonly placeholder: string;
    readonly send: string;
    readonly complete: string;
    readonly agent: string;
    readonly you: string;
  };
  readonly onAnswer: (value: string) => void;
  readonly onSend: () => void;
};

/** Draw accepted turns before the single backend-selected follow-up composer. */
export const AgentOSModuleInterviewBase = (props: AgentOSModuleInterviewProps) => {
  const {
    state,
    studio,
    answer,
    pending,
    labels,
    onAnswer,
    onSend
  }: AgentOSModuleInterviewViewProps = props;
  if (state === "refused") return <SurfaceCard
    label={labels.title}
  ><div><Text size="sm" tone="muted">{labels.refused}</Text></div></SurfaceCard>;
  const loading = state === "loading";
  const messages = loading ? [{
    id: "1",
    role: "assistant" as const,
    content: ""
  }, {
    id: "2",
    role: "user" as const,
    content: ""
  }, {
    id: "3",
    role: "assistant" as const,
    content: ""
  }] : studio?.messages ?? [];
  const composer = studio?.module.currentQuestion === null ? undefined : <div>
    <Input
      id="module-answer"
      name="answer"
      label={labels.field}
      placeholder={labels.placeholder}
      isDisabled={pending}
      variant="secondary"
      onValueChange={onAnswer}
    />
    <Button
      variant="primary"
      isPending={pending}
      isDisabled={answer.trim().length === 0}
      onPress={onSend}
    >{labels.send}</Button>
  </div>;
  return <SurfaceCard
    label={labels.title}
  ><div><div><Heading level={3} isSkeleton={loading}>{studio?.module.currentQuestion ?? labels.complete}</Heading><Text size="xs">{labels.saved}</Text></div>{messages.map((message, index) => <div key={index}><Text size="xs" weight="semibold" isSkeleton={loading}>{message.role === "assistant" ? labels.agent : labels.you}</Text><Text size="sm" isSkeleton={loading}>{message.content}</Text></div>)}{composer}</div></SurfaceCard>;
};

