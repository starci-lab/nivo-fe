import { Fragment } from "react"
import { contractNodeProps, contractSpec, type ContractKey } from "../../contracts"
import type { CompositeComponent, ContractComponent, LeafComponent } from "../../contracts/props"

/**
 * BRANCH - `Tree`: the smallest branch there is. It draws ONE registry node.
 *
 * Anything needing more than one node is a named branch that nests these. That is the whole of the
 * assembly story: the registry describes a node, a branch describes how nodes stack.
 *
 * IT OWNS NO CLASS OF ITS OWN. Every class on the rendered node comes from the registry entry, so
 * there is no seam here for a caller or a maintainer to quietly adjust. That is the whole reason a
 * composite may not draw its own `<div className=...>`: the arrangement would then live somewhere
 * no gate reads and no `why` explains.
 *
 * INSPECTABILITY. The node carries `data-node` (which key drew it) and `data-why` (why the things
 * inside it sit that way). The reason travels into the DOM because the place a tree is wrong is the
 * place a reader is looking when they notice.
 */

/** Props for {@link Tree}. */
export interface TreeProps<K extends ContractKey> {
    /**
     * The registry key. This is the ONLY layout decision an author makes: it fixes the node's
     * classes and, through the key's own name, what belongs inside it.
     */
    readonly contract: K
    /** Named content whose metadata satisfies this exact contract. */
    readonly render: ContractComponent<NoInfer<K>>
}

/** Any closed child a slot may hold. */
type SlotChild =
    | ContractComponent<ContractKey>
    | LeafComponent<string, Readonly<Record<never, never>>>
    | CompositeComponent<string, Readonly<Record<never, never>>>

/** Render validated slots without choosing or opening their host. */
export const ContractContent = <const K extends ContractKey>({ contract, render }: TreeProps<K>) => {
    if (render.kind === "projection") return <>{render.project()}</>
    const spec = contractSpec(contract)
    const slots = render.slots as Record<string, unknown>
    return Object.keys(spec.children).flatMap((slot) => {
        const value = slots[slot]
        const values: ReadonlyArray<unknown> = Array.isArray(value)
            ? value
            : value === undefined ? [] : [value]
        return values.map((component: unknown, index: number) => {
            const child = component as SlotChild
            if (child.meta.shape === "contract") {
                const nested = child as ContractComponent<ContractKey>
                // A projection is a branch that already drew the host for this contract. Opening
                // another Tree around it would change the DOM, and therefore the layout.
                if (nested.kind === "projection") {
                    return <Fragment key={`${slot}-${index}`}>{nested.project()}</Fragment>
                }
                return <Tree key={`${slot}-${index}`} contract={nested.meta.contract} render={nested} />
            }
            const drawable = child as LeafComponent<string, Readonly<Record<never, never>>>
            return <Fragment key={`${slot}-${index}`}>{drawable()}</Fragment>
        })
    })
}

/**
 * Draw one registry node.
 *
 * @param props - {@link TreeProps}
 */
export const Tree = <const K extends ContractKey>({ contract, render }: TreeProps<K>) => (
    <div data-component="Tree" {...contractNodeProps(contract)}>
        <ContractContent contract={contract} render={render} />
    </div>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure" } as const
