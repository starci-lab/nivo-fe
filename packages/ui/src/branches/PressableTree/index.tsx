import { ContractContent } from "../Tree"
import { contractNodeProps, type ContractKey } from "../../contracts"
import type { ContractComponent } from "../../contracts/props"

/** Props for a contract-owned row whose native host is a button. */
export type PressableTreeProps<K extends ContractKey> = {
    readonly contract: K
    readonly render: ContractComponent<NoInfer<K>>
    readonly label: string
    readonly press?: () => void
}

/**
 * BRANCH - draw validated contract content on one native button host.
 *
 * Tree owns the normal div host; this branch owns the one semantic difference needed by a closed
 * pressable composition. Layout still comes only from the contract registry.
 */
export const PressableTree = <const K extends ContractKey>({
    contract,
    render,
    label,
    press,
}: PressableTreeProps<K>) => (
        <button type="button" aria-label={label} onClick={press} {...contractNodeProps(contract)}>
            <ContractContent contract={contract} render={render} />
        </button>
    )

/** Source-level tier marker for the contract-owned native button host. */
export const meta = { shape: "branch", world: "pure" } as const
