/** Field selection reused for the current checkout offers. */
const WORKSPACE_CHECKOUT_OFFER_FIELDS = `offerId offerVersion displayName includedOutcome amount currency billingCadence renewalMode eligibility`

/** Source-qualified facet selection reused by every facet that carries no extra field. */
const WORKSPACE_CHECKOUT_SOURCE_FIELDS = `source state reference observedAt`

/** Composed purchase view selection, including the facets only purchase-status composes. */
const WORKSPACE_CHECKOUT_STATUS_FIELDS = `
  purchaseId
  state
  offer { ${WORKSPACE_CHECKOUT_OFFER_FIELDS} }
  payment { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} }
  billing { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} }
  provisioning { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} disposition reason }
  readiness { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} }
  serviceEligibility { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} reason heldSince paidThrough renewalEvidence renewalAction { operation offerId offerVersion amount currency } }
  ledger {
    source
    state
    ledgerState
    observedAt
    entries { entryId purchaseId billingReceiptId kind amount currency linkedEntryId observationId actorPrincipal reason paymentRail providerTransactionRef accountingCopyState postedAt }
  }
  refund { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} projection refundEntryId }
  refundStatus { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} }
  lastConfirmedAt
`

/** Selection covering the whole closed checkout outcome union. */
export const WORKSPACE_CHECKOUT_OUTCOME_FIELDS = `
  status
  code
  nextAction
  source
  purchaseId
  offers { ${WORKSPACE_CHECKOUT_OFFER_FIELDS} }
  selection { offerId offerVersion state }
  purchase { ${WORKSPACE_CHECKOUT_STATUS_FIELDS} }
  paymentAction { paymentAttemptId provider kind payload }
`

/** Selection covering the whole closed purchase-entry outcome union. */
export const WORKSPACE_CHECKOUT_ENTRY_FIELDS = `
  status
  code
  source
  purchaseId
  workspaceId
  destination { workspaceId ownerId routeName routeVersion context }
  purchase { ${WORKSPACE_CHECKOUT_STATUS_FIELDS} }
`

/**
 * Select an offer and read the current approved ones (contract operation
 * `select-offer`).
 *
 * THE SELECTION IS DATA, NOT AUTHORITY: the backend decides whether this
 * purchaser may buy this exact offer version now and answers `current`,
 * `stale` or `unavailable` with the same list either way.
 *
 * @param offerId - The offer identity the screen is presenting.
 * @param offerVersion - The exact version presented, never a floating "latest".
 * @returns The closed outcome, or why no answer arrived.
 */
