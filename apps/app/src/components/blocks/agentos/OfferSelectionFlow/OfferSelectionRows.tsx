import {
    OFFER_FACT_CLASS_NAME,
    OFFER_IDENTITY_CLASS_NAME,
    OFFER_RADIO_CLASS_NAME,
    OFFER_ROW_CLASS_NAME,
    SELECTED_OFFER_ROW_CLASS_NAME,
    SUMMARY_BAND_CLASS_NAME,
    SUMMARY_BAND_DIVIDER_CLASS_NAME,
    SUMMARY_FACTS_CLASS_NAME,
} from "./classNames"
import { Badge, Text } from "@starci/grammar/common"
import { CheckoutFlowHead } from "../CheckoutFlowHead"
import type { OfferSelectionCopy, OfferSelectionOffer } from "./component"

type OfferSelectionLinks = {
    readonly workspaces: string
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

/** Draw the shared checkout breadcrumb and page heading. */
export const offerSelectionHead = (copy: OfferSelectionCopy, links: OfferSelectionLinks) => (
    <CheckoutFlowHead
        accessibilityLabel={copy.path}
        breadcrumbs={[
            { label: copy.workspaces, href: links.workspaces },
            { label: copy.newWorkspace, isCurrent: true },
        ]}
        title={copy.title}
        description={copy.description}
    />
)

const offerFacts = (offer: OfferSelectionOffer, copy: OfferSelectionCopy, isSkeleton = false) => (
    <>
        {factCell(copy.billingCadence, isSkeleton ? copy.billingCadence : offer.billingCadence, isSkeleton)}
        {factCell(copy.renewalBehavior, isSkeleton ? copy.renewalBehavior : offer.renewalMode, isSkeleton)}
        {factCell(copy.includedOutcome, isSkeleton ? copy.includedOutcome : offer.includedOutcome, isSkeleton)}
        {factCell(copy.eligibility, isSkeleton ? copy.eligibility : offer.eligibility, isSkeleton)}
    </>
)

/** Build one accessible selectable offer and its published facts. */
export const offerSelectionSelectableRow = (
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

/** Draw an offer and its published facts without selection controls. */
export const offerSelectionReadOnlyRow = (offer: OfferSelectionOffer, copy: OfferSelectionCopy) => (
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

/** Draw one offer row while the boundary read is unresolved. */
export const offerSelectionSkeletonRow = (key: string, copy: OfferSelectionCopy) => (
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

/** Draw the selected offer terms as one labelled summary band. */
export const offerSelectionSummaryBand = (copy: OfferSelectionCopy, selected: OfferSelectionOffer) => (
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

