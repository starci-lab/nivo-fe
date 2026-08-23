"use client"

import { useTranslations } from "next-intl"
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component"
import { AgentOSModuleProfileBase } from "./component"

type AgentOSModuleProfileProps = { readonly workspaceId: string, readonly moduleId: string }

/** Read the page-owned live profile without starting a duplicate studio request. */
export const AgentOSModuleProfile = ({ workspaceId, moduleId }: AgentOSModuleProfileProps) => {
    const t = useTranslations("console.agentos.modules.studio.profile")
    const { studio } = useAgentOSModuleStudioProjection()
    const routeMismatch = studio !== undefined && studio !== null && (studio.module.id !== moduleId || studio.module.agentWorkspaceId !== workspaceId)
    return <AgentOSModuleProfileBase studio={studio ?? undefined} loading={studio === undefined} refused={studio === null || routeMismatch} labels={{ title: t("title"), progress: t("progress"), missing: t.raw("missing") as string, refused: t("refused") }} />
}

/** Source-level tier marker for the connected profile owner. */
export const meta = { shape: "block", world: "connected" } as const
