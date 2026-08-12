import { Fragment } from "react"
import { contractNodeProps, contractSpec, type ContractKey } from "../../contracts"
import type { ContractComponent, LeafComponent } from "../../contracts/props"

/**
 * BRANCH - `Tree`: the smallest branch there is. It draws ONE registry node.
 *
 * Anything needing more than one node is a named branch that nests these. That is the whole of the
 * assembly story: the registry describes a node, a branch describes how nodes stack.
 *
 * IT OWNS NO CLASS OF ITS OWN. Every class on the rendered node comes from the registry entry, so
 * there is no seam here for a caller or a maintainer to quietly adjust.
 *
 * INSPECTABILITY. The node carries `data-node` (which key drew it) and `data-why` (why the things
 * inside it sit that way). The reason travels into the DOM because the place a tree is wrong is
 * the place a reader is looking when they notice.
 */

/** Props for {@link Tree}. */
export interface TreeProps<K extends ContractKey> {
    /**
     * The registry key. This is the ONLY layout decision an author makes: it fixes the node's
     * classes and, through the key's own name, what belongs inside it.
     */
    contract: K
    /** Named content whose metadata and source body satisfy this exact contract. */
    render: ContractComponent<NoInfer<K>>
}

/** Props for rendering only a contract's validated content inside a branch-owned host. */
export interface ContractContentProps<K extends ContractKey> {
    contract: K
    render: ContractComponent<NoInfer<K>>
}

/** Render validated slots without choosing or opening their host. */
export const ContractContent = <const K extends ContractKey>({ contract, render }: ContractContentProps<K>) => {
    if (render.kind === "projection") return <>{render.project()}</>
    const spec = contractSpec(contract)
    const slots = render.slots
    return Object.keys(spec.children).flatMap((slot) => {
        const value = slots[slot as keyof typeof slots]
        const values: ReadonlyArray<unknown> = Array.isArray(value)
            ? value
            : value === undefined ? [] : [value]
        return values.map((component: unknown, index: number) => {
            const child = component as ContractComponent<ContractKey> | LeafComponent<string, Readonly<Record<never, never>>>
            if (child.meta.shape === "contract") {
                const contractChild = child as ContractComponent<ContractKey>
                // A projection is a branch that already drew the host for this contract. Opening
                // another Tree around it changes the DOM and therefore the layout: the navbar was
                // inset twice and every projected SurfaceCard gained a duplicate section wrapper.
                if (contractChild.kind === "projection") {
                    return <Fragment key={`${slot}-${index}`}>{contractChild.project()}</Fragment>
                }
                return <Tree key={`${slot}-${index}`} contract={contractChild.meta.contract} render={contractChild} />
            }
            const leaf = child as LeafComponent<string, Readonly<Record<never, never>>>
            return <Fragment key={`${slot}-${index}`}>{leaf()}</Fragment>
        })
    })
}

/**
 * Draw one registry node.
 *
 * @param props - {@link TreeProps}
 */
export const Tree = <const K extends ContractKey>({ contract, render }: TreeProps<K>) => {
    const nodeProps = contractNodeProps(contract)
    return (
        <div
            data-component="Tree"
            {...nodeProps}
        >
            <ContractContent contract={contract} render={render} />
        </div>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure" } as const
