"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { FailureKind } from "@nivo/api"
import { useAgentOSModuleStudioProjection } from "@/hooks/agentos"
import { useRouter } from "@/hooks/i18n"
import { useMutatePublishAgentosCustomModuleSwr } from "@/hooks/swr"
import { installation } from "@/modules/routes"
import { AgentOSModuleSpecificationBase } from "./component"
type AgentOSModuleSpecificationProps = {
    readonly workspaceId: string
    readonly moduleId: string
}
/** The raw template one catalogue key holds; a non-string answer means the key is not copy. */
const rawTemplate = (value: unknown): string => (typeof value === "string" ? value : "")
const specificationState = (
    refused: boolean,
    studio: ReturnType<typeof useAgentOSModuleStudioProjection>["studio"],
) => {
    if (refused) return "refused"
    if (studio === undefined) return "loading"
    if (studio.specification === null) return "incomplete"
    return studio.module.status === "publishing" ? "publishing" : "ready"
}

/** Consume the page projection and own exact-version acknowledgement and publish routing. */
export const AgentOSModuleSpecification = (props: AgentOSModuleSpecificationProps) => {
    const { workspaceId, moduleId }: AgentOSModuleSpecificationProps = props
    const t = useTranslations("console.agentos.modules.studio.specification")
    const queryT = useTranslations("console.query")
    const router = useRouter()
    const { studio } = useAgentOSModuleStudioProjection()
    const publishModule = useMutatePublishAgentosCustomModuleSwr(workspaceId, moduleId)
    const [failureMessage, setFailureMessage] = useState<string>()
    const [acknowledged, setAcknowledged] = useState(false)
    const publish = async () => {
        const version = studio?.specification?.version
        if (version === undefined) return
        try {
            const result = await publishModule.trigger({
                acknowledgedVersion: version,
                idempotencyKey: `nivo-fe:${crypto.randomUUID()}`,
            })
            if (result.ok) {
                setFailureMessage(undefined)
                if (result.data.module.installationId !== null)
                    router.push(installation(workspaceId, result.data.module.installationId))
                return
            }
            const failureText = (kind: FailureKind): string => {
                switch (kind) {
                    case "refused":
                        return queryT("signInRequired")
                    case "forbidden":
                        return queryT("forbidden")
                    case "not-found":
                        return queryT("notFound")
                    case "invalid":
                        return queryT("invalid")
                    case "unavailable":
                        return queryT("actionUnavailable")
                }
            }
            switch (result.kind) {
                case "refused":
                    setFailureMessage(failureText(result.kind))
                    return
                case "forbidden":
                    setFailureMessage(failureText(result.kind))
                    return
                case "not-found":
                    setFailureMessage(failureText(result.kind))
                    return
                case "invalid":
                    setFailureMessage(failureText(result.kind))
                    return
                case "unavailable":
                    setFailureMessage(failureText(result.kind))
                    return
            }
        } catch {
            setFailureMessage(queryT("actionUnavailable"))
        }
    }
    const state = specificationState(failureMessage !== undefined, studio)
    return (
        <AgentOSModuleSpecificationBase
            state={state}
            props={{
                studio: studio ?? undefined,
                acknowledged,
                pending: publishModule.isMutating,
                labels: {
                    title: t("title"),
                    refused: failureMessage ?? t("refused"),
                    incomplete: t("incomplete"),
                    version: rawTemplate(t.raw("version")),
                    acknowledge: rawTemplate(t.raw("acknowledge")),
                    publish: t("publish"),
                    publishing: t("publishing"),
                    published: t("published"),
                },
            }}
            on={{ onAcknowledge: setAcknowledged, onPublish: () => void publish() }}
        />
    )
}
