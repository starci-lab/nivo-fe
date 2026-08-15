"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { useSession } from "@/modules/auth/session"
import {
    catalogItems,
    createExpertSite,
    myExpertSiteDeployment,
    publishExpertSite,
} from "@/modules/api/console"
import useProvisioningRealtime, { type ProvisioningTarget } from "@/modules/realtime/provisioning"
import { _TemplateAppProvisioning, type TemplateAppProvisioningViewProps } from "./component"

/** Route identity owned by the template-app provisioning block. */
export type TemplateAppProvisioningProps = {
    readonly context:
        | { readonly mode: "new"; readonly templateKey: string }
        | { readonly mode: "resume"; readonly siteId: string }
}

type TemplateFlow =
    | { readonly phase: "catalog_loading" }
    | { readonly phase: "unsupported"; readonly name: string }
    | { readonly phase: "request"; readonly name: string }
    | { readonly phase: "submitting"; readonly name: string }
    | { readonly phase: "accepted"; readonly siteId: string; readonly subject: string }
    | { readonly phase: "preparing"; readonly siteId: string; readonly deploymentId: string; readonly publicHost: string | null }
    | { readonly phase: "ready"; readonly siteId: string; readonly deploymentId: string; readonly publicHost: string | null }
    | { readonly phase: "failed"; readonly subject: string; readonly reason: string }

/** Map backend deployment vocabulary onto the flow's visible state. */
const deploymentPhase = (status: string): "preparing" | "ready" | "failed" => {
    if (status === "running" || status === "ready") return "ready"
    if (status === "failed") return "failed"
    return "preparing"
}

/** Own academy creation, K8s deployment snapshots and the matching deployment stream. */
export const TemplateAppProvisioning = ({ context }: TemplateAppProvisioningProps) => {
    const t = useTranslations("console.provisioningFlows")
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null
    const [slug, setSlug] = useState("")
    const [flow, setFlow] = useState<TemplateFlow>({ phase: "catalog_loading" })

    const deploymentSnapshot = useCallback(async (siteId: string, subject = siteId): Promise<TemplateFlow> => {
        const snapshot = await myExpertSiteDeployment(siteId)
        if (!snapshot.ok) {
            return { phase: "failed", subject, reason: t("failedLoad") }
        }
        if (snapshot.data === null) {
            return { phase: "accepted", siteId, subject }
        }
        const phase = deploymentPhase(snapshot.data.status)
        if (phase === "failed") {
            return { phase: "failed", subject, reason: t("failedProvision") }
        }
        return {
            phase,
            siteId,
            deploymentId: snapshot.data.id,
            publicHost: snapshot.data.publicHost,
        }
    }, [t])

    useEffect(() => {
        if (context.mode === "resume" && accessToken === null) return
        let cancelled = false
        const settle = async () => {
            if (context.mode === "new") {
                const catalogue = await catalogItems("site_from_template")
                if (cancelled) return
                if (!catalogue.ok) {
                    setFlow({ phase: "failed", subject: context.templateKey, reason: t("failedLoad") })
                    return
                }
                const item = catalogue.data.find((candidate) => candidate.templateKey === context.templateKey)
                if (item === undefined || context.templateKey !== "ai_academy") {
                    setFlow({ phase: "unsupported", name: item?.name ?? context.templateKey })
                    return
                }
                setFlow({ phase: "request", name: item.name })
                return
            }
            const snapshot = await deploymentSnapshot(context.siteId)
            if (cancelled) return
            setFlow(snapshot)
        }
        void settle()
        return () => {
            cancelled = true
        }
    }, [accessToken, context, deploymentSnapshot, t])

    const target: ProvisioningTarget | null = flow.phase === "preparing" || flow.phase === "ready"
        ? { kind: "deployment", id: flow.deploymentId }
        : null
    const realtime = useProvisioningRealtime({ accessToken, target })

    useEffect(() => {
        if (realtime.status !== "event" || realtime.event.kind !== "deployment") return
        const phase = deploymentPhase(realtime.event.status)
        if (phase === "failed") {
            setFlow({ phase: "failed", subject: realtime.event.id, reason: realtime.event.reason ?? t("failedProvision") })
            return
        }
        setFlow((current) => current.phase === "preparing" || current.phase === "ready"
            ? { ...current, phase }
            : current)
    }, [realtime, t])

    useEffect(() => {
        if (context.mode !== "resume" || realtime.status !== "connected") return
        let cancelled = false
        void deploymentSnapshot(context.siteId).then((snapshot) => {
            if (!cancelled) setFlow(snapshot)
        })
        return () => {
            cancelled = true
        }
    }, [context, deploymentSnapshot, realtime.status])

    useEffect(() => {
        if (flow.phase !== "accepted") return
        const timer = window.setInterval(() => {
            void deploymentSnapshot(flow.siteId, flow.subject).then(setFlow)
        }, 2000)
        return () => window.clearInterval(timer)
    }, [deploymentSnapshot, flow])

    useEffect(() => {
        if (flow.phase !== "preparing") return
        // Keep the durable projection as a recovery path when the browser reconnects after the
        // terminal Kafka event; Socket.IO remains the normal low-latency transition path.
        const timer = window.setInterval(() => {
            void deploymentSnapshot(flow.siteId).then(setFlow)
        }, 4000)
        return () => window.clearInterval(timer)
    }, [deploymentSnapshot, flow])

    const route = (path: string) => locale === DEFAULT_LOCALE ? path : `/${locale}${path}`
    const submit = async () => {
        if (flow.phase !== "request" || slug.trim() === "") return
        setFlow({ phase: "submitting", name: flow.name })
        const created = await createExpertSite(slug.trim())
        if (!created.ok) {
            setFlow({ phase: "failed", subject: slug.trim(), reason: created.reason })
            return
        }
        const published = await publishExpertSite(created.data.id)
        if (!published.ok) {
            setFlow({ phase: "failed", subject: created.data.slug, reason: published.reason })
            return
        }
        setFlow({
            phase: "accepted",
            siteId: created.data.id,
            subject: published.data.slug,
        })
        router.replace(route(`/apps/${created.data.id}/provisioning`))
    }

    const phaseIndex = flow.phase === "request" || flow.phase === "submitting" || flow.phase === "catalog_loading" || flow.phase === "unsupported"
        ? 0
        : flow.phase === "accepted" || flow.phase === "preparing" || flow.phase === "failed" ? 2 : 3
    const stepLabels = [t("steps.request"), t("steps.createApp"), t("steps.infrastructure"), t("steps.manage")]
    const steps = stepLabels.map((label, index) => ({
        ordinal: String(index + 1),
        label,
        state: index < phaseIndex ? "done" as const : index === phaseIndex ? "current" as const : "upcoming" as const,
        stateLabel: index < phaseIndex ? t("stepState.done") : index === phaseIndex ? t("stepState.current") : t("stepState.upcoming"),
    }))
    const view = (): TemplateAppProvisioningViewProps => {
        const subject = flow.phase === "request" || flow.phase === "submitting" || flow.phase === "unsupported"
            ? flow.name
            : flow.phase === "failed" || flow.phase === "accepted" ? flow.subject
                : flow.phase === "preparing" || flow.phase === "ready" ? flow.publicHost ?? flow.siteId
                    : "Template App"
        const common = {
            steps,
            subject,
            detail: flow.phase === "preparing" || flow.phase === "ready" ? flow.deploymentId
                : flow.phase === "accepted" ? flow.siteId : t("template.detail"),
            slugLabel: t("template.slugLabel"),
            slugPlaceholder: t("template.slugPlaceholder"),
            slugHint: t("template.slugHint"),
            submitLabel: t("template.submit"),
        }
        if (flow.phase === "unsupported") return { state: "unsupported", props: { ...common, statusTitle: t("unsupportedTitle"), statusText: t("unsupportedText"), actionLabel: t("backToApps") }, on: { act: () => router.push(route("/apps")) } }
        if (flow.phase === "failed") return { state: "failed", props: { ...common, statusTitle: t("failedTitle"), statusText: flow.reason, actionLabel: t("backToApps") }, on: { act: () => router.push(route("/apps")) } }
        if (flow.phase === "request" || flow.phase === "submitting") return { state: flow.phase, props: { ...common, statusTitle: t("template.requestTitle"), statusText: t("template.requestText") }, on: { changeSlug: setSlug, submit: () => void submit() } }
        if (flow.phase === "ready") return { state: "ready", props: { ...common, statusTitle: t("readyTitle"), statusText: t("template.readyText"), actionLabel: t("manageApps") }, on: { act: () => router.push(route("/apps")) } }
        if (flow.phase === "accepted") return { state: "accepted", props: { ...common, statusTitle: t("template.acceptedTitle"), statusText: t("template.acceptedText") } }
        return { state: flow.phase, props: { ...common, statusTitle: flow.phase === "catalog_loading" ? t("loadingTitle") : t("preparingTitle"), statusText: flow.phase === "catalog_loading" ? t("loadingText") : realtime.status === "connecting" ? t("connecting") : t("template.preparingText") } }
    }

    return <_TemplateAppProvisioning {...view()} />
}

/** Source-level tier marker for the connected block half. */
export const meta = { shape: "block", world: "connected" } as const
