"use client"

import { useTemplateAppProvisioning, type TemplateAppProvisioningContext } from "@/hooks"
import { templateStepState, TEMPLATE_PHASE_INDEX } from "@/modules/provisioning/template-app"
import { templateAppProvisioningView } from "@/modules/provisioning/template-app/view"
import { TemplateAppProvisioningBase } from "./component"

/** Route identity owned by the Template App provisioning block. */
export type TemplateAppProvisioningProps = { readonly context: TemplateAppProvisioningContext }

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

export default TemplateAppProvisioning
