import {
    PrimaryRailLayout as DirectionLayout,
    SectionHeader as DirectionHeader,
    SurfaceCard,
    Text,
} from "@starci/grammar/common"
import type { AgentOSProvisioningViewProps } from "@/modules/provisioning/agentos-flow/view"
import { AgentOSProvisioningActions } from "../AgentOSProvisioningActions"
import { AgentOSProvisioningReadiness } from "../AgentOSProvisioningReadiness"
import { AgentOSProvisioningSteps } from "../AgentOSProvisioningSteps"
import { CONTENT_CLASS_NAME } from "./classNames"

/** Block-owned view contract for the AgentOS purchase and provisioning continuation. */
export type AgentOSProvisioningProps = AgentOSProvisioningViewProps

/** Draw an AgentOS order beside its exact live workspace status. */
export const AgentOSProvisioningBase = (props: AgentOSProvisioningProps) => {
    const { state, props: view, on } = props
    const cardState =
        state === "failed"
            ? "negative"
            : state === "payment_unknown" || state === "provisioning_unknown"
              ? "cautionary"
              : state === "ready"
                ? "affirmative"
                : "neutral"
    const selection = view.selection === undefined ? null : (
        <AgentOSProvisioningActions
            selection={view.selection}
            onSelectOffer={on?.selectOffer}
            onSelectTier={on?.selectTier}
        />
    )
    const statusContent = props.readinessMode ? (
        <AgentOSProvisioningReadiness title={view.statusTitle} text={view.statusText} />
    ) : (
        <>
            <Text weight="medium" isSkeleton={state === "catalog_loading"}>
                {view.statusTitle}
            </Text>
            <Text size="sm" live="polite" isSkeleton={state === "catalog_loading"}>
                {view.statusText}
            </Text>
        </>
    )
    return (
        <DirectionLayout
            primary={
                <div className={CONTENT_CLASS_NAME}>
                    {selection}
                    <SurfaceCard label={view.continuationLabel ?? view.subject} state={cardState}>
                        <div className={CONTENT_CLASS_NAME} data-contract="GAP-2">
                            <DirectionHeader
                                level={2}
                                title={<Text isSkeleton={state === "catalog_loading"}>{view.subject}</Text>}
                                description={
                                    <Text size="sm" tone="muted" isSkeleton={state === "catalog_loading"}>
                                        {view.detail}
                                    </Text>
                                }
                            />
                            {statusContent}
                            <AgentOSProvisioningActions
                                requestActionLabel={view.requestActionLabel}
                                statusActionLabel={view.statusActionLabel}
                                requestActionDisabled={view.requestActionDisabled}
                                statusActionDisabled={view.statusActionDisabled}
                                isRequestPending={view.isRequestPending}
                                onRequest={on?.request}
                                onStatusAction={on?.statusAction}
                            />
                        </div>
                    </SurfaceCard>
                </div>
            }
            rail={
                <AgentOSProvisioningSteps
                    label={view.progressLabel ?? view.subject}
                    steps={view.steps}
                    isLoading={state === "catalog_loading"}
                />
            }
            railWidth="compact"
            align="start"
        />
    )
}
