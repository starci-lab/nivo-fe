import { CONTENT_CLASS_NAME, OFFER_CLASS_NAME, ROW_CLASS_NAME, TIER_ACTIONS_CLASS_NAME } from "./classNames";
import { Badge, SectionHeader as DirectionHeader, PrimaryRailLayout as DirectionLayout, SurfaceListCard as DirectionList, Button, SurfaceCard, Text } from "@starci/grammar/common";
import { LifecycleStep, type LifecycleStepData } from "@nivo/ui";
/** Block-owned conditions of the AgentOS order and provisioning continuation. */
export type AgentOSProvisioningProps = AgentOSProvisioningViewProps;
/** Public API role for AgentOSProvisioningBlockState. */
export type AgentOSProvisioningBlockState = "catalog_loading" | "request" | "submitting" | "awaiting_payment" | "accepted" | "preparing" | "ready" | "failed";
/** One actual catalogue tier available to the buyer. */
export type AgentOSProvisioningTierView = {
    readonly id: string;
    readonly label: string;
    readonly detail?: string;
};
/** One actual catalogue item and its selectable tiers. */
export type AgentOSProvisioningOfferView = {
    readonly id: string;
    readonly label: string;
    readonly description?: string;
    readonly tiers: ReadonlyArray<AgentOSProvisioningTierView>;
};
/** Every settled tree the AgentOS provisioning block can draw. */
export type AgentOSProvisioningViewProps = {
    readonly state: AgentOSProvisioningBlockState;
    readonly props: {
        readonly progressLabel?: string;
        readonly continuationLabel?: string;
        readonly steps: ReadonlyArray<LifecycleStepData>;
        readonly subject: string;
        readonly detail: string;
        readonly statusTitle: string;
        readonly statusText: string;
        readonly requestActionLabel?: string;
        readonly requestActionDisabled?: boolean;
        readonly statusActionLabel?: string;
        readonly statusActionDisabled?: boolean;
        readonly isRequestPending?: boolean;
        readonly selection?: {
            readonly label: string;
            readonly chooseOffer: string;
            readonly chooseTier: string;
            readonly selected: string;
            readonly offers: ReadonlyArray<AgentOSProvisioningOfferView>;
            readonly selectedOfferId?: string;
            readonly selectedTierId?: string;
        };
    };
    readonly on?: {
        readonly request?: () => void;
        readonly selectOffer?: (id: string) => void;
        readonly selectTier?: (id: string) => void;
        readonly statusAction?: () => void;
    };
};
/** Draw an AgentOS order beside its exact live workspace status. */
export const AgentOSProvisioningBase = (props: AgentOSProvisioningProps) => {
    const { state, props: view, on } = props;
    const actionLabel = view.requestActionLabel ?? view.statusActionLabel;
    const selection = view.selection === undefined ? null : <DirectionList label={view.selection.label}>{view.selection.offers.map(offer => {
        const selected = offer.id === view.selection?.selectedOfferId;
        return <div key={offer.id} className={OFFER_CLASS_NAME}>
            <Button width="fill" variant={selected ? "secondary" : "outline"} onPress={() => on?.selectOffer?.(offer.id)}>{offer.label}</Button>
            {offer.description === undefined ? null : <Text size="sm" tone="muted">{offer.description}</Text>}
            {!selected || offer.tiers.length === 0 ? null : <div className={TIER_ACTIONS_CLASS_NAME}>
                <Text size="xs" tone="muted">{view.selection?.chooseTier}</Text>
                {offer.tiers.map(tier => <Button key={tier.id} size="sm" variant={tier.id === view.selection?.selectedTierId ? "secondary" : "outline"} onPress={() => on?.selectTier?.(tier.id)}>
                    {tier.label}{tier.detail === undefined ? null : ` · ${tier.detail}`}{tier.id === view.selection?.selectedTierId ? <Badge tone="success">{view.selection?.selected}</Badge> : null}
                </Button>)}
            </div>}
        </div>;
    })}</DirectionList>;
    const continuation = <div className={CONTENT_CLASS_NAME}>{selection}<SurfaceCard label={view.continuationLabel ?? view.subject} state={state === "failed" ? "negative" : "neutral"}><div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><DirectionHeader level={2} title={<Text isSkeleton={state === "catalog_loading"}>{view.subject}</Text>} description={<Text size="sm" tone="muted" isSkeleton={state === "catalog_loading"}>{view.detail}</Text>}/><Text weight="medium" isSkeleton={state === "catalog_loading"}>{view.statusTitle}</Text><Text size="sm" live="polite" isSkeleton={state === "catalog_loading"}>{view.statusText}</Text>{actionLabel === undefined ? null : <Button variant="primary" type="button" isPending={view.isRequestPending} isDisabled={view.statusActionDisabled || view.requestActionDisabled} onPress={view.requestActionLabel === undefined ? on?.statusAction : on?.request}>{actionLabel}</Button>}</div></SurfaceCard></div>;
    const journey = <DirectionList label={view.progressLabel ?? view.subject}>{view.steps.map((step, index) => <div key={index} className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3"><LifecycleStep props={step} isLoading={state === "catalog_loading"}/></div>)}</DirectionList>;
    return <DirectionLayout primary={continuation} rail={journey} railWidth="compact" align="start"/>;
};
