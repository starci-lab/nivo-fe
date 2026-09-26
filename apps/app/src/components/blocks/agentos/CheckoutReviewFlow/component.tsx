import { BREADCRUMB_LIST_CLASS_NAME, FACT_ROW_CLASS_NAME, FACT_VALUE_CLASS_NAME, ORDINAL_CLASS_NAME, RAIL_BAND_CLASS_NAME, RAIL_OPTION_CLASS_NAME, RAIL_OPTIONS_CLASS_NAME, RAIL_RADIO_CLASS_NAME, SELECTED_RAIL_OPTION_CLASS_NAME, SECTIONS_CLASS_NAME, STEP_BODY_CLASS_NAME, STEP_ROW_CLASS_NAME } from "./classNames";
import { Badge, Button, PageContainer, PrimaryRailLayout, SectionHeader, SurfaceCard, Text, TextAction } from "@starci/grammar/common";
/** Resolved copy the connected owner supplies; no translation or transport lives here. */
export type CheckoutReviewCopy = {
    /** Accessible name of the breadcrumb trail. */
    readonly path: string;
    readonly workspaces: string;
    readonly newWorkspace: string;
    readonly checkout: string;
    readonly title: string;
    readonly description: string;
    /** External label of the frozen-terms surface. */
    readonly offerLabel: string;
    readonly offer: string;
    readonly offerVersion: string;
    readonly amount: string;
    readonly billingTerm: string;
    readonly renewal: string;
    readonly includedOutcome: string;
    readonly eligibility: string;
    readonly seller: string;
    /** External label of the purchaser-identity row. */
    readonly purchaser: string;
    readonly admission: string;
    /** External label of the payment-request rail. */
    readonly railLabel: string;
    /** The truth note: what the request does and does not settle. */
    readonly railNote: string;
    /** The rail choice the boundary requires before any attempt may start. */
    readonly railChoice: string;
    readonly railRequired: string;
    readonly railCredentialPending: string;
    /** Ordered rail step titles. */
    readonly stepRecheck: string;
    readonly stepIdentity: string;
    readonly stepProvider: string;
    readonly requestPayment: string;
    readonly retryPayment: string;
    readonly changeOffer: string;
    readonly returnToOffers: string;
    readonly footnote: string;
    readonly refusedTitle: string;
};
/** One selectable payment rail: the purchaser's explicit choice, never an inferred default. */
export type CheckoutReviewRailOption = {
    readonly rail: string;
    readonly label: string;
    readonly detail: string;
};
/** Frozen offer and admission facts bound to source data, never fixture prose. */
export type CheckoutReviewFacts = {
    readonly offer: string;
    readonly offerVersion: string;
    readonly amount: string;
    readonly billingTerm: string;
    readonly renewal: string;
    readonly includedOutcome: string;
    readonly eligibility: string;
    readonly seller: string;
    /** The admitted purchaser's bound identity; null while no published source names one. */
    readonly purchaser: string | null;
};
/** One ordered rail step: the pre-payment checks in their literal order. */
export type CheckoutReviewStep = {
    readonly title: string;
    readonly detail: string;
};
/** Destinations the connected owner resolved for navigation actions. */
export type CheckoutReviewLinks = {
    readonly workspaces: string;
    readonly offerSelection: string;
};
/** The rail's owned behaviors: raise the canonical request, choose the rail, or leave for offer selection. */
export type CheckoutReviewFlowActions = {
    readonly requestPayment: () => void;
    readonly selectRail: (rail: string) => void;
    readonly changeOffer: () => void;
};
type CheckoutReviewHeadProps = {
    readonly copy: CheckoutReviewCopy;
    readonly links: CheckoutReviewLinks;
};
type CheckoutReviewDecisionProps = CheckoutReviewHeadProps & {
    readonly facts: CheckoutReviewFacts;
    readonly admission: string;
    readonly steps: ReadonlyArray<CheckoutReviewStep>;
    readonly purchaseRef: string;
    readonly rails: ReadonlyArray<CheckoutReviewRailOption>;
    /** The chosen rail, or null while the purchaser has chosen none. */
    readonly selectedRail: string | null;
    /** Present only on the not-started rail: the definitive no-start reason. */
    readonly notice: string | null;
    readonly isPaymentPending?: boolean;
};
/** Complete state/data/action contract of the render half; the unit's public props live in the connected half. */
export type CheckoutReviewFlowBaseProps = {
    readonly state: "loading";
    readonly props: CheckoutReviewHeadProps;
} | {
    readonly state: "review" | "not-started";
    readonly props: CheckoutReviewDecisionProps;
    readonly on: CheckoutReviewFlowActions;
} | {
    readonly state: "refused";
    readonly props: CheckoutReviewHeadProps & {
        readonly facts: CheckoutReviewFacts | null;
        readonly message: string;
        /** The verified-Login door the refusal points at, when the surface owes one. */
        readonly nextAction: string | null;
    };
    readonly on: {
        readonly returnToOffers: () => void;
    };
};
/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type CheckoutReviewFlowProps = CheckoutReviewFlowBaseProps;
const factRow = (label: string, value: string, isSkeleton = false) => <div key={label} className={FACT_ROW_CLASS_NAME}>
    <Text size="sm" weight="semibold" isSkeleton={isSkeleton}>{label}</Text>
    <div className={FACT_VALUE_CLASS_NAME}><Text size="sm" tone="muted" overflow="wrap" isSkeleton={isSkeleton}>{value}</Text></div>
</div>;
const admissionRow = (label: string, admission: string, isSkeleton = false) => <div className={FACT_ROW_CLASS_NAME}>
    <Text size="sm" weight="semibold" isSkeleton={isSkeleton}>{label}</Text>
    <div className={FACT_VALUE_CLASS_NAME}><Badge tone="neutral" isSkeleton={isSkeleton}>{admission}</Badge></div>
</div>;
const factBands = (copy: CheckoutReviewCopy, facts: CheckoutReviewFacts, admission: string | null) => <>
    {factRow(copy.offer, facts.offer)}
    {factRow(copy.offerVersion, facts.offerVersion)}
    {factRow(copy.amount, facts.amount)}
    {factRow(copy.billingTerm, facts.billingTerm)}
    {factRow(copy.renewal, facts.renewal)}
    {factRow(copy.includedOutcome, facts.includedOutcome)}
    {factRow(copy.eligibility, facts.eligibility)}
    {factRow(copy.seller, facts.seller)}
    {facts.purchaser === null ? null : factRow(copy.purchaser, facts.purchaser)}
    {admission === null ? null : admissionRow(copy.admission, admission)}
</>;
const skeletonBands = (copy: CheckoutReviewCopy) => <>
    {factRow(copy.offer, copy.offer, true)}
    {factRow(copy.offerVersion, copy.offerVersion, true)}
    {factRow(copy.amount, copy.amount, true)}
    {factRow(copy.billingTerm, copy.billingTerm, true)}
    {admissionRow(copy.admission, copy.admission, true)}
</>;
const stepRow = (step: CheckoutReviewStep, position: number) => <li key={step.title} className={STEP_ROW_CLASS_NAME}>
    <span aria-hidden="true" className={ORDINAL_CLASS_NAME}>{position}</span>
    <span className={STEP_BODY_CLASS_NAME}>
        <Text size="sm" weight="semibold">{step.title}</Text>
        <Text size="xs" tone="muted" overflow="wrap">{step.detail}</Text>
    </span>
</li>;
const head = (copy: CheckoutReviewCopy, links: CheckoutReviewLinks) => <>
    <nav aria-label={copy.path}>
        <ol className={BREADCRUMB_LIST_CLASS_NAME}>
            <li><TextAction href={links.workspaces} size="sm">{copy.workspaces}</TextAction></li>
            <li aria-hidden="true"><Text size="sm" tone="muted">›</Text></li>
            <li><TextAction href={links.offerSelection} size="sm">{copy.newWorkspace}</TextAction></li>
            <li aria-hidden="true"><Text size="sm" tone="muted">›</Text></li>
            <li aria-current="page"><Text size="sm" tone="muted">{copy.checkout}</Text></li>
        </ol>
    </nav>
    <SectionHeader level={1} title={copy.title} description={<Text size="md" tone="muted">{copy.description}</Text>} />
</>;
const railChoiceBand = (props: CheckoutReviewDecisionProps, on: CheckoutReviewFlowActions) => <div className={RAIL_BAND_CLASS_NAME}>
    <Text size="sm" weight="semibold">{props.copy.railChoice}</Text>
    <div role="radiogroup" aria-label={props.copy.railChoice} className={RAIL_OPTIONS_CLASS_NAME}>
        {props.rails.map(rail => <label key={rail.rail} data-rail={rail.rail} className={rail.rail === props.selectedRail ? SELECTED_RAIL_OPTION_CLASS_NAME : RAIL_OPTION_CLASS_NAME}>
            <input type="radio" name="payment-rail" value={rail.rail} aria-label={rail.label} checked={rail.rail === props.selectedRail} onChange={() => on.selectRail(rail.rail)} className={RAIL_RADIO_CLASS_NAME} />
            <span className={STEP_BODY_CLASS_NAME}>
                <Text size="sm" weight="semibold">{rail.label}</Text>
                <Text size="xs" tone="muted" overflow="wrap">{rail.detail}</Text>
            </span>
        </label>)}
    </div>
    {props.selectedRail === null ? <Text size="xs" tone="muted" overflow="wrap">{props.copy.railRequired}</Text> : null}
    <Text size="xs" tone="muted" overflow="wrap">{props.copy.railCredentialPending}</Text>
</div>;
const reviewRail = (props: CheckoutReviewDecisionProps, state: "review" | "not-started", on: CheckoutReviewFlowActions) => {
    const copy = props.copy;
    const notStarted = state === "not-started";
    return <SurfaceCard label={copy.railLabel} composition="joined" height="fill">
        <div className={RAIL_BAND_CLASS_NAME}>
            <Text size="sm" tone="muted" overflow="wrap">{copy.railNote}</Text>
        </div>
        {railChoiceBand(props, on)}
        <div className={RAIL_BAND_CLASS_NAME}>
            <ol className={STEP_BODY_CLASS_NAME}>
                {props.steps.map((step, index) => stepRow(step, index + 1))}
            </ol>
        </div>
        {notStarted && props.notice !== null ? <div className={RAIL_BAND_CLASS_NAME}>
            <Text size="sm" tone="muted" overflow="wrap">{props.notice}</Text>
        </div> : null}
        <div className={RAIL_BAND_CLASS_NAME}>
            <Button variant="primary" size="lg" width="fill" type="button" isDisabled={props.selectedRail === null} isPending={props.isPaymentPending === true} onPress={on.requestPayment}>{notStarted ? copy.retryPayment : copy.requestPayment}</Button>
            <TextAction href={props.links.offerSelection} size="sm" onFollow={on.changeOffer}>{notStarted ? copy.returnToOffers : copy.changeOffer}</TextAction>
        </div>
        <div className={RAIL_BAND_CLASS_NAME}>
            <Text size="xs" tone="muted" overflow="wrap">{copy.footnote}</Text>
        </div>
    </SurfaceCard>;
};
/** Draw every checkout state from resolved props; the connected owner supplies data and routes. */
export const CheckoutReviewFlowBase = (props: CheckoutReviewFlowProps) => {
    const { state } = props;
    const { copy, links } = props.props;
    if (state === "loading") {
        return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} aria-busy="true" data-contract="GAP-5">
            {head(copy, links)}
            <PrimaryRailLayout railWidth="standard" collapsedOrder="rail-first" primary={<SurfaceCard label={copy.offerLabel} composition="joined">{skeletonBands(copy)}</SurfaceCard>} rail={<SurfaceCard label={copy.railLabel} composition="joined" height="fill"><div className={RAIL_BAND_CLASS_NAME}><Text size="sm" tone="muted" isSkeleton>{copy.railNote}</Text></div><div className={RAIL_BAND_CLASS_NAME}><Button variant="primary" size="lg" width="fill" isSkeleton>{copy.requestPayment}</Button></div></SurfaceCard>} />
        </div></PageContainer>;
    }
    if (state === "refused") {
        const facts = props.props.facts;
        return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
            {head(copy, links)}
            <SurfaceCard label={copy.offerLabel} composition="joined">
                {facts === null ? null : factBands(copy, facts, null)}
                <div className={RAIL_BAND_CLASS_NAME}>
                    <Text size="sm" weight="semibold">{copy.refusedTitle}</Text>
                    <Text size="sm" tone="muted" overflow="wrap">{props.props.message}</Text>
                    {props.props.nextAction === null ? null : <Text size="sm" tone="muted" overflow="wrap">{props.props.nextAction}</Text>}
                    <div><Button variant="secondary" size="md" type="button" onPress={props.on.returnToOffers}>{copy.returnToOffers}</Button></div>
                </div>
            </SurfaceCard>
        </div></PageContainer>;
    }
    const decision = props.props;
    return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
        {head(copy, links)}
        <PrimaryRailLayout railWidth="standard" collapsedOrder="rail-first" primary={<SurfaceCard label={copy.offerLabel} composition="joined">{factBands(copy, decision.facts, decision.admission)}</SurfaceCard>} rail={reviewRail(decision, state, props.on)} />
    </div></PageContainer>;
};