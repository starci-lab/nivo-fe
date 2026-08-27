"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
    useMutateRemoveAgentosModuleIntegrationSecretSwr,
    useMutateSaveAgentosModuleIntegrationSecretSwr,
} from "@/hooks/swr"
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component"
import { AgentOSModuleIntegrationsBase } from "./component"

type AgentOSModuleIntegrationsProps = { readonly workspaceId: string, readonly moduleId: string }
const projectionState = (refused: boolean, studio: ReturnType<typeof useAgentOSModuleStudioProjection>["studio"]) => {
    if (refused || studio === null) return "refused"
    return studio === undefined ? "loading" : "ready"
}

/** Own write-only secret replacement while reading masked status from the shared projection. */
export const AgentOSModuleIntegrations = ({ workspaceId, moduleId }: AgentOSModuleIntegrationsProps) => {
    const t = useTranslations("console.agentos.modules.studio.integrations")
    const { studio } = useAgentOSModuleStudioProjection()
    const saveIntegration = useMutateSaveAgentosModuleIntegrationSecretSwr(workspaceId, moduleId)
    const removeIntegration = useMutateRemoveAgentosModuleIntegrationSecretSwr(workspaceId, moduleId)
    const [refused, setRefused] = useState(false)
    const [secret, setSecret] = useState("")
    const save = async () => {
        try {
            const result = await saveIntegration.trigger({ providerKey: "helpdesk-api", secret })
            if (!result.ok) { setRefused(true); return }
            setSecret("")
            setRefused(false)
        } catch {
            setRefused(true)
        }
    }
    const remove = async (providerKey: string) => {
        try {
            const result = await removeIntegration.trigger(providerKey)
            setRefused(!result.ok)
        } catch {
            setRefused(true)
        }
    }
    return <AgentOSModuleIntegrationsBase studio={studio ?? undefined} state={projectionState(refused, studio)} secret={secret} pending={saveIntegration.isMutating || removeIntegration.isMutating} labels={{ title: t("title"), provider: t("provider"), field: t("field"), placeholder: t("placeholder"), save: t("save"), remove: t("remove"), refused: t("refused"), writeOnly: t("writeOnly"), reveal: t("reveal"), hide: t("hide") }} onSecret={setSecret} onSave={() => void save()} onRemove={(provider) => void remove(provider)} />
}

/** Source-level tier marker for the connected integrations owner. */
export const meta = { shape: "block", world: "connected" } as const
