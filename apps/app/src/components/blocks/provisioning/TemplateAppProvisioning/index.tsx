"use client"

import { useRouter } from "@/hooks/i18n"
import { useTemplateAppProvisioning, type TemplateAppProvisioningContext } from "@/hooks/provisioning"
import { useTranslations } from "next-intl"
import { apps } from "@/modules/routes"
import { templateStepState, TEMPLATE_PHASE_INDEX } from "@/modules/provisioning/template-app"
import { templateAppProvisioningView } from "@/modules/provisioning/template-app/view"
import {
    TemplateAppProvisioningBase,
    TemplateAppProvisioningPageBase,
    type TemplateAppProvisioningRouteProps,
} from "./component"

/** Route identity owned by the Template App provisioning block. */
export type TemplateAppProvisioningProps = { readonly context: TemplateAppProvisioningContext }
type TemplateAppProvisioningPageProps = TemplateAppProvisioningRouteProps

/** Compose the connected Template App flow into its localized presentation. */
export const TemplateAppProvisioning = (props: TemplateAppProvisioningProps) => {
    const state = useTemplateAppProvisioning(props.context)
    const labels = [
        state.t("steps.request"),
        state.t("steps.createApp"),
        state.t("steps.infrastructure"),
        state.t("steps.manage"),
    ]
    const stateLabels = {
        done: state.t("stepState.done"),
        current: state.t("stepState.current"),
        upcoming: state.t("stepState.upcoming"),
    } as const
    const steps = labels.map((label, index) => {
        const position = templateStepState(index, TEMPLATE_PHASE_INDEX[state.flow.phase])
        return { ordinal: String(index + 1), label, state: position, stateLabel: stateLabels[position] }
    })
    const view = templateAppProvisioningView({
        flow: state.flow,
        steps,
        t: state.t,
        realtimeStatus: state.realtime.status,
        changeSlug: state.changeSlug,
        submit: () => void state.submit(),
        act: state.act,
    })
    return <TemplateAppProvisioningBase {...view} />
}

/** Connect route copy and navigation around the provisioning lifecycle. */
export const TemplateAppProvisioningPage = (props: TemplateAppProvisioningPageProps) => {
    const t = useTranslations("console")
    const router = useRouter()
    const route =
        props.mode === "new"
            ? { mode: "new" as const, templateKey: props.templateKey }
            : { mode: "resume" as const, siteId: props.siteId }
    const context: TemplateAppProvisioningContext =
        route.mode === "new"
            ? { mode: "new", templateKey: route.templateKey }
            : { mode: "resume", siteId: route.siteId }
    return (
        <TemplateAppProvisioningPageBase
            props={{
                ...route,
                labels: {
                    path: t("navigationLabel"),
                    apps: t("apps.title"),
                    createTitle: t("apps.createTitle"),
                    createDescription: t("apps.createDescription"),
                    provisioningTitle: t("apps.provisioningTitle"),
                    provisioningDescription: t("apps.provisioningDescription"),
                },
            }}
            on={{ openApps: () => router.push(apps()) }}
        >
            <TemplateAppProvisioning context={context} />
        </TemplateAppProvisioningPageBase>
    )
}

export default TemplateAppProvisioning
