import { LifecycleStep, type LifecycleStepData } from "@nivo/ui"
import { SurfaceListCard } from "@starci/grammar/common"
import { ROW_CLASS_NAME } from "./classNames"

/** Inputs for the purchase and readiness lifecycle rail. */
export type AgentOSProvisioningStepsProps = {
    readonly label: string
    readonly steps: ReadonlyArray<LifecycleStepData>
    readonly isLoading: boolean
}

/** Draw the current purchase or readiness milestones. */
export const AgentOSProvisioningSteps = (props: AgentOSProvisioningStepsProps) => (
    <SurfaceListCard label={props.label}>
        {props.steps.map((step) => (
            <div key={step.ordinal} className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3">
                <LifecycleStep props={step} isLoading={props.isLoading} />
            </div>
        ))}
    </SurfaceListCard>
)
