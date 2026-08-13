import { Card } from "@heroui/react"
import { Tree } from "../Tree"
import type { ContractKey } from "../../contracts"
import type { ContractBranchProps } from "../../contracts/props"

/** Props for a card whose complete content is one typed form-oriented contract. */
export type SurfaceFormCardProps<K extends ContractKey> = ContractBranchProps<K>

/**
 * Draw one bounded form surface without adding a title or another layout node around its content.
 *
 * THE ENTRY'S NODE IS OPENED BY THE FRAME, INSIDE THE CARD - not painted onto the card. Spreading
 * `contractNodeProps` onto a vendor element hands the entry its classes and its markers while the
 * vendor keeps the ELEMENT, so a key declaring `host: "ol"` rendered a `div` and the list left the
 * accessibility tree with nothing to report it: not the compiler, not the linter, not a screenshot.
 * `Tree` is the one place that reads `spec.host`, so the entry only survives if it goes through it.
 *
 * `p-0` IS THE ONLY CLASS HERE AND IT IS NOT A LAYOUT CHOICE. The vendor card carries its own `p-4`;
 * left in place it would sit OUTSIDE the entry's node and become a second inset nobody declared.
 * Zeroing it hands the whole interior to the entry, which is where an inset is readable and where
 * `SurfaceListCard` already puts it.
 *
 * @param input - {@link SurfaceFormCardProps}
 */
export const SurfaceFormCard = <const K extends ContractKey>({
    contract,
    render,
}: SurfaceFormCardProps<K>) => (
        <Card className="p-0" data-component="SurfaceFormCard">
            <Card.Content className="p-0" data-component="SurfaceFormCardBody">
                <Tree contract={contract} render={render} />
            </Card.Content>
        </Card>
    )

/** Source-level tier marker for the form surface branch. */
export const meta = { shape: "branch", world: "pure" } as const
