"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { myAgentosCustomModuleStudio, type AgentosModuleStudio } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import { AgentOSModuleProfileBase } from "./component"

type AgentOSModuleProfileProps = { readonly workspaceId: string, readonly moduleId: string }

/** Own the independent live-profile request lifecycle. */
export const AgentOSModuleProfile = ({ workspaceId, moduleId }: AgentOSModuleProfileProps) => {
    const t = useTranslations("console.agentos.modules.studio.profile")
    const session = useSession()
    const [studio, setStudio] = useState<AgentosModuleStudio | null | undefined>()
    const load = useCallback(async () => { const result = await myAgentosCustomModuleStudio(workspaceId, moduleId); setStudio(result.ok ? result.data : null) }, [moduleId, workspaceId])
    useEffect(() => { if (session.state.status === "signed-in") void load() }, [load, session.state.status])
    return <AgentOSModuleProfileBase studio={studio ?? undefined} loading={studio === undefined} refused={studio === null} labels={{ title: t("title"), progress: t("progress"), missing: t.raw("missing") as string, refused: t("refused") }} />
}

/** Source-level tier marker for the connected profile owner. */
export const meta = { shape: "block", world: "connected" } as const
