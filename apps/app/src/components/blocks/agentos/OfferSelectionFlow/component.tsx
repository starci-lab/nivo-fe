import {
    ACTION_BAND_CLASS_NAME,
    ACTION_TARGET_CLASS_NAME,
    BREADCRUMB_LIST_CLASS_NAME,
    NOTICE_BAND_CLASS_NAME,
    NO_SESSION_BAND_CLASS_NAME,
    OFFER_FACT_CLASS_NAME,
    OFFER_IDENTITY_CLASS_NAME,
    OFFER_RADIO_CLASS_NAME,
    OFFER_ROW_CLASS_NAME,
    SECTIONS_CLASS_NAME,
    SELECTED_OFFER_ROW_CLASS_NAME,
    SUMMARY_BAND_CLASS_NAME,
    SUMMARY_BAND_DIVIDER_CLASS_NAME,
    SUMMARY_FACTS_CLASS_NAME,
} from "./classNames"
import {
    Badge,
    Button,
    EmptyNotice,
    PageContainer,
    RadioGroup,
    SectionHeader,
    SurfaceCard,
    Text,
    TextAction,
} from "@starci/grammar/common"

/** Resolved copy the connected owner supplies; no translation or transport lives here. */
export type OfferSelectionCopy = {
    /** Accessible name of the breadcrumb trail. */
    readonly path: string
    readonly workspaces: string
    readonly newWorkspace: string
    readonly title: string
    readonly description: string
    /** External label of the joined offer surface and its truth fact. */
    readonly offersLabel: string
    readonly offersFact: string
    /** Accessible name of the offer radio group. */
    readonly offerGroupLabel: string
    readonly billingCadence: string
    readonly renewalBehavior: string
    readonly includedOutcome: string
    readonly eligibility: string
    readonly selectedBadge: string
    /** The summary band's own external label. */
    readonly selectedOffer: string
    readonly reviewAction: string
    /** The pre-effect disclosure: this surface never requests payment. */
    readonly noPaymentNote: string
    readonly backToWorkspaces: string
    readonly unavailableTitle: string
    readonly refreshOffers: string
    /** The no-session band: no private offer terms may be disclosed on this path. */
    readonly noSessionTitle: string
    readonly signIn: string
    readonly signUp: string
}

/** One offer bound to the boundary's own field vocabulary. */
export type OfferSelectionOffer = {
    /** Stable identity preserved as the checkout candidate when selected. */
    readonly offerId: string
    /** Immutable version the checkout recheck compares against. */
    readonly offerVersion: string
    readonly displayName: string
    /** Exact charge amount carrying its currency inseparably; never split or recomputed. */
    readonly amount: string
    readonly billingCadence: string
    readonly renewalMode: string
    readonly includedOutcome: string
    readonly eligibility: string
}

/** Destinations the connected owner resolved for navigation actions. */
export type OfferSelectionLinks = {
    readonly workspaces: string
}

type OfferSelectionHeadProps = {
    readonly copy: OfferSelectionCopy
    readonly links: OfferSelectionLinks
}

/** Complete state/data/action contract for the offer-selection surface. */
export type OfferSelectionFlowProps =
    | {
          readonly state: "loading"
          readonly props: OfferSelectionHeadProps
      }
    | {
          readonly state: "selection"
          readonly props: OfferSelectionHeadProps & {
              readonly offers: ReadonlyArray<OfferSelectionOffer>
              readonly selectedOfferId: string
              /** The selected candidate's review destination; continuing preserves identity only. */
              readonly checkoutHref: string
          }
          readonly on: {
              readonly select: (offerId: string) => void
              readonly review?: () => void
          }
      }
    | {
          readonly state: "unavailable"
          readonly props: OfferSelectionHeadProps & {
              /** Last confirmed offer hierarchy, kept readable without selection controls. */
              readonly offers: ReadonlyArray<OfferSelectionOffer>
              /** The source's own sentence, or the owner's unavailable explanation. */
              readonly message: string
              readonly isRefreshPending?: boolean
          }
          readonly on: {
              readonly refresh: () => void
          }
      }
    | {
          readonly state: "no-session"
          readonly props: OfferSelectionHeadProps & {
              /** The scoped source's own refusal sentence for the missing or unadmitted session. */
              readonly message: string
              /** Registered Login address, carrying this route as the return destination. */
              readonly signInHref: string
              /** The same registered Login surface's self-service registration door. */
              readonly signUpHref: string
          }
          readonly on: {
              readonly signIn: () => void
          }
      }

const factCell = (label: string, value: string, isSkeleton = false) => (
    <span key={label} className={OFFER_FACT_CLASS_NAME}>
        <Text size="xs" tone="muted" isSkeleton={isSkeleton}>
            {label}
        </Text>
        <Text size="sm" overflow="wrap" isSkeleton={isSkeleton}>
            {value}
        </Text>
    </span>
)

const head = (copy: OfferSelectionCopy, links: OfferSelectionLinks) => (
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
                <li aria-current="page">
                    <Text size="sm" tone="muted">
                        {copy.newWorkspace}
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

const offerFacts = (offer: OfferSelectionOffer, copy: OfferSelectionCopy, isSkeleton = false) => (
    <>
        {factCell(copy.billingCadence, isSkeleton ? copy.billingCadence : offer.billingCadence, isSkeleton)}
        {factCell(copy.renewalBehavior, isSkeleton ? copy.renewalBehavior : offer.renewalMode, isSkeleton)}
        {factCell(copy.includedOutcome, isSkeleton ? copy.includedOutcome : offer.includedOutcome, isSkeleton)}
        {factCell(copy.eligibility, isSkeleton ? copy.eligibility : offer.eligibility, isSkeleton)}
    </>
)

const selectableRow = (
    offer: OfferSelectionOffer,
    copy: OfferSelectionCopy,
    selected: boolean,
) => ({
    value: offer.offerId,
    label: offer.displayName,
    description: (
        <div className={selected ? SELECTED_OFFER_ROW_CLASS_NAME : OFFER_ROW_CLASS_NAME} data-offer={offer.offerId}>
            <span className={OFFER_IDENTITY_CLASS_NAME}>
                <Text size="sm" tone="muted">
                    {offer.amount}
                </Text>
            </span>
            {offerFacts(offer, copy)}
            {selected ? <Badge tone="accent">{copy.selectedBadge}</Badge> : null}
        </div>
    ),
})

const readOnlyRow = (offer: OfferSelectionOffer, copy: OfferSelectionCopy) => (
    <div key={offer.offerId} className={OFFER_ROW_CLASS_NAME} data-offer={offer.offerId}>
        <span aria-hidden="true" className={OFFER_RADIO_CLASS_NAME} />
        <span className={OFFER_IDENTITY_CLASS_NAME}>
            <Text size="sm" weight="semibold">
                {offer.displayName}
            </Text>
            <Text size="sm" tone="muted">
                {offer.amount}
            </Text>
        </span>
        {offerFacts(offer, copy)}
        <span aria-hidden="true" />
    </div>
)

const skeletonRow = (key: string, copy: OfferSelectionCopy) => (
    <div key={key} className={OFFER_ROW_CLASS_NAME}>
        <span aria-hidden="true" className={OFFER_RADIO_CLASS_NAME} />
        <span className={OFFER_IDENTITY_CLASS_NAME}>
            <Text size="sm" weight="semibold" isSkeleton>
                {copy.offerGroupLabel}
            </Text>
            <Text size="sm" tone="muted" isSkeleton>
                {copy.offersFact}
            </Text>
        </span>
        {factCell(copy.billingCadence, copy.billingCadence, true)}
        {factCell(copy.renewalBehavior, copy.renewalBehavior, true)}
        {factCell(copy.includedOutcome, copy.includedOutcome, true)}
        {factCell(copy.eligibility, copy.eligibility, true)}
        <span aria-hidden="true" />
    </div>
)

const summaryBand = (copy: OfferSelectionCopy, selected: OfferSelectionOffer) => (
    <div className={SUMMARY_BAND_CLASS_NAME}>
        <span className={OFFER_IDENTITY_CLASS_NAME}>
            <Text size="xs" tone="muted">
                {copy.selectedOffer}
            </Text>
            <Text size="sm" weight="semibold">
                {selected.displayName}
            </Text>
        </span>
        <span aria-hidden="true" className={SUMMARY_BAND_DIVIDER_CLASS_NAME} />
        <span className={SUMMARY_FACTS_CLASS_NAME}>
            <Text size="sm">{selected.amount}</Text>
            <Text size="sm">{selected.billingCadence}</Text>
            <Text size="sm">{selected.renewalMode}</Text>
        </span>
    </div>
)

/** Draw every offer-selection state from resolved props; the connected owner supplies data and routes. */
export const OfferSelectionFlowBase = (props: OfferSelectionFlowProps) => {
    const { state } = props
    const { copy, links } = props.props
    if (state === "loading") {
        return (
            <PageContainer measure="product">
                <div className={SECTIONS_CLASS_NAME} aria-busy="true" data-contract="GAP-5">
                    {head(copy, links)}
                    <SurfaceCard label={copy.offersLabel} fact={copy.offersFact} composition="joined">
                        {skeletonRow("offer-a", copy)}
                        {skeletonRow("offer-b", copy)}
                        {skeletonRow("offer-c", copy)}
                        <div className={ACTION_BAND_CLASS_NAME}>
                            <span className={ACTION_TARGET_CLASS_NAME}>
                                <Button variant="primary" size="lg" width="fill" isSkeleton>
                                    {copy.reviewAction}
                                </Button>
                            </span>
                            <Text size="xs" tone="muted" isSkeleton>
                                {copy.noPaymentNote}
                            </Text>
                        </div>
                    </SurfaceCard>
                </div>
            </PageContainer>
        )
    }
    if (state === "no-session") {
        return (
            <PageContainer measure="product">
                <div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
                    {head(copy, links)}
                    <SurfaceCard label={copy.offersLabel} fact={copy.offersFact} composition="joined">
                        <div className={NO_SESSION_BAND_CLASS_NAME}>
                            <Text size="sm" weight="semibold">
                                {copy.noSessionTitle}
                            </Text>
                            <Text size="sm" tone="muted" overflow="wrap">
                                {props.props.message}
                            </Text>
                            <span className={ACTION_TARGET_CLASS_NAME}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    width="fill"
                                    href={props.props.signInHref}
                                    onFollow={props.on.signIn}
                                >
                                    {copy.signIn}
                                </Button>
                            </span>
                            <TextAction href={props.props.signUpHref} size="sm">
                                {copy.signUp}
                            </TextAction>
                        </div>
                    </SurfaceCard>
                    <TextAction href={links.workspaces} size="sm">
                        {copy.backToWorkspaces}
                    </TextAction>
                </div>
            </PageContainer>
        )
    }
    if (state === "unavailable") {
        return (
            <PageContainer measure="product">
                <div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
                    {head(copy, links)}
                    <SurfaceCard label={copy.offersLabel} fact={copy.offersFact} composition="joined">
                        {props.props.offers.map((offer) => readOnlyRow(offer, copy))}
                        <div className={NOTICE_BAND_CLASS_NAME}>
                            <EmptyNotice
                                message={copy.unavailableTitle}
                                description={props.props.message}
                                actionLabel={copy.refreshOffers}
                                actionVariant="secondary"
                                isActionPending={props.props.isRefreshPending === true}
                                onAction={props.on.refresh}
                            />
                        </div>
                    </SurfaceCard>
                    <TextAction href={links.workspaces} size="sm">
                        {copy.backToWorkspaces}
                    </TextAction>
                </div>
            </PageContainer>
        )
    }
    const selected =
        props.props.offers.find((offer) => offer.offerId === props.props.selectedOfferId) ?? props.props.offers[0]
    return (
        <PageContainer measure="product">
            <div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
                {head(copy, links)}
                <SurfaceCard label={copy.offersLabel} fact={copy.offersFact} composition="joined">
                    <RadioGroup
                        name="workspace-offer"
                        label={copy.offerGroupLabel}
                        options={props.props.offers.map((offer) =>
                            selectableRow(offer, copy, offer.offerId === selected?.offerId),
                        )}
                        value={selected?.offerId ?? null}
                        onValueChange={props.on.select}
                    />
                    {selected === undefined ? null : summaryBand(copy, selected)}
                    {selected === undefined ? null : (
                        <div className={ACTION_BAND_CLASS_NAME}>
                            <span className={ACTION_TARGET_CLASS_NAME}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    width="fill"
                                    href={props.props.checkoutHref}
                                    onFollow={props.on.review}
                                >
                                    {copy.reviewAction}
                                </Button>
                            </span>
                            <Text size="xs" tone="muted" overflow="wrap">
                                {copy.noPaymentNote}
                            </Text>
                        </div>
                    )}
                </SurfaceCard>
                <TextAction href={links.workspaces} size="sm">
                    {copy.backToWorkspaces}
                </TextAction>
            </div>
        </PageContainer>
    )
}
