import { Badge, Button, SurfaceListCard, Text } from "@starci/grammar/common"
import type { AgentOSProvisioningViewProps } from "@/modules/provisioning/agentos-flow/view"
import { OFFER_CLASS_NAME, TIER_ACTIONS_CLASS_NAME } from "./classNames"

type Selection = AgentOSProvisioningViewProps["props"]["selection"]

/** Selection and action controls admitted by the current AgentOS phase. */
export type AgentOSProvisioningActionsProps = {
    readonly selection?: Selection
    readonly requestActionLabel?: string
    readonly statusActionLabel?: string
    readonly requestActionDisabled?: boolean
    readonly statusActionDisabled?: boolean
    readonly isRequestPending?: boolean
    readonly onRequest?: () => void
    readonly onStatusAction?: () => void
    readonly onSelectOffer?: (id: string) => void
    readonly onSelectTier?: (id: string) => void
}

/** Draw offer selection and the single action admitted by the current phase. */
export const AgentOSProvisioningActions = (props: AgentOSProvisioningActionsProps) => {
    const selection = props.selection
    const selectionView =
        selection === undefined ? null : (
            <SurfaceListCard label={selection.label}>
                {selection.offers.map((offer) => {
                    const selected = offer.id === selection.selectedOfferId
                    return (
                        <div key={offer.id} className={OFFER_CLASS_NAME}>
                            <Button
                                width="fill"
                                variant={selected ? "secondary" : "outline"}
                                onPress={() => props.onSelectOffer?.(offer.id)}
                            >
                                {offer.label}
                            </Button>
                            {offer.description === undefined ? null : (
                                <Text size="sm" tone="muted">
                                    {offer.description}
                                </Text>
                            )}
                            {!selected || offer.tiers.length === 0 ? null : (
                                <div className={TIER_ACTIONS_CLASS_NAME}>
                                    <Text size="xs" tone="muted">
                                        {selection.chooseTier}
                                    </Text>
                                    {offer.tiers.map((tier) => (
                                        <Button
                                            key={tier.id}
                                            size="sm"
                                            variant={tier.id === selection.selectedTierId ? "secondary" : "outline"}
                                            onPress={() => props.onSelectTier?.(tier.id)}
                                        >
                                            {tier.label}
                                            {tier.detail === undefined ? null : ` · ${tier.detail}`}
                                            {tier.id === selection.selectedTierId ? <Badge tone="success">{selection.selected}</Badge> : null}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </SurfaceListCard>
        )
    const actionLabel = props.requestActionLabel ?? props.statusActionLabel
    const action =
        actionLabel === undefined ? null : (
            <Button
                variant="primary"
                type="button"
                isPending={props.isRequestPending}
                isDisabled={props.statusActionDisabled || props.requestActionDisabled}
                onPress={props.requestActionLabel === undefined ? props.onStatusAction : props.onRequest}
            >
                {actionLabel}
            </Button>
        )
    return (
        <>
            {selectionView}
            {action}
        </>
    )
}
