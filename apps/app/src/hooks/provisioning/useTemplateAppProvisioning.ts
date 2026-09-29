"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
    useAccessToken,
    useMutateCreateAndPublishExpertSiteSwr,
    useProvisioningRealtime,
    useQueryCatalogItemsSwr,
    useQueryMyExpertSiteDeploymentSwr,
    useRouter,
} from "@/hooks"
import {
    templateFlowFromAnswers,
    templateFlowWithDeploymentEvent,
    type TemplateFlow,
} from "@/modules/provisioning/template-app"

/** Route identity owned by the Template App provisioning block. */
export type TemplateAppProvisioningContext =
    | { readonly mode: "new"; readonly templateKey: string }
    | { readonly mode: "resume"; readonly siteId: string }

/** Own catalog, deployment, realtime and create/publish behavior for a Template App request. */
export const useTemplateAppProvisioning = (context: TemplateAppProvisioningContext) => {
    const t = useTranslations("console.provisioningFlows")
    const router = useRouter()
    const accessToken = useAccessToken()
    const [slug, setSlug] = useState("")
    const [submitted, setSubmitted] = useState<TemplateFlow | null>(null)
    const createAndPublish = useMutateCreateAndPublishExpertSiteSwr()
    const templateKey = context.mode === "new" ? context.templateKey : null
    const resumeSiteId = context.mode === "resume" ? context.siteId : null
    const trackedSiteId =
        resumeSiteId ??
        (submitted?.phase === "accepted" || submitted?.phase === "preparing" || submitted?.phase === "ready"
            ? submitted.siteId
            : undefined)
    const catalogQuery = useQueryCatalogItemsSwr("site_from_template", templateKey !== null)
    const deploymentQuery = useQueryMyExpertSiteDeploymentSwr(trackedSiteId)
    const baseFlow = templateFlowFromAnswers({
        templateKey,
        resumeSiteId,
        catalog: catalogQuery.data,
        deployment: deploymentQuery.data,
        accessReady: accessToken !== null,
        submitted,
        isSubmitting: createAndPublish.isMutating,
        failedLoad: t("failedLoad"),
        failedProvision: t("failedProvision"),
    })
    const target =
        baseFlow.phase === "preparing" || baseFlow.phase === "ready"
            ? { kind: "deployment" as const, id: baseFlow.deploymentId }
            : null
    const realtime = useProvisioningRealtime({ accessToken, target })
    const event = realtime.status === "event" && realtime.event.kind === "deployment" ? realtime.event : null
    const flow = templateFlowWithDeploymentEvent(baseFlow, event, t("failedProvision"))
    const refreshDeployment = deploymentQuery.mutate

    useEffect(() => {
        if (realtime.status !== "connected" || trackedSiteId === undefined) return
        void refreshDeployment()
    }, [realtime.status, refreshDeployment, trackedSiteId])

    useEffect(() => {
        if (flow.phase !== "accepted" && flow.phase !== "preparing") return
        const timer = window.setInterval(() => void refreshDeployment(), 4_000)
        return () => window.clearInterval(timer)
    }, [flow.phase, refreshDeployment])

    const changeSlug = (value: string): void => setSlug(value)
    const submit = async (): Promise<void> => {
        if (flow.phase !== "request" || slug.trim() === "") return
        const requestName = flow.name
        const siteSlug = slug.trim()
        setSubmitted({ phase: "submitting", name: requestName })
        try {
            const published = await createAndPublish.trigger(siteSlug)
            if (!published.ok) {
                setSubmitted({ phase: "failed", subject: siteSlug, reason: published.reason })
                return
            }
            setSubmitted({ phase: "accepted", siteId: published.data.id, subject: published.data.slug })
            router.replace(`/apps/${published.data.id}/provisioning`)
        } catch {
            setSubmitted({ phase: "failed", subject: siteSlug, reason: t("failedLoad") })
        }
    }
    const act = (actionFlow: TemplateFlow): void => {
        if (actionFlow.phase === "ready") router.push(`/apps/${actionFlow.siteId}`)
        else router.push("/apps")
    }
    return { flow, t, realtime, changeSlug, submit, act }
}
