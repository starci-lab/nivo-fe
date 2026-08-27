import { Tree } from "../Tree"
import type { ContractKey } from "../../contracts"
import { NivoCoreSurfaceCard as CoreSurfaceCard } from "../../contracts/grammar"
import type { ContractBranchProps } from "../../contracts/props"

/** Props for a card whose complete content is one typed form-oriented contract. */
export type SurfaceFormCardProps<K extends ContractKey> = ContractBranchProps<K> & {
    readonly ariaLabel: string
}

/**
 * Draw one bounded form surface without adding a title or another layout node around its content.
 *
 * THE ENTRY'S NODE IS OPENED BY THE FRAME, INSIDE THE CARD - not painted onto the card. Spreading
 * `contractNodeProps` onto a vendor element hands the entry its classes and its markers while the
 * vendor keeps the ELEMENT, so a key declaring `host: "ol"` rendered a `div` and the list left the
 * accessibility tree with nothing to report it: not the compiler, not the linter, not a screenshot.
 * `Tree` is the one place that reads `spec.host`, so the entry only survives if it goes through it.
 *
 * Grammar Core owns the bounded surface anatomy. The shared Core variable removes its inset so the
 * product contract remains the sole owner of interior spacing.
 *
 * @param input - {@link SurfaceFormCardProps}
 */
export const SurfaceFormCard = <const K extends ContractKey>({
    ariaLabel,
    contract,
    render,
}: SurfaceFormCardProps<K>) => (
    <CoreSurfaceCard ariaLabel={ariaLabel} frame="bounded" scroll="page">
        <div data-component="SurfaceFormCard">
            <div data-component="SurfaceFormCardBody">
                <Tree contract={contract} render={render} />
            </div>
        </div>
    </CoreSurfaceCard>
)

/** Source-level tier marker for the form surface branch. */
export const meta = { shape: "branch", world: "pure" } as const
