"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMutateStartAgentosCustomModuleIntakeSwr } from "@/hooks/swr";
import { AgentOSModuleIntakeBase } from "./component";
type AgentOSModuleIntakeProps = {
  readonly workspaceId: string;
};

/** Create the durable intake identity and continue to its exact studio route. */
export const AgentOSModuleIntake = (props: AgentOSModuleIntakeProps) => {
  const {
    workspaceId
  }: AgentOSModuleIntakeProps = props;
  const t = useTranslations("console.agentos.modules.intake");
  const router = useRouter();
  const startIntake = useMutateStartAgentosCustomModuleIntakeSwr(workspaceId);
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string>();
  const submit = async () => {
    setError(undefined);
    try {
      const result = await startIntake.trigger({
        goal: goal.trim(),
        idempotencyKey: `nivo-fe:${crypto.randomUUID()}`
      });
      if (!result.ok) {
        setError(t("refused"));
        return;
      }
      router.push(`/agentos/workspaces/${workspaceId}/modules/studio/${result.data.module.id}`);
    } catch {
      setError(t("refused"));
    }
  };
  return <AgentOSModuleIntakeBase goal={goal} pending={startIntake.isMutating} error={error} title={t("title")} description={t("description")} fieldLabel={t("fieldLabel")} placeholder={t("placeholder")} note={t("note")} action={t("action")} guideTitle={t("guideTitle")} guideSteps={[t("steps.goal"), t("steps.followUp"), t("steps.review")]} guideNote={t("guideNote")} onGoal={setGoal} onSubmit={() => void submit()} />;
};
