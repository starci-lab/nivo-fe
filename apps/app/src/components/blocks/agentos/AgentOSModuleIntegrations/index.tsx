"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { removeAgentosModuleIntegrationSecret, saveAgentosModuleIntegrationSecret } from "@/modules/api/console"
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component"
import { AgentOSModuleIntegrationsBase } from "./component"

type AgentOSModuleIntegrationsProps = { readonly workspaceId: string, readonly moduleId: string }

/** Own write-only secret replacement while reading masked status from the shared projection. */
export const AgentOSModuleIntegrations = ({ workspaceId, moduleId }: AgentOSModuleIntegrationsProps) => {
    const t = useTranslations("console.agentos.modules.studio.integrations")
    const { studio, refresh } = useAgentOSModuleStudioProjection()
    const [refused, setRefused] = useState(false)
    const [secret, setSecret] = useState("")
    const [pending, setPending] = useState(false)
    const save = async () => { setPending(true); const result = await saveAgentosModuleIntegrationSecret({ agentWorkspaceId: workspaceId, moduleId, providerKey: "helpdesk-api", secret }); if (result.ok) { setSecret(""); setRefused(false); await refresh() } else setRefused(true); setPending(false) }
    const remove = async (providerKey: string) => { setPending(true); const result = await removeAgentosModuleIntegrationSecret({ agentWorkspaceId: workspaceId, moduleId, providerKey }); if (result.ok) { setRefused(false); await refresh() } else setRefused(true); setPending(false) }
    return <AgentOSModuleIntegrationsBase studio={studio ?? undefined} state={refused || studio === null ? "refused" : studio === undefined ? "loading" : "ready"} secret={secret} pending={pending} labels={{ title: t("title"), provider: t("provider"), field: t("field"), placeholder: t("placeholder"), save: t("save"), remove: t("remove"), refused: t("refused"), writeOnly: t("writeOnly"), reveal: t("reveal"), hide: t("hide") }} onSecret={setSecret} onSave={() => void save()} onRemove={(provider) => void remove(provider)} />
}

/** Source-level tier marker for the connected integrations owner. */
export const meta = { shape: "block", world: "connected" } as const
