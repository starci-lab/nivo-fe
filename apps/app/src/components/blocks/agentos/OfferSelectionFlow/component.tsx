import {
    ACTION_BAND_CLASS_NAME,
    ACTION_TARGET_CLASS_NAME,
    BREADCRUMB_LIST_CLASS_NAME,
    NOTICE_BAND_CLASS_NAME,
    OFFER_FACT_CLASS_NAME,
    OFFER_IDENTITY_CLASS_NAME,
    OFFER_RADIO_CLASS_NAME,
    OFFER_ROW_CLASS_NAME,
    SECTIONS_CLASS_NAME,
    SELECTABLE_OFFER_ROW_CLASS_NAME,
    SELECTED_OFFER_ROW_CLASS_NAME,
    SUMMARY_BAND_CLASS_NAME,
    SUMMARY_BAND_DIVIDER_CLASS_NAME,
    SUMMARY_FACTS_CLASS_NAME,
} from "./classNames";
import { Badge, Button, EmptyNotice, PageContainer, SectionHeader, SurfaceCard, Text, TextAction } from "@starci/grammar/common";

/** Resolved copy the connected owner supplies; no translation or transport lives here. */
export type OfferSelectionCopy = {
    /** Accessible name of the breadcrumb trail. */
    readonly path: string;
    readonly workspaces: string;
    readonly newWorkspace: string;
    readonly title: string;
    readonly description: string;
    /** External label of the joined offer surface and its truth fact. */
    readonly offersLabel: string;
    readonly offersFact: string;
    /** Accessible name of the offer radio group. */
    readonly offerGroupLabel: string;
    readonly billingCadence: string;
    readonly renewalBehavior: string;
    readonly includedOutcome: string;
    readonly eligibility: string;
    readonly selectedBadge: string;
    /** The summary band's own external label and provisional disclosure. */
    readonly selectedDraft: string;
    readonly provisionalNote: string;
    readonly reviewAction: string;
    /** The pre-effect disclosure: this surface never requests payment. */
    readonly noPaymentNote: string;
    readonly backToWorkspaces: string;
    readonly unavailableTitle: string;
    readonly refreshOffers: string;
};

/** One offer bound to data.workspace-offer's field vocabulary, provisional or current. */
export type OfferSelectionOffer = {
    /** Stable identity preserved as the checkout candidate when selected. */
    readonly offerId: string;
    /** Immutable version the checkout recheck compares against. */
    readonly offerVersion: string;
    readonly displayName: string;
    /** Exact charge amount and currency; rendered inseparably, never split or recomputed. */
    readonly amount: string;
    readonly currency: string;
    /** Cadence unit the amount belongs to, e.g. "year" for "1,490,000 VND / year". */
    readonly amountCadence: string;
    readonly billingCadence: string;
    readonly renewalMode: string;
    readonly includedOutcome: string;
    /** Short capacity fact repeated in the selected-draft summary band. */
    readonly capacity: string;
    readonly eligibility: string;
};

/** Destinations the connected owner resolved for navigation actions. */
export type OfferSelectionLinks = {
    readonly workspaces: string;
};

type OfferSelectionHeadProps = {
    readonly copy: OfferSelectionCopy;
    readonly links: OfferSelectionLinks;
};

/** Complete state/data/action contract for the offer-selection surface. */
export type OfferSelectionFlowProps = {
    readonly state: "loading";
    readonly props: OfferSelectionHeadProps;
} | {
    readonly state: "selection";
    readonly props: OfferSelectionHeadProps & {
        readonly offers: ReadonlyArray<OfferSelectionOffer>;
        readonly selectedOfferId: string;
        /** The selected candidate's review destination; continuing preserves identity only. */
        readonly checkoutHref: string;
    };
    readonly on: {
        readonly select: (offerId: string) => void;
        readonly review?: () => void;
    };
} | {
    readonly state: "unavailable";
    readonly props: OfferSelectionHeadProps & {
        /** Last confirmed offer hierarchy, kept readable without selection controls. */
        readonly offers: ReadonlyArray<OfferSelectionOffer>;
        /** The source's own sentence, or the owner's unavailable explanation. */
        readonly message: string;
        readonly isRefreshPending?: boolean;
    };
    readonly on: {
        readonly refresh: () => void;
    };
};

const amountText = (offer: OfferSelectionOffer) => `${offer.amount} ${offer.currency} / ${offer.amountCadence}`;

const factCell = (label: string, value: string, isSkeleton = false) => <span key={label} className={OFFER_FACT_CLASS_NAME}>
    <Text size="xs" tone="muted" isSkeleton={isSkeleton}>{label}</Text>
    <Text size="sm" overflow="wrap" isSkeleton={isSkeleton}>{value}</Text>
</span>;

const head = (copy: OfferSelectionCopy, links: OfferSelectionLinks) => <>
    <nav aria-label={copy.path}>
        <ol className={BREADCRUMB_LIST_CLASS_NAME}>
            <li><TextAction href={links.workspaces} size="sm">{copy.workspaces}</TextAction></li>
            <li aria-hidden="true"><Text size="sm" tone="muted">›</Text></li>
            <li aria-current="page"><Text size="sm" tone="muted">{copy.newWorkspace}</Text></li>
        </ol>
    </nav>
    <SectionHeader level={1} title={copy.title} description={<Text size="md" tone="muted">{copy.description}</Text>} />
</>;

const selectableRow = (offer: OfferSelectionOffer, copy: OfferSelectionCopy, selected: boolean, onSelect: (offerId: string) => void) => <label key={offer.offerId} className={selected ? SELECTED_OFFER_ROW_CLASS_NAME : SELECTABLE_OFFER_ROW_CLASS_NAME} data-offer={offer.offerId}>
    <input type="radio" name="workspace-offer" value={offer.offerId} checked={selected} onChange={() => onSelect(offer.offerId)} className={OFFER_RADIO_CLASS_NAME} />
    <span className={OFFER_IDENTITY_CLASS_NAME}>
        <Text size="sm" weight="semibold">{offer.displayName}</Text>
        <Text size="sm" tone="muted">{amountText(offer)}</Text>
    </span>
    {factCell(copy.billingCadence, offer.billingCadence)}
    {factCell(copy.renewalBehavior, offer.renewalMode)}
    {factCell(copy.includedOutcome, offer.includedOutcome)}
    {factCell(copy.eligibility, offer.eligibility)}
    {selected ? <Badge tone="accent">{copy.selectedBadge}</Badge> : <span aria-hidden="true" />}
</label>;

const readOnlyRow = (offer: OfferSelectionOffer, copy: OfferSelectionCopy) => <div key={offer.offerId} className={OFFER_ROW_CLASS_NAME} data-offer={offer.offerId}>
    <span aria-hidden="true" className={OFFER_RADIO_CLASS_NAME} />
    <span className={OFFER_IDENTITY_CLASS_NAME}>
        <Text size="sm" weight="semibold">{offer.displayName}</Text>
        <Text size="sm" tone="muted">{amountText(offer)}</Text>
    </span>
    {factCell(copy.billingCadence, offer.billingCadence)}
    {factCell(copy.renewalBehavior, offer.renewalMode)}
    {factCell(copy.includedOutcome, offer.includedOutcome)}
    {factCell(copy.eligibility, offer.eligibility)}
    <span aria-hidden="true" />
</div>;

const skeletonRow = (key: string, copy: OfferSelectionCopy) => <div key={key} className={OFFER_ROW_CLASS_NAME}>
    <span aria-hidden="true" className={OFFER_RADIO_CLASS_NAME} />
    <span className={OFFER_IDENTITY_CLASS_NAME}>
        <Text size="sm" weight="semibold" isSkeleton>{copy.offerGroupLabel}</Text>
        <Text size="sm" tone="muted" isSkeleton>{copy.offersFact}</Text>
    </span>
    {factCell(copy.billingCadence, copy.billingCadence, true)}
    {factCell(copy.renewalBehavior, copy.renewalBehavior, true)}
    {factCell(copy.includedOutcome, copy.includedOutcome, true)}
    {factCell(copy.eligibility, copy.eligibility, true)}
    <span aria-hidden="true" />
</div>;

const summaryBand = (copy: OfferSelectionCopy, selected: OfferSelectionOffer) => <div className={SUMMARY_BAND_CLASS_NAME}>
    <span className={OFFER_IDENTITY_CLASS_NAME}>
        <Text size="xs" tone="muted">{copy.selectedDraft}</Text>
        <Text size="sm" weight="semibold">{selected.displayName}</Text>
        <Text size="xs" tone="muted" overflow="wrap">{copy.provisionalNote}</Text>
    </span>
    <span aria-hidden="true" className={SUMMARY_BAND_DIVIDER_CLASS_NAME} />
    <span className={SUMMARY_FACTS_CLASS_NAME}>
        <Text size="sm">{amountText(selected)}</Text>
        <Text size="sm">{selected.billingCadence}</Text>
        <Text size="sm">{selected.renewalMode}</Text>
        <Text size="sm">{selected.capacity}</Text>
    </span>
</div>;

/** Draw every offer-selection state from resolved props; the connected owner supplies data and routes. */
export const OfferSelectionFlowBase = (props: OfferSelectionFlowProps) => {
    const { state } = props;
    const { copy, links } = props.props;
    if (state === "loading") {
        return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} aria-busy="true" data-contract="GAP-5">
            {head(copy, links)}
            <SurfaceCard label={copy.offersLabel} fact={copy.offersFact} composition="joined">
                {skeletonRow("offer-a", copy)}
                {skeletonRow("offer-b", copy)}
                {skeletonRow("offer-c", copy)}
                <div className={ACTION_BAND_CLASS_NAME}>
                    <span className={ACTION_TARGET_CLASS_NAME}><Button variant="primary" size="lg" width="fill" isSkeleton>{copy.reviewAction}</Button></span>
                    <Text size="xs" tone="muted" isSkeleton>{copy.noPaymentNote}</Text>
                </div>
            </SurfaceCard>
        </div></PageContainer>;
    }
    if (state === "unavailable") {
        return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
            {head(copy, links)}
            <SurfaceCard label={copy.offersLabel} fact={copy.offersFact} composition="joined">
                {props.props.offers.map(offer => readOnlyRow(offer, copy))}
                <div className={NOTICE_BAND_CLASS_NAME}>
                    <EmptyNotice message={copy.unavailableTitle} description={props.props.message} actionLabel={copy.refreshOffers} actionVariant="secondary" isActionPending={props.props.isRefreshPending === true} onAction={props.on.refresh} />
                </div>
            </SurfaceCard>
            <TextAction href={links.workspaces} size="sm">{copy.backToWorkspaces}</TextAction>
        </div></PageContainer>;
    }
    const selected = props.props.offers.find(offer => offer.offerId === props.props.selectedOfferId) ?? props.props.offers[0];
    return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
        {head(copy, links)}
        <SurfaceCard label={copy.offersLabel} fact={copy.offersFact} composition="joined">
            <div role="radiogroup" aria-label={copy.offerGroupLabel}>
                {props.props.offers.map(offer => selectableRow(offer, copy, offer.offerId === selected.offerId, props.on.select))}
            </div>
            {summaryBand(copy, selected)}
            <div className={ACTION_BAND_CLASS_NAME}>
                <span className={ACTION_TARGET_CLASS_NAME}><Button variant="primary" size="lg" width="fill" href={props.props.checkoutHref} onFollow={props.on.review}>{copy.reviewAction}</Button></span>
                <Text size="xs" tone="muted" overflow="wrap">{copy.noPaymentNote}</Text>
            </div>
        </SurfaceCard>
        <TextAction href={links.workspaces} size="sm">{copy.backToWorkspaces}</TextAction>
    </div></PageContainer>;
};
