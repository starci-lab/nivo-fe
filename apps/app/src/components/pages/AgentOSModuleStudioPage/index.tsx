"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useQueryMyAgentosCustomModuleStudioSwr } from "@/hooks";
import { AgentOSModuleStudioProjectionProvider } from "@/modules/agentos/module-studio-projection";
import { nivoQueryData } from "@/modules/query";
import { AgentOSModuleStudioPageBase } from "./component";
type AgentOSModuleStudioPageProps = {
  readonly workspaceId: string;
  readonly moduleId: string;
};
/** Connect localized copy and exact module identity for the resumable studio. */
export const AgentOSModuleStudioPage = (props: AgentOSModuleStudioPageProps) => {
  const {
    workspaceId,
    moduleId
  }: AgentOSModuleStudioPageProps = props;
  const t = useTranslations("console.agentos.modules.studioPage");
  const router = useRouter();
  const query = useQueryMyAgentosCustomModuleStudioSwr(workspaceId, moduleId);
  const studio = nivoQueryData(query.data);
  const refresh = async () => {
    await query.mutate();
  };
  return <AgentOSModuleStudioProjectionProvider value={{ studio, refresh }}>
    <AgentOSModuleStudioPageBase
      workspaceId={workspaceId}
      moduleId={moduleId}
      labels={{
        path: t("path"),
        modules: t("modules"),
        title: studio?.module.name ?? t("title"),
        description: t("description"),
        eyebrow: t("eyebrow"),
        sections: t("sections")
      }}
      on={{ back: () => router.push(`/agentos/workspaces/${workspaceId}/modules`) }}
    />
  </AgentOSModuleStudioProjectionProvider>;
};
