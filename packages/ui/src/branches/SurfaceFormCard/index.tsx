import { Card } from "@heroui/react"
import { ContractContent } from "../Tree"
import { contractNodeProps, type ContractKey } from "../../contracts"
import type { ContractBranchProps } from "../../contracts/props"

/** Props for a card whose complete content is one typed form-oriented contract. */
export type SurfaceFormCardProps<K extends ContractKey> = ContractBranchProps<K>

/**
 * Draw one bounded form surface without adding a title or another layout node around its content.
 *
 * @param input - {@link SurfaceFormCardProps}
 */
export const SurfaceFormCard = <const K extends ContractKey>({
    contract,
    render,
}: SurfaceFormCardProps<K>) => (
        <Card data-component="SurfaceFormCard" {...contractNodeProps(contract)}>
            <Card.Content data-component="SurfaceFormCardBody">
                <ContractContent contract={contract} render={render} />
            </Card.Content>
        </Card>
    )

/** Source-level tier marker for the form surface branch. */
export const meta = { shape: "branch", world: "pure" } as const
