"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutateAnswerAgentosCustomModuleIntakeSwr } from "@/hooks/swr";
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component";
import { AgentOSModuleInterviewBase } from "./component";
type AgentOSModuleInterviewProps = {
  readonly workspaceId: string;
  readonly moduleId: string;
};
const projectionState = (refused: boolean, studio: ReturnType<typeof useAgentOSModuleStudioProjection>["studio"]) => {
  if (refused || studio === null) return "refused";
  return studio === undefined ? "loading" : "ready";
};

/** Consume the page projection and own the answer-before-next-question mutation. */
export const AgentOSModuleInterview = (props: AgentOSModuleInterviewProps) => {
  const {
    workspaceId,
    moduleId
  }: AgentOSModuleInterviewProps = props;
  const t = useTranslations("console.agentos.modules.studio.interview");
  const {
    studio
  } = useAgentOSModuleStudioProjection();
  const answerIntake = useMutateAnswerAgentosCustomModuleIntakeSwr(workspaceId, moduleId);
  const [refused, setRefused] = useState(false);
  const [answer, setAnswer] = useState("");
  const send = async () => {
    try {
      const result = await answerIntake.trigger({
        answer: answer.trim()
      });
      if (!result.ok) {
        setRefused(true);
        return;
      }
      setRefused(false);
      setAnswer("");
    } catch {
      setRefused(true);
    }
  };
  return <AgentOSModuleInterviewBase state={projectionState(refused, studio)} studio={studio ?? undefined} answer={answer} pending={answerIntake.isMutating} labels={{
    title: t("title"),
    saved: t("saved"),
    refused: t("refused"),
    field: t("field"),
    placeholder: t("placeholder"),
    send: t("send"),
    complete: t("complete"),
    agent: t("agent"),
    you: t("you")
  }} onAnswer={setAnswer} onSend={() => void send()} />;
};
