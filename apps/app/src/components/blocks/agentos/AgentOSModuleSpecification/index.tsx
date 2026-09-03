"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMutatePublishAgentosCustomModuleSwr } from "@/hooks";
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component";
import { AgentOSModuleSpecificationBase } from "./component";
type AgentOSModuleSpecificationProps = {
  readonly workspaceId: string;
  readonly moduleId: string;
};
const specificationState = (refused: boolean, studio: ReturnType<typeof useAgentOSModuleStudioProjection>["studio"]) => {
  if (refused || studio === null) return "refused";
  if (studio === undefined) return "loading";
  if (studio.specification === null) return "incomplete";
  return studio.module.status === "publishing" ? "publishing" : "ready";
};

/** Consume the page projection and own exact-version acknowledgement and publish routing. */
export const AgentOSModuleSpecification = (props: AgentOSModuleSpecificationProps) => {
  const {
    workspaceId,
    moduleId
  }: AgentOSModuleSpecificationProps = props;
  const t = useTranslations("console.agentos.modules.studio.specification");
  const router = useRouter();
  const {
    studio
  } = useAgentOSModuleStudioProjection();
  const publishModule = useMutatePublishAgentosCustomModuleSwr(workspaceId, moduleId);
  const [refused, setRefused] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const publish = async () => {
    const version = studio?.specification?.version;
    if (version === undefined) return;
    try {
      const result = await publishModule.trigger({
        acknowledgedVersion: version,
        idempotencyKey: `nivo-fe:${crypto.randomUUID()}`
      });
      if (!result.ok) {
        setRefused(true);
        return;
      }
      setRefused(false);
      if (result.data.module.installationId !== null) router.push(`/agentos/workspaces/${workspaceId}/modules/${result.data.module.installationId}`);
    } catch {
      setRefused(true);
    }
  };
  const state = specificationState(refused, studio);
  return <AgentOSModuleSpecificationBase studio={studio ?? undefined} state={state} acknowledged={acknowledged} pending={publishModule.isMutating} labels={{
    title: t("title"),
    refused: t("refused"),
    incomplete: t("incomplete"),
    version: t.raw("version") as string,
    acknowledge: t.raw("acknowledge") as string,
    publish: t("publish"),
    publishing: t("publishing"),
    published: t("published")
  }} onAcknowledge={setAcknowledged} onPublish={() => void publish()} />;
};
