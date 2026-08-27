import {
    railContract,
    surfaceCardContract,
    surfaceListCardContract,
    treatmentFor,
    visualTreatmentContract,
} from "@starci/grammar/core"

/** Canonical Core owners consumed by Nivo's thin presentation adapters. */
export const NIVO_GRAMMAR_CONTRACTS = Object.freeze({
    surfaceCard: surfaceCardContract,
    surfaceListCard: surfaceListCardContract,
    rail: railContract,
    visualTreatment: visualTreatmentContract,
})

/** Product-neutral visual treatments resolved once inside the Grammar adapter lane. */
export const NIVO_GRAMMAR_TREATMENTS = Object.freeze({
    neutral: treatmentFor("neutral"),
})

/** The exact package-owned Grammar selected by every Nivo document root. */
export { coreGrammar as NIVO_GRAMMAR } from "@starci/grammar/core"
export {
    SurfaceCard as NivoCoreSurfaceCard,
    SurfaceListCard as NivoCoreSurfaceListCard,
} from "@starci/grammar/core"
export type { PresentationState as NivoCorePresentationState } from "@starci/grammar/core"
