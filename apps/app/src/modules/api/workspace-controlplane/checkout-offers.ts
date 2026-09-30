import { type Outcome } from "@nivo/api"
import { graphql } from "../graphql"
import { WorkspaceCheckoutOffersDocument, WorkspaceCheckoutStartDocument } from "../__generated__/core"
import type { WorkspaceCheckoutStartInput } from "../__generated__/core"
import { parseWorkspaceCheckoutAnswer } from "./payload.guards"
import type { WorkspaceCheckoutAnswer } from "./checkout-types"

/** Reads the approved offers and the verdict for the exact selected version. */
export const readWorkspaceCheckoutOffers = (
    offerId: string,
    offerVersion: string,
): Promise<Outcome<WorkspaceCheckoutAnswer>> =>
    graphql(WorkspaceCheckoutOffersDocument, parseWorkspaceCheckoutAnswer, {
        request: {
            offerId,
            offerVersion,
        },
    })

/**
 * Admit one purchase and request its provider attempt (contract operation
 * `start-checkout`).
 *
 * THE RAIL IS THE PURCHASER'S EXPLICIT CHOICE: an absent rail never starts an
 * attempt, and the frozen snapshot - not the browser - is what billing,
 * provisioning and status are measured against. A returned payment action is
 * an instruction to complete, never a receipt.
 *
 * @param request - The retry identity, the frozen selection and the chosen rail.
 * @returns The closed outcome carrying the payment action, or why none was admitted.
 */
export const startWorkspaceCheckoutPurchase = (
    request: WorkspaceCheckoutStartInput,
): Promise<Outcome<WorkspaceCheckoutAnswer>> =>
    graphql(WorkspaceCheckoutStartDocument, parseWorkspaceCheckoutAnswer, { request })
