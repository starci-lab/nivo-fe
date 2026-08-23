"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { myAgentosCustomModuleStudio, removeAgentosModuleIntegrationSecret, saveAgentosModuleIntegrationSecret, type AgentosModuleStudio } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import { AgentOSModuleIntegrationsBase } from "./component"

type AgentOSModuleIntegrationsProps = { readonly workspaceId: string, readonly moduleId: string }

/** Own write-only secret replacement and masked integration status. */
export const AgentOSModuleIntegrations = ({ workspaceId, moduleId }: AgentOSModuleIntegrationsProps) => {
    const t = useTranslations("console.agentos.modules.studio.integrations")
    const session = useSession()
    const [studio, setStudio] = useState<AgentosModuleStudio | null | undefined>()
    const [secret, setSecret] = useState("")
    const [pending, setPending] = useState(false)
    const load = useCallback(async () => { const result = await myAgentosCustomModuleStudio(workspaceId, moduleId); setStudio(result.ok ? result.data : null) }, [moduleId, workspaceId])
    useEffect(() => { if (session.state.status === "signed-in") void load() }, [load, session.state.status])
    const save = async () => { setPending(true); const result = await saveAgentosModuleIntegrationSecret({ agentWorkspaceId: workspaceId, moduleId, providerKey: "helpdesk-api", secret }); setStudio(result.ok ? result.data : null); if (result.ok) setSecret(""); setPending(false) }
    const remove = async (providerKey: string) => { setPending(true); const result = await removeAgentosModuleIntegrationSecret({ agentWorkspaceId: workspaceId, moduleId, providerKey }); if (result.ok) await load(); setPending(false) }
    return <AgentOSModuleIntegrationsBase studio={studio ?? undefined} state={studio === undefined ? "loading" : studio === null ? "refused" : "ready"} secret={secret} pending={pending} labels={{ title: t("title"), provider: t("provider"), field: t("field"), placeholder: t("placeholder"), save: t("save"), remove: t("remove"), refused: t("refused"), writeOnly: t("writeOnly"), reveal: t("reveal"), hide: t("hide") }} onSecret={setSecret} onSave={() => void save()} onRemove={(provider) => void remove(provider)} />
}

/** Source-level tier marker for the connected integrations owner. */
export const meta = { shape: "block", world: "connected" } as const
