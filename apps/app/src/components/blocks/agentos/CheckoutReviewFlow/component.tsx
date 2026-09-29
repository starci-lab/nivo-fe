import {
    Button,
    PageContainer,
    PrimaryRailLayout,
    SectionHeader,
    SurfaceCard,
    Text,
    TextAction,
} from "@starci/grammar/common"
import type {
    CheckoutReviewCopy,
    CheckoutReviewFlowBaseProps,
    CheckoutReviewLinks,
} from "../../../../modules/agentos/checkout-review"
import { CheckoutReviewFactsPanel } from "../CheckoutReviewFactsPanel"
import { RAIL_BAND_CLASS_NAME } from "../CheckoutReviewPaymentRail/classNames"
import { CheckoutReviewPaymentRail } from "../CheckoutReviewPaymentRail"
import { BREADCRUMB_LIST_CLASS_NAME, SECTIONS_CLASS_NAME } from "./classNames"

export type {
    CheckoutReviewCopy,
    CheckoutReviewFacts,
    CheckoutReviewFlowBaseProps,
    CheckoutReviewRailOption,
} from "../../../../modules/agentos/checkout-review"

/* This alias is the name required by the render-half public signature rule. */
type CheckoutReviewFlowProps = CheckoutReviewFlowBaseProps

const head = (copy: CheckoutReviewCopy, links: CheckoutReviewLinks) => (
    <>
        <nav aria-label={copy.path}>
            <ol className={BREADCRUMB_LIST_CLASS_NAME}>
                <li>
                    <TextAction href={links.workspaces} size="sm">
                        {copy.workspaces}
                    </TextAction>
                </li>
                <li aria-hidden="true">
                    <Text size="sm" tone="muted">
                        ›
                    </Text>
                </li>
                <li>
                    <TextAction href={links.offerSelection} size="sm">
                        {copy.newWorkspace}
                    </TextAction>
                </li>
                <li aria-hidden="true">
                    <Text size="sm" tone="muted">
                        ›
                    </Text>
                </li>
                <li aria-current="page">
                    <Text size="sm" tone="muted">
                        {copy.checkout}
                    </Text>
                </li>
            </ol>
        </nav>
        <SectionHeader
            level={1}
            title={copy.title}
            description={
                <Text size="md" tone="muted">
                    {copy.description}
                </Text>
            }
        />
    </>
)

/** Draw every checkout state from resolved props; the connected owner supplies data and routes. */
export const CheckoutReviewFlowBase = (props: CheckoutReviewFlowProps) => {
    const { state } = props
    const { copy, links } = props.props
    if (state === "loading")
        return (
            <PageContainer measure="product">
                <div className={SECTIONS_CLASS_NAME} aria-busy="true" data-contract="GAP-5">
                    {head(copy, links)}
                    <PrimaryRailLayout
                        railWidth="standard"
                        collapsedOrder="rail-first"
                        primary={
                            <SurfaceCard label={copy.offerLabel} composition="joined">
                                <CheckoutReviewFactsPanel copy={copy} skeleton />
                            </SurfaceCard>
                        }
                        rail={
                            <SurfaceCard label={copy.railLabel} composition="joined" height="fill">
                                <div className={RAIL_BAND_CLASS_NAME}>
                                    <Text size="sm" tone="muted" isSkeleton>
                                        {copy.railNote}
                                    </Text>
                                </div>
                                <div className={RAIL_BAND_CLASS_NAME}>
                                    <Button variant="primary" size="lg" width="fill" isSkeleton>
                                        {copy.requestPayment}
                                    </Button>
                                </div>
                            </SurfaceCard>
                        }
                    />
                </div>
            </PageContainer>
        )
    if (state === "refused")
        return (
            <PageContainer measure="product">
                <div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
                    {head(copy, links)}
                    <SurfaceCard label={copy.offerLabel} composition="joined">
                        <CheckoutReviewFactsPanel copy={copy} facts={props.props.facts} />
                        <div className={RAIL_BAND_CLASS_NAME}>
                            <Text size="sm" weight="semibold">
                                {copy.refusedTitle}
                            </Text>
                            <Text size="sm" tone="muted" overflow="wrap">
                                {props.props.message}
                            </Text>
                            {props.props.nextAction === null ? null : (
                                <Text size="sm" tone="muted" overflow="wrap">
                                    {props.props.nextAction}
                                </Text>
                            )}
                            <div>
                                <Button variant="secondary" size="md" type="button" onPress={props.on.returnToOffers}>
                                    {copy.returnToOffers}
                                </Button>
                            </div>
                        </div>
                    </SurfaceCard>
                </div>
            </PageContainer>
        )
    const decision = props.props
    return (
        <PageContainer measure="product">
            <div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
                {head(copy, links)}
                <PrimaryRailLayout
                    railWidth="standard"
                    collapsedOrder="rail-first"
                    primary={
                        <SurfaceCard label={copy.offerLabel} composition="joined">
                            <CheckoutReviewFactsPanel
                                copy={copy}
                                facts={decision.facts}
                                admission={decision.admission}
                            />
                        </SurfaceCard>
                    }
                    rail={<CheckoutReviewPaymentRail props={decision} state={state} on={props.on} />}
                />
            </div>
        </PageContainer>
    )
}
