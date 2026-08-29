import { Button, Field, Heading, SurfaceCard, Text } from "@nivo/ui";
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
  if (state === "refused") return <SurfaceCard props={{
    label: labels.title
  }}><div><Text props={{
        content: labels.refused,
        size: "sm",
        tone: "muted"
      }} /></div></SurfaceCard>;
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
    <Field props={{
      id: "module-answer",
      name: "answer",
      label: labels.field,
      placeholder: labels.placeholder,
      disabled: pending
    }} on={{
      change: onAnswer
    }} />
    <Button props={{
      label: labels.send,
      variant: "primary",
      isPending: pending,
      disabled: answer.trim().length === 0
    }} on={{
      press: onSend
    }} />
  </div>;
  return <SurfaceCard props={{
    label: labels.title
  }} isLoading={loading}><div><div><Heading props={{
          content: studio?.module.currentQuestion ?? labels.complete,
          level: 3
        }} isLoading={loading} /><Text props={{
          content: labels.saved,
          size: "xs"
        }} /></div>{messages.map((message, index) => <div key={index}><Text props={{
          content: message.role === "assistant" ? labels.agent : labels.you,
          size: "xs",
          weight: "semibold"
        }} isLoading={loading} /><Text props={{
          content: message.content,
          size: "sm"
        }} isLoading={loading} /></div>)}{composer}</div></SurfaceCard>;
};

