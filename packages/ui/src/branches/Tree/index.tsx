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
    if (render.kind === "projection") {
        const { project: Projection } = render
        return <Projection />
    }
    const spec = contractSpec(contract)
    const slots = render.slots
    return Object.keys(spec.children).flatMap((slot) => {
        const value = slots[slot as keyof typeof slots]
        // A slot holds nothing, one thing, or a run of things. The single-value case is named so the
        // two questions - "is it a run?" and "is it there at all?" - are read one at a time.
        const single: ReadonlyArray<unknown> = value === undefined ? [] : [value]
        const values: ReadonlyArray<unknown> = Array.isArray(value) ? value : single
        return values.map((component: unknown, index: number) => {
            const child = component as ContractComponent<ContractKey> | LeafComponent<string, Readonly<Record<never, never>>>
            if (child.meta.shape === "contract") {
                const contractChild = child as ContractComponent<ContractKey>
                // A projection is a branch that already drew the host for this contract. Opening
                // another Tree around it changes the DOM and therefore the layout: the navbar was
                // inset twice and every projected SurfaceCard gained a duplicate section wrapper.
                if (contractChild.kind === "projection") {
                    const { project: Projection } = contractChild
                    return <Projection key={`${slot}-${index}`} />
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
    /*
     * THE ENTRY NAMES THE ELEMENT, NOT THE CALLER. A `<main>` is the document's one main landmark
     * and a `<nav>` is a destination; both are MEANING, and meaning belongs beside the classes and
     * the children that the key already fixes.
     *
     * The alternative was an `as` prop, and it is the wrong door: it hands the element back to the
     * call site, which is the single decision `TreeProps` exists to refuse. It also scales badly in
     * the way this repository already paid for once - `Main` was a whole second frame whose only
     * job was to swap the tag, so every rule taught about `Tree` had to be taught about `Main` too,
     * and the one that was not reported the landmark as a node with no key.
     */
    const Host = contractSpec(contract).host ?? "div"
    return (
        <Host
            data-component="Tree"
            {...nodeProps}
        >
            <ContractContent contract={contract} render={render} />
        </Host>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure" } as const
