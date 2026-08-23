"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { publishAgentosCustomModule } from "@/modules/api/console"
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component"
import { AgentOSModuleSpecificationBase } from "./component"

type AgentOSModuleSpecificationProps = { readonly workspaceId: string, readonly moduleId: string }

/** Consume the page projection and own exact-version acknowledgement and publish routing. */
export const AgentOSModuleSpecification = ({ workspaceId, moduleId }: AgentOSModuleSpecificationProps) => {
    const t = useTranslations("console.agentos.modules.studio.specification")
    const locale = useLocale()
    const router = useRouter()
    const { studio, refresh } = useAgentOSModuleStudioProjection()
    const [refused, setRefused] = useState(false)
    const [acknowledged, setAcknowledged] = useState(false)
    const [pending, setPending] = useState(false)
    const publish = async () => {
        const version = studio?.specification?.version
        if (version === undefined) return
        setPending(true)
        const result = await publishAgentosCustomModule({ agentWorkspaceId: workspaceId, moduleId, acknowledgedVersion: version, idempotencyKey: `nivo-fe:${crypto.randomUUID()}` })
        setPending(false)
        if (!result.ok) { setRefused(true); return }
        setRefused(false)
        await refresh()
        if (result.data.module.installationId !== null) router.push(`/${locale}/agentos/workspaces/${workspaceId}/modules/${result.data.module.installationId}`)
    }
    const state = refused || studio === null ? "refused" : studio === undefined ? "loading" : studio.specification === null ? "incomplete" : studio.module.status === "publishing" ? "publishing" : "ready"
    return <AgentOSModuleSpecificationBase studio={studio ?? undefined} state={state} acknowledged={acknowledged} pending={pending} labels={{ title: t("title"), refused: t("refused"), incomplete: t("incomplete"), version: t.raw("version") as string, acknowledge: t.raw("acknowledge") as string, publish: t("publish"), publishing: t("publishing"), published: t("published") }} onAcknowledge={setAcknowledged} onPublish={() => void publish()} />
}

/** Source-level tier marker for the connected specification owner. */
export const meta = { shape: "block", world: "connected" } as const
